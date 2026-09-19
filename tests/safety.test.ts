import { describe, it, expect } from "vitest";
import { analyzeDeterministicSafety } from "../lib/ai/deterministic-safety";
import { checkHighStakesGuardrails } from "../lib/ai/guardrails";
import { SafetyResponseSchema, AskResponseSchema } from "../lib/ai/schemas";

describe("Deterministic Safety Engine", () => {
  it("detects high risk OTP and PIN requests", () => {
    const input = "URGENT: Send your bank OTP immediately to verify your account.";
    const res = analyzeDeterministicSafety(input);
    expect(res.riskLevel).toBe("High risk");
    expect(res.heuristicWarnings.some((w) => w.includes("OTP"))).toBe(true);
    expect(res.neverShareAlerts.length).toBeGreaterThan(0);
  });

  it("detects shortened links and urgency tactics", () => {
    const input = "Your package is waiting. Click http://bit.ly/3x88z now within 1 hour!";
    const res = analyzeDeterministicSafety(input);
    expect(res.riskLevel).toBe("Be cautious");
    expect(res.heuristicWarnings.some((w) => w.includes("shortened link"))).toBe(true);
  });

  it("returns low concern for safe general messages", () => {
    const input = "Good morning! Hope you have a wonderful day ahead.";
    const res = analyzeDeterministicSafety(input);
    expect(res.riskLevel).toBe("Low concern");
    expect(res.heuristicWarnings.length).toEqual(0);
  });
});

describe("High Stakes Guardrails", () => {
  it("identifies medical topics and appends disclaimer", () => {
    const res = checkHighStakesGuardrails("What medicine should I take for high blood pressure?");
    expect(res.isHighStakes).toBe(true);
    expect(res.category).toBe("medical");
    expect(res.disclaimer).toContain("cannot give medical advice");
  });

  it("identifies emergency situations", () => {
    const res = checkHighStakesGuardrails("I have chest pain and need help!");
    expect(res.isHighStakes).toBe(true);
    expect(res.category).toBe("emergency");
    expect(res.recommendedAction).toContain("112");
  });
});

describe("AI Schema Parsing", () => {
  it("validates SafetyResponse JSON schema", () => {
    const sample = {
      riskLevel: "High risk",
      overallExplanation: "This message is a scam.",
      warningSigns: ["Demands OTP"],
      safeActions: ["Do not reply"],
      neverShare: ["OTP", "PIN"],
      confidence: "High",
    };
    const parsed = SafetyResponseSchema.parse(sample);
    expect(parsed.riskLevel).toBe("High risk");
  });
});
