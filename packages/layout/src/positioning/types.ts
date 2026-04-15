/**
 * Layout Positioning System Types
 *
 * Proper coordinate system for professional layouts
 */

/**
 * Position in absolute coordinates
 */
export interface AbsolutePosition {
  x: number;
  y: number;
}

/**
 * Size in absolute units
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Bounding box (position + size)
 */
export interface BoundingBox extends AbsolutePosition, Size {}

/**
 * Padding (all sides)
 */
export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Margin (all sides)
 */
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Layout mode
 */
export type LayoutMode = "absolute" | "flow";

/**
 * Flow direction
 */
export type FlowDirection = "vertical" | "horizontal";

/**
 * Alignment
 */
export type HorizontalAlign = "left" | "center" | "right";
export type VerticalAlign = "top" | "middle" | "bottom";

/**
 * Positioned element
 */
export interface PositionedElement {
  id: string;
  box: BoundingBox;
  zIndex?: number;
}

/**
 * Flow container configuration
 */
export interface FlowConfig {
  direction: FlowDirection;
  gap: number;
  align?: HorizontalAlign;
  verticalAlign?: VerticalAlign;
  padding?: Padding;
}

/**
 * Absolute container configuration
 */
export interface AbsoluteConfig {
  bounds: BoundingBox;
  padding?: Padding;
}
