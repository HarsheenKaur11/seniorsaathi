import { describe, it, expect } from "vitest";
import { routeUserIntent } from "../lib/ai/intent-router";

describe("Smart Intent Router V3", () => {
  it("should route practice requests to PRACTICE intent", () => {
    const res = routeUserIntent("I want to practice spotting OTP scam calls");
    expect(res.intent).toBe("PRACTICE");
    expect(res.confidence).toBe("high");
  });

  it("should route translation requests to TRANSLATE intent", () => {
    const res = routeUserIntent("Translate this message into Punjabi");
    expect(res.intent).toBe("TRANSLATE");
    expect(res.extractedDetails?.targetLanguage?.toLowerCase()).toBe("punjabi");
  });

  it("should route dictionary term lookups to DICTIONARY intent", () => {
    const res = routeUserIntent("What is UPI?");
    expect(res.intent).toBe("DICTIONARY");
    expect(res.extractedDetails?.dictionaryTerm).toBe("UPI");
  });

  it("should route natural reminder prompts to REMINDER intent", () => {
    const res = routeUserIntent("Remind me to call doctor tomorrow");
    expect(res.intent).toBe("REMINDER");
    expect(res.extractedDetails?.reminderTitle).toBe("call doctor");
  });

  it("should route scam inquiries to SAFETY_CHECK intent", () => {
    const res = routeUserIntent("Is this SMS link safe or a scam?");
    expect(res.intent).toBe("SAFETY_CHECK");
  });
});
