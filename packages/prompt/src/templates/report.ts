/**
 * Report Template
 *
 * Business report structure
 */

export interface ReportInput {
  title: string;
  period?: string;
}

export function reportTemplate(input: ReportInput) {
  const period = input.period || "Q4 2024";

  return {
    version: "1.0",
    meta: {
      title: input.title,
      theme: "executive",
    },
    slides: [
      {
        id: "slide-1",
        type: "hero",
        content: {
          kicker: period,
          title: input.title,
          subtitle: "Executive Summary",
        },
      },
      {
        id: "slide-2",
        type: "stat-trio",
        content: {
          title: "Key Metrics",
          stats: [
            { label: "Revenue", value: "$2.4M", delta: "+12%" },
            { label: "Customers", value: "1,250", delta: "+8%" },
            { label: "NPS", value: "71", delta: "+5pts" },
          ],
        },
      },
      {
        id: "slide-3",
        type: "bullet-list",
        content: {
          title: "Highlights",
          bullets: ["Exceeded revenue targets", "Strong customer retention", "Successful product launch", "Expanded team capabilities"],
        },
      },
      {
        id: "slide-4",
        type: "bullet-list",
        content: {
          title: "Challenges",
          bullets: ["Market headwinds", "Increased competition", "Resource constraints", "Scaling operations"],
        },
      },
      {
        id: "slide-5",
        type: "bullet-list",
        content: {
          title: "Next Quarter Focus",
          bullets: ["Accelerate growth", "Improve efficiency", "Launch new features", "Strengthen partnerships"],
        },
      },
    ],
  };
}
