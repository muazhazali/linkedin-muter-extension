import './style.css';
import { keywordStorage, extensionEnabledStorage, hiddenCountStorage } from '@/utils/storage';

const input = document.querySelector<HTMLInputElement>('#keyword-input')!;
const addBtn = document.querySelector<HTMLButtonElement>('#add-btn')!;
const list = document.querySelector<HTMLUListElement>('#keyword-list')!;
const statusMsg = document.querySelector<HTMLSpanElement>('#status-msg')!;
const toggle = document.querySelector<HTMLInputElement>('#extension-toggle')!;
const hiddenCountEl = document.querySelector<HTMLSpanElement>('#hidden-count')!;

// Function to render the list
async function renderList() {
  const keywords = await keywordStorage.getValue();
  list.innerHTML = '';

  keywords.forEach((word: string) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="keyword-text">${word}</span>
      <button class="delete-btn" data-keyword="${word}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
          <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1-1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3h11V2h-11v1z"/>
        </svg>
      </button>
    `;
    list.appendChild(li);
  });

  // Show status
  statusMsg.textContent = `${keywords.length} words muted`;

  // Update count from storage
  const count = await hiddenCountStorage.getValue();
  hiddenCountEl.textContent = count.toString();
}

// Handle Toggle
toggle.addEventListener('change', async () => {
  await extensionEnabledStorage.setValue(toggle.checked);
});

// Add keyword
addBtn.addEventListener('click', async () => {
  const word = input.value.trim().toLowerCase();
  if (!word) return;

  const current = await keywordStorage.getValue();
  if (current.includes(word)) {
    showStatus('Already in list!', true);
    return;
  }

  await keywordStorage.setValue([...current, word]);
  input.value = '';
  renderList();
});

// Delete keyword
list.addEventListener('click', async (e) => {
  const target = e.target as HTMLElement;
  const btn = target.closest('.delete-btn');
  if (!btn) return;

  const word = btn.getAttribute('data-keyword');
  const current = await keywordStorage.getValue();
  await keywordStorage.setValue(current.filter((k: string) => k !== word));
  renderList();
});

function showStatus(msg: string, isError = false) {
  statusMsg.textContent = msg;
  statusMsg.style.color = isError ? 'var(--danger-color)' : 'var(--text-sub)';
  setTimeout(renderList, 2000);
}

// Initial render
async function init() {
  toggle.checked = await extensionEnabledStorage.getValue();
  renderList();
}

init();

// Watch for count changes to update UI live
hiddenCountStorage.watch((newCount) => {
  hiddenCountEl.textContent = (newCount || 0).toString();
});
