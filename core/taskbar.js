/* NexOS Taskbar + AppLauncher */

// ── AppLauncher ──────────────────────────────────────────────────
const App = {
  _r: {},
  reg(id, fn) { this._r[id] = fn; },
  open(id) { (this._r[id] ?? (() => console.warn('App inconnue:', id)))(); },
};

// ── Taskbar ──────────────────────────────────────────────────────
const Taskbar = {
  init() {
    K.on('spawn', () => this._render());
    K.on('kill',  () => this._render());
    K.on('focus', () => this._render());
  },
  _render() {
    const el = document.getElementById('tb-apps');
    el.innerHTML = '';
    K.list().forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'tb-app' + (K.focusPid===p.pid && !p.el.classList.contains('mini') ? ' on' : '');
      btn.textContent = p.title;
      btn.onclick = () => {
        if(p.el.classList.contains('mini')) WM.restore(p.pid);
        else if(K.focusPid===p.pid) WM.minimize(p.pid);
        else K.focus(p.pid);
      };
      el.appendChild(btn);
    });
  }
};

// ── Horloge ──────────────────────────────────────────────────────
const Clock = {
  init() {
    const el = document.getElementById('tb-clock');
    const tick = () => el.textContent = new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    tick(); setInterval(tick, 10000);
  }
};

// ── Menu démarrer ─────────────────────────────────────────────────
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
    const btn  = document.getElementById('start-btn');
    const menu = document.getElementById('start-menu');
    const grid = document.getElementById('sm-grid');

    // Remplit la grille
    this.APPS.forEach(a => {
      const b = document.createElement('button');
      b.className = 'sm-item';
      b.dataset.label = a.label;
      b.dataset.icon = a.icon;
      b.innerHTML = `<span class="sm-icon">${a.icon}</span>${a.label}`;
      b.onclick = () => { App.open(a.id); menu.hidden=true; btn.classList.remove('open'); };
      grid.appendChild(b);
    });

    // Double-clic bureau = ouvre aussi les apps (icônes non affichées ici, tout passe par le menu)
    btn.onclick = e => {
      e.stopPropagation();
      const open = !menu.hidden;
      menu.hidden = open;
      btn.classList.toggle('open', !open);
    };
    document.addEventListener('click', () => { menu.hidden=true; btn.classList.remove('open'); });
    menu.addEventListener('click', e => e.stopPropagation());

    document.getElementById('sm-quit').onclick = () => K.shutdown();
  }
};
