export interface HeuristicSafetyResult {
  hasRisk: boolean;
  riskLevel: "High risk" | "Be cautious" | "Low concern";
  heuristicWarnings: string[];
  neverShareAlerts: string[];
  extractedDomains: string[];
}

/**
 * Deterministic scam heuristic engine.
 * Scans text for high-risk flags BEFORE sending to LLM.
 */
export function analyzeDeterministicSafety(input: string): HeuristicSafetyResult {
  const text = input.trim();
  const lower = text.toLowerCase();
  const warnings: string[] = [];
  const neverShare: string[] = [];
  const extractedDomains: string[] = [];

  let isHighRisk = false;
  let isCautious = false;

  // Extract URLs & domains safely
  const urlMatches = text.match(/https?:\/\/[^\s]+/gi);
  if (urlMatches) {
    urlMatches.forEach((url) => {
      try {
        const domain = new URL(url).hostname;
        if (domain && !extractedDomains.includes(domain)) {
          extractedDomains.push(domain);
        }
      } catch (e) {
        // Fallback string domain extraction
        const match = url.match(/https?:\/\/([^\/\s]+)/i);
        if (match && match[1] && !extractedDomains.includes(match[1])) {
          extractedDomains.push(match[1]);
        }
      }
    });
  }

  // 1. Secret / Credential Requests
  if (/\b(otp|one time password|verification code|verif code|passcode)\b/i.test(text)) {
    isHighRisk = true;
    warnings.push("Requests your One-Time Password (OTP) or Verification Code.");
    neverShare.push("NEVER share your OTP with anyone, even if they claim to be from your bank or government.");
  }

  if (/\b(pin|cvv|password|passcode|atm pin|upi pin)\b/i.test(text)) {
    isHighRisk = true;
    warnings.push("Requests sensitive security PIN, CVV, or Password.");
    neverShare.push("NEVER share your PIN, CVV, or passwords.");
  }

  if (/\b(card number|credit card|debit card|bank account number|netbanking password)\b/i.test(text)) {
    isHighRisk = true;
    warnings.push("Asks for full payment card details or netbanking credentials.");
    neverShare.push("NEVER enter bank or card details on links received in messages.");
  }

  // 2. Urgent Threat / Pressure Tactics
  if (/\b(account blocked|account suspended|deactivated today|legal action|police|arrest|electricity cut|sim block|kyc expired)\b/i.test(text)) {
    isHighRisk = true;
    warnings.push("Uses frightening threats (account blocked, service cut, legal action) to cause panic.");
  }

  if (/\b(within \d+ (hour|min|minute|day)|immediately|urgent|act now|today only|expired)\b/i.test(text)) {
    isCautious = true;
    warnings.push("Creates artificial urgency to make you hurry without thinking.");
  }

  // 3. Shortened Links & Suspicious URLs
  if (/https?:\/\/(bit\.ly|tinyurl\.com|t\.co|is\.gd|goo\.gl|ow\.ly|rb\.gy|cutt\.ly)/i.test(text)) {
    isCautious = true;
    warnings.push("Contains a shortened link which hides the real website destination.");
  }

  if (/https?:\/\/[^\s]+/i.test(text) && !/https?:\/\/(www\.)?([a-z0-9-]+\.)+(gov|edu|org|com|in)\b/i.test(text)) {
    isCautious = true;
    warnings.push("Contains an unfamiliar or unofficial website link.");
  }

  // 4. Lottery / Unrealistic Reward / Prize
  if (/\b(won|winner|lottery|prize|reward|gift card|congratulations!|claim your|free cash)\b/i.test(text)) {
    isCautious = true;
    warnings.push("Offers unexpected money, lottery prizes, or rewards, which are almost always scams.");
  }

  // Determine overall risk
  let riskLevel: "High risk" | "Be cautious" | "Low concern" = "Low concern";
  if (isHighRisk) {
    riskLevel = "High risk";
  } else if (isCautious || warnings.length > 0) {
    riskLevel = "Be cautious";
  }

  return {
    hasRisk: riskLevel !== "Low concern",
    riskLevel,
    heuristicWarnings: Array.from(new Set(warnings)),
    neverShareAlerts: Array.from(new Set(neverShare)),
    extractedDomains,
  };
}

/**
 * Redacts secrets (OTP, PIN, passwords, credit card numbers) from text for Safe Share.
 */
export function redactSensitiveSecrets(rawText: string): string {
  if (!rawText) return "";
  let sanitized = rawText;

  // Redact 4-8 digit OTP / PIN codes
  sanitized = sanitized.replace(/\b\d{4,8}\b/g, "[REDACTED CODE]");

  // Redact credit card numbers
  sanitized = sanitized.replace(/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, "[REDACTED CARD]");

  // Redact explicit secret words
  sanitized = sanitized.replace(/(otp|password|pin|cvv|passcode)\s*[:=]\s*\S+/gi, "$1: [REDACTED]");

  return sanitized;
}
