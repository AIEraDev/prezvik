import type { Slide } from "@kyro/schema";

export interface ExtractedContent {
  title: string;
  subtitle?: string;
  kicker?: string;
  body?: string;
  bullets: string[];
  bulletItems: Array<{ text: string; icon?: string; highlight?: boolean }>;
  stats: Array<{ value: string; label: string; visualWeight: string }>;
  quote?: { text: string; author?: string; role?: string };
  columns: Array<{ heading?: string; bullets: string[] }>;
}

export function extractFromBlocks(slide: Slide): ExtractedContent {
  const blocks = slide.content ?? [];

  console.log(`[extractFromBlocks] Slide type: ${(slide as any).type}, blocks: ${blocks.length}`);
  console.log(`[extractFromBlocks] Block types: ${blocks.map((b: any) => b.type).join(", ")}`);

  const headings = blocks.filter((b: any) => b.type === "heading");
  console.log(`[extractFromBlocks] Found ${headings.length} headings: ${headings.map((h: any) => `${h.level}:${h.value?.substring(0, 20)}`).join(", ")}`);
  const texts = blocks.filter((b: any) => b.type === "text");
  const allBulletBlocks = blocks.filter((b: any) => b.type === "bullets");
  const stats = blocks.filter((b: any) => b.type === "stat");
  const quoteBlock = blocks.find((b: any) => b.type === "quote");

  // Title: first h1, then first h2, then first heading, then fallback
  const titleBlock = headings.find((h: any) => h.level === "h1") ?? headings.find((h: any) => h.level === "h2") ?? headings[0];

  // Kicker: last h3 before the title, or undefined
  const kickerBlock = headings.find((h: any) => h.level === "h3");

  // Subtitle: first text block
  const subtitleBlock = texts[0];

  // Body: second text block (used in quote/section slides)
  const bodyBlock = texts[1];

  // Bullets: flatten all bullet blocks into one list
  const allBulletItems = allBulletBlocks.flatMap((b: any) => b.items ?? []);
  const bulletStrings = allBulletItems.map((i: any) => i.text);

  // Two-column extraction: pair headings with subsequent bullet blocks
  const columns: Array<{ heading?: string; bullets: string[] }> = [];
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i];
    if (block.type === "heading" && block !== titleBlock) {
      const nextBullets = blocks[i + 1];
      columns.push({
        heading: (block as any).value,
        bullets: nextBullets?.type === "bullets" ? ((nextBullets as any).items ?? []).map((x: any) => x.text) : [],
      });
      i += nextBullets?.type === "bullets" ? 2 : 1;
    } else {
      i++;
    }
  }

  const result = {
    title: (titleBlock as any)?.value ?? "Untitled",
    subtitle: (subtitleBlock as any)?.value,
    kicker: (kickerBlock as any)?.value,
    body: (bodyBlock as any)?.value,
    bullets: bulletStrings,
    bulletItems: allBulletItems as any,
    stats: stats.map((s: any) => ({
      value: s.value ?? "",
      label: s.label ?? "",
      visualWeight: s.visualWeight ?? "normal",
    })),
    quote: quoteBlock ? { text: (quoteBlock as any).text ?? "", author: (quoteBlock as any).author, role: (quoteBlock as any).role } : undefined,
    columns,
  };

  console.log(`[extractFromBlocks] Extracted title: "${result.title.substring(0, 30)}..."`);
  return result;
}
