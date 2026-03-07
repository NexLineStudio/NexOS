/* NexOS — Navigateur */
App.reg('navigateur', () => WM.open({
  appId:'navigateur', title:'Navigateur', icon:'🌐', w:1020, h:680,
  render(el) {
    el.style.cssText = 'display:flex;flex-direction:column;height:100%;';
    el.innerHTML = `
      <div class="toolbar" style="gap:8px;">
        <button class="btn btn-ghost" id="br-back"  style="padding:6px 10px;" title="Précédent">◀</button>
        <button class="btn btn-ghost" id="br-fwd"   style="padding:6px 10px;" title="Suivant">▶</button>
        <button class="btn btn-ghost" id="br-reload" style="padding:6px 10px;" title="Actualiser">↺</button>
        <input class="inp" id="br-url" type="text" value="https://google.com"
          style="border-radius:99px;flex:1;" placeholder="Adresse du site…" aria-label="Adresse"/>
        <button class="btn btn-mint"  id="br-go" style="border-radius:99px;">Y aller</button>
      </div>
      <div style="display:flex;gap:6px;padding:6px 12px;background:var(--surface2);border-bottom:1px solid var(--border);flex-shrink:0;overflow-x:auto;">
        ${[
          ['🏠 Accueil','https://google.com'],
          ['📺 YouTube','https://youtube.com'],
          ['🐙 GitHub','https://github.com'],
          ['🌿 NexLine','https://nexlinestudio.github.io/presentation'],
          ['📖 Wikipedia','https://fr.wikipedia.org'],
        ].map(([l,u])=>`<button class="btn btn-ghost" style="font-size:13px;padding:4px 10px;white-space:nowrap;" data-url="${u}">${l}</button>`).join('')}
      </div>
      <div style="height:3px;background:transparent;flex-shrink:0;overflow:hidden;" id="br-prog">
        <div id="br-prog-bar" style="height:100%;width:0%;background:var(--mint);transition:width 200ms;"></div>
      </div>
      <webview id="br-view" src="https://google.com" partition="persist:nexos"
        style="flex:1;width:100%;border:none;" aria-label="Contenu web"></webview>`;

    const view  = el.querySelector('#br-view');
    const urlEl = el.querySelector('#br-url');
    const back  = el.querySelector('#br-back');
    const fwd   = el.querySelector('#br-fwd');
    const bar   = el.querySelector('#br-prog-bar');

    const go = url => {
      if(!url) return;
      if(!/^https?:\/\//i.test(url)) url = 'https://'+url;
      urlEl.value = url; view.src = url;
    };

    el.querySelector('#br-go').onclick    = () => go(urlEl.value);
    el.querySelector('#br-reload').onclick = () => view.reload();
    back.onclick = () => view.goBack();
    fwd.onclick  = () => view.goForward();
    urlEl.onkeydown = e => { if(e.key==='Enter') go(urlEl.value); };
    el.querySelectorAll('[data-url]').forEach(b => b.onclick = () => go(b.dataset.url));

    view.addEventListener('did-start-loading', () => { bar.style.width='40%'; });
    view.addEventListener('did-stop-loading',  () => {
      bar.style.width='100%'; setTimeout(()=>bar.style.width='0%',300);
      urlEl.value = view.getURL();
      back.disabled = !view.canGoBack();
      fwd.disabled  = !view.canGoForward();
    });
  }
}));
