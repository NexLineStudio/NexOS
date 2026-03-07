const { app, BrowserWindow, ipcMain, dialog, shell, globalShortcut } = require('electron');
const path = require('path');
const fs   = require('fs');
const os   = require('os');
const https = require('https');

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    kiosk: true,
    frame: false,
    backgroundColor: '#0f1923',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
  });
  win.loadFile('index.html');
  win.on('maximize',   () => win.webContents.send('win:state', 'maximized'));
  win.on('unmaximize', () => win.webContents.send('win:state', 'normal'));
}

app.whenReady().then(() => {
  createWindow();
  // Empêcher la sortie du kiosk avec Escape ou Alt+F4
  globalShortcut.register('Escape', () => null);
  globalShortcut.register('Alt+F4', () => null);
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ── Fenêtre ──────────────────────────────────────────────────────
ipcMain.on('win:minimize', e => BrowserWindow.fromWebContents(e.sender).minimize());
ipcMain.on('win:maximize', e => { const w = BrowserWindow.fromWebContents(e.sender); w.isMaximized() ? w.unmaximize() : w.maximize(); });
ipcMain.on('win:close',    e => BrowserWindow.fromWebContents(e.sender).close());

// ── Filesystem ───────────────────────────────────────────────────
ipcMain.handle('fs:readdir', (_, p) => {
  try {
    return fs.readdirSync(p, { withFileTypes: true }).map(e => ({
      name: e.name,
      isDir: e.isDirectory(),
      path: path.join(p, e.name),
      ext: path.extname(e.name).toLowerCase(),
      size: e.isDirectory() ? null : (() => { try { return fs.statSync(path.join(p, e.name)).size; } catch { return 0; } })(),
    }));
  } catch (err) { return { error: err.message }; }
});

ipcMain.handle('fs:readfile', (_, p) => {
  try {
    const stat = fs.statSync(p);
    if (stat.size > 5 * 1024 * 1024) return { error: 'Fichier trop grand' };
    return { content: fs.readFileSync(p, 'utf8') };
  } catch (err) { return { error: err.message }; }
});

ipcMain.handle('fs:writefile', (_, p, c) => {
  try { fs.writeFileSync(p, c, 'utf8'); return { ok: true }; }
  catch (err) { return { error: err.message }; }
});

ipcMain.handle('fs:mkdir',  (_, p) => { try { fs.mkdirSync(p, { recursive: true }); return { ok: true }; } catch (e) { return { error: e.message }; } });
ipcMain.handle('fs:delete', (_, p) => { try { fs.rmSync(p, { recursive: true, force: true }); return { ok: true }; } catch (e) { return { error: e.message }; } });
ipcMain.handle('fs:rename', (_, o, n) => { try { fs.renameSync(o, n); return { ok: true }; } catch (e) { return { error: e.message }; } });
ipcMain.handle('fs:open',   (_, p) => shell.openPath(p).then(() => ({ ok: true })));
ipcMain.handle('fs:pickdir',  () => dialog.showOpenDialog({ properties: ['openDirectory'] }).then(r => r.canceled ? null : r.filePaths[0]));
ipcMain.handle('fs:pickfile', (_, f=[]) => dialog.showOpenDialog({ properties: ['openFile'], filters: f }).then(r => r.canceled ? null : r.filePaths[0]));
ipcMain.handle('fs:savedialog', (_, n='fichier.txt') => dialog.showSaveDialog({ defaultPath: n }).then(r => r.canceled ? null : r.filePath));
ipcMain.handle('fs:pickimages', () => dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'Images', extensions: ['jpg','jpeg','png','gif','webp','svg'] }] }).then(r => r.canceled ? [] : r.filePaths));

// ── Système ──────────────────────────────────────────────────────
ipcMain.handle('sys:info', () => ({
  platform: process.platform, arch: process.arch,
  hostname: os.hostname(), username: os.userInfo().username,
  homedir: os.homedir(),
  totalMem: os.totalmem(), freeMem: os.freemem(),
  cpus: os.cpus().length, uptime: os.uptime(),
  nodeVer: process.version, electronVer: process.versions.electron,
}));

// ── Météo (Open-Meteo, gratuit, sans clé API) ────────────────────
ipcMain.handle('weather:fetch', (_, lat, lon) => {
  return new Promise((resolve) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=5`;
    https.get(url, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({ error: 'Parse error' }); } });
    }).on('error', e => resolve({ error: e.message }));
  });
});

ipcMain.handle('weather:geocode', (_, city) => {
  return new Promise((resolve) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr`;
    https.get(url, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({ error: 'Parse error' }); } });
    }).on('error', e => resolve({ error: e.message }));
  });
});
