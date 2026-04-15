/**
 * Tool Registry
 *
 * All MCP tools exposed by Kyro
 */

import { generateTool } from "./generate.js";
import { validateTool } from "./validate.js";
import { infoTool } from "./info.js";

export const tools = [generateTool, validateTool, infoTool];
