/**
 * ExportLayerFacade
 *
 * Provides a simplified interface to the Export Layer subsystem.
 * Manages renderer instances and provides access to renderers by format.
 *
 * Requirements: 3.10, 8.6
 */

import type { Renderer } from "./renderer-interface.js";
import { PPTXRenderer } from "./pptx-renderer.js";
import { WebRenderer } from "./web-renderer.js";

/**
 * Supported output formats
 */
export type OutputFormat = "pptx" | "html";

/**
 * ExportLayerFacade class
 *
 * Provides a simplified interface to the Export Layer subsystem.
 * Initializes and manages renderer instances for different output formats.
 *
 * The facade:
 * 1. Initializes renderers for supported formats (PPTX, HTML)
 * 2. Provides getRenderer(format) method to retrieve renderers
 * 3. Throws descriptive errors for unsupported formats
 *
 * Requirements: 3.10, 8.6
 */
export class ExportLayerFacade {
  private renderers: Map<OutputFormat, Renderer>;

  /**
   * Create a new ExportLayerFacade
   *
   * Initializes renderers for all supported formats:
   * - "pptx": PPTXRenderer for PowerPoint output
   * - "html": WebRenderer for web preview output
   */
  constructor() {
    this.renderers = new Map();

    // Initialize PPTX renderer
    this.renderers.set("pptx", new PPTXRenderer());

    // Initialize Web renderer
    this.renderers.set("html", new WebRenderer());
  }

  /**
   * Get renderer for specified output format
   *
   * @param format - Output format ("pptx" or "html")
   * @returns Renderer instance for the specified format
   * @throws Error if format is not supported
   *
   * Requirements: 3.10, 8.6
   *
   * @example
   * ```typescript
   * const facade = new ExportLayerFacade();
   * const renderer = facade.getRenderer("pptx");
   * const result = await renderer.render(visualContext, { outputPath: "output.pptx" });
   * ```
   */
  getRenderer(format: OutputFormat): Renderer {
    const renderer = this.renderers.get(format);

    if (!renderer) {
      throw new Error(`No renderer available for format: ${format}. Supported formats: ${Array.from(this.renderers.keys()).join(", ")}`);
    }

    return renderer;
  }
}
