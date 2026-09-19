import { getGenAIClient } from "@/lib/ai/client";

export interface LanguageItem {
  code: string;
  name: string;
  nativeName: string;
}

export interface TranslateParams {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
}

export const SUPPORTED_LANGUAGES: LanguageItem[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "gu", name: "Gujarati", nativeName: "ਗੁਜਰਾਤੀ" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
];

export class TranslationService {
  private googleApiKey: string;

  constructor() {
    this.googleApiKey = process.env.GOOGLE_TRANSLATION_API_KEY || process.env.GEMINI_API_KEY || "";
  }

  public getSupportedLanguages(): LanguageItem[] {
    return SUPPORTED_LANGUAGES;
  }

  public async detectLanguage(text: string): Promise<{ language: string; code: string; confidence: number }> {
    if (!text || text.trim().length === 0) {
      return { language: "English", code: "en", confidence: 1.0 };
    }

    // Heuristic script detection for rapid zero-latency detection
    if (/[\u0A00-\u0A7F]/.test(text)) {
      return { language: "Punjabi", code: "pa", confidence: 0.95 };
    }
    if (/[\u0900-\u097F]/.test(text)) {
      return { language: "Hindi", code: "hi", confidence: 0.95 };
    }
    if (/[\u0980-\u09FF]/.test(text)) {
      return { language: "Bengali", code: "bn", confidence: 0.95 };
    }
    if (/[\u0A80-\u0AFF]/.test(text)) {
      return { language: "Gujarati", code: "gu", confidence: 0.95 };
    }
    if (/[\u0B80-\u0BFF]/.test(text)) {
      return { language: "Tamil", code: "ta", confidence: 0.95 };
    }
    if (/[\u0C00-\u0C7F]/.test(text)) {
      return { language: "Telugu", code: "te", confidence: 0.95 };
    }
    if (/[\u0C80-\u0CFF]/.test(text)) {
      return { language: "Kannada", code: "kn", confidence: 0.95 };
    }
    if (/[\u0D00-\u0D7F]/.test(text)) {
      return { language: "Malayalam", code: "ml", confidence: 0.95 };
    }
    if (/[\u0600-\u06FF]/.test(text)) {
      return { language: "Urdu", code: "ur", confidence: 0.95 };
    }

    // Default to English
    return { language: "English", code: "en", confidence: 0.8 };
  }

  public async translateText(params: TranslateParams): Promise<string> {
    const { text, targetLanguage } = params;

    if (!text || text.trim() === "") return "";
    if (targetLanguage === "English" && /^[a-zA-Z0-9\s.,!?'"()-]+$/.test(text)) {
      return text;
    }

    // Use Gemini model dynamic translation fallback
    const { ai, modelName, apiKeyAvailable } = getGenAIClient();
    if (apiKeyAvailable && ai) {
      try {
        const prompt = `
Translate the following text accurately into ${targetLanguage}.
Preserve all numbers, monetary values (₹/$/€), dates, links, and security terms (OTP, PIN, CVV) exactly.
Do not add extra commentary. Return ONLY the translated string.

Text:
"${text}"
`;
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        const translated = (response.text || "").trim();
        if (translated) return translated;
      } catch (err) {
        console.error("Gemini translation error:", err);
      }
    }

    return text;
  }
}

export const translationProvider = new TranslationService();
