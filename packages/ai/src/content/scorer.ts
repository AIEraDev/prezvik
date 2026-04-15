/**
 * Content Quality Scorer
 *
 * Score presentation content quality (VERY IMPORTANT)
 */

import OpenAI from "openai";

export interface ContentScore {
  score: number; // 1-10
  feedback: string;
}

/**
 * Score content quality for presentations
 */
export async function scoreContent(text: string): Promise<ContentScore> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable not set");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `Score this presentation text from 1-10 for quality.
Consider: clarity, impact, conciseness, professionalism.

Text: "${text}"

Return ONLY valid JSON:
{
  "score": <number 1-10>,
  "feedback": "<brief feedback>"
}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    return { score: 5, feedback: "Unable to score" };
  }

  try {
    const result = JSON.parse(content);
    return {
      score: result.score ?? 5,
      feedback: result.feedback ?? "No feedback",
    };
  } catch {
    return { score: 5, feedback: "Unable to parse score" };
  }
}

/**
 * Score entire slide
 */
export async function scoreSlide(content: any): Promise<ContentScore> {
  // Combine all text from slide
  const texts: string[] = [];

  if (content.title) texts.push(content.title);
  if (content.subtitle) texts.push(content.subtitle);
  if (content.bullets) texts.push(...content.bullets);

  const combined = texts.join(". ");
  return scoreContent(combined);
}
