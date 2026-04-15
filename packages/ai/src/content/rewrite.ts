/**
 * Content Rewriter
 *
 * Turn weak content into impactful presentation text
 */

import OpenAI from "openai";

/**
 * Rewrite text for clarity and impact
 */
export async function rewriteText(text: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable not set");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `Rewrite this text for a professional presentation slide.
Make it clear, concise, and impactful. Keep it under 100 characters if possible.

Original: "${text}"

Return ONLY the rewritten text, no explanation.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 100,
  });

  return response.choices[0].message.content?.trim() || text;
}

/**
 * Rewrite multiple texts in parallel
 */
export async function rewriteTexts(texts: string[]): Promise<string[]> {
  return Promise.all(texts.map((text) => rewriteText(text)));
}
