/**
 * Pitch Deck Template
 *
 * Classic investor pitch structure
 */

export interface PitchInput {
  title: string;
  companyName?: string;
}

export function pitchTemplate(input: PitchInput) {
  const company = input.companyName || "Our Company";

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
          kicker: "Investor Pitch",
          title: input.title,
          subtitle: `${company} - Transforming the industry`,
        },
      },
      {
        id: "slide-2",
        type: "bullet-list",
        content: {
          title: "The Problem",
          bullets: ["Market pain point is widespread", "Current solutions are inadequate", "Opportunity is massive and growing", "Timing is perfect for disruption"],
        },
      },
      {
        id: "slide-3",
        type: "bullet-list",
        content: {
          title: "Our Solution",
          bullets: ["Simple and intuitive", "Scalable architecture", "AI-powered intelligence", "10x better than alternatives"],
        },
      },
      {
        id: "slide-4",
        type: "stat-trio",
        content: {
          title: "Traction",
          stats: [
            { label: "Users", value: "10K", delta: "+20%" },
            { label: "Revenue", value: "$50K", delta: "+15%" },
            { label: "Growth", value: "30%", delta: "+5pts" },
          ],
        },
      },
      {
        id: "slide-5",
        type: "bullet-list",
        content: {
          title: "Market Opportunity",
          bullets: ["$10B+ addressable market", "Growing 25% annually", "Underserved segment", "Clear path to dominance"],
        },
      },
      {
        id: "slide-6",
        type: "bullet-list",
        content: {
          title: "Why Now?",
          bullets: ["Technology is ready", "Market conditions are ideal", "Competition is weak", "Team is exceptional"],
        },
      },
    ],
  };
}
