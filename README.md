# 🚫 LinkedIn Muter

LinkedIn Muter is a powerful, lightweight browser extension designed to help you reclaim your LinkedIn feed. Tired of seeing the same repetitive corporate jargon, political debates, or specific topics you'd rather avoid? This extension puts you back in control by automatically hiding posts that contain keywords you choose.

## ✨ Key Features

- **🎯 Precision Filtering**: Instantly hides posts containing your blacklisted keywords.
- **🔄 Infinite Scroll Support**: Uses `MutationObserver` to ensure new posts are filtered in real-time as you scroll.
- **⚡ Dynamic Updates**: Changes take effect immediately. No need to refresh your page when you add or remove keywords.
- **🕵️ Reveal Mode**: Choose between hiding posts completely or applying a subtle blur effect so you still know something was filtered.
- **💾 Persistent Storage**: Your keyword list is securely saved across sessions using the Chrome Storage API.
- **🎨 Modern UI**: A clean, intuitive management popup to easily manage your muted words.

## 🚀 Local Development

To get started with development or run the extension locally from source, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [pnpm](https://pnpm.io/) (Preferred package manager)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LCD/linkedin-muter.git
   cd linkedin-muter
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

### Running Locally

1. **Start the development server:**
   ```bash
   pnpm dev
   ```
   This will start the WXT development server and automatically open a browser instance with the extension pre-loaded.

2. **Build for production:**
   ```bash
   pnpm build
   ```
   The production-ready files will be generated in the `.output` directory.

3. **Loading manually into Chrome:**
   If you need to load it manually:
   - Go to `chrome://extensions/`
   - Enable **Developer mode** (top right).
   - Click **Load unpacked**.
   - Select the `.output/chrome-mv3` folder (after running `pnpm build` or `pnpm dev`).

## 🛠️ Tech Stack

- **[WXT](https://wxt.dev/)**: Next-gen Web Extension Framework.
- **TypeScript**: For robust and type-safe code.
- **Vanilla CSS**: Clean and performant styling.
- **Chrome Storage API**: For persistent user preferences.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have ideas for improvements or new features.

---
*Made with ❤️ to improve your LinkedIn experience.*
