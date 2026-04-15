/**
 * Flow Layout Engine
 *
 * Automatic stacking with proper spacing
 * This is what makes slides look professional
 */

import type { BoundingBox, FlowConfig, PositionedElement, Size } from "./types";

/**
 * Flow layout engine
 *
 * Automatically positions elements in a flow (vertical or horizontal)
 */
export class FlowLayout {
  private config: FlowConfig;
  private currentX: number;
  private currentY: number;
  private maxWidth: number;
  private maxHeight: number;

  constructor(config: FlowConfig, containerBox: BoundingBox) {
    this.config = config;

    const padding = config.padding || { top: 0, right: 0, bottom: 0, left: 0 };

    this.currentX = containerBox.x + padding.left;
    this.currentY = containerBox.y + padding.top;
    this.maxWidth = containerBox.width - padding.left - padding.right;
    this.maxHeight = containerBox.height - padding.top - padding.bottom;
  }

  /**
   * Add element to flow
   */
  addElement(size: Size, id: string = ""): PositionedElement {
    const box: BoundingBox = {
      x: this.currentX,
      y: this.currentY,
      width: size.width,
      height: size.height,
    };

    // Apply alignment
    if (this.config.direction === "vertical") {
      // Horizontal alignment for vertical flow
      switch (this.config.align) {
        case "center":
          box.x = this.currentX + (this.maxWidth - size.width) / 2;
          break;
        case "right":
          box.x = this.currentX + this.maxWidth - size.width;
          break;
      }
    } else {
      // Vertical alignment for horizontal flow
      switch (this.config.verticalAlign) {
        case "middle":
          box.y = this.currentY + (this.maxHeight - size.height) / 2;
          break;
        case "bottom":
          box.y = this.currentY + this.maxHeight - size.height;
          break;
      }
    }

    // Advance position
    if (this.config.direction === "vertical") {
      this.currentY += size.height + this.config.gap;
    } else {
      this.currentX += size.width + this.config.gap;
    }

    return { id, box };
  }

  /**
   * Get remaining space
   */
  getRemainingSpace(): Size {
    if (this.config.direction === "vertical") {
      return {
        width: this.maxWidth,
        height: Math.max(0, this.maxHeight - (this.currentY - this.config.padding!.top)),
      };
    } else {
      return {
        width: Math.max(0, this.maxWidth - (this.currentX - this.config.padding!.left)),
        height: this.maxHeight,
      };
    }
  }

  /**
   * Get current position
   */
  getCurrentPosition(): { x: number; y: number } {
    return {
      x: this.currentX,
      y: this.currentY,
    };
  }
}

/**
 * Create vertical flow layout
 */
export function createVerticalFlow(containerBox: BoundingBox, gap: number = 20, align: "left" | "center" | "right" = "left", padding?: { top: number; right: number; bottom: number; left: number }): FlowLayout {
  return new FlowLayout(
    {
      direction: "vertical",
      gap,
      align,
      padding,
    },
    containerBox,
  );
}

/**
 * Create horizontal flow layout
 */
export function createHorizontalFlow(containerBox: BoundingBox, gap: number = 20, verticalAlign: "top" | "middle" | "bottom" = "top", padding?: { top: number; right: number; bottom: number; left: number }): FlowLayout {
  return new FlowLayout(
    {
      direction: "horizontal",
      gap,
      verticalAlign,
      padding,
    },
    containerBox,
  );
}
