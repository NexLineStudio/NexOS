/* NexOS — Paramètres */
App.reg('parametres', () => WM.open({
  appId:'parametres', title:'Paramètres', icon:'⚙', w:560, h:440,
  render(el) {
    const ACCENTS=[{n:'Menthe 🌿',v:'#3ecf8e'},{n:'Bleu 💧',v:'#38bdf8'},{n:'Violet 💜',v:'#a78bfa'},{n:'Orange 🍊',v:'#fb923c'},{n:'Rose 🌸',v:'#f472b6'},{n:'Rouge ❤',v:'#ef4444'}];
    el.style.cssText='display:flex;height:100%;';
    el.innerHTML=`
      <nav style="width:170px;flex-shrink:0;background:var(--surface2);border-right:1px solid var(--border);padding:10px 8px;display:flex;flex-direction:column;gap:2px;">
        ${[['app','🎨 Apparence'],['acc','♿ Accessibilité'],['sys','🖥 Système']].map(([id,l])=>`<button class="p-tab btn btn-ghost" data-tab="${id}" style="text-align:left;font-size:14px;padding:10px 12px;">${l}</button>`).join('')}
      </nav>
      <div style="flex:1;overflow-y:auto;padding:22px;">

        <div class="p-sec" id="p-app">
          <div style="font-size:18px;font-weight:800;margin-bottom:18px;">Apparence</div>
          <div style="margin-bottom:16px;">
            <div style="font-size:15px;font-weight:700;margin-bottom:10px;">Couleur principale</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;" id="p-colors"></div>
          </div>
          <div style="margin-bottom:16px;">
            <div style="font-size:15px;font-weight:700;margin-bottom:8px;">Taille du texte</div>
            <div style="display:flex;align-items:center;gap:12px;">
              <input type="range" id="p-font" min="13" max="20" value="16" style="-webkit-appearance:none;width:140px;height:5px;border-radius:99px;background:var(--surface3);outline:none;cursor:pointer;"/>
              <span id="p-font-lbl" style="font-family:var(--mono);font-size:14px;color:var(--muted);">16px</span>
            </div>
          </div>
        </div>

        <div class="p-sec" id="p-acc" hidden>
          <div style="font-size:18px;font-weight:800;margin-bottom:18px;">Accessibilité</div>
          ${[['p-rm','Réduire les animations','Désactive les transitions'],['p-hc','Contraste élevé','Renforce les bordures et textes']].map(([id,l,d])=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--border);">
            <div><div style="font-size:15px;font-weight:600;">${l}</div><div style="font-size:13px;color:var(--muted);margin-top:2px;">${d}</div></div>
            <label style="position:relative;width:44px;height:24px;flex-shrink:0;">
              <input type="checkbox" id="${id}" style="opacity:0;position:absolute;" aria-label="${l}"/>
              <span style="position:absolute;inset:0;background:var(--surface3);border-radius:99px;cursor:pointer;transition:background var(--fast);" id="${id}-track"></span>
              <span style="position:absolute;top:3px;left:3px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform var(--fast);pointer-events:none;" id="${id}-thumb"></span>
            </label>
          </div>`).join('')}
        </div>

        <div class="p-sec" id="p-sys" hidden>
          <div style="font-size:18px;font-weight:800;margin-bottom:18px;">Informations système</div>
          <div id="p-sysinfo" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"></div>
        </div>

      </div>`;

    // Tabs
    const tabs=el.querySelectorAll('.p-tab'), secs=el.querySelectorAll('.p-sec');
    tabs.forEach((t,i)=>{ if(i===0) t.style.cssText+=';background:var(--mint-dim);color:var(--mint);'; });
    tabs.forEach(t=>t.onclick=()=>{
      tabs.forEach(x=>{ x.style.background=''; x.style.color=''; });
      secs.forEach(s=>s.hidden=true);
      t.style.background='var(--mint-dim)'; t.style.color='var(--mint)';
      const sec=el.querySelector(`#p-${t.dataset.tab}`); sec.hidden=false;
      if(t.dataset.tab==='sys') loadSys();
    });

    // Couleurs
    const cGrid=el.querySelector('#p-colors');
    ACCENTS.forEach(a=>{
      const b=document.createElement('button');
      b.style.cssText=`display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:var(--r);font-size:14px;font-weight:600;border:2px solid ${a.v===getComputedStyle(document.documentElement).getPropertyValue('--mint').trim()?a.v:'transparent'};transition:border-color var(--fast),background var(--fast);`;
      b.innerHTML=`<span style="width:16px;height:16px;border-radius:50%;background:${a.v};flex-shrink:0;"></span>${a.n}`;
      b.onmouseover=()=>b.style.background='var(--surface2)';
      b.onmouseleave=()=>b.style.background='';
      b.onclick=()=>{
        document.documentElement.style.setProperty('--mint',a.v);
        document.documentElement.style.setProperty('--mint-dim',a.v+'22');
        document.documentElement.style.setProperty('--mint-ring',a.v+'55');
        cGrid.querySelectorAll('button').forEach(x=>x.style.borderColor='transparent');
        b.style.borderColor=a.v;
      };
      cGrid.appendChild(b);
    });

    // Font size
    const fontEl=el.querySelector('#p-font'), fontLbl=el.querySelector('#p-font-lbl');
    fontEl.oninput=()=>{ document.documentElement.style.fontSize=fontEl.value+'px'; fontLbl.textContent=fontEl.value+'px'; };

    // Toggles
    [['p-rm',v=>['--fast','--mid'].forEach(p=>document.documentElement.style.setProperty(p,v?'0ms':p==='--fast'?'140ms':'260ms'))],
     ['p-hc',v=>document.documentElement.style.setProperty('--border2',v?'#ffffff30':'#ffffff18')]
    ].forEach(([id,fn])=>{
      const inp=el.querySelector(`#${id}`), track=el.querySelector(`#${id}-track`), thumb=el.querySelector(`#${id}-thumb`);
      inp.onchange=()=>{ track.style.background=inp.checked?'var(--mint)':'var(--surface3)'; thumb.style.transform=inp.checked?'translateX(20px)':''; fn(inp.checked); };
    });

    const loadSys=async()=>{
      const i=await API.sys.info();
      el.querySelector('#p-sysinfo').innerHTML=[
        ['Version','NexOS v0.2'],['Studio','NexLine'],
        ['Hôte',i.hostname],['Utilisateur',i.username],
        ['Plateforme',i.platform+' / '+i.arch],['RAM libre',(i.freeMem/1048576|0)+' Mo'],
        ['CPU',i.cpus+' cœurs'],['Node.js',i.nodeVer],
        ['Electron',i.electronVer],['Uptime NexOS',K.uptime()],
      ].map(([l,v])=>`<div style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:12px;"><div style="font-size:12px;color:var(--muted);margin-bottom:4px;">${l}</div><div style="font-size:14px;font-weight:700;font-family:var(--mono);">${v}</div></div>`).join('');
    };
  }
}));
