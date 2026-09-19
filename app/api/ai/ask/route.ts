import { NextResponse } from "next/server";
import { generateJSONResponse } from "@/lib/ai/client";
import { SENIOR_SAATHI_SYSTEM_PROMPT, getLanguageInstruction } from "@/lib/ai/prompts";
import { AskResponseSchema, AskResponse } from "@/lib/ai/schemas";
import { checkHighStakesGuardrails } from "@/lib/ai/guardrails";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = typeof body.query === "string" ? body.query.trim() : "";
    const language = typeof body.language === "string" ? body.language : "English";

    if (!query) {
      return NextResponse.json({ error: "Please type or speak your question first." }, { status: 400 });
    }

    // High stakes check
    const guardrail = checkHighStakesGuardrails(query);

    const prompt = `
Question from senior citizen: "${query}"
Selected Language: ${language}

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

    const fallbackGenerator = (): AskResponse => ({
      intent: `Understanding: ${query.slice(0, 40)}...`,
      simpleAnswer: guardrail.isHighStakes && guardrail.recommendedAction
        ? `${guardrail.disclaimer} ${guardrail.recommendedAction}`
        : `Here is clear guidance on "${query}": Keep your passwords private, double check sender names in messages, and ask SeniorSaathi whenever you feel unsure.`,
      keyPoints: [
        "Take your time and never hurry online.",
        "Keep your personal numbers, PIN, and OTP completely secret.",
        "Reach out to official support phone numbers directly if needed.",
      ],
      nextSteps: [
        "Check if you have any questions about this message.",
        "You can tap 'Guide me step-by-step' for sequential assistance.",
      ],
      warnings: guardrail.isHighStakes && guardrail.disclaimer ? [guardrail.disclaimer] : [],
      suggestedAction: {
        label: "Guide me through this step-by-step",
        action: "guide",
        prompt: query,
      },
    });

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
