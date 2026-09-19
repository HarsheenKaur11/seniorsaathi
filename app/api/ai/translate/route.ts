import { NextResponse } from "next/server";
import { translationProvider } from "@/lib/translation/provider";
import { detectInputLanguage } from "@/lib/translation/language-detector";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const targetLanguage = typeof body.targetLanguage === "string" ? body.targetLanguage : "English";
    const preferredLanguage = typeof body.preferredLanguage === "string" ? body.preferredLanguage : "English";

    if (!text) {
      return NextResponse.json({ error: "Please provide text to translate." }, { status: 400 });
    }

    const detection = await detectInputLanguage(text, preferredLanguage);
    const translation = await translationProvider.translateText({
      text,
      targetLanguage,
      sourceLanguage: detection.detectedLanguage,
    });

    return NextResponse.json({
      original: text,
      translation,
      detectedLanguage: detection.detectedLanguage,
      suggestionMessage: detection.suggestionMessage,
      isLiveAI: true,
    });
  } catch (err: any) {
    console.error("Translate API error:", err);
    return NextResponse.json({ error: "Translation failed." }, { status: 500 });
  }
}
