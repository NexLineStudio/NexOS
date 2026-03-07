/* NexOS Window Manager */
const WM = (() => {
  const layer = () => document.getElementById('win-layer');

  const open = ({ appId, title, icon='🗂', w=700, h=480, render }) => {
    // Une seule instance par app
    const ex = K.list().find(p => p.appId === appId);
    if(ex){ ex.el.classList.remove('mini'); K.focus(ex.pid); return ex.pid; }

    const win = document.createElement('div');
    win.className = 'win';

    // Position centrée + décalage léger
    const mw = window.innerWidth, mh = window.innerHeight - 58 - 34;
    const x = Math.max(10, Math.min((mw-w)/2 + (Math.random()-.5)*80|0, mw-w-10));
    const y = Math.max(10, Math.min((mh-h)/2 + (Math.random()-.5)*50|0, mh-h-10));
    win.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;`;

    win.innerHTML = `
      <div class="win-bar">
        <div class="win-dots">
          <button class="win-dot c" title="Fermer"></button>
          <button class="win-dot m" title="Réduire"></button>
          <button class="win-dot x" title="Agrandir"></button>
        </div>
        <span class="win-icon">${icon}</span>
        <span class="win-title">${title}</span>
      </div>
      <div class="win-body"></div>
      <div class="win-resize" title="Redimensionner"></div>`;

    const body = win.querySelector('.win-body');
    layer().appendChild(win);
    const pid = K.spawn(appId, title, win);

    render(body, pid);

    win.addEventListener('pointerdown', () => K.focus(pid), { capture: true });
    win.querySelector('.win-dot.c').onclick = () => close(pid);
    win.querySelector('.win-dot.m').onclick = () => minimize(pid);
    win.querySelector('.win-dot.x').onclick = () => maximize(win);

    _drag(win.querySelector('.win-bar'), win);
    _resize(win.querySelector('.win-resize'), win);
    K.focus(pid);
    return pid;
  };

  const close = pid => {
    const p = K.list().find(p=>p.pid===pid); if(!p) return;
    const win = p.el;
    win.style.transition='opacity 140ms,transform 140ms';
    win.style.opacity='0'; win.style.transform='scale(.94)';
    setTimeout(() => { win.remove(); K.kill(pid); }, 140);
  };

  const minimize = pid => { const p=K.list().find(p=>p.pid===pid); if(p) p.el.classList.add('mini'); };
  const restore  = pid => { const p=K.list().find(p=>p.pid===pid); if(p){ p.el.classList.remove('mini'); K.focus(pid); } };

  const maximize = win => {
    if(win.dataset.max==='1'){
      Object.assign(win.style, JSON.parse(win.dataset.prev));
      win.dataset.max='0';
    } else {
      win.dataset.prev=JSON.stringify({left:win.style.left,top:win.style.top,width:win.style.width,height:win.style.height});
      Object.assign(win.style,{left:'0',top:'0',width:'100%',height:'100%'});
      win.dataset.max='1';
    }
  };

  const _drag = (bar, win) => {
    let ox,oy;
    const mv = e => { win.style.left=(e.clientX-ox)+'px'; win.style.top=Math.max(0,e.clientY-oy)+'px'; };
    const up = () => { document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up); };
    bar.addEventListener('pointerdown', e => {
      if(e.target.classList.contains('win-dot')||win.dataset.max==='1') return;
      const r=win.getBoundingClientRect(); ox=e.clientX-r.left; oy=e.clientY-r.top;
      document.addEventListener('pointermove',mv);
      document.addEventListener('pointerup',up);
      e.preventDefault();
    });
  };

  const _resize = (handle, win) => {
    let sx,sy,sw,sh;
    const mv = e => { win.style.width=Math.max(280,sw+e.clientX-sx)+'px'; win.style.height=Math.max(200,sh+e.clientY-sy)+'px'; };
    const up = () => { document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up); };
    handle.addEventListener('pointerdown', e => {
      sx=e.clientX; sy=e.clientY; sw=win.offsetWidth; sh=win.offsetHeight;
      document.addEventListener('pointermove',mv); document.addEventListener('pointerup',up);
      e.stopPropagation(); e.preventDefault();
    });
  };

  return { open, close, minimize, restore };
})();
