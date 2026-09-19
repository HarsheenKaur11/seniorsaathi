import { describe, it, expect } from "vitest";
import { scanWithDigitalGuardian } from "../lib/ai/guardian";

describe("Digital Guardian Security Scanner", () => {
  it("should flag OTP sharing requests as high risk", () => {
    const scan = scanWithDigitalGuardian("URGENT: Share your OTP 482019 to prevent account suspension.");
    expect(scan).not.toBeNull();
    expect(scan?.hasHighRisk).toBe(true);
    expect(scan?.threatType).toBe("OTP");
  });

  it("should flag PIN / CVV requests", () => {
    const scan = scanWithDigitalGuardian("Please enter your ATM PIN and CVV number to confirm transaction.");
    expect(scan).not.toBeNull();
    expect(scan?.hasHighRisk).toBe(true);
    expect(scan?.threatType).toBe("PIN");
  });

  it("should flag suspicious shortened links", () => {
    const scan = scanWithDigitalGuardian("Pay your bill now at http://bit.ly/pay-now-fast");
    expect(scan).not.toBeNull();
    expect(scan?.hasHighRisk).toBe(true);
    expect(scan?.threatType).toBe("SUSPICIOUS_LINK");
  });

  it("should return null for harmless general queries", () => {
    const scan = scanWithDigitalGuardian("How do I change font size on my phone?");
    expect(scan).toBeNull();
  });
});
