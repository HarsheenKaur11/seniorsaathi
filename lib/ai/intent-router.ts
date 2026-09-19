export type ParsedIntent =
  | "REMINDER"
  | "SAFETY_CHECK"
  | "SIMPLIFY"
  | "GUIDED_TASK"
  | "LENS"
  | "GENERAL_HELP";

export interface IntentRouteResult {
  intent: ParsedIntent;
  confidence: "high" | "medium" | "low";
  extractedDetails?: {
    reminderTitle?: string;
    reminderDate?: string;
    reminderTime?: string;
    targetTask?: string;
  };
}

/**
 * Parses user input to detect actionable intent (e.g. natural reminder creation, safety check, guided task).
 */
export function routeUserIntent(input: string): IntentRouteResult {
  const text = input.trim();
  const lower = text.toLowerCase();

  // 1. Natural Language Reminder Parsing
  const reminderMatch = lower.match(/\b(remind me|set a reminder|remember to)\s+(?:to\s+)?(.+)/i);
  if (reminderMatch) {
    const rawSubject = reminderMatch[2].trim();
    
    // Extract basic date/time heuristics if present
    let extractedTime = "09:00";
    if (/\b(tomorrow|next day)\b/i.test(lower)) {
      // Tomorrow date calculation
    }

    return {
      intent: "REMINDER",
      confidence: "high",
      extractedDetails: {
        reminderTitle: rawSubject.replace(/\b(tomorrow|today|at \d+.*|in the morning)\b/gi, "").trim() || rawSubject,
        reminderTime: extractedTime,
      },
    };
  }

  // 2. Safety / Scam Check Intent
  if (/\b(scam|suspicious|safe|fake|fraud|phishing|is this real|is this link safe)\b/i.test(lower)) {
    return { intent: "SAFETY_CHECK", confidence: "high" };
  }

  // 3. Simplify Intent
  if (/\b(simplify|explain this bill|what does this mean|confusing message|understand this notice)\b/i.test(lower)) {
    return { intent: "SIMPLIFY", confidence: "high" };
  }

  // 4. Guided Task Intent
  if (/\b(how do i|how to|guide me|step by step|help me do|show me how)\b/i.test(lower)) {
    return {
      intent: "GUIDED_TASK",
      confidence: "high",
      extractedDetails: { targetTask: text },
    };
  }

  // 5. Lens Intent
  if (/\b(photo|screenshot|look at this|image|document|picture)\b/i.test(lower)) {
    return { intent: "LENS", confidence: "medium" };
  }

  return { intent: "GENERAL_HELP", confidence: "low" };
}
