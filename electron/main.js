const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

let mainWindow;
let serverProcess;


function startServer() {
  const serverDir = app.isPackaged
    ? path.join(process.resourcesPath, 'server')
    : path.join(__dirname, '../server');

  const serverPath = path.join(serverDir, 'index.js');

  console.log('Server Dir:', serverDir);
  console.log('Server Path:', serverPath);
  console.log('Exists:', fs.existsSync(serverPath));

  // Use 'node' from PATH (system Node), not Electron's internal Node
  const nodeBin = process.platform === 'win32' ? 'node.exe' : 'node';

  serverProcess = spawn(nodeBin, [serverPath], {
    cwd: serverDir,
    env: {
      ...process.env,
      NODE_ENV: app.isPackaged ? 'production' : 'development',
      NODE_PATH: path.join(serverDir, 'node_modules') // explicit module path
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  serverProcess.stdout?.on('data', (data) => {
    console.log(`[SERVER]: ${data}`);
  });

  serverProcess.stderr?.on('data', (data) => {
    console.error(`[SERVER ERROR]: ${data}`);
  });

  serverProcess.on('error', (err) => {
    console.error('Server failed to start:', err);
  });

  serverProcess.on('exit', (code) => {
    console.log('Server exited with code:', code);
  });
}

function waitForServerReady(callback, retries = 40) {
  const check = () => {
    http
      .get('http://localhost:5000/api/health', (res) => {
        if (res.statusCode === 200) {
          console.log('Backend Ready');
          callback();
        } else {
          retry();
        }
      })
      .on('error', retry);
  };

  const retry = () => {
    if (retries <= 0) {
      console.error('Backend failed to start');
      app.quit();
      return;
    }

    retries--;
    setTimeout(check, 500);
  };

  check();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Madira Muse',

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '../client/dist/index.html')
    );
  }

  // TEMP DEBUGGING
  mainWindow.webContents.openDevTools();

  mainWindow.webContents.on(
    'did-fail-load',
    (e, code, desc) => {
      console.error('LOAD FAILED:', code, desc);
    }
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startServer();

  waitForServerReady(() => {
    createWindow();
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});