import { GoogleGenAI } from "@google/genai";

export function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  const apiKeyAvailable = Boolean(apiKey && apiKey !== "your_gemini_api_key_here");
  
  if (!apiKeyAvailable) {
    return {
      ai: null,
      modelName: "gemini-2.5-flash",
      apiKeyAvailable: false,
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  return {
    ai,
    modelName: "gemini-2.5-flash",
    apiKeyAvailable: true,
  };
}

export async function generateJSONResponse<T>(
  prompt: string,
  systemInstruction: string,
  fallbackGenerator: () => T,
  validator: (data: unknown) => T
): Promise<{ data: T; isLiveAI: boolean; message?: string }> {
  const { ai, modelName, apiKeyAvailable } = getGenAIClient();

  if (!apiKeyAvailable || !ai) {
    console.warn("GEMINI_API_KEY is not configured. Returning rule-based fallback response.");
    return {
      data: fallbackGenerator(),
      isLiveAI: false,
      message: "Running in offline demonstration mode. Set GEMINI_API_KEY for live AI responses.",
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    const parsed = JSON.parse(responseText);
    const validated = validator(parsed);
    return { data: validated, isLiveAI: true };
  } catch (error: any) {
    console.error("Gemini API call or JSON parsing error:", error?.message || error);
    return {
      data: fallbackGenerator(),
      isLiveAI: false,
      message: "AI service was temporarily unavailable. Provided rule-based guidance.",
    };
  }
}
