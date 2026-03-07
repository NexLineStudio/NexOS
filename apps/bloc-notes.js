/* NexOS — Bloc-notes */
App.reg('bloc-notes', () => WM.open({
  appId:'bloc-notes', title:'Bloc-notes', icon:'📝', w:740, h:520,
  render(el) {
    let path=null;
    el.style.cssText='display:flex;flex-direction:column;height:100%;';
    el.innerHTML=`
      <div class="toolbar">
        <button class="btn btn-ghost" id="n-new">📄 Nouveau</button>
        <button class="btn btn-ghost" id="n-open">📂 Ouvrir</button>
        <button class="btn btn-mint"  id="n-save">💾 Sauvegarder</button>
        <span id="n-name" style="margin-left:auto;font-size:13px;color:var(--muted);font-family:var(--mono);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Sans titre</span>
      </div>
      <div style="display:flex;flex:1;overflow:hidden;">
        <div id="n-lines" style="padding:12px 8px;background:#0c1219;color:var(--dim);font-family:var(--mono);font-size:15px;line-height:1.7;text-align:right;min-width:44px;border-right:1px solid var(--border);overflow:hidden;user-select:none;flex-shrink:0;"></div>
        <textarea id="n-area" style="flex:1;background:var(--surface);color:var(--text);border:none;outline:none;resize:none;font-family:var(--mono);font-size:15px;line-height:1.7;padding:12px 16px;caret-color:var(--mint);tab-size:2;" placeholder="Commencez à écrire ici…" aria-label="Zone de texte" spellcheck="false"></textarea>
      </div>
      <div class="statusbar" id="n-status">0 ligne · 0 caractère</div>`;

    const area   = el.querySelector('#n-area');
    const lines  = el.querySelector('#n-lines');
    const nameEl = el.querySelector('#n-name');
    const status = el.querySelector('#n-status');

    const update=()=>{
      const ls=area.value.split('\n');
      lines.innerHTML=ls.map((_,i)=>`<div style="line-height:1.7;">${i+1}</div>`).join('');
      lines.scrollTop=area.scrollTop;
      status.textContent=`${ls.length} ligne${ls.length>1?'s':''} · ${area.value.length} caractère${area.value.length>1?'s':''}`;
    };

    area.addEventListener('input', update);
    area.addEventListener('scroll',()=>lines.scrollTop=area.scrollTop);
    area.addEventListener('keydown',e=>{ if(e.ctrlKey&&e.key==='s'){ e.preventDefault(); save(); } });

    const setFile=(p,content)=>{ path=p; area.value=content||''; nameEl.textContent=p?p.split(/[/\\]/).pop():'Sans titre'; update(); };
    const save=async()=>{
      if(!path){ const p=await API.fs.savedialog('sans-titre.txt'); if(!p) return; path=p; nameEl.textContent=p.split(/[/\\]/).pop(); }
      const r=await API.fs.writefile(path,area.value);
      if(r.error) alert('Erreur : '+r.error);
    };

    el.querySelector('#n-new').onclick  =()=>{ if(area.value&&!confirm('Abandonner ?')) return; setFile(null,''); };
    el.querySelector('#n-open').onclick =async()=>{ const p=await API.fs.pickfile([{name:'Fichiers texte',extensions:['txt','md','js','py','html','css','json','csv']}]); if(p){ const r=await API.fs.readfile(p); if(!r.error) setFile(p,r.content); } };
    el.querySelector('#n-save').onclick =()=>save();

    // Ouverture depuis l'explorateur
    K.on('editor:open', async p => { const r=await API.fs.readfile(p); if(!r.error) setFile(p,r.content); });

    update();
  }
}));
