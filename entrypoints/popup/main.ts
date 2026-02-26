import './style.css';
import { keywordStorage, extensionEnabledStorage, hiddenCountStorage, showHiddenPostsStorage, muteSponsoredStorage } from '@/utils/storage';
import type { KeywordEntry } from '@/utils/storage';

const input = document.querySelector<HTMLInputElement>('#keyword-input')!;
const regexToggle = document.querySelector<HTMLInputElement>('#regex-toggle')!;
const addBtn = document.querySelector<HTMLButtonElement>('#add-btn')!;
const list = document.querySelector<HTMLUListElement>('#keyword-list')!;
const statusMsg = document.querySelector<HTMLSpanElement>('#status-msg')!;
const toggle = document.querySelector<HTMLInputElement>('#extension-toggle')!;
const showHiddenToggle = document.querySelector<HTMLInputElement>('#show-hidden-toggle')!;
const muteSponsoredToggle = document.querySelector<HTMLInputElement>('#mute-sponsored-toggle')!;
const hiddenCountEl = document.querySelector<HTMLSpanElement>('#hidden-count')!;

function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

function migrateKeywords(raw: unknown[]): import('@/utils/storage').KeywordEntry[] {
  return raw.map((item) => {
    if (typeof item === 'string') {
      return { pattern: item, isRegex: false, count: 0 };
    }
    return item as import('@/utils/storage').KeywordEntry;
  });
}

async function renderList() {
  const raw = await keywordStorage.getValue();
  const keywords = migrateKeywords(raw as unknown[]);
  // If migration happened, persist the new format
  if (raw.some((item) => typeof item === 'string')) {
    await keywordStorage.setValue(keywords);
  }
  list.innerHTML = '';

  keywords.forEach((entry: KeywordEntry, index: number) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${entry.isRegex ? '<span class="regex-pill">.*</span>' : ''}
      <span class="keyword-text" title="${entry.isRegex ? 'Regex pattern' : 'Keyword'}">${escapeHtml(entry.pattern)}</span>
      <span class="keyword-count" title="Posts muted by this rule">${entry.count}</span>
      <button class="delete-btn" data-index="${index}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
          <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1-1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3h11V2h-11v1z"/>
        </svg>
      </button>
    `;
    list.appendChild(li);
  });

  statusMsg.textContent = `${keywords.length} rule${keywords.length !== 1 ? 's' : ''} active`;

  const count = await hiddenCountStorage.getValue();
  hiddenCountEl.textContent = count.toString();
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

toggle.addEventListener('change', async () => {
  await extensionEnabledStorage.setValue(toggle.checked);
});

showHiddenToggle.addEventListener('change', async () => {
  await showHiddenPostsStorage.setValue(showHiddenToggle.checked);
});

muteSponsoredToggle.addEventListener('change', async () => {
  await muteSponsoredStorage.setValue(muteSponsoredToggle.checked);
});

addBtn.addEventListener('click', async () => {
  const pattern = input.value.trim();
  if (!pattern) return;

  const isRegex = regexToggle.checked;

  if (isRegex && !isValidRegex(pattern)) {
    showStatus('Invalid regex pattern!', true);
    return;
  }

  const current = await keywordStorage.getValue();
  const duplicate = current.some((e: KeywordEntry) => e.pattern === (isRegex ? pattern : pattern.toLowerCase()) && e.isRegex === isRegex);
  if (duplicate) {
    showStatus('Already in list!', true);
    return;
  }

  const newEntry: KeywordEntry = {
    pattern: isRegex ? pattern : pattern.toLowerCase(),
    isRegex,
    count: 0,
  };

  await keywordStorage.setValue([...current, newEntry]);
  input.value = '';
  regexToggle.checked = false;
  renderList();
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addBtn.click();
});

list.addEventListener('click', async (e) => {
  const target = e.target as HTMLElement;
  const btn = target.closest('.delete-btn');
  if (!btn) return;

  const index = parseInt(btn.getAttribute('data-index') || '-1', 10);
  if (index < 0) return;

  const current = await keywordStorage.getValue();
  await keywordStorage.setValue(current.filter((_: KeywordEntry, i: number) => i !== index));
  renderList();
});

function showStatus(msg: string, isError = false) {
  statusMsg.textContent = msg;
  statusMsg.style.color = isError ? 'var(--danger-color)' : 'var(--text-sub)';
  setTimeout(renderList, 2000);
}

async function init() {
  toggle.checked = await extensionEnabledStorage.getValue();
  showHiddenToggle.checked = await showHiddenPostsStorage.getValue();
  muteSponsoredToggle.checked = await muteSponsoredStorage.getValue();
  renderList();
}

init();

hiddenCountStorage.watch((newCount) => {
  hiddenCountEl.textContent = (newCount || 0).toString();
});

keywordStorage.watch(() => {
  renderList();
});
