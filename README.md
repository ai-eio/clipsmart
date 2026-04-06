# ClipSmart

AI-powered clipboard manager for Windows and Mac. Local-first, keyboard-driven, with optional semantic search via Claude.

![ClipSmart](https://img.shields.io/badge/version-0.1.0-7c6bf0) ![Electron](https://img.shields.io/badge/Electron-29-47848F) ![React](https://img.shields.io/badge/React-18-61DAFB) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Auto-captures** everything you copy — text, code, URLs, emails
- **Instant search** across your full clipboard history
- **AI semantic search** — describe what you're looking for in plain English (requires Anthropic API key)
- **Keyboard-first** — open, navigate, and copy without touching the mouse
- **Pin important clips** so they survive the history limit
- **Content type detection** — automatically tags URLs, emails, code snippets, phone numbers
- **Local-only** — all data stored on your machine, nothing sent to the cloud unless AI search is used
- **System tray** — lives quietly in the background, always available

## Quickstart

### Prerequisites

- [Node.js](https://nodejs.org) 18+

### Install & run

```bash
git clone https://github.com/ai-eio/clipsmart.git
cd clipsmart
npm install
npm run dev
```

The app will appear in your system tray. Press **Ctrl+Shift+V** (or **Cmd+Shift+V** on Mac) anywhere to open the clipboard panel.

## Usage

| Action | How |
|---|---|
| Open / close | `Ctrl+Shift+V` |
| Navigate clips | `↑` / `↓` |
| Copy selected clip | `Enter` |
| Close panel | `Esc` |
| Search history | Type in the search bar |
| AI semantic search | Type a query → click **✦ AI** |
| Pin a clip | Hover → click `○` |
| Delete a clip | Hover → click `✕` |
| Clear all history | Click **Clear all** in the status bar |
| Settings | Click `⚙` in the title bar |

## AI Search

ClipSmart uses Claude Haiku for semantic search — find clips by meaning, not just keywords.

1. Open Settings (`⚙`)
2. Paste your [Anthropic API key](https://console.anthropic.com)
3. Type a search query and click **✦ AI**

> AI search is optional. The app works fully offline without an API key.

## Build for distribution

```bash
npm run build
```

Outputs installers to `dist-electron/`:
- **Windows:** NSIS installer + portable `.exe`
- **Mac:** `.dmg`
- **Linux:** `.AppImage`

## Project structure

```
clipsmart/
├── electron/
│   ├── main.js              # App lifecycle, tray, hotkey, IPC
│   ├── preload.js           # Secure renderer ↔ main bridge
│   ├── db.js                # Local JSON storage + search
│   └── clipboardMonitor.js  # 500ms clipboard polling
└── src/
    ├── App.jsx              # Root component + keyboard navigation
    ├── index.css            # Dark theme styles
    └── components/
        ├── SearchBar.jsx
        ├── ClipList.jsx
        ├── ClipItem.jsx
        └── Settings.jsx
```

## Data & privacy

Clipboard history is stored in a local JSON file:

- **Windows:** `%APPDATA%\clipsmart\clips.json`
- **Mac:** `~/Library/Application Support/clipsmart/clips.json`

Nothing leaves your machine unless you use AI search, which sends clip content to the Anthropic API.

## License

MIT
