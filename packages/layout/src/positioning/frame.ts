/**
 * Frame System
 *
 * Bounding box for layout nodes
 * Every node gets a frame assigned at runtime
 */

export interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Create a frame from coordinates
 */
export function createFrame(x: number, y: number, width: number, height: number): Frame {
  return { x, y, width, height };
}

/**
 * Apply padding to a frame (shrinks the frame)
 */
export function applyPadding(frame: Frame, padding: number): Frame {
  return {
    x: frame.x + padding,
    y: frame.y + padding,
    width: frame.width - padding * 2,
    height: frame.height - padding * 2,
  };
}

/**
 * Apply margin to a frame (shrinks the frame)
 */
export function applyMargin(frame: Frame, margin: number): Frame {
  return {
    x: frame.x + margin,
    y: frame.y + margin,
    width: frame.width - margin * 2,
    height: frame.height - margin * 2,
  };
}

/**
 * Split frame vertically into N equal parts
 */
export function splitVertical(frame: Frame, count: number, gap: number = 0): Frame[] {
  const totalGap = gap * (count - 1);
  const itemHeight = (frame.height - totalGap) / count;

  return Array.from({ length: count }, (_, i) => ({
    x: frame.x,
    y: frame.y + i * (itemHeight + gap),
    width: frame.width,
    height: itemHeight,
  }));
}

/**
 * Split frame horizontally into N equal parts
 */
export function splitHorizontal(frame: Frame, count: number, gap: number = 0): Frame[] {
  const totalGap = gap * (count - 1);
  const itemWidth = (frame.width - totalGap) / count;

  return Array.from({ length: count }, (_, i) => ({
    x: frame.x + i * (itemWidth + gap),
    y: frame.y,
    width: itemWidth,
    height: frame.height,
  }));
}
