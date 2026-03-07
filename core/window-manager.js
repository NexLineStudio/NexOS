/* NexOS WindowManager */
const WindowManager = (() => {
  const layer = () => document.getElementById('window-layer');

  const open = ({ appId, title, icon='🗂', width=700, height=480, render }) => {
    const existing = NexOS.getProcesses().find(p=>p.appId===appId);
    if(existing){ existing.windowEl.classList.remove('minimized'); NexOS.focus(existing.pid); return existing.pid; }

    const win = document.createElement('div');
    win.className = 'nexos-window';
    win.setAttribute('role','dialog');
    win.setAttribute('aria-label', title);

    const maxX = window.innerWidth-width-40, maxY = window.innerHeight-height-80;
    const x = Math.max(20, Math.floor(maxX/2+(Math.random()-.5)*100));
    const y = Math.max(20, Math.floor(maxY/2+(Math.random()-.5)*60));
    win.style.cssText = `width:${width}px;height:${height}px;left:${x}px;top:${y}px;`;

    const tb = document.createElement('div');
    tb.className = 'win-titlebar';
    tb.innerHTML = `
      <div class="win-controls">
        <button class="win-btn close"    aria-label="Fermer"></button>
        <button class="win-btn minimize" aria-label="Réduire"></button>
        <button class="win-btn maximize" aria-label="Agrandir"></button>
      </div>
      <span class="win-icon">${icon}</span>
      <span class="win-title">${title}</span>`;

    const content = document.createElement('div');
    content.className = 'win-content';

    const rh = document.createElement('div');
    rh.className = 'win-resize';

    win.append(tb, content, rh);
    layer().appendChild(win);
    const pid = NexOS.spawn(appId, title, win);

    render(content, pid);

    win.addEventListener('pointerdown', ()=>NexOS.focus(pid));
    tb.querySelector('.close').addEventListener('click',    ()=>close(pid));
    tb.querySelector('.minimize').addEventListener('click', ()=>minimize(pid));
    tb.querySelector('.maximize').addEventListener('click', ()=>maximize(win));

    _drag(tb, win);
    _resize(rh, win);
    NexOS.focus(pid);
    return pid;
  };

  const close = (pid) => {
    const p = NexOS.getProcesses().find(p=>p.pid===pid); if(!p) return;
    const win = p.windowEl;
    win.style.transition='opacity 150ms,transform 150ms';
    win.style.opacity='0'; win.style.transform='scale(.95)';
    setTimeout(()=>{ win.remove(); NexOS.kill(pid); }, 150);
  };
  const minimize = (pid) => { const p=NexOS.getProcesses().find(p=>p.pid===pid); if(p) p.windowEl.classList.add('minimized'); };
  const restore  = (pid) => { const p=NexOS.getProcesses().find(p=>p.pid===pid); if(p){ p.windowEl.classList.remove('minimized'); NexOS.focus(pid); } };
  const maximize = (win) => {
    if(win.dataset.max==='1'){
      Object.assign(win.style, JSON.parse(win.dataset.prev));
      win.dataset.max='0';
    } else {
      win.dataset.prev=JSON.stringify({left:win.style.left,top:win.style.top,width:win.style.width,height:win.style.height});
      Object.assign(win.style,{left:'0',top:'0',width:'100%',height:'100%'});
      win.dataset.max='1';
    }
  };

  const _drag = (handle, win) => {
    let ox,oy;
    const mv = e=>{ win.style.left=(e.clientX-ox)+'px'; win.style.top=Math.max(0,e.clientY-oy)+'px'; };
    const up = ()=>{ document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up); };
    handle.addEventListener('pointerdown', e=>{
      if(e.target.classList.contains('win-btn')||win.dataset.max==='1') return;
      const r=win.getBoundingClientRect(); ox=e.clientX-r.left; oy=e.clientY-r.top;
      document.addEventListener('pointermove',mv); document.addEventListener('pointerup',up);
      e.preventDefault();
    });
  };
  const _resize = (handle, win) => {
    let sx,sy,sw,sh;
    const mv = e=>{ win.style.width=Math.max(300,sw+e.clientX-sx)+'px'; win.style.height=Math.max(220,sh+e.clientY-sy)+'px'; };
    const up = ()=>{ document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up); };
    handle.addEventListener('pointerdown', e=>{
      sx=e.clientX; sy=e.clientY; sw=win.offsetWidth; sh=win.offsetHeight;
      document.addEventListener('pointermove',mv); document.addEventListener('pointerup',up);
      e.preventDefault(); e.stopPropagation();
    });
  };

  return { open, close, minimize, restore, maximize };
})();
