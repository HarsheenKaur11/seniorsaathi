export class SaathiAIError extends Error {
  public code: string;

  constructor(message: string, code: string = "AI_SERVICE_ERROR") {
    super(message);
    this.name = "SaathiAIError";
    this.code = code;
  }
}

export const ERROR_MESSAGES = {
  MISSING_INPUT: "Please type or speak your request first.",
  API_KEY_MISSING: "SeniorSaathi is operating in offline demonstration mode. Configure GEMINI_API_KEY for live responses.",
  SERVICE_UNAVAILABLE: "SeniorSaathi AI service was temporarily unable to respond. Please try asking again in a moment.",
  INVALID_RESPONSE: "Received an incomplete response from AI service. Provided fallback guidance.",
  RATE_LIMIT: "Too many requests. Please wait a few seconds before asking again.",
};
