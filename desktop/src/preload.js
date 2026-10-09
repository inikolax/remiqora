'use strict';
const { contextBridge, ipcRenderer } = require('electron');

// The first-run screen gets a small, explicit API. It has no access to Node or to the file system.
contextBridge.exposeInMainWorld('remiqora', {
  context: () => ipcRenderer.invoke('setup:context'),
  checks: (dir) => ipcRenderer.invoke('setup:checks', dir),
  chooseFolder: () => ipcRenderer.invoke('setup:choose-folder'),
  setRoot: (dir) => ipcRenderer.invoke('setup:set-root', dir),
  start: () => ipcRenderer.invoke('setup:start'),
  pause: () => ipcRenderer.invoke('setup:pause'),
  launch: () => ipcRenderer.invoke('setup:launch'),
  openExternal: (key) => ipcRenderer.invoke('setup:open-external', key),
  openLogs: () => ipcRenderer.invoke('setup:open-logs'),
  showData: () => ipcRenderer.invoke('setup:show-data'),
  setFeatures: (picked) => ipcRenderer.invoke('setup:set-features', picked),
  // For the app itself (the same window shows it): what is installed, and adding a part left out at install.
  installed: () => ipcRenderer.invoke('app:features'),
  addFeatures: (ids) => ipcRenderer.invoke('app:add-features', ids),
  onEvent: (callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on('setup:event', handler);
    return () => ipcRenderer.removeListener('setup:event', handler);
  },
});
