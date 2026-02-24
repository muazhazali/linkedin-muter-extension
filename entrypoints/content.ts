import { keywordStorage, extensionEnabledStorage, hiddenCountStorage } from '@/utils/storage';

export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  async main() {
    console.log('LinkedIn Muter: Active');

    let keywords = await keywordStorage.getValue();
    let isEnabled = await extensionEnabledStorage.getValue();
    let sessionHiddenCount = 0;

    // Set of processed post URNs to avoid double counting
    const hiddenPostsSet = new Set<string>();

    const updateGlobalCount = async (increment: number) => {
      if (increment === 0) return;
      const current = await hiddenCountStorage.getValue();
      await hiddenCountStorage.setValue(current + increment);
    };

    // Function to hide a post
    const processPost = (post: HTMLElement) => {
      const postUrn = post.getAttribute('data-urn') || post.innerText.substring(0, 50); // Fallback to start of text if no URN

      if (!isEnabled) {
        if (post.style.display === 'none') {
          post.style.display = '';
          if (hiddenPostsSet.has(postUrn)) {
            hiddenPostsSet.delete(postUrn);
            updateGlobalCount(-1);
          }
        }
        return;
      }

      const text = post.innerText.toLowerCase();
      const shouldHide = keywords.some((word: string) => text.includes(word.toLowerCase()));

      if (shouldHide) {
        if (post.style.display !== 'none') {
          post.style.display = 'none';
          if (!hiddenPostsSet.has(postUrn)) {
            hiddenPostsSet.add(postUrn);
            updateGlobalCount(1);
          }
        }
      } else {
        if (post.style.display === 'none') {
          post.style.display = '';
          if (hiddenPostsSet.has(postUrn)) {
            hiddenPostsSet.delete(postUrn);
            updateGlobalCount(-1);
          }
        }
      }
    };

    // Scan all posts currently on the page
    const scanAllPosts = () => {
      const posts = document.querySelectorAll<HTMLElement>('.feed-shared-update-v2, [data-urn^="urn:li:activity:"]');
      posts.forEach(processPost);
    };

    // Observer for lazy loading (infinite scroll)
    const observer = new MutationObserver(() => {
      scanAllPosts();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial scan
    scanAllPosts();

    // Watch for keyword changes
    keywordStorage.watch((newKeywords) => {
      keywords = newKeywords || [];
      scanAllPosts();
    });

    // Watch for toggle changes
    extensionEnabledStorage.watch((newVal) => {
      isEnabled = newVal ?? true;
      scanAllPosts();
    });
  },
});
