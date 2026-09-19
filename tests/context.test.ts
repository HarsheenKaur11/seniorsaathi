import { describe, it, expect } from "vitest";
import { buildContextInstruction, SaathiContext } from "../lib/ai/context";

describe("SaathiContext Engine", () => {
  it("should generate clear instruction for Very Simple mode", () => {
    const ctx: SaathiContext = {
      feature: "ask",
      userMessage: "What is UPI?",
      selectedLanguage: "Hindi",
      explanationLevel: "Very Simple",
      assistanceLevel: "Gentle",
    };

    const instruction = buildContextInstruction(ctx);
    expect(instruction).toContain("Target Language: Hindi");
    expect(instruction).toContain("STRICT RULE FOR VERY SIMPLE MODE");
  });

  it("should format previous turn context for follow-up questions", () => {
    const ctx: SaathiContext = {
      feature: "ask",
      userMessage: "Make that simpler",
      selectedLanguage: "English",
      explanationLevel: "Simple",
      assistanceLevel: "Standard",
      previousRelevantContext: {
        lastQuery: "What is phishing?",
        lastAnswer: "Phishing is a scam where bad actors send fake messages to trick you into sharing passwords.",
        topic: "Phishing Security",
      },
    };

    const instruction = buildContextInstruction(ctx);
    expect(instruction).toContain("Previous Question: \"What is phishing?\"");
    expect(instruction).toContain("Follow-up Context");
  });
});
