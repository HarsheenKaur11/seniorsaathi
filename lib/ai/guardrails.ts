export interface GuardrailResult {
  isHighStakes: boolean;
  category?: "medical" | "financial" | "legal" | "emergency";
  disclaimer?: string;
  recommendedAction?: string;
}

/**
 * Detects high-stakes topics that require safe disclosures and official contact advice.
 */
export function checkHighStakesGuardrails(input: string): GuardrailResult {
  const lower = input.toLowerCase();

  // Emergency
  if (/\b(emergency|police|fire|ambulance|heart attack|stroke|chest pain|suicide|danger|thief|robbery)\b/i.test(lower)) {
    return {
      isHighStakes: true,
      category: "emergency",
      disclaimer: "SeniorSaathi is an AI companion, not an emergency responder.",
      recommendedAction: "If you are in immediate danger or have a medical emergency, please call emergency services (like 112, 100, or 108) or ask a nearby person for immediate help right away.",
    };
  }

  // Medical
  if (/\b(doctor|medicine|dosage|prescription|symptom|fever|disease|treatment|pain|blood pressure|diabetes)\b/i.test(lower)) {
    return {
      isHighStakes: true,
      category: "medical",
      disclaimer: "SeniorSaathi provides general digital information and cannot give medical advice or diagnosis.",
      recommendedAction: "Always consult your doctor or a qualified medical healthcare provider for health advice and before changing any medication.",
    };
  }

  // Financial / Banking
  if (/\b(transfer money|bank account balance|invest|stock market|loan|fixed deposit|tax filing|pension withdrawal)\b/i.test(lower)) {
    return {
      isHighStakes: true,
      category: "financial",
      disclaimer: "SeniorSaathi is a digital helper and cannot perform banking transactions or manage financial accounts.",
      recommendedAction: "For financial transactions, contact your official bank branch or use official banking apps directly. Never share OTP or PIN with anyone.",
    };
  }

  // Legal
  if (/\b(court|lawyer|police complaint|property legal|will document|legal case)\b/i.test(lower)) {
    return {
      isHighStakes: true,
      category: "legal",
      disclaimer: "SeniorSaathi provides simple guidance and is not a legal advisor.",
      recommendedAction: "Please consult a certified legal advisor or trusted legal service for formal legal matters.",
    };
  }

  return { isHighStakes: false };
}
