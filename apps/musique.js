/* NexOS — Lecteur Musique */
App.reg('musique', () => WM.open({
  appId:'musique', title:'Musique', icon:'🎵', w:420, h:520,
  render(el) {
    let tracks=[], idx=0, audio=new Audio();
    audio.volume=0.8;

    el.style.cssText='display:flex;flex-direction:column;height:100%;';
    el.innerHTML=`
      <div class="toolbar">
        <button class="btn btn-mint" id="mu-open">📂 Ouvrir des fichiers</button>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:16px;">
        <div id="mu-art" style="width:160px;height:160px;border-radius:var(--r2);background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:5rem;flex-shrink:0;box-shadow:0 8px 32px #00000060;">🎵</div>
        <div style="text-align:center;width:100%;">
          <div id="mu-title" style="font-size:18px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Aucun titre</div>
          <div id="mu-sub"   style="font-size:14px;color:var(--muted);margin-top:4px;">Ouvrez des fichiers pour commencer</div>
        </div>
        <!-- Barre de progression -->
        <div style="width:100%;">
          <input type="range" id="mu-seek" min="0" max="100" value="0" step="0.1"
            style="-webkit-appearance:none;width:100%;height:4px;border-radius:99px;background:var(--surface3);outline:none;cursor:pointer;" aria-label="Position dans le morceau"/>
          <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:12px;font-family:var(--mono);color:var(--muted);">
            <span id="mu-cur">0:00</span><span id="mu-dur">0:00</span>
          </div>
        </div>
        <!-- Contrôles -->
        <div style="display:flex;align-items:center;gap:12px;">
          <button id="mu-prev" class="btn btn-ghost" style="font-size:22px;padding:6px;">⏮</button>
          <button id="mu-play" style="width:60px;height:60px;border-radius:50%;background:var(--mint);color:var(--bg);font-size:24px;display:flex;align-items:center;justify-content:center;transition:filter var(--fast);" aria-label="Lecture/Pause">▶</button>
          <button id="mu-next" class="btn btn-ghost" style="font-size:22px;padding:6px;">⏭</button>
        </div>
        <!-- Volume -->
        <div style="display:flex;align-items:center;gap:10px;width:100%;">
          <span style="font-size:16px;">🔈</span>
          <input type="range" id="mu-vol" min="0" max="1" step="0.05" value="0.8"
            style="-webkit-appearance:none;flex:1;height:4px;border-radius:99px;background:var(--surface3);outline:none;cursor:pointer;" aria-label="Volume"/>
          <span style="font-size:16px;">🔊</span>
        </div>
      </div>
      <!-- Liste -->
      <div id="mu-list" style="max-height:130px;overflow-y:auto;border-top:1px solid var(--border);"></div>`;

    const fmt=s=>{ const m=Math.floor(s/60); return `${m}:${String(Math.floor(s%60)).padStart(2,'0')}`; };

    const playIdx=i=>{
      if(!tracks.length) return;
      idx=((i%tracks.length)+tracks.length)%tracks.length;
      const t=tracks[idx];
      audio.src=t.src; audio.play();
      el.querySelector('#mu-title').textContent=t.name;
      el.querySelector('#mu-sub').textContent='🎵 NexOS Musique';
      el.querySelector('#mu-play').textContent='⏸';
      el.querySelector('#mu-art').textContent=['🎵','🎸','🎹','🥁','🎺','🎻','🪗'][idx%7];
      el.querySelectorAll('.mu-track').forEach((r,ri)=>{ r.style.background=ri===idx?'var(--mint-dim)':''; r.style.color=ri===idx?'var(--mint)':''; });
    };

    audio.ontimeupdate=()=>{
      if(!audio.duration) return;
      const p=audio.currentTime/audio.duration*100;
      el.querySelector('#mu-seek').value=p;
      el.querySelector('#mu-cur').textContent=fmt(audio.currentTime);
      el.querySelector('#mu-dur').textContent=fmt(audio.duration);
    };
    audio.onended=()=>playIdx(idx+1);

    el.querySelector('#mu-play').onclick=()=>{ if(audio.paused) audio.play(); else audio.pause(); el.querySelector('#mu-play').textContent=audio.paused?'▶':'⏸'; };
    el.querySelector('#mu-prev').onclick=()=>playIdx(idx-1);
    el.querySelector('#mu-next').onclick=()=>playIdx(idx+1);
    el.querySelector('#mu-seek').oninput=e=>{ audio.currentTime=e.target.value/100*audio.duration; };
    el.querySelector('#mu-vol').oninput=e=>{ audio.volume=e.target.value; };

    el.querySelector('#mu-open').onclick=async()=>{
      const paths=await API.fs.pickfile([{name:'Audio',extensions:['mp3','wav','ogg','flac','aac','m4a']}]);
      if(!paths) return;
      const arr=Array.isArray(paths)?paths:[paths];
      tracks=arr.map(p=>({ src:'file://'+p.replace(/\\/g,'/'), name:p.split(/[/\\]/).pop().replace(/\.[^.]+$/,'') }));
      const list=el.querySelector('#mu-list'); list.innerHTML='';
      tracks.forEach((t,i)=>{
        const row=document.createElement('button');
        row.className='mu-track';
        row.style.cssText='display:flex;align-items:center;gap:10px;width:100%;padding:8px 14px;font-size:14px;transition:background var(--fast);text-align:left;';
        row.innerHTML=`<span style="color:var(--muted);font-family:var(--mono);font-size:12px;width:20px;">${i+1}</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t.name}</span>`;
        row.onmouseover=()=>{ if(i!==idx) row.style.background='var(--surface2)'; };
        row.onmouseleave=()=>{ if(i!==idx) row.style.background=''; };
        row.onclick=()=>playIdx(i);
        list.appendChild(row);
      });
      playIdx(0);
    };
  }
}));
