/**
 * Validate Deck Tool
 *
 * MCP tool for validating deck schemas
 */

import { validateDeck } from "../adapters/kyro.js";

export const validateTool = {
  name: "validate_deck",
  description: "Validate a Kyro deck schema. Checks structure and returns slide count and types.",
  inputSchema: {
    type: "object",
    properties: {
      deck: {
        type: "object",
        description: "Kyro deck schema to validate",
      },
    },
    required: ["deck"],
  },

  handler: async (args: any) => {
    const result = validateDeck(args.deck);

    if (result.valid) {
      return {
        content: [
          {
            type: "text",
            text: `✅ Valid deck!\n\nSlides: ${result.slideCount}\nTypes: ${result.slideTypes?.join(", ")}`,
          },
        ],
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: `❌ Invalid deck: ${result.error}`,
          },
        ],
        isError: true,
      };
    }
  },
};
