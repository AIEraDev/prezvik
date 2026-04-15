/**
 * Layout System Types
 *
 * Proper box model with margin, padding, and computed rectangles
 */

export type LayoutNode = TextNode | ImageNode | ShapeNode | ContainerNode;

/**
 * Base node properties
 */
interface BaseNode {
  id: string;
  type: string;

  /**
   * Computed rectangle (set by layout engine)
   * Renderer MUST check this exists before rendering
   */
  _rect?: Rectangle;

  /**
   * Margin (space outside the node)
   */
  margin?: Spacing;

  /**
   * Padding (space inside the node)
   */
  padding?: Spacing;
}

/**
 * Rectangle in percentage coordinates
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Spacing (margin or padding)
 */
export interface Spacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Text node
 */
export interface TextNode extends BaseNode {
  type: "text";
  content: string;
  text: {
    fontSize: number;
    fontFamily?: string;
    fontWeight?: "normal" | "bold";
    italic?: boolean;
    color?: string;
    align?: "left" | "center" | "right";
    lineSpacingMultiple?: number;
    // Semantic roles (resolved by theme)
    fontRole?: string;
    colorRole?: string;
    weightRole?: string;
  };
  box?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  };
}

/**
 * Image node
 */
export interface ImageNode extends BaseNode {
  type: "image";
  src: string;
  objectFit?: "contain" | "cover";
}

/**
 * Shape node
 */
export interface ShapeNode extends BaseNode {
  type: "shape";
  shape: "rect" | "ellipse" | "line" | "rounded-rect";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

/**
 * Container node
 */
export interface ContainerNode extends BaseNode {
  type: "container";
  children: LayoutNode[];
  layout?: LayoutMode;
}

/**
 * Layout modes
 */
export type LayoutMode = FlowLayout | AbsoluteLayout | GridLayout;

export interface FlowLayout {
  type: "flow";
  direction: "vertical" | "horizontal";
  gap?: number;
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
}

export interface AbsoluteLayout {
  type: "absolute";
}

export interface GridLayout {
  type: "grid";
  columns: number;
  columnGap?: number;
  rowGap?: number;
}

/**
 * Layout tree (root node with metadata)
 */
export interface LayoutTree {
  root: LayoutNode;
  background?: string;
}
