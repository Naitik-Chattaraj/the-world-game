const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1300,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);
