import { translationProvider } from "./provider";

export interface DetectionResult {
  detectedLanguage: string;
  detectedCode: string;
  isDifferentFromPreferred: boolean;
  suggestionMessage?: string;
}

export async function detectInputLanguage(
  text: string,
  preferredLanguage: string = "English"
): Promise<DetectionResult> {
  const result = await translationProvider.detectLanguage(text);

  const isDifferent = result.language.toLowerCase() !== preferredLanguage.toLowerCase();
  let suggestionMessage: string | undefined = undefined;

  if (isDifferent && result.confidence >= 0.8) {
    suggestionMessage = `Looks like this message is in ${result.language}. Would you like SeniorSaathi to explain it in ${preferredLanguage} or keep it in ${result.language}?`;
  }

  return {
    detectedLanguage: result.language,
    detectedCode: result.code,
    isDifferentFromPreferred: isDifferent,
    suggestionMessage,
  };
}
