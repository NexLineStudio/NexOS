/* NexOS Taskbar + AppLauncher CORRIGÉ */

// ── AppLauncher ──────────────────────────────────────────────────
const App = {
  _r: {},
  reg(id, fn) { this._r[id] = fn; },
  open(id) { (this._r[id] ?? (() => console.warn('App inconnue:', id)))(); },
};

// ── Taskbar ──────────────────────────────────────────────────────
const Taskbar = {
  init() {
    // On vérifie que K existe pour éviter les erreurs au boot
    if (typeof K !== 'undefined') {
      K.on('spawn', () => this._render());
      K.on('kill',  () => this._render());
      K.on('focus', () => this._render());
    }
  },
  _render() {
    const el = document.getElementById('tb-apps');
    if (!el) return; // Sécurité
    el.innerHTML = '';
    K.list().forEach(p => {
      const btn = document.createElement('button');
      // On utilise ta classe CSS 'tb-app-btn' pour correspondre à ton index.html
      btn.className = 'tb-app-btn' + (K.focusPid === p.pid && !p.el.classList.contains('mini') ? ' active' : '');
      btn.textContent = p.title;
      btn.onclick = () => {
        if (p.el.classList.contains('mini')) WM.restore(p.pid);
        else if (K.focusPid === p.pid) WM.minimize(p.pid);
        else K.focus(p.pid);
      };
      el.appendChild(btn);
    });
  }
};

// ── Horloge (Cachée car tu as le widget, mais on la garde pour la compatibilité) ──
const Clock = {
  init() {
    const el = document.getElementById('tb-clock');
    if (!el) return; 
    const tick = () => el.textContent = new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    tick(); setInterval(tick, 10000);
  }
};

// ── Menu démarrer (Adapté pour ton #desktop-icons) ────────────────
const StartMenu = {
  APPS: [
    { id:'navigateur', icon:'🌐', label:'Navigateur' },
    { id:'fichiers',   icon:'📁', label:'Fichiers'   },
    { id:'bloc-notes', icon:'📝', label:'Bloc-notes' },
    { id:'calculatrice',icon:'🔢',label:'Calculatrice'},
    { id:'meteo',      icon:'🌤', label:'Météo'      },
    { id:'horloge',    icon:'⏰', label:'Horloge'    },
    { id:'galerie',    icon:'🖼', label:'Galerie'    },
    { id:'musique',    icon:'🎵', label:'Musique'    },
    { id:'calendrier', icon:'📅', label:'Calendrier' },
    { id:'dessin',     icon:'🎨', label:'Dessin'     },
    { id:'terminal',   icon:'⌨', label:'Terminal'   },
    { id:'parametres', icon:'⚙', label:'Paramètres' },
  ],
  init() {
    const menu = document.getElementById('start-menu');
    const grid = document.getElementById('sm-grid');
    if (!grid) return;

    // Remplit la grille (utilisée par ton script dans index.html pour créer les icônes du bureau)
    grid.innerHTML = '';
    this.APPS.forEach(a => {
      const b = document.createElement('button');
      b.className = 'sm-item';
      b.dataset.label = a.label;
      b.dataset.icon = a.icon;
      b.innerHTML = `<span class="sm-icon">${a.icon}</span>${a.label}`;
      b.onclick = () => { 
        App.open(a.id); 
        if(menu) menu.hidden = true; 
      };
      grid.appendChild(b);
    });

    // Sécurité pour le bouton quitter s'il existe
    const quitBtn = document.getElementById('sm-quit');
    if (quitBtn) {
      quitBtn.onclick = () => {
        if (typeof K !== 'undefined' && K.shutdown) K.shutdown();
        else if (window.API?.app?.quit) window.API.app.quit();
      };
    }
  }
};