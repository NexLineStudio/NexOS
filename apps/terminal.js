/* NexOS — Terminal */
App.reg('terminal', () => WM.open({
  appId:'terminal', title:'Terminal', icon:'⌨', w:680, h:440,
  render(el) {
    let hist=[], hi=-1;
    el.style.cssText='display:flex;flex-direction:column;height:100%;background:#080d12;font-family:var(--mono);';
    el.innerHTML=`
      <div id="t-out" style="flex:1;overflow-y:auto;padding:12px 16px;font-size:14px;line-height:1.7;"></div>
      <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-top:1px solid var(--border);background:#0b1017;flex-shrink:0;">
        <span style="color:var(--mint);font-size:14px;white-space:nowrap;">nexos $</span>
        <input id="t-in" type="text" style="flex:1;background:transparent;border:none;outline:none;color:var(--text);font-family:var(--mono);font-size:14px;caret-color:var(--mint);" placeholder="tapez help…" autocomplete="off" spellcheck="false" aria-label="Commande"/>
      </div>`;

    const out=el.querySelector('#t-out'), inp=el.querySelector('#t-in');
    const p=(txt,c='var(--text)')=>{ const d=document.createElement('div'); d.style.cssText=`color:${c};white-space:pre-wrap;word-break:break-all;`; d.textContent=txt; out.appendChild(d); out.scrollTop=1e9; };
    const CMDS={
      help:()=>p('Commandes : '+Object.keys(CMDS).sort().join(', '),'var(--muted)'),
      clear:()=>out.innerHTML='',
      echo:(_,a)=>p(a.join(' ')),
      version:()=>p('NexOS v0.2 — NexLine Studio','var(--mint)'),
      date:()=>p(new Date().toLocaleString('fr-FR')),
      uptime:()=>p('Uptime NexOS : '+K.uptime()),
      ps:()=>K.list().forEach(pr=>p(`  PID ${String(pr.pid).padEnd(3)}  ${pr.title}`)),
      sysinfo:async()=>{
        const i=await API.sys.info();
        [`Hôte     : ${i.hostname}`,`Utilisateur: ${i.username}`,`OS       : ${i.platform}/${i.arch}`,`RAM libre: ${(i.freeMem/1048576|0)} Mo / ${(i.totalMem/1048576|0)} Mo`,`CPU      : ${i.cpus} cœurs`,`Node     : ${i.nodeVer}`].forEach(l=>p(l));
      },
    };
    p('NexOS Terminal — tapez "help" pour les commandes','var(--muted)');
    inp.addEventListener('keydown',e=>{
      if(e.key==='Enter'){
        const v=inp.value.trim(); inp.value=''; if(!v) return;
        hist.unshift(v); hi=-1;
        p('nexos $ '+v,'var(--mint)');
        const [cmd,...args]=v.split(/\s+/);
        if(CMDS[cmd]) CMDS[cmd](null,args); else p(`"${cmd}" : commande inconnue. Tapez "help".`,'var(--danger)');
      } else if(e.key==='ArrowUp'){ e.preventDefault(); if(hi<hist.length-1){ hi++; inp.value=hist[hi]; } }
        else if(e.key==='ArrowDown'){ e.preventDefault(); if(hi>0){hi--;inp.value=hist[hi];}else{hi=-1;inp.value='';} }
    });
    inp.focus();
  }
}));
