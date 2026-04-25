import type { Dimensions, Point, Rect } from "./visual-context.js";

/**
 * Gradient types
 */
export interface LinearGradient {
  type: "linear";
  angle: number;
  stops: ColorStop[];
}

export interface RadialGradient {
  type: "radial";
  center: Point;
  radius: number;
  stops: ColorStop[];
}

export interface ColorStop {
  position: number; // 0-1
  color: string; // CSS Color Level 4 format
}

/**
 * Pattern fill definition
 */
export interface Pattern {
  /** Pattern type */
  type: "image" | "svg" | "dots" | "lines" | "grid";

  /** Pattern source (for image/svg) */
  src?: string;

  /** Pattern repeat mode */
  repeat: "repeat" | "repeat-x" | "repeat-y" | "no-repeat";

  /** Pattern scale */
  scale?: number;

  /** Pattern-specific properties */
  properties?: {
    // For dots
    dotSize?: number;
    dotSpacing?: number;
    dotColor?: string;

    // For lines
    lineWidth?: number;
    lineSpacing?: number;
    lineAngle?: number;
    lineColor?: string;

    // For grid
    gridSize?: number;
    gridColor?: string;
  };
}

/**
 * Fill types for shapes and backgrounds
 */
export interface SolidFill {
  type: "solid";
  color: string;
}

export interface GradientFill {
  type: "gradient";
  gradient: LinearGradient | RadialGradient;
}

export interface PatternFill {
  type: "pattern";
  pattern: Pattern;
}

export type Fill = SolidFill | GradientFill | PatternFill;

/**
 * Stroke definition for shapes
 */
export interface Stroke {
  color: string;
  width: number;
  dashArray?: number[]; // For dashed lines
}

/**
 * Text content properties
 */
export interface TextContent {
  text: string;
  font: string;
  fontSize: number;
  color: string;
  align: "left" | "center" | "right";
  verticalAlign: "top" | "middle" | "bottom";
  bold?: boolean;
  italic?: boolean;
}

/**
 * Image content properties
 */
export interface ImageContent {
  src: string; // URL or data URI
  fit: "cover" | "contain" | "fill";
}

/**
 * Base visual element interface
 */
export interface VisualElement {
  /** Unique identifier */
  id: string;

  /** Element kind */
  kind: "background" | "shape" | "text" | "image";

  /** Z-index for layering */
  zIndex: number;

  /** Opacity (0-1) */
  opacity: number;
}

/**
 * Background element for slides
 */
export interface BackgroundElement extends VisualElement {
  kind: "background";
  fill: Fill;
  dimensions: Dimensions;
}

/**
 * Shape element for decorations
 */
export interface ShapeElement extends VisualElement {
  kind: "shape";
  shapeType: "rectangle" | "circle" | "polygon" | "line" | "path";
  bounds: Rect;
  fill?: Fill;
  stroke?: Stroke;

  /** Shape-specific properties */
  properties?: {
    // For rectangles
    cornerRadius?: number;

    // For circles
    radius?: number;

    // For polygons
    points?: Point[];

    // For paths
    pathData?: string; // SVG path data
  };
}

/**
 * Content element for text and images
 */
export interface ContentElement extends VisualElement {
  kind: "text" | "image";
  bounds: Rect;

  /** Content-specific properties */
  content: TextContent | ImageContent;
}
