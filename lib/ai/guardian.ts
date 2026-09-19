export interface GuardianScanResult {
  hasHighRisk: boolean;
  threatType?: "OTP" | "PIN" | "CVV" | "PASSWORD" | "URGENT_TRANSFER" | "SUSPICIOUS_LINK";
  warningTitle: string;
  warningMessage: string;
  recommendation: string;
}

export function scanWithDigitalGuardian(input: string): GuardianScanResult | null {
  if (!input || input.trim().length < 5) return null;

  const text = input.trim();
  const lower = text.toLowerCase();

  // 1. OTP Request Detection
  if (/\b(otp|one time password|verification code|one-time code)\b/i.test(lower) && /\b(share|send|tell|read|provide|enter|forward|call)\b/i.test(lower)) {
    return {
      hasHighRisk: true,
      threatType: "OTP",
      warningTitle: "Before we continue...",
      warningMessage: "SeniorSaathi noticed this message asks to share an OTP (One-Time Password).",
      recommendation: "Never share an OTP with anyone—not even bank executives, police, or delivery agents over the phone.",
    };
  }

  // 2. PIN / Password / CVV Detection
  if (/\b(pin|cvv|password|atm pin|upi pin)\b/i.test(lower) && /\b(share|enter|send|verify|provide)\b/i.test(lower)) {
    return {
      hasHighRisk: true,
      threatType: "PIN",
      warningTitle: "Hold on a moment...",
      warningMessage: "This request mentions your confidential PIN, CVV, or Password.",
      recommendation: "Your PIN and CVV are strictly private. Real banks will NEVER ask for your secret PIN or CVV.",
    };
  }

  // 3. Urgent Money Transfer / Block Threat Detection
  if (/\b(account blocked|sim blocked|electricity disconnected|power cut|lottery winner|urgent transfer|pay immediately|deactivated)\b/i.test(lower)) {
    return {
      hasHighRisk: true,
      threatType: "URGENT_TRANSFER",
      warningTitle: "Important Safety Warning",
      warningMessage: "This message creates urgency by claiming your account, electricity, or SIM card will be blocked immediately.",
      recommendation: "Scammers use panic to make people react quickly. Take a deep breath. Always verify through official app/helplines directly.",
    };
  }

  // 4. Suspicious Shortened Links
  if (/\b(bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly|goo\.gl)\b/i.test(lower)) {
    return {
      hasHighRisk: true,
      threatType: "SUSPICIOUS_LINK",
      warningTitle: "Unclear Web Address",
      warningMessage: "This message contains a shortened or masked web link.",
      recommendation: "Shortened links hide the actual website destination. Avoid logging in or entering details through unknown links.",
    };
  }

  return null;
}
