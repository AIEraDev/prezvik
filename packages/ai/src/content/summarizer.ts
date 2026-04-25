/**
 * Content Summarizer
 *
 * Vercel AI SDK implementation
 */

import { generateText } from "ai";
import { openai, anthropic, groq } from "../providers/index.js";

/**
 * Summarize text to fit slide constraints
 */
export async function summarize(text: string, maxLength: number = 100, options: { provider?: string } = {}): Promise<string> {
  const provider = options.provider === "anthropic" ? anthropic : options.provider === "groq" ? groq : openai;

  const prompt = `Summarize this text into one concise sentence for a presentation slide.
Keep it under ${maxLength} characters.

Original: "${text}"

Return ONLY the summary, no explanation.`;

  try {
    const result = await generateText({
      model: provider(options.provider === "anthropic" ? "claude-3-5-sonnet-20241022" : options.provider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o"),
      prompt,
      temperature: 0.5,
      maxTokens: 50,
    });

    return result.text?.trim() || text;
  } catch (error) {
    console.error("Failed to summarize:", error);
    return text;
  }
}

/**
 * Summarize to one sentence
 */
export async function summarizeToSentence(text: string, options?: { provider?: string }): Promise<string> {
  return summarize(text, 100, options);
}

/**
 * Summarize to bullet point
 */
export async function summarizeToBullet(text: string, options?: { provider?: string }): Promise<string> {
  return summarize(text, 80, options);
}
