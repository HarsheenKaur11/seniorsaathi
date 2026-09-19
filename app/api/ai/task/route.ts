import { NextResponse } from "next/server";
import { generateJSONResponse } from "@/lib/ai/client";
import { SENIOR_SAATHI_SYSTEM_PROMPT, getLanguageInstruction } from "@/lib/ai/prompts";
import { TaskResponseSchema, TaskResponse } from "@/lib/ai/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const taskGoal = typeof body.taskGoal === "string" ? body.taskGoal.trim() : "";
    const language = typeof body.language === "string" ? body.language : "English";

    if (!taskGoal) {
      return NextResponse.json({ error: "Please provide a task goal." }, { status: 400 });
    }

    const prompt = `
Break down this digital task into 4 to 6 calm, clear, step-by-step instructions for a senior citizen.
Task Goal: "${taskGoal}"
Selected Language: ${language}

Output JSON matching schema:
{
  "title": "Clear task title",
  "totalSteps": 4,
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "One single clear action step to perform right now",
      "simplifiedExplanation": "Gentle explanation in plain everyday words",
      "whyThisStep": "Briefly why this step is helpful",
      "whyThisMatters": "Teaches the user WHY this setting or action matters for long-term independence",
      "safetyTip": "Simple safety tip for this specific action",
      "dangerWarning": "Optional warning if this step involves privacy/money"
    }
  ],
  "completionMessage": "You did it 🎉 Great job staying safe and completing this task!",
  "confidenceTip": "Short memorable lesson for next time e.g., 'Banks will never ask you to share OTP over message or call.'"
}

${getLanguageInstruction(language)}
`;

    const fallbackGenerator = (): TaskResponse => {
      return {
        title: `Guided Steps: ${taskGoal.slice(0, 40)}`,
        totalSteps: 4,
        steps: [
          {
            stepNumber: 1,
            instruction: "Stop and inspect the details carefully without rushing.",
            simplifiedExplanation: "Take a deep breath. Scammers count on speed. Going slowly keeps you safe.",
            whyThisStep: "Helps you maintain full control of your actions.",
            whyThisMatters: "Taking your time builds confidence and prevents accidental taps on unfamiliar screens.",
            safetyTip: "Never rush when a digital message demands quick action.",
            dangerWarning: "Never enter your OTP or bank PIN.",
          },
          {
            stepNumber: 2,
            instruction: "Verify who sent the message or request.",
            simplifiedExplanation: "Check if the name, official phone number, or email matches your official bank/service documents.",
            whyThisStep: "Ensures you are dealing with a real trusted company.",
            whyThisMatters: "Official companies always use registered domain names and numbers.",
            safetyTip: "Compare phone numbers with the number printed on the back of your physical card.",
          },
          {
            stepNumber: 3,
            instruction: "Use official apps or call official helpline numbers directly.",
            simplifiedExplanation: "Open your official app store or look at the back of your bank card for the real customer phone number.",
            whyThisStep: "Bypasses suspicious links or fake numbers.",
            whyThisMatters: "Opening official apps directly avoids phishing websites entirely.",
            safetyTip: "Do not click links sent inside SMS or chat messages.",
          },
          {
            stepNumber: 4,
            instruction: "Mark the task complete or inform a trusted relative.",
            simplifiedExplanation: "If you feel completely confident, complete your task. If in doubt, ask a trusted family member.",
            whyThisStep: "Protects your peace of mind.",
            whyThisMatters: "Sharing digital questions with trusted family strengthens your online safety.",
            safetyTip: "Use Safe Share to check messages with family without sharing secrets.",
          },
        ],
        completionMessage: "You did it 🎉 You completed all the steps safely!",
        confidenceTip: "Remember: Official banks and services will never ask for your PIN or OTP.",
      };
    };

    const result = await generateJSONResponse(
      prompt,
      SENIOR_SAATHI_SYSTEM_PROMPT,
      fallbackGenerator,
      (data) => TaskResponseSchema.parse(data)
    );

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Could not create guided steps. Please try again." },
      { status: 500 }
    );
  }
}
