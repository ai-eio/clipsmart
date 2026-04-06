const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('clipAPI', {
  getClips: (limit, offset) => ipcRenderer.invoke('get-clips', limit, offset),
  searchClips: (query) => ipcRenderer.invoke('search-clips', query),
  deleteClip: (id) => ipcRenderer.invoke('delete-clip', id),
  togglePin: (id) => ipcRenderer.invoke('toggle-pin', id),
  clearAll: () => ipcRenderer.invoke('clear-all'),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  aiSearch: (query, clips) => ipcRenderer.invoke('ai-search', query, clips),
  onNewClip: (cb) => ipcRenderer.on('new-clip', (_, clip) => cb(clip)),
  onWindowShown: (cb) => ipcRenderer.on('window-shown', () => cb()),
})
