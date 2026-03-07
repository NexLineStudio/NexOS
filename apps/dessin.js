/* NexOS — Dessin / Paint */
App.reg('dessin', () => WM.open({
  appId:'dessin', title:'Dessin', icon:'🎨', w:800, h:580,
  render(el) {
    el.style.cssText='display:flex;flex-direction:column;height:100%;';
    const COLORS=['#3ecf8e','#38bdf8','#a78bfa','#fb923c','#f472b6','#e8edf5','#ffffff','#000000','#ff5c5c','#ffb830','#10b981','#0ea5e9','#6366f1','#ec4899','#64748b','#1e293b'];

    el.innerHTML=`
      <div class="toolbar" style="flex-wrap:wrap;gap:6px;">
        <!-- Outils -->
        <div style="display:flex;gap:4px;">
          ${[['✏','crayon'],['🖌','pinceau'],['⬜','rect'],['⭕','cercle'],['╱','ligne'],['🧹','gomme'],['🪣','fill']].map(([i,t])=>`<button class="btn btn-ghost tool-btn" data-tool="${t}" style="padding:6px 8px;font-size:16px;" title="${t}">${i}</button>`).join('')}
        </div>
        <div style="width:1px;background:var(--border);height:30px;"></div>
        <!-- Taille -->
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:13px;color:var(--muted);">Taille</span>
          <input type="range" id="d-size" min="1" max="40" value="4" style="-webkit-appearance:none;width:80px;height:4px;border-radius:99px;background:var(--surface3);outline:none;cursor:pointer;" aria-label="Taille du pinceau"/>
          <span id="d-size-lbl" style="font-size:13px;font-family:var(--mono);color:var(--muted);width:24px;">4</span>
        </div>
        <div style="width:1px;background:var(--border);height:30px;"></div>
        <!-- Couleurs -->
        <div style="display:flex;gap:3px;flex-wrap:wrap;max-width:200px;">
          ${COLORS.map(c=>`<button class="color-btn" data-color="${c}" style="width:20px;height:20px;border-radius:4px;background:${c};border:2px solid transparent;transition:border-color var(--fast);" title="${c}"></button>`).join('')}
        </div>
        <input type="color" id="d-custom" value="#3ecf8e" style="width:28px;height:28px;border-radius:4px;border:none;cursor:pointer;background:transparent;" title="Couleur personnalisée" aria-label="Couleur personnalisée"/>
        <div style="margin-left:auto;display:flex;gap:4px;">
          <button class="btn btn-ghost" id="d-undo" style="font-size:13px;">↩ Annuler</button>
          <button class="btn btn-ghost" id="d-clear" style="font-size:13px;color:var(--danger);">🗑 Tout effacer</button>
          <button class="btn btn-mint"  id="d-save" style="font-size:13px;">💾 Sauvegarder</button>
        </div>
      </div>
      <div style="flex:1;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#1a1a2e;cursor:crosshair;" id="d-wrap">
        <canvas id="d-canvas" style="background:#ffffff;display:block;cursor:crosshair;" aria-label="Zone de dessin"></canvas>
      </div>
      <div class="statusbar" id="d-status">Outil : Crayon · Couleur : #3ecf8e · Taille : 4px</div>`;

    const wrap   = el.querySelector('#d-wrap');
    const canvas = el.querySelector('#d-canvas');
    const ctx    = canvas.getContext('2d');
    let tool='crayon', color='#3ecf8e', size=4;
    let drawing=false, startX=0, startY=0, history=[];
    let snapshot=null;

    // Resize canvas to fill wrap
    const resize=()=>{
      const saved=ctx.getImageData(0,0,canvas.width,canvas.height);
      canvas.width=wrap.clientWidth-2; canvas.height=wrap.clientHeight-2;
      ctx.putImageData(saved,0,0);
    };
    new ResizeObserver(resize).observe(wrap);
    setTimeout(()=>{ canvas.width=wrap.clientWidth-2; canvas.height=wrap.clientHeight-2; },100);

    const saveHistory=()=>{ history.push(ctx.getImageData(0,0,canvas.width,canvas.height)); if(history.length>30) history.shift(); };

    const getPos=e=>{ const r=canvas.getBoundingClientRect(); return {x:(e.clientX??e.touches?.[0]?.clientX)-r.left, y:(e.clientY??e.touches?.[0]?.clientY)-r.top}; };

    const fill=(x,y,fillColor)=>{
      const img=ctx.getImageData(0,0,canvas.width,canvas.height);
      const d=img.data, w=canvas.width;
      const idx=(Math.round(y)*w+Math.round(x))*4;
      const tr=[d[idx],d[idx+1],d[idx+2],d[idx+3]];
      const fc=parseInt(fillColor.slice(1),16);
      const fr=(fc>>16)&255,fg=(fc>>8)&255,fb=fc&255;
      if(tr[0]===fr&&tr[1]===fg&&tr[2]===fb) return;
      const stack=[[Math.round(x),Math.round(y)]];
      while(stack.length){
        const [cx,cy]=stack.pop();
        const i=(cy*w+cx)*4;
        if(cx<0||cx>=w||cy<0||cy>=canvas.height) continue;
        if(d[i]!==tr[0]||d[i+1]!==tr[1]||d[i+2]!==tr[2]) continue;
        d[i]=fr;d[i+1]=fg;d[i+2]=fb;d[i+3]=255;
        stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
      }
      ctx.putImageData(img,0,0);
    };

    canvas.addEventListener('pointerdown',e=>{
      saveHistory(); drawing=true;
      const {x,y}=getPos(e); startX=x; startY=y;
      if(tool==='fill'){ fill(x,y,color); drawing=false; return; }
      snapshot=ctx.getImageData(0,0,canvas.width,canvas.height);
      ctx.beginPath(); ctx.moveTo(x,y);
      if(tool==='gomme'){ ctx.strokeStyle='#ffffff'; ctx.lineWidth=size*3; }
      else { ctx.strokeStyle=color; ctx.lineWidth=size; }
      ctx.lineCap='round'; ctx.lineJoin='round';
    });

    canvas.addEventListener('pointermove',e=>{
      if(!drawing) return;
      const {x,y}=getPos(e);
      if(tool==='crayon'||tool==='pinceau'||tool==='gomme'){
        ctx.lineTo(x,y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y);
      } else {
        ctx.putImageData(snapshot,0,0);
        ctx.beginPath(); ctx.strokeStyle=color; ctx.lineWidth=size;
        if(tool==='rect'){ ctx.strokeRect(startX,startY,x-startX,y-startY); }
        else if(tool==='cercle'){ const rx=(x-startX)/2,ry=(y-startY)/2; ctx.ellipse(startX+rx,startY+ry,Math.abs(rx),Math.abs(ry),0,0,2*Math.PI); ctx.stroke(); }
        else if(tool==='ligne'){ ctx.moveTo(startX,startY); ctx.lineTo(x,y); ctx.stroke(); }
      }
    });

    canvas.addEventListener('pointerup',()=>drawing=false);
    canvas.addEventListener('pointerleave',()=>drawing=false);

    // Palette
    el.querySelectorAll('.color-btn').forEach(b=>b.onclick=()=>{
      color=b.dataset.color;
      el.querySelectorAll('.color-btn').forEach(x=>x.style.borderColor='transparent');
      b.style.borderColor='var(--text)';
      updateStatus();
    });
    el.querySelector('#d-custom').oninput=e=>{ color=e.target.value; updateStatus(); };

    // Outils
    el.querySelectorAll('.tool-btn').forEach(b=>b.onclick=()=>{
      tool=b.dataset.tool;
      el.querySelectorAll('.tool-btn').forEach(x=>x.style.background='transparent');
      b.style.background='var(--mint-dim)'; updateStatus();
    });
    el.querySelector('[data-tool="crayon"]').style.background='var(--mint-dim)';

    // Taille
    const sizeEl=el.querySelector('#d-size');
    sizeEl.oninput=()=>{ size=+sizeEl.value; el.querySelector('#d-size-lbl').textContent=size; updateStatus(); };

    const updateStatus=()=>{ el.querySelector('#d-status').textContent=`Outil : ${tool} · Couleur : ${color} · Taille : ${size}px`; };

    el.querySelector('#d-undo').onclick=()=>{ if(history.length){ ctx.putImageData(history.pop(),0,0); } };
    el.querySelector('#d-clear').onclick=()=>{ if(confirm('Tout effacer ?')){ saveHistory(); ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height); } };
    el.querySelector('#d-save').onclick=()=>{
      const a=document.createElement('a'); a.download='dessin-nexos.png'; a.href=canvas.toDataURL('image/png'); a.click();
    };
  }
}));
