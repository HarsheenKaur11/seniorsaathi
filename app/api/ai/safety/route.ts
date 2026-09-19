import { NextResponse } from "next/server";
import { generateJSONResponse } from "@/lib/ai/client";
import { SENIOR_SAATHI_SYSTEM_PROMPT, getLanguageInstruction } from "@/lib/ai/prompts";
import { SafetyResponseSchema, SafetyResponse } from "@/lib/ai/schemas";
import { analyzeDeterministicSafety } from "@/lib/ai/deterministic-safety";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const language = typeof body.language === "string" ? body.language : "English";

    if (!message) {
      return NextResponse.json(
        { error: "Please paste a message or URL to evaluate safety." },
        { status: 400 }
      );
    }

    // 1. Run deterministic scam heuristics
    const heuristic = analyzeDeterministicSafety(message);

    const prompt = `
Analyze this message/link for potential scams, fraud, or phishing targeting a senior citizen.
Message: "${message}"
Deterministic Heuristic Pre-analysis: ${JSON.stringify(heuristic)}
Selected Language: ${language}

Output JSON matching schema:
{
  "riskLevel": "Low concern" | "Be cautious" | "High risk",
  "overallExplanation": "Clear, gentle 2-sentence explanation of the safety assessment",
  "warningSigns": ["Specific warning sign 1", "Specific warning sign 2"],
  "safeActions": ["What the user should do to stay safe 1", "What the user should do to stay safe 2"],
  "neverShare": ["NEVER share your OTP", "NEVER share your bank PIN"],
  "confidence": "High confidence based on threat analysis",
  "guideTaskTitle": "How to safely handle this suspicious message"
}

${getLanguageInstruction(language)}
`;

    const fallbackGenerator = (): SafetyResponse => {
      const neverShareList = Array.from(new Set([
        "OTP (One-Time Password)",
        "ATM / UPI PIN",
        "Netbanking Passwords",
        "CVV number on the back of your bank card",
        ...heuristic.neverShareAlerts,
      ]));

      if (heuristic.riskLevel === "High risk") {
        return {
          riskLevel: "High risk",
          overallExplanation: "This message displays classic signs of a scam or fraud attempt designed to take your money or personal accounts.",
          warningSigns: heuristic.heuristicWarnings.length > 0
            ? heuristic.heuristicWarnings
            : [
                "Demands your secret OTP or password.",
                "Uses urgent threats to make you panic and hurry.",
                "Contains an unofficial or suspicious web link.",
              ],
          safeActions: [
            "Do NOT click on any link in the message.",
            "Do NOT reply or call the phone number in the message.",
            "Delete or ignore the message.",
            "If concerned about your account, call your bank using the official phone number printed on your physical debit/credit card.",
          ],
          neverShare: neverShareList,
          confidence: "High risk detected by security heuristics",
          guideTaskTitle: "What to do when you receive a suspicious scam message",
        };
      }

      if (heuristic.riskLevel === "Be cautious") {
        return {
          riskLevel: "Be cautious",
          overallExplanation: "This message requires careful attention. It contains urgency or links that should be verified before acting.",
          warningSigns: heuristic.heuristicWarnings.length > 0
            ? heuristic.heuristicWarnings
            : ["Contains an unknown web link or urgent request for action."],
          safeActions: [
            "Do not click links directly from messages.",
            "Verify the message sender independently through official customer support.",
            "Ask a family member or trusted friend if you feel unsure.",
          ],
          neverShare: neverShareList,
          confidence: "Caution recommended",
          guideTaskTitle: "How to safely check and verify suspicious messages",
        };
      }

      return {
        riskLevel: "Low concern",
        overallExplanation: "This message appears to be standard digital correspondence. However, always stay alert online.",
        warningSigns: [],
        safeActions: [
          "Keep your personal information private.",
          "Check that the sender email or phone number matches your official records.",
        ],
        neverShare: neverShareList,
        confidence: "Low risk detected",
        guideTaskTitle: "How to handle general online messages safely",
      };
    };

    const result = await generateJSONResponse(
      prompt,
      SENIOR_SAATHI_SYSTEM_PROMPT,
      fallbackGenerator,
      (data) => SafetyResponseSchema.parse(data)
    );

    // Always ensure deterministic warnings & neverShare safeguards are present
    if (heuristic.heuristicWarnings.length > 0) {
      const mergedWarnings = Array.from(new Set([...result.data.warningSigns, ...heuristic.heuristicWarnings]));
      result.data.warningSigns = mergedWarnings;
    }

    if (heuristic.riskLevel === "High risk" && result.data.riskLevel !== "High risk") {
      result.data.riskLevel = "High risk";
    }

    const mandatoryNeverShare = ["OTP", "PIN", "CVV", "Passwords"];
    const mergedNeverShare = Array.from(new Set([...result.data.neverShare, ...heuristic.neverShareAlerts, ...mandatoryNeverShare]));
    result.data.neverShare = mergedNeverShare;

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Could not complete safety assessment. Please try again." },
      { status: 500 }
    );
  }
}
