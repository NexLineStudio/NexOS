const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('API', {
  fs: {
    readdir:    p     => ipcRenderer.invoke('fs:readdir', p),
    readfile:   p     => ipcRenderer.invoke('fs:readfile', p),
    writefile:  (p,c) => ipcRenderer.invoke('fs:writefile', p, c),
    mkdir:      p     => ipcRenderer.invoke('fs:mkdir', p),
    delete:     p     => ipcRenderer.invoke('fs:delete', p),
    rename:     (o,n) => ipcRenderer.invoke('fs:rename', o, n),
    open:       p     => ipcRenderer.invoke('fs:open', p),
    pickdir:    ()    => ipcRenderer.invoke('fs:pickdir'),
    pickfile:   f     => ipcRenderer.invoke('fs:pickfile', f),
    savedialog: n     => ipcRenderer.invoke('fs:savedialog', n),
    pickimages: ()    => ipcRenderer.invoke('fs:pickimages'),
  },
  sys:     { info: () => ipcRenderer.invoke('sys:info') },
  weather: {
    fetch:    (lat, lon) => ipcRenderer.invoke('weather:fetch', lat, lon),
    geocode:  city       => ipcRenderer.invoke('weather:geocode', city),
  },
  win: {
    minimize:  () => ipcRenderer.send('win:minimize'),
    maximize:  () => ipcRenderer.send('win:maximize'),
    close:     () => ipcRenderer.send('win:close'),
    onState:   cb => ipcRenderer.on('win:state', (_, v) => cb(v)),
  },
});
