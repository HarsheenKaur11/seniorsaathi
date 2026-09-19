import { z } from "zod";

export const SuggestedActionSchema = z.object({
  label: z.string(),
  action: z.enum(["guide", "simplify", "safety", "ask", "reminders"]),
  prompt: z.string().optional(),
});

export const AskResponseSchema = z.object({
  intent: z.string(),
  simpleAnswer: z.string(),
  keyPoints: z.array(z.string()),
  nextSteps: z.array(z.string()),
  warnings: z.array(z.string()).default([]),
  suggestedAction: SuggestedActionSchema.optional(),
});
export type AskResponse = z.infer<typeof AskResponseSchema>;

export const SimplifyResponseSchema = z.object({
  summary: z.string(),
  whatThisMeans: z.string(),
  actionSteps: z.array(z.string()),
  importantInfo: z.array(z.string()).default([]),
  caution: z.array(z.string()).default([]),
  suggestedAction: SuggestedActionSchema.optional(),
});
export type SimplifyResponse = z.infer<typeof SimplifyResponseSchema>;

export const SafetyResponseSchema = z.object({
  riskLevel: z.enum(["Low concern", "Be cautious", "High risk"]),
  overallExplanation: z.string(),
  warningSigns: z.array(z.string()),
  safeActions: z.array(z.string()),
  neverShare: z.array(z.string()).default([]),
  confidence: z.string().default("High confidence based on security patterns"),
  guideTaskTitle: z.string().optional(),
});
export type SafetyResponse = z.infer<typeof SafetyResponseSchema>;

export const TaskStepSchema = z.object({
  stepNumber: z.number(),
  instruction: z.string(),
  simplifiedExplanation: z.string().optional(),
  whyThisStep: z.string(),
  dangerWarning: z.string().optional(),
});

export const TaskResponseSchema = z.object({
  title: z.string(),
  totalSteps: z.number(),
  steps: z.array(TaskStepSchema),
  completionMessage: z.string(),
});
export type TaskResponse = z.infer<typeof TaskResponseSchema>;

export const TaskHelpResponseSchema = z.object({
  stepNumber: z.number(),
  simpleExplanation: z.string(),
  tips: z.array(z.string()),
  safetyNote: z.string().optional(),
});
export type TaskHelpResponse = z.infer<typeof TaskHelpResponseSchema>;
