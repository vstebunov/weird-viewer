const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('files', {
    getAllFiles: () => ipcRenderer.invoke('getAllFiles')
});
