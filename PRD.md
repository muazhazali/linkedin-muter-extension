# Project Requirements: LinkedIn Word Blocker (WXT)

## 1. Project Overview

* **Goal:** Create a browser extension that allows users to mute/hide LinkedIn posts containing specific user-defined keywords.
* **Tech Stack:** WXT (Web Extension Toolbox), Vanilla TypeScript, CSS, Chrome Storage API.
* **Target Platform:** Google Chrome (Chromium-based browsers).

## 2. Core Features

### A. Content Filtering (Content Script)

* **Real-time Scanning:** Scan the LinkedIn feed for posts containing blacklisted words.
* **DOM Manipulation:** Hide matching posts (set `display: none` or apply a blur filter).
* **Infinite Scroll Support:** Use `MutationObserver` to ensure new posts are filtered as the user scrolls.
* **Dynamic Updates:** Automatically re-filter the page when the keyword list is updated without requiring a page refresh.

### B. Management UI (Popup)

* **Word Input:** A text field to add new keywords.
* **Keyword List:** Display all currently muted words.
* **Delete Action:** Remove individual words from the list.
*   **Persistence:** All keywords must persist across browser sessions using `wxt/storage`.
*   **Reveal Mode:** A toggle to choose between hiding matching posts completely or showing them with a blur/fade visual indicator.

---

## 3. Technical Architecture

### Directory Structure

* `entrypoints/content.ts`: The "Engine" injected into LinkedIn to monitor the DOM.
* `entrypoints/popup/`: The management interface (HTML/TS/CSS).
* `utils/storage.ts`: Shared logic for getting/setting keyword data.

### Data Flow

1. **User Input:** User adds "Politics" via the Popup.
2. **Storage:** `wxt/storage` saves the updated array.
3. **Sync:** Content Script detects the storage change via `storage.watch()`.
4. **Action:** Content Script scans `.feed-shared-update-v2` elements and hides matches.

---

## 4. UI/UX Requirements

* **Clean Interface:** Simple list view with "Add" and "Delete" buttons.
* **Non-Intrusive:** The extension should not slow down LinkedIn’s performance.
* **Visual Feedback:** (Optional) Show a small badge or toast when a post has been hidden to inform the user why content is missing.

## 5. Deployment & Permissions

* **Host Permissions:** `*://*.linkedin.com/*`
* **Permissions:** `storage`
* **Manifest:** Generated automatically by WXT based on `wxt.config.ts`.