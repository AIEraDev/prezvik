/**
 * Info Tool
 *
 * Get information about available themes and slide types
 */

import { getAvailableThemes, getAvailableSlideTypes } from "../adapters/kyro.js";

export const infoTool = {
  name: "get_kyro_info",
  description: "Get information about available themes and slide types in Kyro",
  inputSchema: {
    type: "object",
    properties: {},
  },

  handler: async () => {
    const themes = getAvailableThemes();
    const slideTypes = getAvailableSlideTypes();

    return {
      content: [
        {
          type: "text",
          text: `Kyro Info

Available Themes:
${themes.map((t) => `  - ${t}`).join("\n")}

Available Slide Types:
${slideTypes.map((t) => `  - ${t}`).join("\n")}

Example Deck Schema:
{
  "version": "1.0",
  "meta": {
    "title": "My Presentation",
    "theme": "executive"
  },
  "slides": [
    {
      "id": "slide-1",
      "type": "hero",
      "content": {
        "title": "Welcome",
        "subtitle": "Subtitle here"
      }
    }
  ]
}`,
        },
      ],
    };
  },
};
