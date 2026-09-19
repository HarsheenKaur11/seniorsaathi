import { NextResponse } from "next/server";
import { getGenAIClient } from "@/lib/ai/client";
import { SENIOR_SAATHI_SYSTEM_PROMPT, getLanguageInstruction } from "@/lib/ai/prompts";
import { LensResponseSchema, LensResponse } from "@/lib/ai/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64 : null;
    const imageMimeType = typeof body.imageMimeType === "string" ? body.imageMimeType : "image/jpeg";
    const userNote = typeof body.text === "string" ? body.text.trim() : "";
    const language = typeof body.language === "string" ? body.language : "English";

    if (!imageBase64) {
      return NextResponse.json({ error: "Please provide a screenshot or image for Saathi Lens." }, { status: 400 });
    }

    const promptText = `
You are Saathi Lens. Analyze this image (screenshot, settings screen, bank notice, website, bill, or app error) for a senior citizen.
User Note: "${userNote || "Inspect this screen image carefully"}"
Selected Language: ${language}

Output JSON adhering strictly to this schema:
{
  "whatItIs": "Clear 1-sentence identification of what screen/document this is",
  "whatItMeans": "Gentle 2-sentence explanation of what is happening or displayed",
  "importantDetails": ["Key detail 1 (amounts, buttons, dates)", "Key detail 2"],
  "suspiciousFlags": ["Any scam or risk warning if present"],
  "suggestedNextStep": "The single safest next action to take",
  "guidedTaskPrompt": "Suggested prompt to guide the user step-by-step through this screen",
  "screenControlHint": "Screen location hint e.g., 'I can see the Wi-Fi option near the top of this screen'",
  "confidenceTip": "Remember: Always verify app permissions and bank notices carefully."
}

${getLanguageInstruction(language)}
`;

    const fallbackGenerator = (): LensResponse => ({
      whatItIs: "Digital notice or device screen screenshot.",
      whatItMeans: "This screen presents options or information requiring your attention.",
      importantDetails: [
        "Review the options displayed on your screen carefully.",
        "Ensure no secret OTP or PIN is being requested.",
      ],
      suspiciousFlags: [],
      suggestedNextStep: "Review the options carefully or tap 'Guide me step-by-step'.",
      guidedTaskPrompt: userNote || "Help me navigate this device screen step-by-step",
      screenControlHint: "Main controls appear near the center and bottom of your screen.",
      confidenceTip: "Take your time when reviewing device screens.",
    });

    const { ai, modelName, apiKeyAvailable } = getGenAIClient();

    if (apiKeyAvailable && ai) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const contents = [
          { inlineData: { mimeType: imageMimeType, data: cleanBase64 } },
          promptText,
        ];

        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: SENIOR_SAATHI_SYSTEM_PROMPT,
            responseMimeType: "application/json",
          },
        });

        const parsed = JSON.parse(response.text || "");
        const validated = LensResponseSchema.parse(parsed);
        return NextResponse.json({ data: validated, isLiveAI: true });
      } catch (e: any) {
        console.error("Saathi Lens Gemini API error:", e?.message || e);
      }
    }

    return NextResponse.json({ data: fallbackGenerator(), isLiveAI: false });
  } catch (err: any) {
    return NextResponse.json({ error: "Could not inspect screen with Saathi Lens." }, { status: 500 });
  }
}
