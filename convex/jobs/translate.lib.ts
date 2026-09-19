"use node";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

export const TranslationSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const targetLanguages = {
  fr: "French",
  en: "English",
  de: "German",
} as const;

type TargetLanguage = keyof typeof targetLanguages;

export async function translateWithOpenAI(
  title: string,
  description: string,
  language: TargetLanguage,
) {
  const apiKey = process.env.OPEN_API_KEY;

  if (!apiKey) {
    throw new Error("OPEN_API_KEY is not configured");
  }

  const openai = new OpenAI({
    apiKey,
  });

  const response = await openai.responses.parse({
    model: "gpt-4o-mini",

    instructions: `
You are a professional translator specialized in job offers.

Translate the job title and description into ${targetLanguages[language]}.

Rules:
- Translate naturally and professionally.
- Preserve the exact meaning.
- Do not add information.
- Do not remove information.
- Do not invent information.
- Preserve names, company names, numbers, dates and technical terms when appropriate.
- Use natural terminology for job offers.
- Return only the translated title and description.
`,

    input: JSON.stringify({
      title,
      description,
    }),

    text: {
      format: zodTextFormat(TranslationSchema, "job_translation"),
    },
  });

  if (response.status !== "completed") {
    throw new Error(`OpenAI response was not completed: ${response.status}`);
  }

  if (!response.output_parsed) {
    throw new Error("OpenAI did not return a valid translation");
  }

  return response.output_parsed;
}
