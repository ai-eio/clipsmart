# ClipSmart

AI-powered clipboard manager for Windows and Mac. Local-first, keyboard-driven, with semantic search via a local LLM or Claude.

![ClipSmart](https://img.shields.io/badge/version-0.1.0-7c6bf0) ![Electron](https://img.shields.io/badge/Electron-29-47848F) ![React](https://img.shields.io/badge/React-18-61DAFB) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Auto-captures** everything you copy — text, code, URLs, emails
- **Instant search** across your full clipboard history
- **AI semantic search** — describe what you're looking for in plain English
- **Local LLM by default** — AI search runs on your machine via Ollama, no API key required
- **Keyboard-first** — open, navigate, and copy without touching the mouse
- **Pin important clips** so they survive the history limit
- **Content type detection** — automatically tags URLs, emails, code snippets, phone numbers
- **100% local** — nothing ever leaves your machine in default mode
- **System tray** — lives quietly in the background, always available

## Quickstart

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Ollama](https://ollama.com) (for AI search — optional but recommended)

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

ClipSmart defaults to running AI search locally using [Ollama](https://ollama.com) — no internet connection or API key required.

### Local LLM (default)

1. Install [Ollama](https://ollama.com)
2. Pull a model:
   ```bash
   ollama pull llama3.2
   ```
3. Type a search query in ClipSmart and click **✦ AI**

The default URL is `http://localhost:11434` and the default model is `llama3.2`. Both can be changed in Settings. Other good options: `mistral`, `phi3`, `gemma2`.

### Anthropic Claude (optional)

To use Claude Haiku instead:

1. Open Settings (`⚙`) and switch the provider to **Anthropic**
2. Paste your [Anthropic API key](https://console.anthropic.com)
3. Type a search query and click **✦ AI**

> In local mode, AI search data never leaves your machine. Anthropic mode sends clip content to the Anthropic API.

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
│   ├── main.js              # App lifecycle, tray, hotkey, IPC, AI search
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
        └── Settings.jsx     # Provider toggle (Local LLM / Anthropic)
```

## Data & privacy

Clipboard history is stored in a local JSON file:

- **Windows:** `%APPDATA%\clipsmart\clips.json`
- **Mac:** `~/Library/Application Support/clipsmart/clips.json`

Settings (including any API key) are stored in the same directory as `settings.json`.

In **Local LLM mode** (default), nothing ever leaves your machine. In **Anthropic mode**, clipboard content is sent to the Anthropic API only when you trigger an AI search.

## License

MIT
