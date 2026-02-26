# TabVault – Save & Restore Tab Sessions

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://chrome.google.com/webstore)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-☕-yellow.svg)](https://buymeacoffee.com/)

> **Never lose your research tabs again.** TabVault saves your open browser tabs as named sessions you can restore with one click — even days or weeks later.

---

## What It Does

You're deep in research with 20 tabs open. You need to shut your laptop. Tomorrow you won't remember which tabs were open or why. **TabVault fixes this.**

- Press the extension icon → give your session a name → all your tabs are saved
- Come back any time → click **Restore** → all those tabs open again
- Add tags like `work`, `research`, `personal` to find sessions fast
- Write a note so you remember what you were doing
- Auto-save runs in the background so you never lose anything

---

## Installation (Step by Step)

### From Chrome Web Store (Recommended)
1. Visit the Chrome Web Store page for TabVault
2. Click **Add to Chrome**
3. Click **Add extension** in the confirmation dialog
4. The TabVault icon appears in your toolbar — click it to start

### Manual Install (Developer Mode)
1. Download the latest `.zip` from [Releases](../../releases)
2. Unzip the file anywhere on your computer
3. Open Chrome and go to `chrome://extensions`
4. Toggle **Developer mode** ON (top-right switch)
5. Click **Load unpacked** → select the unzipped `tabvault` folder
6. The extension is now installed

---

## Full Feature List

| Feature | Description |
|---|---|
| **Save Session** | Captures all open tabs in the current window with their URLs and titles |
| **Session Names** | Give each session a meaningful name (auto-filled with date/time) |
| **Tags** | Add comma-separated tags to organise sessions (e.g. `work, design, research`) |
| **Notes** | Write a short note per session so you remember the context |
| **Restore** | Opens all tabs from a saved session in the current window |
| **New Window** | Restores a session into a brand-new browser window |
| **Search** | Instantly filter sessions by name, tag, or note text |
| **Favicon Preview** | See a mini strip of site icons so you recognise sessions at a glance |
| **Auto-Save** | Optionally schedule automatic saves every 15 / 30 / 60 / 120 minutes |
| **Export** | Download all sessions as a `.json` file for backup |
| **Delete** | Remove individual sessions from the list |
| **Settings Page** | Configure auto-save, max sessions, and manage storage |

---

## Permissions

| Permission | Why It's Needed |
|---|---|
| `tabs` | To read the URL and title of your currently open tabs when saving a session |
| `storage` | To save your sessions locally on your computer (nothing is sent to any server) |
| `alarms` | To run the optional auto-save feature on a schedule |

**No network requests are made. All data stays on your device.**

---

## File Structure

```
tabvault/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Service worker — handles save/restore/auto-save logic
├── popup/
│   ├── popup.html         # Main extension popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup interaction logic
├── options/
│   ├── options.html       # Settings page
│   ├── options.css        # Settings styles
│   └── options.js         # Settings logic
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

---

## Roadmap

### v1.1
- [ ] Import sessions from exported JSON file
- [ ] Duplicate a session
- [ ] Rename sessions after saving
- [ ] Sort sessions by name, date, or tab count

### v1.2
- [ ] Colour-coded tags
- [ ] Pinned/starred sessions
- [ ] Keyboard shortcut to quick-save (`Ctrl+Shift+S`)

### v2.0
- [ ] Cross-device sync (optional, Pro feature)
- [ ] Firefox version
- [ ] Session sharing via link
- [ ] Bulk operations (select + delete multiple)

---

## Support This Project

If TabVault saves your sanity, consider buying me a coffee ☕

[![Buy Me a Coffee](https://img.shields.io/badge/☕%20Buy%20Me%20a%20Coffee-Support%20this%20project-yellow?style=for-the-badge)](https://buymeacoffee.com/)

Every coffee helps me build more free tools like this one. Thank you!

---

## License

MIT License — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.
