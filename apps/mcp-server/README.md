# Prezvik MCP Server

Model Context Protocol server for Prezvik. Exposes presentation generation as MCP tools for AI agents.

## What is MCP?

MCP (Model Context Protocol) is a standard for connecting AI agents to external tools and data sources. This server makes Prezvik available to any MCP-compatible AI agent.

## Installation

```bash
pnpm install
pnpm build
```

## Usage

### With Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "prezvik": {
      "command": "node",
      "args": ["/path/to/Prezvik/apps/mcp-server/dist/index.js"]
    }
  }
}
```

### With Other MCP Clients

Run the server:

```bash
node dist/index.js
```

The server communicates via stdio using the MCP protocol.

## Available Tools

### `generate_presentation`

Generate a PowerPoint presentation from a deck schema.

**Input:**

```json
{
  "deck": {
    "version": "1.0",
    "meta": {
      "title": "My Presentation"
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
  },
  "theme": "executive"
}
```

**Output:**

- File path to generated PPTX

### `validate_deck`

Validate a deck schema before generating.

**Input:**

```json
{
  "deck": { ... }
}
```

**Output:**

- Validation result with slide count and types

### `get_prezvik_info`

Get information about available themes and slide types.

**Output:**

- List of themes
- List of slide types
- Example deck schema

## Architecture

```
MCP Client (AI Agent)
  ↓
MCP Protocol (stdio)
  ↓
Prezvik MCP Server (thin adapter)
  ↓
Prezvik Core Engine
  ↓
PPTX Output
```

## Design Principles

- **Thin adapter** - No business logic, just calls core engine
- **Minimal** - Only essential tools exposed
- **Reusable** - Adapter layer can be used for REST API later

## Development

```bash
pnpm dev  # Watch mode
```

## What AI Agents Can Do

With this MCP server, AI agents can:

- Generate presentations programmatically
- Validate deck schemas
- Iterate on designs automatically
- Create presentations from natural language prompts

## Next Steps

- Connect to Claude Desktop
- Test with AI agents
- Build prompt → deck generator on top
