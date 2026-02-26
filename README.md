# LinkedIn Muter

A lightweight browser extension to reclaim your LinkedIn feed by automatically hiding posts that match keywords or regex patterns you define.

## Features

- **Keyword & Regex Filtering**: Filter posts by plain keywords or full regular expressions.
- **Per-Rule Hit Counts**: Each rule shows how many posts it has muted.
- **Click-to-Reveal**: In reveal mode, click a blurred post to temporarily show it.
- **Sponsored Post Muting**: Optionally mute all sponsored/promoted posts.
- **Two Muting Modes**: Completely hide posts (`display: none`) or blur/grayscale them so you know something was filtered.
- **Infinite Scroll Support**: Uses `MutationObserver` to filter new posts in real-time as you scroll.
- **Dynamic Updates**: Changes take effect immediately — no page refresh needed.
- **Persistent Storage**: Settings and keyword list are saved across sessions via the Chrome Storage API.

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [pnpm](https://pnpm.io/)

### Setup

```bash
git clone https://github.com/LCD/linkedin-muter.git
cd linkedin-muter
pnpm install
```

### Commands

```bash
pnpm dev              # Dev server with hot reload (opens Chrome with extension loaded)
pnpm dev:firefox      # Dev server for Firefox
pnpm build            # Production build → .output/chrome-mv3/
pnpm build:firefox    # Production build for Firefox
pnpm zip              # Build and zip for Chrome Web Store submission
pnpm compile          # TypeScript type-check only
```

### Loading manually in Chrome

1. Go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `.output/chrome-mv3` folder

## Tech Stack

- **[WXT](https://wxt.dev/)** — Web Extension Framework (Manifest V3)
- **TypeScript**
- **Vanilla CSS**
- **Chrome Storage API**

## Contributing

Contributions are welcome. Open an issue or submit a pull request.
