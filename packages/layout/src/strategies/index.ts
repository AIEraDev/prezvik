import type { LayoutTree, ContainerNode, TextNode } from "../types.js";
import type { Slide } from "@kyro/schema";
import { extractFromBlocks } from "./content-extractor.js";

export { extractFromBlocks } from "./content-extractor.js";

// ─── Shared helpers ────────────────────────────────────────────────────────

function textNode(
  id: string,
  content: string,
  fontSize: number,
  opts: {
    fontRole?: string;
    colorRole?: string;
    weightRole?: string;
    align?: string;
    fontWeight?: string;
  } = {},
): TextNode {
  return {
    id,
    type: "text",
    content,
    text: {
      fontSize,
      fontWeight: (opts.fontWeight ?? "normal") as any,
      align: (opts.align ?? "left") as any,
      fontRole: opts.fontRole as any,
      colorRole: opts.colorRole as any,
      weightRole: opts.weightRole as any,
    },
  };
}

function vFlow(id: string, children: any[], gap = 3, padding = { top: 8, right: 8, bottom: 8, left: 8 }, align?: string): ContainerNode {
  return {
    id,
    type: "container",
    children,
    layout: { type: "flow", direction: "vertical", gap, align: align as any } as any,
    padding,
  };
}

function hFlow(id: string, children: any[], gap = 4, padding = { top: 6, right: 6, bottom: 6, left: 6 }): ContainerNode {
  return {
    id,
    type: "container",
    children,
    layout: { type: "flow", direction: "horizontal", gap } as any,
    padding,
  };
}

function grid(id: string, children: any[], columns: number, colGap = 4, rowGap = 4, padding = { top: 8, right: 6, bottom: 8, left: 6 }): ContainerNode {
  return {
    id,
    type: "container",
    children,
    layout: { type: "grid", columns, columnGap: colGap, rowGap } as any,
    padding,
  };
}

// ─── 1. hero ──────────────────────────────────────────────────────────────

export function layoutHero(slide: Slide): LayoutTree {
  const c = extractFromBlocks(slide);
  const children: any[] = [];

  if (c.kicker) {
    children.push(
      textNode("kicker", c.kicker, 14, {
        fontRole: "small",
        colorRole: "textMuted",
        weightRole: "bold",
        align: "center",
        fontWeight: "bold",
      }),
    );
  }

  // Adaptive font: shrink for long titles
  const titleSize = c.title.length > 40 ? 44 : c.title.length > 25 ? 54 : 64;
  children.push(
    textNode("title", c.title, titleSize, {
      fontRole: "hero",
      colorRole: "text",
      weightRole: "bold",
      align: "center",
      fontWeight: "bold",
    }),
  );

  if (c.subtitle) {
    children.push(
      textNode("subtitle", c.subtitle, 24, {
        fontRole: "h2",
        colorRole: "textMuted",
        weightRole: "regular",
        align: "center",
      }),
    );
  }

  return {
    root: vFlow("root", children, 3, { top: 10, right: 10, bottom: 10, left: 10 }, "center"),
  };
}

// ─── 2. section ───────────────────────────────────────────────────────────
// Large centered label — minimal, used as a divider between major sections

export function layoutSection(slide: Slide): LayoutTree {
  const c = extractFromBlocks(slide);
  const children: any[] = [];

  children.push(
    textNode("label", c.title, 48, {
      fontRole: "h1",
      colorRole: "text",
      weightRole: "bold",
      align: "center",
      fontWeight: "bold",
    }),
  );

  if (c.subtitle) {
    children.push(
      textNode("sublabel", c.subtitle, 20, {
        fontRole: "body",
        colorRole: "textMuted",
        weightRole: "regular",
        align: "center",
      }),
    );
  }

  return {
    root: vFlow("root", children, 4, { top: 28, right: 15, bottom: 28, left: 15 }, "center"),
  };
}

// ─── 3. bullet-list ───────────────────────────────────────────────────────

export function layoutBulletList(slide: Slide): LayoutTree {
  const c = extractFromBlocks(slide);

  const titleNode = textNode("title", c.title, 32, {
    fontRole: "h1",
    colorRole: "text",
    weightRole: "bold",
    fontWeight: "bold",
  });

  const bulletNodes = c.bulletItems.map((item, i) => textNode(`bullet-${i}`, `${item.icon ? item.icon + "  " : "• "}${item.text}`, 16, { fontRole: "body", colorRole: item.highlight ? "accent" : "text", weightRole: "regular" }));

  const bodyContainer = vFlow("body", bulletNodes, 2, { top: 0, right: 0, bottom: 0, left: 4 });

  return {
    root: vFlow("root", [titleNode, bodyContainer], 5, { top: 8, right: 8, bottom: 8, left: 10 }),
  };
}

// ─── 4. two-column ────────────────────────────────────────────────────────

export function layoutTwoColumn(slide: Slide): LayoutTree {
  const c = extractFromBlocks(slide);

  const titleNode = textNode("title", c.title, 28, {
    fontRole: "h1",
    colorRole: "text",
    weightRole: "bold",
    fontWeight: "bold",
  });

  // Build two columns from extracted column data or split bullets
  let leftChildren: any[];
  let rightChildren: any[];

  if (c.columns.length >= 2) {
    leftChildren = [...(c.columns[0].heading ? [textNode("lh", c.columns[0].heading, 18, { fontRole: "h2", colorRole: "text", weightRole: "bold", fontWeight: "bold" })] : []), ...c.columns[0].bullets.map((b, i) => textNode(`lb-${i}`, `• ${b}`, 14, { fontRole: "body", colorRole: "text" }))];
    rightChildren = [...(c.columns[1].heading ? [textNode("rh", c.columns[1].heading, 18, { fontRole: "h2", colorRole: "text", weightRole: "bold", fontWeight: "bold" })] : []), ...c.columns[1].bullets.map((b, i) => textNode(`rb-${i}`, `• ${b}`, 14, { fontRole: "body", colorRole: "text" }))];
  } else {
    // Fallback: split bullet list in half
    const mid = Math.ceil(c.bulletItems.length / 2);
    leftChildren = c.bulletItems.slice(0, mid).map((b, i) => textNode(`lb-${i}`, `• ${b.text}`, 14, { fontRole: "body", colorRole: "text" }));
    rightChildren = c.bulletItems.slice(mid).map((b, i) => textNode(`rb-${i}`, `• ${b.text}`, 14, { fontRole: "body", colorRole: "text" }));
  }

  const leftCol = vFlow("left", leftChildren, 2, { top: 0, right: 3, bottom: 0, left: 0 });
  const rightCol = vFlow("right", rightChildren, 2, { top: 0, right: 0, bottom: 0, left: 3 });
  const cols = hFlow("cols", [leftCol, rightCol], 4, { top: 0, right: 0, bottom: 0, left: 0 });

  return {
    root: vFlow("root", [titleNode, cols], 5, { top: 8, right: 8, bottom: 8, left: 10 }),
  };
}

// ─── 5. stat-trio ─────────────────────────────────────────────────────────

export function layoutStatTrio(slide: Slide): LayoutTree {
  const c = extractFromBlocks(slide);

  const titleNode = textNode("title", c.title, 28, {
    fontRole: "h1",
    colorRole: "text",
    weightRole: "bold",
    fontWeight: "bold",
    align: "center",
  });

  // Use up to 3 stats; pad with placeholder if fewer
  const stats = c.stats.slice(0, 3);
  while (stats.length < 3) {
    stats.push({ value: "—", label: "", visualWeight: "normal" });
  }

  const statCells = stats.map((st, i) => {
    const valueFontSize = st.visualWeight === "hero" ? 52 : st.visualWeight === "emphasis" ? 42 : 34;
    const valueNode = textNode(`sv-${i}`, st.value, valueFontSize, {
      fontRole: "hero",
      colorRole: "accent",
      weightRole: "bold",
      fontWeight: "bold",
      align: "center",
    });
    const labelNode = textNode(`sl-${i}`, st.label, 13, {
      fontRole: "small",
      colorRole: "textMuted",
      weightRole: "regular",
      align: "center",
    });
    return vFlow(`stat-${i}`, [valueNode, labelNode], 1, { top: 4, right: 4, bottom: 4, left: 4 }, "center");
  });

  const statRow = grid("stats", statCells, 3, 4, 0, { top: 6, right: 4, bottom: 4, left: 4 });

  return {
    root: vFlow("root", [titleNode, statRow], 6, { top: 10, right: 8, bottom: 10, left: 8 }, "center"),
  };
}

// ─── 6. quote ─────────────────────────────────────────────────────────────

export function layoutQuote(slide: Slide): LayoutTree {
  const c = extractFromBlocks(slide);
  const children: any[] = [];

  // Opening mark
  children.push(
    textNode("mark", "\u201C", 72, {
      fontRole: "hero",
      colorRole: "accent",
      weightRole: "bold",
      align: "center",
      fontWeight: "bold",
    }),
  );

  // Quote body — use quote block if present, else subtitle
  const quoteText = c.quote?.text ?? c.subtitle ?? c.title;
  children.push(
    textNode("quote", quoteText, 22, {
      fontRole: "h2",
      colorRole: "text",
      weightRole: "regular",
      align: "center",
    }),
  );

  // Attribution
  if (c.quote?.author) {
    const attribution = c.quote.role ? `— ${c.quote.author}, ${c.quote.role}` : `— ${c.quote.author}`;
    children.push(
      textNode("attr", attribution, 14, {
        fontRole: "small",
        colorRole: "textMuted",
        weightRole: "regular",
        align: "center",
      }),
    );
  }

  return {
    root: vFlow("root", children, 4, { top: 15, right: 14, bottom: 15, left: 14 }, "center"),
  };
}

// ─── 7. comparison ────────────────────────────────────────────────────────
// Explicit A vs B — two labeled cards side by side

export function layoutComparison(slide: Slide): LayoutTree {
  const c = extractFromBlocks(slide);

  const titleNode = textNode("title", c.title, 28, {
    fontRole: "h1",
    colorRole: "text",
    weightRole: "bold",
    fontWeight: "bold",
  });

  const buildCard = (prefix: string, col: { heading?: string; bullets: string[] }, colorRole: string) => {
    const children: any[] = [];
    if (col.heading) {
      children.push(
        textNode(`${prefix}-h`, col.heading, 18, {
          fontRole: "h2",
          colorRole,
          weightRole: "bold",
          fontWeight: "bold",
          align: "center",
        }),
      );
    }
    col.bullets.forEach((b, i) => {
      children.push(
        textNode(`${prefix}-b${i}`, `• ${b}`, 14, {
          fontRole: "body",
          colorRole: "text",
        }),
      );
    });
    return vFlow(`${prefix}-card`, children, 2, { top: 5, right: 5, bottom: 5, left: 5 });
  };

  const left = c.columns[0] ?? { heading: "Option A", bullets: c.bullets.slice(0, Math.ceil(c.bullets.length / 2)) };
  const right = c.columns[1] ?? { heading: "Option B", bullets: c.bullets.slice(Math.ceil(c.bullets.length / 2)) };

  const cols = hFlow("cols", [buildCard("l", left, "accent"), buildCard("r", right, "secondary")], 6, { top: 0, right: 0, bottom: 0, left: 0 });

  return {
    root: vFlow("root", [titleNode, cols], 5, { top: 8, right: 8, bottom: 8, left: 8 }),
  };
}

// ─── 8. timeline ──────────────────────────────────────────────────────────
// Ordered steps/phases — each bullet becomes a numbered milestone

export function layoutTimeline(slide: Slide): LayoutTree {
  const c = extractFromBlocks(slide);

  const titleNode = textNode("title", c.title, 28, {
    fontRole: "h1",
    colorRole: "text",
    weightRole: "bold",
    fontWeight: "bold",
  });

  const items = c.bulletItems.length > 0 ? c.bulletItems : c.bullets.map((b) => ({ text: b }));

  const stepNodes = items.map((item, i) => {
    const numNode = textNode(`n-${i}`, `${i + 1}`, 20, {
      fontRole: "h2",
      colorRole: "accent",
      weightRole: "bold",
      fontWeight: "bold",
      align: "center",
    });
    const labelNode = textNode(`l-${i}`, item.text, 15, {
      fontRole: "body",
      colorRole: "text",
      weightRole: "regular",
    });
    // Each step: number + label side by side
    return hFlow(`step-${i}`, [numNode, labelNode], 3, { top: 2, right: 2, bottom: 2, left: 2 });
  });

  const stepsContainer = vFlow("steps", stepNodes, 3, { top: 0, right: 4, bottom: 0, left: 4 });

  return {
    root: vFlow("root", [titleNode, stepsContainer], 5, { top: 8, right: 8, bottom: 8, left: 10 }),
  };
}

// ─── 9. grid ──────────────────────────────────────────────────────────────
// 2×2 or 2×3 card grid — each bullet becomes a card

export function layoutGrid(slide: Slide): LayoutTree {
  const c = extractFromBlocks(slide);

  const titleNode = textNode("title", c.title, 28, {
    fontRole: "h1",
    colorRole: "text",
    weightRole: "bold",
    fontWeight: "bold",
  });

  const items = c.bulletItems.length > 0 ? c.bulletItems : c.bullets.map((b) => ({ text: b }));
  const cols = items.length <= 4 ? 2 : 3;

  const cards = items.map((item, i) => {
    const children: any[] = [];
    if ((item as any).icon) {
      children.push(
        textNode(`icon-${i}`, (item as any).icon, 24, {
          fontRole: "body",
          colorRole: "accent",
          align: "center",
        }),
      );
    }
    children.push(
      textNode(`text-${i}`, item.text, 14, {
        fontRole: "body",
        colorRole: "text",
        weightRole: "regular",
      }),
    );
    return vFlow(`card-${i}`, children, 2, { top: 4, right: 4, bottom: 4, left: 4 }, "center");
  });

  const cardGrid = grid("grid", cards, cols, 4, 4, { top: 4, right: 4, bottom: 4, left: 4 });

  return {
    root: vFlow("root", [titleNode, cardGrid], 5, { top: 8, right: 8, bottom: 8, left: 8 }),
  };
}

// ─── 10. closing ──────────────────────────────────────────────────────────

export function layoutClosing(slide: Slide): LayoutTree {
  const c = extractFromBlocks(slide);
  const children: any[] = [];

  children.push(
    textNode("title", c.title, 48, {
      fontRole: "hero",
      colorRole: "text",
      weightRole: "bold",
      align: "center",
      fontWeight: "bold",
    }),
  );

  if (c.subtitle) {
    children.push(
      textNode("subtitle", c.subtitle, 20, {
        fontRole: "body",
        colorRole: "textMuted",
        weightRole: "regular",
        align: "center",
      }),
    );
  }

  // Optional CTA from body or second text block
  if (c.body) {
    children.push(
      textNode("cta", c.body, 16, {
        fontRole: "small",
        colorRole: "accent",
        weightRole: "bold",
        align: "center",
        fontWeight: "bold",
      }),
    );
  }

  return {
    root: vFlow("root", children, 4, { top: 20, right: 14, bottom: 20, left: 14 }, "center"),
  };
}

// ─── Fallback ─────────────────────────────────────────────────────────────

export function layoutFallback(slide: Slide): LayoutTree {
  const c = extractFromBlocks(slide);
  // Route to the best-fit strategy based on available content
  if (c.stats.length >= 2) return layoutStatTrio(slide);
  if (c.quote) return layoutQuote(slide);
  if (c.columns.length >= 2) return layoutTwoColumn(slide);
  if (c.bulletItems.length > 0) return layoutBulletList(slide);
  return layoutSection(slide);
}
