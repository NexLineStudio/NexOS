/* NexOS — Calendrier */
App.reg('calendrier', () => WM.open({
  appId:'calendrier', title:'Calendrier', icon:'📅', w:560, h:520,
  render(el) {
    const JOURS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
    const MOIS=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    let now=new Date(), cur=new Date(now.getFullYear(),now.getMonth(),1);
    let events=JSON.parse(localStorage.getItem?.('nexos-cal')||'{}'); // Note: localStorage peut ne pas marcher, on utilise une variable
    let eventsStore={};

    el.style.cssText='display:flex;flex-direction:column;height:100%;';
    el.innerHTML=`
      <div class="toolbar" style="justify-content:space-between;">
        <button class="btn btn-ghost" id="cal-prev">◀</button>
        <span id="cal-title" style="font-size:18px;font-weight:800;"></span>
        <button class="btn btn-ghost" id="cal-next">▶</button>
        <button class="btn btn-ghost" id="cal-today" style="font-size:13px;">Aujourd'hui</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);padding:0 12px;flex-shrink:0;">
        ${JOURS.map(j=>`<div style="text-align:center;padding:8px 0;font-size:13px;font-weight:700;color:var(--muted);">${j}</div>`).join('')}
      </div>
      <div id="cal-grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;padding:0 12px 12px;flex:1;overflow-y:auto;"></div>
      <!-- Panneau événements -->
      <div id="cal-panel" style="border-top:1px solid var(--border);padding:12px;flex-shrink:0;min-height:70px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:6px;" id="cal-sel-date"></div>
        <div id="cal-events-list" style="font-size:14px;color:var(--muted);">Cliquez sur un jour pour voir / ajouter des événements.</div>
      </div>`;

    let selDate=null;

    const render=()=>{
      const grid=el.querySelector('#cal-grid');
      const y=cur.getFullYear(), m=cur.getMonth();
      el.querySelector('#cal-title').textContent=MOIS[m]+' '+y;
      grid.innerHTML='';
      // Premier jour de la semaine (lundi=0)
      let start=(new Date(y,m,1).getDay()+6)%7;
      const daysInMonth=new Date(y,m+1,0).getDate();
      // Cases vides avant
      for(let i=0;i<start;i++){ const d=document.createElement('div'); grid.appendChild(d); }
      // Jours
      for(let d=1;d<=daysInMonth;d++){
        const key=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const isToday=now.getDate()===d&&now.getMonth()===m&&now.getFullYear()===y;
        const isSel=selDate===key;
        const hasEv=(eventsStore[key]||[]).length>0;
        const cell=document.createElement('button');
        cell.style.cssText=`
          aspect-ratio:1;border-radius:var(--r);font-size:15px;font-weight:700;
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
          position:relative;transition:background var(--fast);
          background:${isSel?'var(--mint)':isToday?'var(--mint-dim)':'transparent'};
          color:${isSel?'var(--bg)':isToday?'var(--mint)':'var(--text)'};`;
        cell.textContent=d;
        if(hasEv){ const dot=document.createElement('div'); dot.style.cssText='width:5px;height:5px;border-radius:50%;background:'+(isSel?'var(--bg)':'var(--mint)')+';'; cell.appendChild(dot); }
        cell.onmouseover=()=>{ if(!isSel) cell.style.background='var(--surface2)'; };
        cell.onmouseleave=()=>{ if(!isSel) cell.style.background=isToday?'var(--mint-dim)':'transparent'; };
        cell.onclick=()=>{ selDate=key; showDay(key,d,m,y); render(); };
        grid.appendChild(cell);
      }
    };

    const showDay=(key,d,m,y)=>{
      el.querySelector('#cal-sel-date').textContent=`📅 ${d} ${MOIS[m]} ${y}`;
      const evs=eventsStore[key]||[];
      const list=el.querySelector('#cal-events-list');
      list.innerHTML=(evs.length?evs.map((e,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid var(--border);"><span style="flex:1;">• ${e}</span><button onclick="delEv('${key}',${i})" style="color:var(--danger);font-size:12px;cursor:pointer;">✕</button></div>`).join(''):'<span style="color:var(--dim);">Aucun événement.</span>')
        +`<button onclick="addEv('${key}')" class="btn btn-ghost" style="margin-top:8px;font-size:13px;">+ Ajouter</button>`;
    };

    window.addEv=key=>{ const n=prompt('Nouvel événement :'); if(n){ (eventsStore[key]??=[]).push(n); render(); showDay(key,...key.split('-').map(Number).map((v,i)=>i===1?v-1:v)); } };
    window.delEv=(key,i)=>{ eventsStore[key].splice(i,1); render(); showDay(key,...key.split('-').map(Number).map((v,i)=>i===1?v-1:v)); };

    el.querySelector('#cal-prev').onclick=()=>{ cur=new Date(cur.getFullYear(),cur.getMonth()-1,1); render(); };
    el.querySelector('#cal-next').onclick=()=>{ cur=new Date(cur.getFullYear(),cur.getMonth()+1,1); render(); };
    el.querySelector('#cal-today').onclick=()=>{ cur=new Date(now.getFullYear(),now.getMonth(),1); render(); };

    render();
  }
}));
