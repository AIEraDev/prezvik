/**
 * Educational Template
 *
 * Teaching/tutorial structure
 */

export interface EducationalInput {
  title: string;
  topic?: string;
}

export function educationalTemplate(input: EducationalInput) {
  const topic = input.topic || "the topic";

  return {
    version: "1.0",
    meta: {
      title: input.title,
      theme: "minimal",
    },
    slides: [
      {
        id: "slide-1",
        type: "hero",
        content: {
          title: input.title,
          subtitle: `A comprehensive guide to ${topic}`,
        },
      },
      {
        id: "slide-2",
        type: "bullet-list",
        content: {
          title: "What You'll Learn",
          bullets: ["Core concepts and fundamentals", "Practical applications", "Best practices", "Common pitfalls to avoid"],
        },
      },
      {
        id: "slide-3",
        type: "bullet-list",
        content: {
          title: "Key Concepts",
          bullets: ["Foundation principles", "Important terminology", "How it works", "Why it matters"],
        },
      },
      {
        id: "slide-4",
        type: "two-column",
        content: {
          title: "Before vs After",
          left: [
            { type: "text", text: "Without this knowledge" },
            { type: "list", items: ["Confusion", "Inefficiency", "Mistakes"] },
          ],
          right: [
            { type: "text", text: "With this knowledge" },
            { type: "list", items: ["Clarity", "Efficiency", "Confidence"] },
          ],
        },
      },
      {
        id: "slide-5",
        type: "bullet-list",
        content: {
          title: "Next Steps",
          bullets: ["Practice the concepts", "Apply to real projects", "Explore advanced topics", "Share your knowledge"],
        },
      },
    ],
  };
}
