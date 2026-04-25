/**
 * Content Quality Scorer
 *
 * Vercel AI SDK implementation
 */

import { generateText } from "ai";
import { openai, anthropic, groq } from "../providers/index.js";

export interface ContentScore {
  score: number; // 1-10
  feedback: string;
}

/**
 * Score content quality for presentations
 */
export async function scoreContent(text: string, options: { provider?: string } = {}): Promise<ContentScore> {
  const provider = options.provider === "anthropic" ? anthropic : options.provider === "groq" ? groq : openai;

  const prompt = `Score this presentation text from 1-10 for quality.
Consider: clarity, impact, conciseness, professionalism.

Text: "${text}"

Return ONLY valid JSON:
{
  "score": <number 1-10>,
  "feedback": "<brief feedback>"
}`;

  try {
    const result = await generateText({
      model: provider(options.provider === "anthropic" ? "claude-3-5-sonnet-20241022" : options.provider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o"),
      prompt,
      temperature: 0.3,
      maxTokens: 200,
    });

    const parsed = JSON.parse(result.text);
    return {
      score: parsed.score ?? 5,
      feedback: parsed.feedback ?? "No feedback",
    };
  } catch (error) {
    console.error("Failed to score content:", error);
    return { score: 5, feedback: "Unable to score" };
  }
}

/**
 * Score entire slide
 */
export async function scoreSlide(content: any, options: { provider?: string } = {}): Promise<ContentScore> {
  // Combine all text from slide
  const texts: string[] = [];

  if (content.title) texts.push(content.title);
  if (content.subtitle) texts.push(content.subtitle);
  if (content.bullets) texts.push(...content.bullets);

  const combined = texts.join(". ");
  return scoreContent(combined, options);
}
