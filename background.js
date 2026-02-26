// TabVault Background Service Worker

const AUTO_SAVE_ALARM = 'tabvault_autosave';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(AUTO_SAVE_ALARM, { periodInMinutes: 30 });
  chrome.storage.local.get(['sessions', 'settings'], (result) => {
    if (!result.sessions) chrome.storage.local.set({ sessions: [] });
    if (!result.settings) {
      chrome.storage.local.set({
        settings: { autoSave: false, autoSaveInterval: 30, maxSessions: 50 }
      });
    }
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === AUTO_SAVE_ALARM) {
    chrome.storage.local.get(['settings'], (result) => {
      if (result.settings && result.settings.autoSave) {
        autoSaveCurrentTabs();
      }
    });
  }
});

async function autoSaveCurrentTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const tabData = tabs.map(tab => ({ url: tab.url, title: tab.title, favIconUrl: tab.favIconUrl }));
  const now = new Date();
  const session = {
    id: Date.now().toString(),
    name: `Auto-save ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    tabs: tabData,
    tabCount: tabData.length,
    notes: '',
    tags: ['auto-save'],
    createdAt: now.toISOString(),
    isAutoSave: true
  };

  chrome.storage.local.get(['sessions', 'settings'], (result) => {
    let sessions = result.sessions || [];
    const maxSessions = result.settings?.maxSessions || 50;
    // Remove old auto-saves beyond limit
    const autoSaves = sessions.filter(s => s.isAutoSave);
    if (autoSaves.length >= 5) {
      const oldest = autoSaves.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
      sessions = sessions.filter(s => s.id !== oldest.id);
    }
    sessions.unshift(session);
    if (sessions.length > maxSessions) sessions = sessions.slice(0, maxSessions);
    chrome.storage.local.set({ sessions });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveCurrentTabs') {
    saveCurrentTabs(message.data).then(sendResponse);
    return true;
  }
  if (message.action === 'restoreSession') {
    restoreSession(message.sessionId, message.openInNewWindow).then(sendResponse);
    return true;
  }
  if (message.action === 'deleteSession') {
    deleteSession(message.sessionId).then(sendResponse);
    return true;
  }
  if (message.action === 'updateAutoSaveInterval') {
    chrome.alarms.clear(AUTO_SAVE_ALARM, () => {
      chrome.alarms.create(AUTO_SAVE_ALARM, { periodInMinutes: message.interval });
    });
    sendResponse({ success: true });
  }
});

async function saveCurrentTabs(data) {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const tabData = tabs
    .filter(tab => tab.url && !tab.url.startsWith('chrome://'))
    .map(tab => ({ url: tab.url, title: tab.title || tab.url, favIconUrl: tab.favIconUrl || '' }));

  const session = {
    id: Date.now().toString(),
    name: data.name || `Session ${new Date().toLocaleDateString()}`,
    tabs: tabData,
    tabCount: tabData.length,
    notes: data.notes || '',
    tags: data.tags || [],
    createdAt: new Date().toISOString(),
    isAutoSave: false
  };

  return new Promise((resolve) => {
    chrome.storage.local.get(['sessions', 'settings'], (result) => {
      let sessions = result.sessions || [];
      const maxSessions = result.settings?.maxSessions || 50;
      sessions.unshift(session);
      if (sessions.length > maxSessions) sessions = sessions.slice(0, maxSessions);
      chrome.storage.local.set({ sessions }, () => resolve({ success: true, session }));
    });
  });
}

async function restoreSession(sessionId, openInNewWindow) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['sessions'], async (result) => {
      const sessions = result.sessions || [];
      const session = sessions.find(s => s.id === sessionId);
      if (!session) { resolve({ success: false, error: 'Session not found' }); return; }

      const urls = session.tabs.map(t => t.url).filter(Boolean);
      if (openInNewWindow) {
        await chrome.windows.create({ url: urls });
      } else {
        for (const url of urls) {
          await chrome.tabs.create({ url, active: false });
        }
      }
      resolve({ success: true });
    });
  });
}

async function deleteSession(sessionId) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['sessions'], (result) => {
      let sessions = result.sessions || [];
      sessions = sessions.filter(s => s.id !== sessionId);
      chrome.storage.local.set({ sessions }, () => resolve({ success: true }));
    });
  });
}
