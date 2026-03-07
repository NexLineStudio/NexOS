/* NexOS — Galerie d'images */
App.reg('galerie', () => WM.open({
  appId:'galerie', title:'Galerie', icon:'🖼', w:820, h:580,
  render(el) {
    let images=[], idx=0;
    el.style.cssText='display:flex;flex-direction:column;height:100%;background:#080d12;';
    el.innerHTML=`
      <div class="toolbar">
        <button class="btn btn-mint" id="g-open">📂 Ouvrir des images</button>
        <span id="g-count" style="margin-left:auto;font-size:14px;color:var(--muted);"></span>
        <button class="btn btn-ghost" id="g-prev" disabled>◀</button>
        <button class="btn btn-ghost" id="g-next" disabled>▶</button>
      </div>
      <div style="flex:1;display:flex;overflow:hidden;">
        <!-- Vignettes -->
        <div id="g-thumbs" style="width:120px;flex-shrink:0;overflow-y:auto;background:var(--surface2);border-right:1px solid var(--border);padding:8px;display:flex;flex-direction:column;gap:6px;"></div>
        <!-- Préview principale -->
        <div id="g-main" style="flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;">
          <div style="text-align:center;color:var(--muted);">
            <div style="font-size:4rem;">🖼</div>
            <div style="font-size:16px;margin-top:12px;">Ouvrez des images pour les voir ici</div>
          </div>
        </div>
      </div>
      <div class="statusbar" id="g-status"></div>`;

    const thumbsEl = el.querySelector('#g-thumbs');
    const mainEl   = el.querySelector('#g-main');
    const countEl  = el.querySelector('#g-count');
    const statusEl = el.querySelector('#g-status');
    const prev     = el.querySelector('#g-prev');
    const next     = el.querySelector('#g-next');

    const show = i => {
      if(!images.length) return;
      idx = ((i%images.length)+images.length)%images.length;
      const img = images[idx];
      mainEl.innerHTML=`<img src="${img.src}" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:var(--r);box-shadow:0 8px 40px #00000080;" alt="${img.name}" draggable="false"/>`;
      thumbsEl.querySelectorAll('.thumb').forEach((t,ti)=>{ t.style.outline=ti===idx?'2px solid var(--mint)':'2px solid transparent'; });
      countEl.textContent=`${idx+1} / ${images.length}`;
      statusEl.textContent=img.name;
      prev.disabled=images.length<=1; next.disabled=images.length<=1;
    };

    const load = paths => {
      images=[]; thumbsEl.innerHTML='';
      paths.forEach(path=>{
        const src='file://'+path.replace(/\\/g,'/');
        const name=path.split(/[/\\]/).pop();
        images.push({src,name,path});
        const thumb=document.createElement('button');
        thumb.className='thumb';
        thumb.style.cssText='border-radius:var(--r);overflow:hidden;outline:2px solid transparent;transition:outline-color var(--fast);flex-shrink:0;width:100%;aspect-ratio:1;';
        thumb.innerHTML=`<img src="${src}" style="width:100%;height:100%;object-fit:cover;" alt="${name}" draggable="false"/>`;
        thumb.onclick=()=>show(images.findIndex(im=>im.path===path));
        thumbsEl.appendChild(thumb);
      });
      show(0);
    };

    el.querySelector('#g-open').onclick=async()=>{ const p=await API.fs.pickimages(); if(p?.length) load(p); };
    prev.onclick=()=>show(idx-1);
    next.onclick=()=>show(idx+1);

    // Touches clavier
    el.addEventListener('keydown',e=>{ if(e.key==='ArrowLeft') show(idx-1); if(e.key==='ArrowRight') show(idx+1); });
    el.setAttribute('tabindex','0');
  }
}));
