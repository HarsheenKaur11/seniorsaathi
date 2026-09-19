import { AskResponse, SimplifyResponse, SafetyResponse, TaskResponse } from "./schemas";

export function generateAskFallback(query: string): AskResponse {
  return {
    intent: `Answering question about "${query.slice(0, 30)}"`,
    simpleAnswer: `Here is helpful guidance regarding your question: Always take your time online, verify official details independently, and never share private codes like OTP or PIN with anyone.`,
    keyPoints: [
      "Never hurry when performing digital actions.",
      "Keep personal numbers, passwords, and OTPs private.",
      "Ask SeniorSaathi or a trusted person whenever you feel unsure.",
    ],
    nextSteps: [
      "Check if you need a step-by-step guide for this task.",
      "You can tap 'Guide me step-by-step' below.",
    ],
    warnings: [],
    suggestedAction: {
      label: "Guide me step-by-step",
      action: "guide",
      prompt: query,
    },
  };
}

export function generateSimplifyFallback(text: string): SimplifyResponse {
  return {
    summary: "Clear breakdown of your document or message.",
    whatThisMeans: "This message contains digital instructions or information regarding an account or service.",
    actionSteps: [
      "Read through the main details carefully.",
      "Do not share your private passwords, PINs, or OTPs.",
      "If an official phone number or app is mentioned, verify it independently.",
    ],
    importantInfo: [
      "Always verify messages directly with official customer care.",
    ],
    caution: [
      "Be cautious of links asking you to login or make urgent payments.",
    ],
    suggestedAction: {
      label: "Guide me step-by-step through this message",
      action: "guide",
      prompt: text || "Help me respond to this document step-by-step",
    },
  };
}
