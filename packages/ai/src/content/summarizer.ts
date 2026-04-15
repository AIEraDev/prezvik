/**
 * Content Summarizer
 *
 * Fit content to layout constraints
 */

import OpenAI from "openai";

/**
 * Summarize text to fit slide constraints
 */
export async function summarize(text: string, maxLength: number = 100): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable not set");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `Summarize this text into one concise sentence for a presentation slide.
Keep it under ${maxLength} characters.

Original: "${text}"

Return ONLY the summary, no explanation.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 50,
  });

  return response.choices[0].message.content?.trim() || text;
}

/**
 * Summarize to one sentence
 */
export async function summarizeToSentence(text: string): Promise<string> {
  return summarize(text, 100);
}

/**
 * Summarize to bullet point
 */
export async function summarizeToBullet(text: string): Promise<string> {
  return summarize(text, 80);
}
