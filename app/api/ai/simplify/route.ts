import { NextResponse } from "next/server";
import { getGenAIClient, generateJSONResponse } from "@/lib/ai/client";
import { SENIOR_SAATHI_SYSTEM_PROMPT, getLanguageInstruction } from "@/lib/ai/prompts";
import { SimplifyResponseSchema, SimplifyResponse } from "@/lib/ai/schemas";
import { analyzeDeterministicSafety } from "@/lib/ai/deterministic-safety";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64 : null;
    const imageMimeType = typeof body.imageMimeType === "string" ? body.imageMimeType : "image/jpeg";
    const language = typeof body.language === "string" ? body.language : "English";

    if (!text && !imageBase64) {
      return NextResponse.json(
        { error: "Please paste text or upload an image to simplify." },
        { status: 400 }
      );
    }

    const heuristic = text ? analyzeDeterministicSafety(text) : { hasRisk: false, heuristicWarnings: [] };

    const promptText = `
Simplify this confusing text/document for a senior citizen.
Text: "${text || "Inspect the uploaded screenshot/image"}"
Language: ${language}

Strictly output JSON with schema:
{
  "summary": "Short 1-sentence summary",
  "whatThisMeans": "Clear explanation in simple plain everyday words",
  "actionSteps": ["Step 1", "Step 2"],
  "importantInfo": ["Dates, deadlines, amounts, or reference numbers found"],
  "caution": ["Warning or things to be cautious about"],
  "suggestedAction": {
    "label": "Action button text",
    "action": "guide" | "safety",
    "prompt": "Suggested task description"
  }
}

${getLanguageInstruction(language)}
`;

    const fallbackGenerator = (): SimplifyResponse => {
      const isUrgent = heuristic.hasRisk;
      return {
        summary: text ? `Summary of your message (${text.slice(0, 30)}...)` : "Summary of uploaded screenshot document.",
        whatThisMeans: text
          ? "This message is informing you about a digital update or service request."
          : "This image contains written instructions or a digital notice.",
        actionSteps: [
          "Read through the main details carefully.",
          "Do not share your private passwords, PINs, or OTPs.",
          "If an official phone number or app is mentioned, verify it independently.",
        ],
        importantInfo: [
          "Always verify messages directly with official customer care.",
        ],
        caution: heuristic.heuristicWarnings.length > 0
          ? heuristic.heuristicWarnings
          : ["Be cautious of links asking you to login or make urgent payments."],
        suggestedAction: {
          label: "Guide me step-by-step through this message",
          action: "guide",
          prompt: text || "Help me respond to this document step-by-step",
        },
      };
    };

    const { ai, modelName, apiKeyAvailable } = getGenAIClient();

    if (apiKeyAvailable && ai) {
      try {
        let contents: any = promptText;

        if (imageBase64) {
          // Clean base64 header if present
          const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
          contents = [
            { inlineData: { mimeType: imageMimeType, data: cleanBase64 } },
            promptText,
          ];
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: SENIOR_SAATHI_SYSTEM_PROMPT,
            responseMimeType: "application/json",
          },
        });

        const responseText = response.text || "";
        const parsed = JSON.parse(responseText);
        const validated = SimplifyResponseSchema.parse(parsed);

        // Merge heuristic warnings into caution if any
        if (heuristic.heuristicWarnings.length > 0) {
          const mergedCaution = Array.from(new Set([...validated.caution, ...heuristic.heuristicWarnings]));
          validated.caution = mergedCaution;
        }

        return NextResponse.json({ data: validated, isLiveAI: true });
      } catch (e: any) {
        console.error("Gemini Simplify call error:", e?.message || e);
      }
    }

    // Fallback response
    const fallbackData = fallbackGenerator();
    return NextResponse.json({
      data: fallbackData,
      isLiveAI: false,
      message: "Showing clear simplified analysis.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to simplify input." }, { status: 500 });
  }
}
