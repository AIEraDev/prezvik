/**
 * Layout Switching
 *
 * Next-level intelligence: automatically choose better layouts
 * We are NOT obeying the schema blindly - we interpret intent intelligently
 */

/**
 * Suggest optimal layout based on content characteristics
 *
 * Example: 12 bullets → bullet-list is WRONG → switch to two-column
 */
export function suggestLayout(type: string, content: any): string {
  // Bullet list with too many items → two-column
  if (type === "bullet-list" && content.bullets?.length > 8) {
    return "two-column";
  }

  // Hero with very long title → regular content slide
  if (type === "hero" && content.title?.length > 80) {
    return "bullet-list";
  }

  // Two-column with unbalanced content → single column
  if (type === "two-column") {
    const leftLength = content.left?.length || 0;
    const rightLength = content.right?.length || 0;

    if (leftLength === 0 || rightLength === 0) {
      return "bullet-list";
    }
  }

  return type;
}

/**
 * Check if layout switch is recommended
 */
export function shouldSwitchLayout(type: string, content: any): boolean {
  return suggestLayout(type, content) !== type;
}

/**
 * Get layout recommendation with reason
 */
export function getLayoutRecommendation(type: string, content: any): { layout: string; reason?: string } {
  const suggested = suggestLayout(type, content);

  if (suggested === type) {
    return { layout: type };
  }

  let reason: string | undefined;

  if (type === "bullet-list" && content.bullets?.length > 8) {
    reason = "Too many bullets - two-column layout is more readable";
  } else if (type === "hero" && content.title?.length > 80) {
    reason = "Title too long for hero layout";
  } else if (type === "two-column") {
    const leftLength = content.left?.length || 0;
    const rightLength = content.right?.length || 0;

    if (leftLength === 0 || rightLength === 0) {
      reason = "Unbalanced columns - single column is better";
    }
  }

  return { layout: suggested, reason };
}

/**
 * Transform content for new layout type
 */
export function transformContentForLayout(originalType: string, newType: string, content: any): any {
  // Bullet list → Two column
  if (originalType === "bullet-list" && newType === "two-column") {
    const bullets = content.bullets || [];
    const midpoint = Math.ceil(bullets.length / 2);

    return {
      title: content.title,
      left: bullets.slice(0, midpoint).map((text: string) => ({ type: "text", text })),
      right: bullets.slice(midpoint).map((text: string) => ({ type: "text", text })),
    };
  }

  // Hero → Bullet list
  if (originalType === "hero" && newType === "bullet-list") {
    return {
      title: content.title,
      bullets: content.subtitle ? [content.subtitle] : [],
    };
  }

  return content;
}
