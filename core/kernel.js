/* NexOS Kernel — EventBus + ProcessManager */
const K = (() => {
  const _l = {};
  const on   = (e,cb) => (_l[e]??=[]).push(cb);
  const off  = (e,cb) => { if(_l[e]) _l[e]=_l[e].filter(f=>f!==cb); };
  const emit = (e,d)  => (_l[e]??[]).forEach(cb=>cb(d));

  const procs = new Map();
  let nextPid = 1, focusPid = null, zTop = 20;
  let startTime = null;

  const spawn = (appId, title, el) => {
    const pid = nextPid++;
    procs.set(pid, { pid, appId, title, el });
    emit('spawn', { pid, appId });
    return pid;
  };
  const kill = pid => {
    const p = procs.get(pid); if(!p) return;
    procs.delete(pid); emit('kill', { pid, appId: p.appId });
  };
  const list  = () => [...procs.values()];
  const uptime = () => startTime ? ((Date.now()-startTime)/1000).toFixed(0)+'s' : '0s';

  const focus = pid => {
    document.querySelectorAll('.win').forEach(w => w.classList.remove('focus'));
    const p = procs.get(pid);
    if(p){ focusPid=pid; p.el.classList.add('focus'); p.el.style.zIndex=++zTop; }
    emit('focus', { pid });
  };

  const boot = () => { startTime = Date.now(); emit('boot'); };
  const shutdown = () => window.API.win.close();

  return { on, off, emit, spawn, kill, list, focus, uptime, boot, shutdown,
    get focusPid(){ return focusPid; } };
})();
