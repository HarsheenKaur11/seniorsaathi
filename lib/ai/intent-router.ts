export type ParsedIntent =
  | "REMINDER"
  | "SAFETY_CHECK"
  | "SIMPLIFY"
  | "TRANSLATE"
  | "GUIDED_TASK"
  | "LENS"
  | "PRACTICE"
  | "DICTIONARY"
  | "FORM_HELPER"
  | "GENERAL_HELP";

export interface IntentRouteResult {
  intent: ParsedIntent;
  confidence: "high" | "medium" | "low";
  extractedDetails?: {
    reminderTitle?: string;
    reminderTime?: string;
    targetTask?: string;
    targetLanguage?: string;
    dictionaryTerm?: string;
  };
}

/**
 * Parses user input to detect actionable intent across SeniorSaathi V3 features.
 */
export function routeUserIntent(input: string): IntentRouteResult {
  const text = input.trim();
  const lower = text.toLowerCase();

  // 1. Practice Mode Intent
  if (/\b(practice|rehearse|learn how to|try doing|simulator|test run)\b/i.test(lower)) {
    return { intent: "PRACTICE", confidence: "high" };
  }

  // 2. Translation Intent
  const translateMatch = lower.match(/\b(?:translate|in|to|into)\s+(hindi|punjabi|bengali|gujarati|marathi|tamil|telugu|kannada|malayalam|urdu|english)\b/i);
  if (translateMatch || /\b(translate|what does this say in|convert to language)\b/i.test(lower)) {
    return {
      intent: "TRANSLATE",
      confidence: "high",
      extractedDetails: {
        targetLanguage: translateMatch ? translateMatch[1] : undefined,
      },
    };
  }

  // 3. Dictionary / Term Lookup Intent
  if (/\b(what is|what does|meaning of|define)\s+(otp|qr|upi|bluetooth|wifi|wi-fi|browser|url|pdf|cloud|permission|link|cvv|pin)\b/i.test(lower)) {
    const termMatch = lower.match(/\b(otp|qr|upi|bluetooth|wifi|wi-fi|browser|url|pdf|cloud|permission|link|cvv|pin)\b/i);
    return {
      intent: "DICTIONARY",
      confidence: "high",
      extractedDetails: {
        dictionaryTerm: termMatch ? termMatch[1].toUpperCase() : undefined,
      },
    };
  }

  // 4. Form Helper Intent
  if (/\b(form|nominee|permanent address|kyc|fill out|field|application)\b/i.test(lower)) {
    return { intent: "FORM_HELPER", confidence: "medium" };
  }

  // 5. Natural Language Reminder Parsing
  const reminderMatch = lower.match(/\b(remind me|set a reminder|remember to)\s+(?:to\s+)?(.+)/i);
  if (reminderMatch) {
    const rawSubject = reminderMatch[2].trim();
    return {
      intent: "REMINDER",
      confidence: "high",
      extractedDetails: {
        reminderTitle: rawSubject.replace(/\b(tomorrow|today|at \d+.*|in the morning)\b/gi, "").trim() || rawSubject,
        reminderTime: "09:00",
      },
    };
  }

  // 6. Safety / Scam Check Intent
  if (/\b(scam|suspicious|safe|fake|fraud|phishing|is this real|is this link safe|urgent|otp)\b/i.test(lower)) {
    return { intent: "SAFETY_CHECK", confidence: "high" };
  }

  // 7. Simplify Intent
  if (/\b(simplify|explain this bill|what does this mean|confusing message|understand this notice)\b/i.test(lower)) {
    return { intent: "SIMPLIFY", confidence: "high" };
  }

  // 8. Guided Task Intent
  if (/\b(how do i|how to|guide me|step by step|help me do|show me how)\b/i.test(lower)) {
    return {
      intent: "GUIDED_TASK",
      confidence: "high",
      extractedDetails: { targetTask: text },
    };
  }

  // 9. Lens Intent
  if (/\b(photo|screenshot|look at this|image|document|picture)\b/i.test(lower)) {
    return { intent: "LENS", confidence: "medium" };
  }

  return { intent: "GENERAL_HELP", confidence: "low" };
}
