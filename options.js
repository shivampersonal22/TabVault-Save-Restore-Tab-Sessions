// TabVault Options Script

document.addEventListener('DOMContentLoaded', init);

function init() {
  loadSettings();
  bindEvents();
  loadStorageInfo();
}

function bindEvents() {
  document.getElementById('autoSaveToggle').addEventListener('change', saveSettings);
  document.getElementById('intervalSelect').addEventListener('change', saveSettings);
  document.getElementById('maxSessions').addEventListener('change', saveSettings);
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('clearAllBtn').addEventListener('click', clearAll);
}

function loadSettings() {
  chrome.storage.local.get(['settings'], (result) => {
    const s = result.settings || {};
    const toggle = document.getElementById('autoSaveToggle');
    toggle.checked = s.autoSave || false;

    const interval = document.getElementById('intervalSelect');
    if (s.autoSaveInterval) interval.value = String(s.autoSaveInterval);

    const max = document.getElementById('maxSessions');
    if (s.maxSessions) max.value = String(s.maxSessions);

    updateIntervalVisibility(toggle.checked);
  });
}

function saveSettings() {
  const autoSave = document.getElementById('autoSaveToggle').checked;
  const autoSaveInterval = parseInt(document.getElementById('intervalSelect').value, 10);
  const maxSessions = parseInt(document.getElementById('maxSessions').value, 10);

  updateIntervalVisibility(autoSave);

  const settings = { autoSave, autoSaveInterval, maxSessions };
  chrome.storage.local.set({ settings }, () => {
    chrome.runtime.sendMessage({ action: 'updateAutoSaveInterval', interval: autoSaveInterval });
    showToast('Settings saved');
  });
}

function updateIntervalVisibility(show) {
  const row = document.getElementById('intervalRow');
  row.style.opacity = show ? '1' : '0.4';
  row.style.pointerEvents = show ? '' : 'none';
}

function loadStorageInfo() {
  chrome.storage.local.get(['sessions'], (result) => {
    const sessions = result.sessions || [];
    document.getElementById('sessionCount').textContent = `${sessions.length} sessions saved`;

    // Estimate size
    const bytes = new TextEncoder().encode(JSON.stringify(sessions)).length;
    const kb = (bytes / 1024).toFixed(1);
    document.getElementById('storageSize').textContent = `~${kb} KB used`;
  });
}

function exportData() {
  chrome.storage.local.get(['sessions'], (result) => {
    const sessions = result.sessions || [];
    const json = JSON.stringify({ tabvault_export: true, exportedAt: new Date().toISOString(), sessions }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabvault-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported!');
  });
}

function clearAll() {
  if (!confirm('Delete ALL saved sessions? This cannot be undone.')) return;
  chrome.storage.local.set({ sessions: [] }, () => {
    loadStorageInfo();
    showToast('All sessions cleared');
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
