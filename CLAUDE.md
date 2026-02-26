# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server with hot reload (opens Chrome with extension loaded)
pnpm dev:firefox      # Dev server for Firefox
pnpm build            # Production build → .output/chrome-mv3/
pnpm build:firefox    # Production build for Firefox
pnpm zip              # Build and zip for Chrome Web Store submission
pnpm compile          # TypeScript type-check only (no emit)
```

To load the built extension manually in Chrome: go to `chrome://extensions/`, enable Developer mode, click "Load unpacked", select `.output/chrome-mv3/`.

## Architecture

This is a [WXT](https://wxt.dev/)-based Chrome/Firefox extension (Manifest V3). WXT provides the build tooling; the `@` alias maps to the project root.

**Entrypoints** (WXT convention — each file is an extension entry):
- `entrypoints/content.ts` — Content script injected into all `*.linkedin.com` pages. Scans posts using `MutationObserver` for infinite scroll support, applies hide/blur based on keywords.
- `entrypoints/background.ts` — Service worker background script.
- `entrypoints/popup/` — Extension popup UI (HTML + vanilla TS + CSS). Manages keyword list, enable/disable toggle, and reveal mode toggle.

**Shared state** (`utils/storage.ts`):
All cross-component state uses WXT's `storage.defineItem()` wrapper over the Chrome Storage API. Four items: `keywords` (string[]), `enabled` (boolean), `hiddenCount` (number), `showHiddenPosts` (boolean). Both popup and content script watch these reactively via `.watch()`.

**Post detection** (`content.ts`):
Posts are selected via `.feed-shared-update-v2, [data-urn^="urn:li:activity:"]`. Each post is identified by its `data-urn` attribute (or first 50 chars of text as fallback) to deduplicate counting in `hiddenPostsSet`.

**Two muting modes**: complete hide (`display: none`) or reveal mode (blur + grayscale + reduced opacity).
