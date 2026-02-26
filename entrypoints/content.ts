import { keywordStorage, extensionEnabledStorage, hiddenCountStorage, showHiddenPostsStorage, muteSponsoredStorage } from '@/utils/storage';
import type { KeywordEntry } from '@/utils/storage';

export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  async main() {
    console.log('LinkedIn Muter: Active');

    const migrateKeywords = (raw: unknown[]): KeywordEntry[] =>
      raw.map((item) => (typeof item === 'string' ? { pattern: item, isRegex: false, count: 0 } : item as KeywordEntry));

    const rawKeywords = await keywordStorage.getValue();
    if (rawKeywords.some((item) => typeof item === 'string')) {
      await keywordStorage.setValue(migrateKeywords(rawKeywords as unknown[]));
    }
    let keywords = migrateKeywords(rawKeywords as unknown[]);
    let isEnabled = await extensionEnabledStorage.getValue();
    let showHidden = await showHiddenPostsStorage.getValue();
    let muteSponsored = await muteSponsoredStorage.getValue();

    // Reset count at the start of each session
    await hiddenCountStorage.setValue(0);

    // Map from post URN → index of matched keyword (for per-keyword counts)
    const hiddenPostsMap = new Map<string, number>();

    // Posts that the user has manually revealed (click-to-reveal)
    const revealedPostsSet = new Set<string>();

    const updateGlobalCount = async (increment: number) => {
      if (increment === 0) return;
      const current = await hiddenCountStorage.getValue();
      await hiddenCountStorage.setValue(current + increment);
    };

    const buildRegex = (entry: KeywordEntry): RegExp | null => {
      try {
        if (entry.isRegex) {
          return new RegExp(entry.pattern, 'i');
        }
        const escaped = entry.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`\\b${escaped}\\b`, 'i');
      } catch {
        return null;
      }
    };

    const isSponsored = (post: HTMLElement): boolean => {
      // LinkedIn marks promoted posts with "Promoted" label or specific aria attributes
      const text = post.querySelector('.feed-shared-actor__sub-description, [aria-label*="Promoted"], .update-components-actor__sub-description');
      if (text && /promoted/i.test(text.textContent || '')) return true;
      // Also check for data-urn patterns or hidden spans LinkedIn uses
      const spans = post.querySelectorAll('span');
      for (const span of spans) {
        if (span.textContent?.trim() === 'Promoted' || span.textContent?.trim() === 'Sponsored') {
          return true;
        }
      }
      return false;
    };

    const applyBlur = (post: HTMLElement) => {
      post.style.display = '';
      post.style.filter = 'blur(8px) grayscale(100%)';
      post.style.opacity = '0.4';
      post.style.pointerEvents = 'none';
      post.style.transition = 'filter 0.3s ease, opacity 0.3s ease';
      post.style.cursor = '';
      post.setAttribute('data-lm-blurred', '1');

      // Add click-to-reveal overlay if not already present
      if (!post.parentElement?.querySelector('.lm-reveal-overlay')) {
        const wrapper = post.parentElement;
        if (!wrapper) return;
        wrapper.style.position = 'relative';
        const overlay = document.createElement('div');
        overlay.className = 'lm-reveal-overlay';
        overlay.setAttribute('data-lm-urn', post.getAttribute('data-urn') || post.innerText.substring(0, 50));
        overlay.style.cssText = `
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
        `;
        overlay.innerHTML = `
          <span style="
            background: rgba(0,0,0,0.55);
            color: white;
            font-size: 13px;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 20px;
            font-family: -apple-system, system-ui, sans-serif;
            pointer-events: none;
          ">Click to reveal</span>
        `;
        wrapper.appendChild(overlay);
      }
    };

    const applyHide = (post: HTMLElement) => {
      post.style.display = 'none';
      post.removeAttribute('data-lm-blurred');
      post.parentElement?.querySelector('.lm-reveal-overlay')?.remove();
      if (post.parentElement) post.parentElement.style.position = '';
    };

    const resetStyle = (post: HTMLElement) => {
      post.style.display = '';
      post.style.filter = '';
      post.style.opacity = '';
      post.style.pointerEvents = '';
      post.style.cursor = '';
      post.style.transition = '';
      post.removeAttribute('data-lm-blurred');
      // Remove overlay from parent
      post.parentElement?.querySelector('.lm-reveal-overlay')?.remove();
      if (post.parentElement) post.parentElement.style.position = '';
    };

    const processPost = async (post: HTMLElement) => {
      const postUrn = post.getAttribute('data-urn') || post.innerText.substring(0, 50);

      if (!isEnabled) {
        resetStyle(post);
        if (hiddenPostsMap.has(postUrn)) {
          hiddenPostsMap.delete(postUrn);
          updateGlobalCount(-1);
        }
        return;
      }

      // User manually revealed this post — respect their choice
      if (revealedPostsSet.has(postUrn)) {
        resetStyle(post);
        return;
      }

      // Check sponsored
      if (muteSponsored && isSponsored(post)) {
        if (!hiddenPostsMap.has(postUrn)) {
          hiddenPostsMap.set(postUrn, -1); // -1 = sponsored, no keyword index
          updateGlobalCount(1);
        }
        showHidden ? applyBlur(post) : applyHide(post);
        return;
      }

      const text = post.innerText.toLowerCase();
      let matchedIndex = -1;
      for (let i = 0; i < keywords.length; i++) {
        const re = buildRegex(keywords[i]);
        if (re && re.test(text)) {
          matchedIndex = i;
          break;
        }
      }

      if (matchedIndex >= 0) {
        if (!hiddenPostsMap.has(postUrn)) {
          hiddenPostsMap.set(postUrn, matchedIndex);
          updateGlobalCount(1);

          // Increment per-keyword count
          const fresh = await keywordStorage.getValue();
          if (fresh[matchedIndex]) {
            fresh[matchedIndex] = { ...fresh[matchedIndex], count: fresh[matchedIndex].count + 1 };
            await keywordStorage.setValue(fresh);
            keywords = fresh;
          }
        }
        showHidden ? applyBlur(post) : applyHide(post);
      } else {
        if (hiddenPostsMap.has(postUrn)) {
          resetStyle(post);
          hiddenPostsMap.delete(postUrn);
          updateGlobalCount(-1);
        }
      }
    };

    const scanAllPosts = () => {
      const posts = document.querySelectorAll<HTMLElement>('.feed-shared-update-v2, [data-urn^="urn:li:activity:"]');
      posts.forEach(processPost);
    };

    // Click-to-reveal: clicking the overlay unblurs the post
    document.addEventListener('click', (e) => {
      const overlay = (e.target as HTMLElement).closest<HTMLElement>('.lm-reveal-overlay');
      if (!overlay) return;
      e.stopPropagation();
      const urn = overlay.getAttribute('data-lm-urn') || '';
      revealedPostsSet.add(urn);
      overlay.remove();
      // Find the sibling blurred post
      const parent = overlay.parentElement;
      if (parent) {
        const post = parent.querySelector<HTMLElement>('[data-lm-blurred="1"]');
        if (post) resetStyle(post);
        parent.style.position = '';
      }
    }, true);

    const observer = new MutationObserver(() => {
      scanAllPosts();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    scanAllPosts();

    keywordStorage.watch((newKeywords) => {
      keywords = migrateKeywords((newKeywords || []) as unknown[]);
      scanAllPosts();
    });

    extensionEnabledStorage.watch((newVal) => {
      isEnabled = newVal ?? true;
      scanAllPosts();
    });

    showHiddenPostsStorage.watch((newVal) => {
      showHidden = newVal ?? false;
      scanAllPosts();
    });

    muteSponsoredStorage.watch((newVal) => {
      muteSponsored = newVal ?? true;
      scanAllPosts();
    });
  },
});
