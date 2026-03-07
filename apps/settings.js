/**
 * NexOS Paramètres
 * Thème, accessibilité, infos système.
 */

(() => {

  const style = document.createElement('style');
  style.textContent = `
    .settings-wrap {
      display: flex;
      height: 100%;
    }
    .settings-nav {
      width: 180px;
      flex-shrink: 0;
      background: var(--surface-2);
      border-right: 1px solid var(--border);
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .settings-nav-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--r-sm);
      font-size: var(--text-sm);
      color: var(--text-muted);
      text-align: left;
      transition: background var(--t-fast), color var(--t-fast);
      width: 100%;
    }
    .settings-nav-btn:hover { background: var(--surface-3); color: var(--text); }
    .settings-nav-btn.active { background: var(--mint-soft); color: var(--mint); }

    .settings-panel {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }
    .settings-section { display: none; }
    .settings-section.visible { display: block; }

    .settings-title {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text);
      margin-bottom: 20px;
    }
    .settings-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 0;
      border-bottom: 1px solid var(--border-soft);
      gap: 16px;
    }
    .settings-row-label { font-size: var(--text-sm); color: var(--text); }
    .settings-row-desc  { font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px; }

    .toggle {
      position: relative;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
    }
    .toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
    .toggle-track {
      position: absolute;
      inset: 0;
      background: var(--surface-3);
      border-radius: 99px;
      cursor: pointer;
      transition: background var(--t-fast);
    }
    .toggle input:checked + .toggle-track { background: var(--mint); }
    .toggle-thumb {
      position: absolute;
      top: 3px; left: 3px;
      width: 18px; height: 18px;
      background: #fff;
      border-radius: 50%;
      transition: transform var(--t-fast);
      pointer-events: none;
    }
    .toggle input:checked ~ .toggle-thumb { transform: translateX(20px); }

    .color-swatches {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .swatch {
      width: 28px; height: 28px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color var(--t-fast), transform var(--t-fast);
    }
    .swatch:hover, .swatch.selected { border-color: var(--text); transform: scale(1.15); }

    .settings-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 8px;
    }
    .info-card {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: 14px;
    }
    .info-card-label { font-size: var(--text-xs); color: var(--text-muted); margin-bottom: 4px; }
    .info-card-value { font-size: var(--text-md); font-weight: 600; color: var(--text); font-family: var(--font-mono); }

    .settings-slider {
      -webkit-appearance: none;
      appearance: none;
      width: 140px;
      height: 4px;
      border-radius: 99px;
      background: var(--surface-3);
      outline: none;
    }
    .settings-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px; height: 16px;
      border-radius: 50%;
      background: var(--mint);
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  const ACCENTS = [
    { name: 'Menthe',   value: '#3ecf8e' },
    { name: 'Bleu',     value: '#38bdf8' },
    { name: 'Violet',   value: '#a78bfa' },
    { name: 'Orange',   value: '#fb923c' },
    { name: 'Rose',     value: '#f472b6' },
  ];

  class SettingsApp {
    constructor(el) {
      el.innerHTML = `
        <div class="settings-wrap">
          <nav class="settings-nav" aria-label="Catégories">
            <button class="settings-nav-btn active" data-tab="apparence">🎨 Apparence</button>
            <button class="settings-nav-btn" data-tab="accessibilite">♿ Accessibilité</button>
            <button class="settings-nav-btn" data-tab="systeme">🖥 Système</button>
          </nav>
          <div class="settings-panel">

            <!-- Apparence -->
            <div class="settings-section visible" id="tab-apparence">
              <div class="settings-title">Apparence</div>
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">Couleur d'accentuation</div>
                  <div class="settings-row-desc">Appliquée à toute l'interface</div>
                </div>
                <div class="color-swatches" id="swatches" role="radiogroup" aria-label="Couleur d'accent"></div>
              </div>
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">Taille de la police</div>
                  <div class="settings-row-desc" id="font-size-label">16px (défaut)</div>
                </div>
                <input type="range" class="settings-slider" id="font-size-slider"
                  min="14" max="22" step="1" value="16" aria-label="Taille de la police" />
              </div>
            </div>

            <!-- Accessibilité -->
            <div class="settings-section" id="tab-accessibilite">
              <div class="settings-title">Accessibilité</div>
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">Réduire les animations</div>
                  <div class="settings-row-desc">Désactive les transitions d'ouverture</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" id="reduce-motion" aria-label="Réduire les animations" />
                  <span class="toggle-track"></span>
                  <span class="toggle-thumb"></span>
                </label>
              </div>
              <div class="settings-row">
                <div>
                  <div class="settings-row-label">Contraste élevé</div>
                  <div class="settings-row-desc">Renforce la lisibilité des éléments</div>
                </div>
                <label class="toggle">
                  <input type="checkbox" id="high-contrast" aria-label="Contraste élevé" />
                  <span class="toggle-track"></span>
                  <span class="toggle-thumb"></span>
                </label>
              </div>
            </div>

            <!-- Système -->
            <div class="settings-section" id="tab-systeme">
              <div class="settings-title">Informations système</div>
              <div class="settings-info-grid">
                <div class="info-card">
                  <div class="info-card-label">Version</div>
                  <div class="info-card-value">NexOS v0.1</div>
                </div>
                <div class="info-card">
                  <div class="info-card-label">Studio</div>
                  <div class="info-card-value">NexLine</div>
                </div>
                <div class="info-card">
                  <div class="info-card-label">Uptime</div>
                  <div class="info-card-value" id="set-uptime">—</div>
                </div>
                <div class="info-card">
                  <div class="info-card-label">Processus</div>
                  <div class="info-card-value" id="set-procs">—</div>
                </div>
                <div class="info-card">
                  <div class="info-card-label">Navigateur</div>
                  <div class="info-card-value" id="set-browser">—</div>
                </div>
                <div class="info-card">
                  <div class="info-card-label">Résolution</div>
                  <div class="info-card-value" id="set-res">—</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      `;

      // Tabs
      el.querySelectorAll('.settings-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          el.querySelectorAll('.settings-nav-btn').forEach(b => b.classList.remove('active'));
          el.querySelectorAll('.settings-section').forEach(s => s.classList.remove('visible'));
          btn.classList.add('active');
          el.querySelector(`#tab-${btn.dataset.tab}`).classList.add('visible');
          if (btn.dataset.tab === 'systeme') this._refreshSystem(el);
        });
      });

      // Swatches
      const swatchContainer = el.querySelector('#swatches');
      ACCENTS.forEach(ac => {
        const btn = document.createElement('button');
        btn.className = 'swatch' + (ac.value === '#3ecf8e' ? ' selected' : '');
        btn.style.background = ac.value;
        btn.setAttribute('aria-label', ac.name);
        btn.setAttribute('title', ac.name);
        btn.addEventListener('click', () => {
          document.documentElement.style.setProperty('--mint', ac.value);
          document.documentElement.style.setProperty('--mint-soft', ac.value + '22');
          document.documentElement.style.setProperty('--mint-border', ac.value + '44');
          swatchContainer.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
          btn.classList.add('selected');
        });
        swatchContainer.appendChild(btn);
      });

      // Font size
      const slider = el.querySelector('#font-size-slider');
      const sizeLabel = el.querySelector('#font-size-label');
      slider.addEventListener('input', () => {
        const v = slider.value;
        document.documentElement.style.fontSize = v + 'px';
        sizeLabel.textContent = `${v}px`;
      });

      // Reduce motion
      el.querySelector('#reduce-motion').addEventListener('change', e => {
        document.documentElement.style.setProperty('--t-fast', e.target.checked ? '0ms' : '120ms');
        document.documentElement.style.setProperty('--t-mid',  e.target.checked ? '0ms' : '240ms');
        document.documentElement.style.setProperty('--t-slow', e.target.checked ? '0ms' : '400ms');
      });

      // High contrast
      el.querySelector('#high-contrast').addEventListener('change', e => {
        document.documentElement.style.setProperty('--border', e.target.checked ? '#ffffff30' : '#ffffff12');
        document.documentElement.style.setProperty('--text-muted', e.target.checked ? '#a0adb8' : '#7a8799');
      });
    }

    _refreshSystem(el) {
      el.querySelector('#set-uptime').textContent = NexOS.uptime() + 's';
      el.querySelector('#set-procs').textContent = NexOS.getProcesses().length;
      el.querySelector('#set-browser').textContent = navigator.userAgent.includes('Firefox') ? 'Firefox' : navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Autre';
      el.querySelector('#set-res').textContent = `${window.innerWidth}×${window.innerHeight}`;
    }
  }

  AppLauncher.register('settings', () => {
    WindowManager.open({
      appId: 'settings',
      title: 'Paramètres',
      icon: '⚙',
      width: 640,
      height: 440,
      render: (el) => new SettingsApp(el),
    });
  });

})();
