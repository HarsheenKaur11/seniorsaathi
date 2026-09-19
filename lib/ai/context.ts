export interface PreviousTurnContext {
  lastQuery?: string;
  lastAnswer?: string;
  lastIntent?: string;
  topic?: string;
}

export interface SafetySignals {
  hasRisk?: boolean;
  detectedSecrets?: string[];
  riskLevel?: string;
}

export interface ImageContext {
  summary?: string;
  detectedText?: string;
}

export interface SaathiContext {
  feature: "ask" | "simplify" | "safety" | "guide" | "lens" | "practice" | "translate" | "general";
  userMessage: string;
  selectedLanguage: string;
  explanationLevel: "Normal" | "Simple" | "Very Simple";
  assistanceLevel: "Gentle" | "Standard" | "Detailed";
  currentTask?: string;
  currentStep?: number;
  totalSteps?: number;
  previousRelevantContext?: PreviousTurnContext;
  safetySignals?: SafetySignals;
  imageContext?: ImageContext;
}

export function buildContextInstruction(context: SaathiContext): string {
  const parts: string[] = [];

  parts.push(`Target Language: ${context.selectedLanguage || "English"}`);
  parts.push(`Explanation Depth Level: ${context.explanationLevel || "Normal"}`);
  parts.push(`Assistance Style: ${context.assistanceLevel || "Standard"}`);

  if (context.explanationLevel === "Very Simple") {
    parts.push("STRICT RULE FOR VERY SIMPLE MODE: Use extremely short sentences (under 10 words each). Use everyday analogies. Avoid any technical terms without instant one-word definitions.");
  } else if (context.explanationLevel === "Simple") {
    parts.push("RULE FOR SIMPLE MODE: Use brief, gentle paragraphs. Keep vocabulary simple and clear.");
  }

  if (context.currentTask) {
    parts.push(`Active Guided Task: "${context.currentTask}" (Step ${context.currentStep || 1} of ${context.totalSteps || "unspecified"})`);
  }

  if (context.previousRelevantContext && (context.previousRelevantContext.lastQuery || context.previousRelevantContext.lastAnswer)) {
    parts.push("CONVERSATIONAL HISTORY (Follow-up Context):");
    if (context.previousRelevantContext.lastQuery) {
      parts.push(`Previous Question: "${context.previousRelevantContext.lastQuery}"`);
    }
    if (context.previousRelevantContext.lastAnswer) {
      parts.push(`Previous Explanation Given: "${context.previousRelevantContext.lastAnswer}"`);
    }
    if (context.previousRelevantContext.topic) {
      parts.push(`Current Topic: "${context.previousRelevantContext.topic}"`);
    }
    parts.push("NOTE: If the user says 'What does that mean?', 'Give me an example', 'Make that simpler', 'Translate this into Hindi', or 'Say that again', refer directly to the Previous Question/Explanation Given above.");
  }

  if (context.imageContext?.summary) {
    parts.push(`Uploaded Screenshot Context: ${context.imageContext.summary}`);
  }

  if (context.safetySignals?.hasRisk) {
    parts.push(`SAFETY WARNING ACTIVE: Risk Level is ${context.safetySignals.riskLevel || "High"}. Emphasize NEVER sharing OTP, PIN, CVV, or passwords.`);
  }

  return parts.join("\n");
}
