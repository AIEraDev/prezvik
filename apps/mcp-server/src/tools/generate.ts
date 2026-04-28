/**
 * Generate Presentation Tool
 *
 * MCP tool for generating presentations
 */

import { generatePresentation } from "../adapters/prezvik.js";

export const generateTool = {
  name: "generate_presentation",
  description: "Generate a PowerPoint presentation from a Prezvik deck schema. Returns the path to the generated PPTX file.",
  inputSchema: {
    type: "object",
    properties: {
      deck: {
        type: "object",
        description: "Prezvik deck schema with slides array",
        properties: {
          version: { type: "string" },
          meta: {
            type: "object",
            properties: {
              title: { type: "string" },
              author: { type: "string" },
              theme: { type: "string", enum: ["executive", "minimal"] },
            },
          },
          slides: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                type: { type: "string", enum: ["hero", "bullet-list", "stat-trio", "two-column"] },
                content: { type: "object" },
              },
              required: ["type", "content"],
            },
          },
        },
        required: ["slides"],
      },
      theme: {
        type: "string",
        description: "Theme to use (overrides deck.meta.theme)",
        enum: ["executive", "minimal"],
      },
    },
    required: ["deck"],
  },

  handler: async (args: any) => {
    try {
      const result = await generatePresentation(args.deck, {
        theme: args.theme,
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Presentation generated successfully!\n\nFile: ${result.fileName}\nPath: ${result.path}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Error generating presentation: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  },
};
