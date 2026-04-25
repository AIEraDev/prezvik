/**
 * Content Rewriter
 *
 * Vercel AI SDK implementation
 */

import { generateText } from "ai";
import { openai, anthropic, groq } from "../providers/index.js";

/**
 * Rewrite text for clarity and impact
 */
export async function rewriteText(text: string, options: { provider?: string } = {}): Promise<string> {
  const provider = options.provider === "anthropic" ? anthropic : options.provider === "groq" ? groq : openai;

  const prompt = `Rewrite this text for a professional presentation slide.
Make it clear, concise, and impactful. Keep it under 100 characters if possible.

Original: "${text}"

Return ONLY the rewritten text, no explanation.`;

  try {
    const result = await generateText({
      model: provider(options.provider === "anthropic" ? "claude-3-5-sonnet-20241022" : options.provider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 100,
    });

    return result.text || text;
  } catch (error) {
    console.error("Failed to rewrite text:", error);
    return text;
  }
}

/**
 * Rewrite multiple texts in parallel
 */
export async function rewriteTexts(texts: string[], options: { provider?: string } = {}): Promise<string[]> {
  return Promise.all(texts.map((text) => rewriteText(text, options)));
}
