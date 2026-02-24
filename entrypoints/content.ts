import { keywordStorage } from '@/utils/storage';

export default defineContentScript({
  matches: ['*://*.linkedin.com/*'],
  async main() {
    console.log('LinkedIn Muter: Active');

    let keywords = await keywordStorage.getValue();

    // Function to hide a post
    const processPost = (post: HTMLElement) => {
      const text = post.innerText.toLowerCase();
      const shouldHide = keywords.some((word: string) => text.includes(word.toLowerCase()));

      if (shouldHide) {
        post.style.display = 'none';
        // console.log('LinkedIn Muter: Post hidden');
      } else {
        // If it was previously hidden and shouldn't be anymore (e.g. keyword removed)
        if (post.style.display === 'none') {
          post.style.display = '';
        }
      }
    };

    // Scan all posts currently on the page
    const scanAllPosts = () => {
      const posts = document.querySelectorAll<HTMLElement>('.feed-shared-update-v2, .feed-shared-update-v2__control-menu-container, [data-urn^="urn:li:activity:"]');
      posts.forEach(processPost);
    };

    // Observer for lazy loading (infinite scroll)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Check if the added node is a post or contains posts
            if (node.classList.contains('feed-shared-update-v2') || node.querySelector('.feed-shared-update-v2')) {
              scanAllPosts();
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial scan
    scanAllPosts();

    // Watch for keyword changes
    keywordStorage.watch((newKeywords: string[] | null) => {
      keywords = newKeywords || [];
      console.log('LinkedIn Muter: Keywords updated', keywords);
      scanAllPosts();
    });
  },
});
