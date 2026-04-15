/**
 * Intent Detector
 *
 * Analyzes prompt to extract intent
 */

export type Intent = {
  type: "pitch" | "report" | "educational";
  topic: string;
  goal: "inform" | "persuade" | "educate" | "pitch" | "report";
  tone: "formal" | "modern" | "bold" | "minimal" | "friendly";
  audience?: string;
  keywords: string[];
};

/**
 * Detect intent from prompt
 */
export function detectIntent(prompt: string): Intent {
  const lower = prompt.toLowerCase();

  // Detect type
  let type: "pitch" | "report" | "educational" = "pitch";
  if (lower.includes("report") || lower.includes("quarterly") || lower.includes("q1") || lower.includes("q2") || lower.includes("q3") || lower.includes("q4") || lower.includes("financial") || lower.includes("metrics")) {
    type = "report";
  } else if (lower.includes("tutorial") || lower.includes("course") || lower.includes("introduction") || lower.includes("learn") || lower.includes("guide") || lower.includes("education")) {
    type = "educational";
  }

  // Detect goal
  let goal: Intent["goal"] = type === "pitch" ? "pitch" : type === "report" ? "report" : "educate";

  // Detect tone
  let tone: Intent["tone"] = "modern";
  if (lower.includes("formal") || lower.includes("corporate") || lower.includes("professional")) {
    tone = "formal";
  } else if (lower.includes("bold") || lower.includes("aggressive")) {
    tone = "bold";
  } else if (lower.includes("minimal") || lower.includes("clean")) {
    tone = "minimal";
  } else if (lower.includes("friendly") || lower.includes("casual")) {
    tone = "friendly";
  }

  // Extract topic (remove template keywords)
  let topic = prompt;
  const removeWords = ["pitch", "deck", "presentation", "report", "tutorial", "course", "introduction", "guide", "for", "about"];
  for (const word of removeWords) {
    topic = topic.replace(new RegExp(`\\b${word}\\b`, "gi"), "");
  }
  topic = topic.trim();

  // Extract keywords
  const keywords = topic.split(/\s+/).filter((w) => w.length > 3);

  return {
    type,
    topic,
    goal,
    tone,
    keywords,
  };
}
