import { NextResponse } from "next/server";
import { generateJSONResponse } from "@/lib/ai/client";
import { SENIOR_SAATHI_SYSTEM_PROMPT, getLanguageInstruction } from "@/lib/ai/prompts";
import { TaskHelpResponseSchema, TaskHelpResponse } from "@/lib/ai/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const currentStep = body.currentStep || {};
    const taskTitle = typeof body.taskTitle === "string" ? body.taskTitle : "";
    const language = typeof body.language === "string" ? body.language : "English";

    const prompt = `
A senior citizen needs extra help understanding step #${currentStep.stepNumber || 1} of task "${taskTitle}".
Step instruction: "${currentStep.instruction || ""}"
Selected Language: ${language}

Output JSON schema:
{
  "stepNumber": ${currentStep.stepNumber || 1},
  "simpleExplanation": "Very simple 2-sentence explanation of what to do right now on screen or phone",
  "tips": ["Tip 1 to make this easier", "Tip 2"],
  "safetyNote": "Optional gentle reminder if relevant"
}

${getLanguageInstruction(language)}
`;

    const fallbackGenerator = (): TaskHelpResponse => ({
      stepNumber: currentStep.stepNumber || 1,
      simpleExplanation: `For this step: "${currentStep.instruction}". Simply look at your device screen, locate the option or text mentioned, and tap it gently.`,
      tips: [
        "You can ask a family member to double check your screen if you feel stuck.",
        "Take all the time you need — there is no rush.",
      ],
      safetyNote: "Remember: SeniorSaathi will never ask for your passwords or OTP.",
    });

    const result = await generateJSONResponse(
      prompt,
      SENIOR_SAATHI_SYSTEM_PROMPT,
      fallbackGenerator,
      (data) => TaskHelpResponseSchema.parse(data)
    );

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: "Could not fetch step help." }, { status: 500 });
  }
}
