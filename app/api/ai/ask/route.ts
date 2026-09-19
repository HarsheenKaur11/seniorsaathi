import { NextResponse } from "next/server";
import { generateJSONResponse } from "@/lib/ai/client";
import { SENIOR_SAATHI_SYSTEM_PROMPT, getLanguageInstruction } from "@/lib/ai/prompts";
import { AskResponseSchema, AskResponse } from "@/lib/ai/schemas";
import { checkHighStakesGuardrails } from "@/lib/ai/guardrails";
import { buildContextInstruction, SaathiContext } from "@/lib/ai/context";
import { generateAskFallback } from "@/lib/ai/fallback";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = typeof body.query === "string" ? body.query.trim() : "";
    const language = typeof body.language === "string" ? body.language : "English";
    const explanationLevel = body.explanationLevel || "Normal";
    const previousContext = body.previousContext || null;

    if (!query) {
      return NextResponse.json({ error: "Please type or speak your question first." }, { status: 400 });
    }

    // High stakes check
    const guardrail = checkHighStakesGuardrails(query);

    const saathiContext: SaathiContext = {
      feature: "ask",
      userMessage: query,
      selectedLanguage: language,
      explanationLevel,
      assistanceLevel: body.assistanceLevel || "Standard",
      previousRelevantContext: previousContext ? {
        lastQuery: previousContext.lastQuery,
        lastAnswer: previousContext.lastAnswer,
        topic: previousContext.topic,
      } : undefined,
    };

    const contextInstructions = buildContextInstruction(saathiContext);

    const prompt = `
Question from senior citizen: "${query}"

CONTEXT & PERSONALIZATION RULES:
${contextInstructions}

Provide a structured response JSON matching this exact schema:
{
  "intent": "Short summary of what the user is asking",
  "simpleAnswer": "Clear, friendly, short 2-3 sentence answer in simple everyday language",
  "keyPoints": ["Key point 1", "Key point 2"],
  "nextSteps": ["What the user should do next 1", "What the user should do next 2"],
  "warnings": ["Safety warning if applicable"],
  "suggestedAction": {
    "label": "Action button text",
    "action": "guide" | "simplify" | "safety" | "ask" | "reminders",
    "prompt": "Suggested text to carry over"
  }
}

${getLanguageInstruction(language)}
`;

    const fallbackGenerator = (): AskResponse => {
      const fb = generateAskFallback(query);
      if (guardrail.isHighStakes && guardrail.disclaimer) {
        fb.simpleAnswer = `${guardrail.disclaimer} ${guardrail.recommendedAction || fb.simpleAnswer}`;
        fb.warnings = [guardrail.disclaimer];
      }
      return fb;
    };

    const result = await generateJSONResponse(
      prompt,
      SENIOR_SAATHI_SYSTEM_PROMPT,
      fallbackGenerator,
      (data) => AskResponseSchema.parse(data)
    );

    // Inject guardrail disclaimer if present
    if (guardrail.isHighStakes && guardrail.disclaimer) {
      if (!result.data.warnings.includes(guardrail.disclaimer)) {
        result.data.warnings.unshift(guardrail.disclaimer);
      }
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Something went wrong. Please try asking again." },
      { status: 500 }
    );
  }
}
