/* NexOS — Fichiers */
App.reg('fichiers', () => WM.open({
  appId:'fichiers', title:'Fichiers', icon:'📁', w:880, h:560,
  render(el) {
    const fmtSize = b => {
      if(b===null||b===undefined) return '';
      if(b<1024) return b+'o';
      if(b<1048576) return (b/1024).toFixed(1)+'Ko';
      return (b/1048576).toFixed(1)+'Mo';
    };
    const ICONS = { folder:'📁',txt:'📄',md:'📄',js:'📜',ts:'📜',py:'🐍',html:'🌐',css:'🎨',json:'📋',png:'🖼',jpg:'🖼',jpeg:'🖼',gif:'🖼',svg:'🎨',mp4:'🎬',mp3:'🎵',wav:'🎵',pdf:'📕',zip:'🗜',rar:'🗜',exe:'⚙',bat:'⚙',sh:'⚙',docx:'📘',xlsx:'📗',pptx:'📙' };
    const icon = e => e.isDir ? '📁' : (ICONS[e.ext.replace('.','')]||'📄');

    let cwd='', hist=[], hi=-1, sel=null;

    el.style.cssText='display:flex;flex-direction:column;height:100%;';
    el.innerHTML=`
      <div class="toolbar">
        <button class="btn btn-ghost" id="f-back" disabled style="padding:6px 10px;">◀</button>
        <button class="btn btn-ghost" id="f-fwd"  disabled style="padding:6px 10px;">▶</button>
        <button class="btn btn-ghost" id="f-up"            style="padding:6px 10px;" title="Dossier parent">⬆</button>
        <button class="btn btn-ghost" id="f-home"           style="padding:6px 10px;" title="Dossier personnel">🏠</button>
        <input  class="inp" id="f-path" type="text" placeholder="Chemin…" aria-label="Chemin" style="flex:1;font-size:13px;padding:6px 12px;font-family:var(--mono)"/>
        <button class="btn btn-ghost" id="f-pick" title="Choisir un dossier">📂</button>
        <button class="btn btn-mint"  id="f-new">+ Dossier</button>
      </div>
      <div style="display:flex;flex:1;overflow:hidden;">
        <div id="f-sidebar" style="width:160px;flex-shrink:0;background:var(--surface2);border-right:1px solid var(--border);overflow-y:auto;padding:8px 0;"></div>
        <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
          <div style="display:grid;grid-template-columns:32px 1fr 80px 70px;padding:6px 12px;font-size:12px;color:var(--dim);border-bottom:1px solid var(--border);flex-shrink:0;background:var(--surface2);">
            <span></span><span>Nom</span><span style="text-align:right;">Taille</span><span></span>
          </div>
          <div id="f-list" style="flex:1;overflow-y:auto;padding:4px;"></div>
        </div>
      </div>
      <div class="statusbar" id="f-status">Aucun dossier ouvert</div>`;

    const listEl   = el.querySelector('#f-list');
    const pathEl   = el.querySelector('#f-path');
    const statusEl = el.querySelector('#f-status');
    const btnBack  = el.querySelector('#f-back');
    const btnFwd   = el.querySelector('#f-fwd');

    // Sidebar favoris
    const sidebar = el.querySelector('#f-sidebar');
    const addFav = (label, getPath) => {
      const b = document.createElement('button');
      b.style.cssText='display:flex;align-items:center;gap:8px;padding:9px 14px;font-size:13px;color:var(--muted);width:100%;border-radius:0;transition:background var(--fast);';
      b.textContent=label;
      b.onmouseover=()=>b.style.background='var(--surface3)';
      b.onmouseleave=()=>b.style.background='';
      b.onclick=()=>{ const p=getPath(); if(p) nav(p); };
      sidebar.appendChild(b);
      return b;
    };

    API.sys.info().then(info => {
      addFav('🏠 Personnel',  ()=>info.homedir);
      addFav('🖥 Bureau',     ()=>info.homedir+'\\Desktop');
      addFav('📥 Télécharg.', ()=>info.homedir+'\\Downloads');
      addFav('📄 Documents',  ()=>info.homedir+'\\Documents');
      addFav('🖼 Images',     ()=>info.homedir+'\\Pictures');
      addFav('🎵 Musique',    ()=>info.homedir+'\\Music');
      const sep=document.createElement('div'); sep.style.cssText='padding:8px 14px 4px;font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;'; sep.textContent='Ce PC'; sidebar.appendChild(sep);
      ['C:\\','D:\\','E:\\','F:\\'].forEach(d=>addFav('💽 '+d, ()=>d));
      nav(info.homedir);
    });

    const nav = async path => {
      const res = await API.fs.readdir(path);
      if(res?.error){ listEl.innerHTML=`<div style="padding:20px;color:var(--danger);font-size:14px;">⚠ ${res.error}</div>`; return; }
      cwd=path; pathEl.value=path;
      hist=hist.slice(0,hi+1); hist.push(path); hi=hist.length-1;
      btnBack.disabled=hi<=0; btnFwd.disabled=true;
      render(res);
    };

    const render = entries => {
      listEl.innerHTML='';
      if(!entries.length){ listEl.innerHTML='<div style="padding:20px;color:var(--dim);font-size:14px;text-align:center;">📭 Dossier vide</div>'; return; }
      const sorted=[...entries].sort((a,b)=>{ if(a.isDir!==b.isDir) return a.isDir?-1:1; return a.name.localeCompare(b.name,'fr'); });
      sorted.forEach(item=>{
        const row=document.createElement('div');
        row.style.cssText='display:grid;grid-template-columns:32px 1fr 80px 70px;align-items:center;padding:7px 12px;border-radius:var(--r);font-size:14px;cursor:default;transition:background var(--fast);';
        row.innerHTML=`<span style="font-size:1.1rem">${icon(item)}</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${item.name}">${item.name}</span><span style="text-align:right;font-family:var(--mono);font-size:12px;color:var(--muted);">${fmtSize(item.size)}</span><span></span>`;
        row.onmouseover=()=>row.style.background='var(--surface2)';
        row.onmouseleave=()=>{ row.style.background=sel===item?'var(--mint-dim)':''; };
        row.onclick=()=>{ listEl.querySelectorAll('[data-sel]').forEach(r=>{ r.style.background=''; delete r.dataset.sel; }); row.style.background='var(--mint-dim)'; row.dataset.sel='1'; sel=item; };
        row.ondblclick=()=>{ if(item.isDir) nav(item.path); else API.fs.open(item.path); };
        row.oncontextmenu=e=>{ e.preventDefault(); showCtx(e,item); };
        listEl.appendChild(row);
      });
      const dirs=entries.filter(e=>e.isDir).length, files=entries.length-dirs;
      statusEl.textContent=`${dirs} dossier(s), ${files} fichier(s) — ${cwd}`;
    };

    el.querySelector('#f-back').onclick=()=>{ if(hi>0){ hi--; nav(hist[hi]); btnFwd.disabled=false; } };
    el.querySelector('#f-fwd').onclick =()=>{ if(hi<hist.length-1){ hi++; nav(hist[hi]); } };
    el.querySelector('#f-up').onclick  =()=>{ if(!cwd) return; const p=cwd.replace(/[/\\][^/\\]+[/\\]?$/,''); if(p&&p!==cwd) nav(p); };
    el.querySelector('#f-home').onclick=()=>API.sys.info().then(i=>nav(i.homedir));
    el.querySelector('#f-pick').onclick=()=>API.fs.pickdir().then(p=>{ if(p) nav(p); });
    el.querySelector('#f-new').onclick =()=>{ const n=prompt('Nom du nouveau dossier :'); if(n) API.fs.mkdir(cwd+'\\'+n).then(()=>nav(cwd)); };
    pathEl.onkeydown=e=>{ if(e.key==='Enter') nav(pathEl.value); };

    // Menu contextuel
    let ctxEl=null;
    const showCtx=(e,item)=>{
      removeCtx();
      ctxEl=document.createElement('div');
      ctxEl.style.cssText=`position:fixed;left:${e.clientX}px;top:${e.clientY}px;background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r2);box-shadow:0 10px 40px #00000060;z-index:9999;min-width:180px;padding:6px 0;animation:pop .1s var(--ease) both;`;
      const items=[
        { l: item.isDir?'📂 Ouvrir':'🚀 Ouvrir', fn:()=>{ item.isDir?nav(item.path):API.fs.open(item.path); } },
        !item.isDir?{ l:'📝 Modifier dans Bloc-notes', fn:()=>{ App.open('bloc-notes'); setTimeout(()=>{ K.emit('editor:open',item.path); },300); } }:null,
        { sep:true },
        { l:'✏ Renommer', fn:async()=>{ const n=prompt('Nouveau nom :',item.name); if(n&&n!==item.name){ await API.fs.rename(item.path,cwd+'\\'+n); nav(cwd); } } },
        { l:'🗑 Supprimer', danger:true, fn:async()=>{ if(confirm(`Supprimer "${item.name}" ?`)){ await API.fs.delete(item.path); nav(cwd); } } },
      ].filter(Boolean);
      items.forEach(i=>{
        if(i.sep){ const s=document.createElement('div'); s.style.cssText='height:1px;background:var(--border);margin:4px 0;'; ctxEl.appendChild(s); return; }
        const b=document.createElement('button');
        b.style.cssText=`display:block;width:100%;text-align:left;padding:9px 16px;font-size:14px;transition:background var(--fast);color:${i.danger?'var(--danger)':'var(--text)'};`;
        b.textContent=i.l;
        b.onmouseover=()=>b.style.background='var(--surface3)';
        b.onmouseleave=()=>b.style.background='';
        b.onclick=()=>{ i.fn(); removeCtx(); };
        ctxEl.appendChild(b);
      });
      document.body.appendChild(ctxEl);
    };
    const removeCtx=()=>{ ctxEl?.remove(); ctxEl=null; };
    document.addEventListener('click', removeCtx);
  }
}));
