// TabVault Popup Script

let allSessions = [];

// DOM refs
const sessionsList = document.getElementById('sessionsList');
const emptyState = document.getElementById('emptyState');
const currentTabCount = document.getElementById('currentTabCount');
const sessionCountBadge = document.getElementById('sessionCountBadge');
const savePanel = document.getElementById('savePanel');
const quickSave = document.getElementById('quickSave');
const showSavePanelBtn = document.getElementById('showSavePanel');
const cancelSaveBtn = document.getElementById('cancelSave');
const confirmSaveBtn = document.getElementById('confirmSave');
const sessionNameInput = document.getElementById('sessionName');
const tagsInput = document.getElementById('tagsInput');
const notesInput = document.getElementById('notesInput');
const searchInput = document.getElementById('searchInput');
const openOptionsBtn = document.getElementById('openOptions');

// Init
document.addEventListener('DOMContentLoaded', init);

function init() {
  loadTabCount();
  loadSessions();
  bindEvents();
}

function bindEvents() {
  showSavePanelBtn.addEventListener('click', openSavePanel);
  cancelSaveBtn.addEventListener('click', closeSavePanel);
  confirmSaveBtn.addEventListener('click', saveSession);
  openOptionsBtn.addEventListener('click', () => chrome.runtime.openOptionsPage());
  searchInput.addEventListener('input', filterSessions);
  sessionNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveSession(); });

  // Event delegation for session card buttons
  sessionsList.addEventListener('click', handleSessionAction);
}

function loadTabCount() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const count = tabs.filter(t => t.url && !t.url.startsWith('chrome://')).length;
    currentTabCount.textContent = count;
  });
}

function loadSessions() {
  chrome.storage.local.get(['sessions'], (result) => {
    allSessions = result.sessions || [];
    updateSessionCount();
    renderSessions(allSessions);
  });
}

function updateSessionCount() {
  sessionCountBadge.textContent = `${allSessions.length} saved`;
}

function openSavePanel() {
  const now = new Date();
  const defaultName = `Session – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  sessionNameInput.value = defaultName;
  tagsInput.value = '';
  notesInput.value = '';
  savePanel.classList.add('visible');
  quickSave.style.display = 'none';
  sessionNameInput.focus();
  sessionNameInput.select();
}

function closeSavePanel() {
  savePanel.classList.remove('visible');
  quickSave.style.display = '';
}

function saveSession() {
  const name = sessionNameInput.value.trim() || `Session ${new Date().toLocaleDateString()}`;
  const rawTags = tagsInput.value.trim();
  const tags = rawTags ? rawTags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const notes = notesInput.value.trim();

  confirmSaveBtn.disabled = true;
  confirmSaveBtn.textContent = 'Saving…';

  chrome.runtime.sendMessage({ action: 'saveCurrentTabs', data: { name, tags, notes } }, (response) => {
    if (response && response.success) {
      closeSavePanel();
      loadSessions();
    }
    confirmSaveBtn.disabled = false;
    confirmSaveBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Save Session`;
  });
}

function handleSessionAction(e) {
  const restoreBtn = e.target.closest('[data-action="restore"]');
  const deleteBtn = e.target.closest('[data-action="delete"]');
  const newWindowBtn = e.target.closest('[data-action="new-window"]');

  if (restoreBtn) {
    const id = restoreBtn.dataset.id;
    chrome.runtime.sendMessage({ action: 'restoreSession', sessionId: id, openInNewWindow: false });
  }
  if (newWindowBtn) {
    const id = newWindowBtn.dataset.id;
    chrome.runtime.sendMessage({ action: 'restoreSession', sessionId: id, openInNewWindow: true });
  }
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    deleteBtn.textContent = '…';
    chrome.runtime.sendMessage({ action: 'deleteSession', sessionId: id }, () => {
      loadSessions();
    });
  }
}

function filterSessions() {
  const query = searchInput.value.toLowerCase();
  if (!query) { renderSessions(allSessions); return; }
  const filtered = allSessions.filter(s =>
    s.name.toLowerCase().includes(query) ||
    (s.notes && s.notes.toLowerCase().includes(query)) ||
    (s.tags && s.tags.some(t => t.toLowerCase().includes(query)))
  );
  renderSessions(filtered);
}

function renderSessions(sessions) {
  if (sessions.length === 0) {
    emptyState.style.display = 'flex';
    // Remove cards
    const cards = sessionsList.querySelectorAll('.session-card');
    cards.forEach(c => c.remove());
    return;
  }
  emptyState.style.display = 'none';

  // Diff render
  const existingCards = sessionsList.querySelectorAll('.session-card');
  existingCards.forEach(c => c.remove());

  sessions.forEach(session => {
    const card = buildCard(session);
    sessionsList.appendChild(card);
  });
}

function buildCard(session) {
  const card = document.createElement('div');
  card.className = 'session-card';
  card.dataset.id = session.id;

  const timeAgo = formatTimeAgo(session.createdAt);
  const tagsHtml = (session.tags || []).map(t =>
    `<span class="tag-pill">${escHtml(t)}</span>`
  ).join('');

  const previewTabs = (session.tabs || []).slice(0, 12);
  const extraCount = (session.tabs || []).length - previewTabs.length;

  const faviconsHtml = previewTabs.map(tab => {
    if (tab.favIconUrl && tab.favIconUrl.startsWith('http')) {
      return `<img class="favicon" src="${escHtml(tab.favIconUrl)}" onerror="this.style.display='none'" alt="">`;
    }
    const letter = (tab.title || tab.url || '?')[0].toUpperCase();
    return `<span class="favicon-fallback">${escHtml(letter)}</span>`;
  }).join('');

  const autoBadge = session.isAutoSave ? '<span class="auto-badge">auto</span>' : '';
  const notesSection = session.notes
    ? `<div class="session-notes has-notes">${escHtml(session.notes)}</div>`
    : `<div class="session-notes"></div>`;

  card.innerHTML = `
    <div class="session-header">
      <span class="session-name">${escHtml(session.name)}</span>
      ${autoBadge}
    </div>
    <div class="session-meta">
      <span class="tab-pill">${session.tabCount} tabs</span>
      <span class="time-pill">${timeAgo}</span>
      ${tagsHtml}
    </div>
    <div class="tabs-preview">
      ${faviconsHtml}
      ${extraCount > 0 ? `<span class="more-tabs">+${extraCount}</span>` : ''}
    </div>
    ${notesSection}
    <div class="session-actions">
      <button class="btn btn-restore" data-action="restore" data-id="${session.id}">Restore</button>
      <button class="btn btn-restore" data-action="new-window" data-id="${session.id}" style="font-size:10px;padding:3px 8px;">New Window</button>
      <span style="flex:1"></span>
      <button class="btn btn-danger" data-action="delete" data-id="${session.id}">Delete</button>
    </div>
  `;

  return card;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatTimeAgo(iso) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
