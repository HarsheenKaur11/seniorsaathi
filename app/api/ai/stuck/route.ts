import { NextResponse } from "next/server";
import { generateJSONResponse } from "@/lib/ai/client";
import { SENIOR_SAATHI_SYSTEM_PROMPT, getLanguageInstruction } from "@/lib/ai/prompts";
import { StuckResponseSchema, StuckResponse } from "@/lib/ai/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const currentContext = typeof body.context === "string" ? body.context.trim() : "";
    const currentStep = body.step || {};
    const language = typeof body.language === "string" ? body.language : "English";

    const prompt = `
A senior citizen clicked "I'm Stuck" while working on digital task/message.
Current context: "${currentContext}"
Current step instruction: "${currentStep.instruction || "Navigating screen"}"
Selected Language: ${language}

Provide AT MOST 3 simple recovery options. Output JSON matching schema:
{
  "contextSummary": "Reassuring 1-sentence summary acknowledging their hesitation",
  "options": [
    {
      "label": "Explain this differently",
      "actionType": "explain_simpler",
      "explanation": "Let's break this step down into even shorter words."
    },
    {
      "label": "Show me what to do",
      "actionType": "step_by_step",
      "explanation": "Look for the button or link on your screen mentioned above."
    },
    {
      "label": "Go back one step",
      "actionType": "previous_step",
      "explanation": "Let's review the previous step to make sure we didn't miss anything."
    }
  ]
}

${getLanguageInstruction(language)}
`;

    const fallbackGenerator = (): StuckResponse => ({
      contextSummary: "Don't worry — feeling stuck is completely normal. Take a deep breath.",
      options: [
        {
          label: "Explain this differently",
          actionType: "explain_simpler",
          explanation: "Re-explains the current instruction in super simple words.",
        },
        {
          label: "Show me what to do",
          actionType: "step_by_step",
          explanation: "Describes where on your screen to look for controls.",
        },
        {
          label: "Go back one step",
          actionType: "previous_step",
          explanation: "Returns to the previous step so you can check your progress.",
        },
      ],
    });

    const result = await generateJSONResponse(
      prompt,
      SENIOR_SAATHI_SYSTEM_PROMPT,
      fallbackGenerator,
      (data) => StuckResponseSchema.parse(data)
    );

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: "Could not generate recovery options." }, { status: 500 });
  }
}
