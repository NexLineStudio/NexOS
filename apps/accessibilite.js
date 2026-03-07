/* NexOS — Accessibilité */
const Accessibility = (() => {

  const DEFAULTS = {
    fontSize:    'md',   // sm | md | lg | xl
    contrast:    'none', // none | high | daltonien
    simplified:  false,
    bigCursor:   false,
  };

  const HIDDEN_IN_SIMPLE = ['terminal', 'dessin', 'galerie'];

  let cfg = { ...DEFAULTS };
  let panelEl = null;
  let btnEl   = null;

  // ── Persistance ───────────────────────────────────────
  const save = () => localStorage.setItem('nexos-a11y', JSON.stringify(cfg));
  const load = () => {
    try { const s = localStorage.getItem('nexos-a11y'); if(s) cfg = { ...DEFAULTS, ...JSON.parse(s) }; }
    catch(_) {}
  };

  // ── Application des réglages sur <html> ───────────────
  const apply = () => {
    const h = document.documentElement;

    // Taille texte
    h.dataset.fontSize = cfg.fontSize;

    // Contraste
    h.dataset.contrast = cfg.contrast;

    // Curseur
    h.dataset.bigCursor = cfg.bigCursor ? '1' : '0';

    // Mode simplifié : masque certains items dans sm-grid et desktop-icons
    document.querySelectorAll('.sm-item, .desk-icon').forEach(el => {
      const id = el.dataset.appId || '';
      if(cfg.simplified && HIDDEN_IN_SIMPLE.includes(id)) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    });

    save();
    if(panelEl) _syncUI();
  };

  // ── Panel HTML ─────────────────────────────────────────
  const FONT_LABELS = { sm:'Petit', md:'Normal', lg:'Grand', xl:'Très grand' };

  const _buildPanel = () => {
    const p = document.createElement('div');
    p.id = 'a11y-panel';
    p.innerHTML = `
      <div class="a11y-header">
        <span class="a11y-title">♿ Accessibilité</span>
        <button class="a11y-close" id="a11y-close" title="Fermer">✕</button>
      </div>

      <div class="a11y-section">
        <div class="a11y-label">Taille du texte</div>
        <div class="a11y-row" id="a11y-font-btns">
          ${Object.entries(FONT_LABELS).map(([k,v]) =>
            `<button class="a11y-chip" data-font="${k}">${v}</button>`
          ).join('')}
        </div>
      </div>

      <div class="a11y-section">
        <div class="a11y-label">Contraste</div>
        <div class="a11y-row" id="a11y-contrast-btns">
          <button class="a11y-chip" data-contrast="none">Normal</button>
          <button class="a11y-chip" data-contrast="high">Élevé</button>
          <button class="a11y-chip" data-contrast="daltonien">Daltonien</button>
        </div>
      </div>

      <div class="a11y-section">
        <div class="a11y-row-toggle">
          <div>
            <div class="a11y-label">Mode simplifié</div>
            <div class="a11y-hint">Cache Terminal, Dessin, Galerie</div>
          </div>
          <button class="a11y-toggle" id="a11y-simple" role="switch" aria-checked="false"></button>
        </div>
      </div>

      <div class="a11y-section">
        <div class="a11y-row-toggle">
          <div>
            <div class="a11y-label">Grand curseur</div>
            <div class="a11y-hint">Curseur agrandi partout</div>
          </div>
          <button class="a11y-toggle" id="a11y-cursor" role="switch" aria-checked="false"></button>
        </div>
      </div>

      <button class="a11y-reset" id="a11y-reset">↺ Réinitialiser</button>
    `;
    document.body.appendChild(p);
    panelEl = p;

    // Événements
    p.querySelector('#a11y-close').onclick = toggle;

    p.querySelectorAll('[data-font]').forEach(b =>
      b.onclick = () => { cfg.fontSize = b.dataset.font; apply(); }
    );
    p.querySelectorAll('[data-contrast]').forEach(b =>
      b.onclick = () => { cfg.contrast = b.dataset.contrast; apply(); }
    );

    p.querySelector('#a11y-simple').onclick = function() {
      cfg.simplified = !cfg.simplified; apply();
    };
    p.querySelector('#a11y-cursor').onclick = function() {
      cfg.bigCursor = !cfg.bigCursor; apply();
    };

    p.querySelector('#a11y-reset').onclick = () => {
      cfg = { ...DEFAULTS }; apply();
    };
  };

  const _syncUI = () => {
    if(!panelEl) return;
    panelEl.querySelectorAll('[data-font]').forEach(b =>
      b.classList.toggle('active', b.dataset.font === cfg.fontSize)
    );
    panelEl.querySelectorAll('[data-contrast]').forEach(b =>
      b.classList.toggle('active', b.dataset.contrast === cfg.contrast)
    );
    const ts = panelEl.querySelector('#a11y-simple');
    ts.classList.toggle('on', cfg.simplified);
    ts.setAttribute('aria-checked', cfg.simplified);
    const tc = panelEl.querySelector('#a11y-cursor');
    tc.classList.toggle('on', cfg.bigCursor);
    tc.setAttribute('aria-checked', cfg.bigCursor);
  };

  // ── Bouton taskbar ─────────────────────────────────────
  const _buildBtn = () => {
    btnEl = document.createElement('button');
    btnEl.id = 'a11y-btn';
    btnEl.title = 'Accessibilité';
    btnEl.textContent = '♿';
    btnEl.onclick = e => { e.stopPropagation(); toggle(); };
    const taskbar = document.getElementById('taskbar');
    const clock   = document.getElementById('tb-clock');
    taskbar.insertBefore(btnEl, clock);
  };

  // ── Fermeture au clic extérieur ────────────────────────
  const _outsideClick = e => {
    if(panelEl && !panelEl.hidden &&
       !panelEl.contains(e.target) &&
       e.target !== btnEl) {
      panelEl.hidden = true;
      btnEl.classList.remove('open');
    }
  };

  const toggle = () => {
    if(!panelEl) return;
    const willOpen = panelEl.hidden;
    panelEl.hidden = !willOpen;
    btnEl.classList.toggle('open', willOpen);
    if(willOpen) _syncUI();
  };

  // ── Init public ────────────────────────────────────────
  const init = () => {
    load();
    _injectStyles();
    _buildBtn();
    _buildPanel();
    panelEl.hidden = true;
    apply();
    document.addEventListener('click', _outsideClick);
  };

  // ── Styles injectés ────────────────────────────────────
  const _injectStyles = () => {
    const s = document.createElement('style');
    s.textContent = `

      /* ── Zoom contenu des fenêtres (scale tout, y compris px hardcodés) ── */
      html[data-font-size="sm"] .win-body { zoom: .88; }
      html[data-font-size="md"] .win-body { zoom: 1;   }
      html[data-font-size="lg"] .win-body { zoom: 1.2; }
      html[data-font-size="xl"] .win-body { zoom: 1.45; }

      /* ── Taskbar & bureau ── */
      html[data-font-size="sm"] { --a11y-scale: .88; }
      html[data-font-size="md"] { --a11y-scale: 1;   }
      html[data-font-size="lg"] { --a11y-scale: 1.2; }
      html[data-font-size="xl"] { --a11y-scale: 1.45; }

      #tb-clock, #tb-apps .tb-app-btn {
        font-size: calc(.95rem * var(--a11y-scale, 1)) !important;
      }
      .desk-icon .icon-emoji {
        font-size: calc(2.4rem * var(--a11y-scale, 1)) !important;
      }
      .desk-icon {
        width: calc(108px * var(--a11y-scale, 1)) !important;
      }

      /* ── Label icône : pas de débordement ── */
      .desk-icon .icon-label {
        font-size: calc(.88rem * var(--a11y-scale, 1)) !important;
        width: 100%;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        white-space: normal;
        word-break: break-word;
      }

      /* ── Contraste élevé ── */
      html[data-contrast="high"] {
        --bg:       #000000 !important;
        --bg-card:  #0a0a0a !important;
        --bg-card2: #111111 !important;
        --text:     #ffffff !important;
        --border:   rgba(255,255,255,.5) !important;
        --mint:     #00ff99 !important;
      }

      /* ── Mode daltonien (deutéranopie) ── */
      html[data-contrast="daltonien"] {
        --mint:      #0095ff !important;
        --mint-dark: #007acc !important;
        --mint-glow: rgba(0,149,255,.25) !important;
        --danger:    #ff8c00 !important;
        --ok:        #0095ff !important;
      }

      /* ── Grand curseur ── */
      html[data-big-cursor="1"],
      html[data-big-cursor="1"] * {
        cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M6 2 L6 26 L12 20 L17 30 L20 29 L15 19 L23 19 Z' fill='white' stroke='black' stroke-width='2'/%3E%3C/svg%3E") 6 2, auto !important;
      }

      /* ── Bouton taskbar ── */
      #a11y-btn {
        height: 54px; padding: 0 14px;
        border-radius: 15px; border: 1.5px solid var(--border);
        background: var(--bg-card);
        font-size: 1.25rem;
        color: var(--text); cursor: pointer;
        transition: background .15s, border-color .15s, transform .15s;
        flex-shrink: 0;
      }
      #a11y-btn:hover { background: var(--bg-card2); border-color: var(--mint); transform: scale(1.05); }
      #a11y-btn.open  { background: var(--mint); color: #0f1923; border-color: transparent; }

      /* ── Panel ── */
      #a11y-panel {
        position: fixed;
        bottom: 84px; right: 16px;
        width: 300px;
        background: var(--bg-card);
        border: 1.5px solid var(--border);
        border-radius: 18px;
        box-shadow: 0 8px 32px rgba(0,0,0,.5);
        padding: 0;
        z-index: 860;
        overflow: hidden;
        animation: a11yPop .18s cubic-bezier(.34,1.56,.64,1);
      }
      @keyframes a11yPop {
        from { opacity:0; transform: translateY(12px) scale(.96); }
        to   { opacity:1; transform: translateY(0) scale(1); }
      }
      .a11y-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 18px 12px;
        border-bottom: 1px solid var(--border);
      }
      .a11y-title { font-size: 1rem; font-weight: 900; color: var(--text); }
      .a11y-close {
        width: 28px; height: 28px; border-radius: 8px; border: none;
        background: rgba(255,95,87,.15); color: #ff7b76;
        font-size: .9rem; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: background .15s;
      }
      .a11y-close:hover { background: rgba(255,95,87,.3); }
      .a11y-section {
        padding: 14px 18px;
        border-bottom: 1px solid rgba(255,255,255,.05);
      }
      .a11y-section:last-of-type { border-bottom: none; }
      .a11y-label {
        font-size: .85rem; font-weight: 800;
        color: var(--text); margin-bottom: 10px; letter-spacing: .3px;
      }
      .a11y-hint {
        font-size: .78rem; color: var(--text-muted);
        margin-top: 2px; font-weight: 600;
      }
      .a11y-row { display: flex; gap: 6px; flex-wrap: wrap; }
      .a11y-row-toggle {
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
      }

      /* Chips */
      .a11y-chip {
        padding: 7px 12px; border-radius: 10px;
        border: 1.5px solid var(--border);
        background: var(--bg-card2);
        color: var(--text-muted);
        font-family: var(--font); font-size: .82rem; font-weight: 700;
        cursor: pointer; transition: all .15s;
      }
      .a11y-chip:hover { border-color: var(--mint); color: var(--text); }
      .a11y-chip.active {
        background: var(--mint); color: #0f1923;
        border-color: transparent;
      }

      /* Toggle switch */
      .a11y-toggle {
        width: 48px; height: 26px; border-radius: 99px;
        border: none; background: var(--bg-card2);
        position: relative; cursor: pointer;
        transition: background .2s; flex-shrink: 0;
        border: 1.5px solid var(--border);
      }
      .a11y-toggle::after {
        content: '';
        position: absolute; top: 3px; left: 3px;
        width: 18px; height: 18px; border-radius: 50%;
        background: var(--text-muted);
        transition: transform .2s, background .2s;
      }
      .a11y-toggle.on { background: var(--mint); border-color: transparent; }
      .a11y-toggle.on::after { transform: translateX(22px); background: #0f1923; }

      /* Reset */
      .a11y-reset {
        display: block; width: calc(100% - 36px);
        margin: 0 18px 16px; padding: 11px;
        border-radius: 12px; border: 1.5px solid var(--border);
        background: transparent; color: var(--text-muted);
        font-family: var(--font); font-size: .88rem; font-weight: 700;
        cursor: pointer; transition: all .15s; text-align: center;
      }
      .a11y-reset:hover { border-color: var(--mint); color: var(--mint); }
    `;
    document.head.appendChild(s);
  };

  return { init, apply };
})();