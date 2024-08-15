const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('files', {
    getAllFiles: (path) => ipcRenderer.invoke('getAllFiles', path),
    saveFile: (binary) => ipcRenderer.invoke('saveFile', binary)
});

process.once('loaded', () => {
    window.addEventListener('message', evt => {
        if (evt.data.type === 'select-dir') {
            ipcRenderer.invoke('selectDir');
        }
    });

    ipcRenderer.on('change-dir', (event, dir) => {
        window.dispatchEvent(new CustomEvent('onChangeDir', {
            detail: dir
        }));
    });
});

