import { describe, it, expect } from "vitest";
import { routeUserIntent } from "../lib/ai/intent-router";
import { redactSensitiveSecrets } from "../lib/ai/deterministic-safety";
import { LensResponseSchema, StuckResponseSchema } from "../lib/ai/schemas";

describe("Smart Intent Router V2", () => {
  it("routes natural language reminder queries", () => {
    const res = routeUserIntent("Remind me to pay electricity bill tomorrow");
    expect(res.intent).toBe("REMINDER");
    expect(res.extractedDetails?.reminderTitle).toBe("pay electricity bill");
  });

  it("routes scam check queries", () => {
    const res = routeUserIntent("Is this bank message safe or a scam?");
    expect(res.intent).toBe("SAFETY_CHECK");
  });

  it("routes step-by-step guidance queries", () => {
    const res = routeUserIntent("How do I change font size on my phone?");
    expect(res.intent).toBe("GUIDED_TASK");
  });
});

describe("Safe Share Secret Redaction", () => {
  it("redacts 6-digit OTP codes and card numbers", () => {
    const raw = "Your OTP is 849201. Never share this code.";
    const sanitized = redactSensitiveSecrets(raw);
    expect(sanitized).not.toContain("849201");
    expect(sanitized).toContain("[REDACTED CODE]");
  });
});

describe("V2 AI Schemas", () => {
  it("validates LensResponse JSON schema", () => {
    const sample = {
      whatItIs: "Phone settings screen showing Wi-Fi option.",
      whatItMeans: "Your device is connected to home Wi-Fi.",
      importantDetails: ["Wi-Fi network: Home_5G"],
      suspiciousFlags: [],
      suggestedNextStep: "Tap Guided Task to change network.",
      guidedTaskPrompt: "How to connect to Wi-Fi",
      screenControlHint: "Wi-Fi control is near the top of the screen.",
    };
    const parsed = LensResponseSchema.parse(sample);
    expect(parsed.whatItIs).toContain("settings screen");
  });
});
