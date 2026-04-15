# Google Slides Renderer

Clean adapter for rendering Kyro layouts to Google Slides.

## Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Slides API

### 2. Create Service Account

1. Go to IAM & Admin → Service Accounts
2. Create service account
3. Create key (JSON format)
4. Download the key file

### 3. Configure Credentials

Set environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

Or add to `.env`:

```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

## Usage

```typescript
import { renderGoogleSlides } from "@kyro/renderer-gslides";

const result = await renderGoogleSlides(layouts, "My Presentation");

console.log("Presentation URL:", result.url);
// Opens: https://docs.google.com/presentation/d/{presentationId}
```

## CLI Integration

```bash
# Generate Google Slides
kyro generate deck.json --format gslides

# With prompt
kyro generate --prompt "Pitch deck for AI startup" --format gslides
```

## Architecture

```
LayoutTree
  ↓
Google Slides API (batchUpdate)
  ↓
Presentation Created
  ↓
Editable in Browser
```

## API Structure

- **adapter/** - API client and core operations
  - `client.ts` - Auth + API client
  - `presentation.ts` - Create/manage presentations
  - `slide.ts` - Create/manage slides
  - `node.ts` - Render LayoutNode tree

- **mappers/** - Node type → API requests
  - `text.ts` - TextNode → text box

- **utils/** - Helpers
  - `units.ts` - Percentage → points conversion
  - `ids.ts` - Unique ID generation

## Limitations

- Service account presentations are owned by the service account
- To edit, share the presentation with your Google account
- API is slower than PPTX generation (network calls)
- Rate limits apply (10 requests/second)

## Why This Matters

- **PPTX** - Proves engine works, offline export
- **Google Slides** - Real workflows, collaboration, cloud-native

Together they cover all use cases.

## Development

```bash
pnpm build
pnpm dev  # Watch mode
```

## Next Steps

1. Set up service account
2. Test with CLI
3. Share presentations with your account
4. Use in real workflows
