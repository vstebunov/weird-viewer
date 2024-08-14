const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const getAllFiles = (_, dir) => {
    const defaultDir = '/home/r4ge/PARA/3_resources/images/неразобрано/';
    dir = dir ? dir : defaultDir;
    const files = fs.readdirSync(dir);
    const filesWithPath = files.map(file => {return {name: file, path: path.join(dir, file)}});
    return filesWithPath;
};

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    const selectDir = async (event) => {
        const result = await dialog.showOpenDialog(win, {
            properties: ['openDirectory']
        })
        if (!result.canceled) {
            event.sender.send('change-dir', result.filePaths[0]);
        }
    };

    ipcMain.handle('ping', () => 'pong');
    ipcMain.handle('getAllFiles', getAllFiles);
    ipcMain.handle('selectDir', selectDir);

    win.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

