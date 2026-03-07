/* NexOS — Horloge & Réveil */
App.reg('horloge', () => WM.open({
  appId:'horloge', title:'Horloge', icon:'⏰', w:400, h:460,
  render(el) {
    el.style.cssText='display:flex;flex-direction:column;height:100%;background:var(--surface);';

    // Onglets
    el.innerHTML=`
      <div style="display:flex;border-bottom:1px solid var(--border);flex-shrink:0;">
        <button class="h-tab" data-tab="horloge" style="flex:1;padding:12px;font-size:15px;font-weight:700;border-bottom:2px solid var(--mint);color:var(--mint);">⏰ Horloge</button>
        <button class="h-tab" data-tab="chrono"  style="flex:1;padding:12px;font-size:15px;font-weight:700;color:var(--muted);">⏱ Chrono</button>
        <button class="h-tab" data-tab="reveil"  style="flex:1;padding:12px;font-size:15px;font-weight:700;color:var(--muted);">🔔 Réveil</button>
      </div>
      <div id="h-panels" style="flex:1;overflow:hidden;"></div>`;

    const panels = el.querySelector('#h-panels');
    const tabs   = el.querySelectorAll('.h-tab');

    const PANELS = {
      horloge: () => {
        const d=document.createElement('div');
        d.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:12px;';
        d.innerHTML=`
          <div id="h-time" style="font-size:64px;font-weight:800;font-family:var(--mono);color:var(--mint);letter-spacing:-.02em;"></div>
          <div id="h-date" style="font-size:17px;color:var(--muted);"></div>
          <canvas id="h-canvas" width="200" height="200" style="margin-top:12px;" aria-label="Horloge analogique"></canvas>`;
        const tick=()=>{
          const now=new Date();
          d.querySelector('#h-time').textContent=now.toLocaleTimeString('fr-FR');
          d.querySelector('#h-date').textContent=now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
          const cv=d.querySelector('#h-canvas'); if(!cv||!cv.getContext) return;
          const ctx=cv.getContext('2d'), cx=100,cy=100,r=90;
          ctx.clearRect(0,0,200,200);
          // Cadran
          ctx.beginPath(); ctx.arc(cx,cy,r,0,2*Math.PI); ctx.strokeStyle='#3ecf8e33'; ctx.lineWidth=2; ctx.stroke();
          // Chiffres
          for(let i=1;i<=12;i++){
            const a=(i/6)*Math.PI-Math.PI/2;
            ctx.fillStyle='#6b8399';ctx.font='12px Nunito,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
            ctx.fillText(String(i),cx+76*Math.cos(a),cy+76*Math.sin(a));
          }
          // Aiguilles
          const H=now.getHours()%12, M=now.getMinutes(), S=now.getSeconds();
          const hand=(angle,len,width,color)=>{
            ctx.beginPath(); ctx.moveTo(cx,cy);
            ctx.lineTo(cx+len*Math.cos(angle),cy+len*Math.sin(angle));
            ctx.strokeStyle=color; ctx.lineWidth=width; ctx.lineCap='round'; ctx.stroke();
          };
          hand((H/6+M/360)*Math.PI-Math.PI/2, 52, 5,'#e8edf5');
          hand((M/30)*Math.PI-Math.PI/2, 68, 3,'#e8edf5');
          hand((S/30)*Math.PI-Math.PI/2, 78, 1.5,'#3ecf8e');
          ctx.beginPath();ctx.arc(cx,cy,4,0,2*Math.PI);ctx.fillStyle='#3ecf8e';ctx.fill();
        };
        tick(); const iv=setInterval(tick,1000);
        d._cleanup=()=>clearInterval(iv);
        return d;
      },
      chrono: () => {
        const d=document.createElement('div');
        d.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:20px;';
        let ms=0,running=false,iv=null,laps=[];
        d.innerHTML=`
          <div id="ch-disp" style="font-size:58px;font-weight:800;font-family:var(--mono);color:var(--text);">00:00.00</div>
          <div style="display:flex;gap:12px;">
            <button id="ch-start" class="btn btn-mint" style="width:100px;">▶ Démarrer</button>
            <button id="ch-lap"   class="btn btn-ghost" disabled>🏁 Tour</button>
            <button id="ch-reset" class="btn btn-ghost">↺ Réinitialiser</button>
          </div>
          <div id="ch-laps" style="width:100%;max-height:120px;overflow-y:auto;padding:0 16px;"></div>`;
        const fmt=t=>{ const m=Math.floor(t/60000),s=Math.floor((t%60000)/1000),cs=Math.floor((t%1000)/10); return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`; };
        const startBtn=d.querySelector('#ch-start'), lapBtn=d.querySelector('#ch-lap'), dispEl=d.querySelector('#ch-disp');
        startBtn.onclick=()=>{
          if(running){ clearInterval(iv);running=false;startBtn.textContent='▶ Reprendre';startBtn.style.background='var(--surface3)'; }
          else { const t=Date.now()-ms;iv=setInterval(()=>{ ms=Date.now()-t;dispEl.textContent=fmt(ms); },50);running=true;startBtn.textContent='⏸ Pause';startBtn.style.background='var(--mint)';lapBtn.disabled=false; }
        };
        lapBtn.onclick=()=>{ laps.push(ms); const el=d.querySelector('#ch-laps'); el.innerHTML=laps.map((l,i)=>`<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);font-size:14px;"><span style="color:var(--muted);">Tour ${i+1}</span><span style="font-family:var(--mono);color:var(--mint);">${fmt(l)}</span></div>`).reverse().join(''); };
        d.querySelector('#ch-reset').onclick=()=>{ clearInterval(iv);running=false;ms=0;laps=[];dispEl.textContent='00:00.00';startBtn.textContent='▶ Démarrer';startBtn.style.background='var(--mint)';lapBtn.disabled=true;d.querySelector('#ch-laps').innerHTML=''; };
        d._cleanup=()=>clearInterval(iv);
        return d;
      },
      reveil: () => {
        const d=document.createElement('div');
        d.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;padding:24px;';
        d.innerHTML=`
          <div style="font-size:18px;font-weight:700;">Définir une alarme</div>
          <input type="time" id="rv-time" class="inp" style="font-size:28px;font-family:var(--mono);text-align:center;width:180px;" aria-label="Heure de l'alarme"/>
          <button id="rv-set" class="btn btn-mint" style="font-size:16px;padding:10px 28px;">🔔 Activer l'alarme</button>
          <div id="rv-status" style="font-size:15px;color:var(--muted);text-align:center;min-height:24px;"></div>`;
        let alarmIv=null;
        d.querySelector('#rv-set').onclick=()=>{
          const t=d.querySelector('#rv-time').value; if(!t) return;
          if(alarmIv) clearInterval(alarmIv);
          const [ah,am]=t.split(':').map(Number);
          d.querySelector('#rv-status').textContent=`⏰ Alarme activée pour ${t}`;
          alarmIv=setInterval(()=>{
            const n=new Date();
            if(n.getHours()===ah&&n.getMinutes()===am&&n.getSeconds()===0){
              clearInterval(alarmIv);
              new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=').play().catch(()=>{});
              d.querySelector('#rv-status').textContent='🔔 Alarme !';
              alert('⏰ ALARME ! Il est '+t);
            }
          },1000);
        };
        d._cleanup=()=>alarmIv&&clearInterval(alarmIv);
        return d;
      }
    };

    let current=null;
    const switchTab=name=>{
      tabs.forEach(t=>{ const on=t.dataset.tab===name; t.style.color=on?'var(--mint)':'var(--muted)'; t.style.borderBottom=on?'2px solid var(--mint)':'2px solid transparent'; });
      if(current?._cleanup) current._cleanup();
      panels.innerHTML=''; current=PANELS[name](); current.style.height='100%'; panels.appendChild(current);
    };
    tabs.forEach(t=>t.onclick=()=>switchTab(t.dataset.tab));
    switchTab('horloge');
  }
}));
