/* NexOS Boot */
(() => {
  const bootEl = document.getElementById('boot');
  const bar    = document.getElementById('boot-bar');
  const msg    = document.getElementById('boot-msg');
  
  // 🔊 Audio avec chemin absolu file://
  const jingle = new Audio('file:///D:/Nathan/NexOSS/sounds/boot.mp3');
  jingle.volume = 0.8;

  const steps = [
    [10,  'Allumage des circuits… ⚡'],
    [30,  'Chargement des fichiers… 📦'],
    [55,  'Préparation du bureau… 🖥️'],
    [75,  'Lancement des apps… 🚀'],
    [90,  'Presque prêt… 🤫'],
    [100, 'Bienvenue ! 👋']
  ];

  let i = 0;
  const tick = () => {
    if (i >= steps.length) {
      setTimeout(() => {
        if (bootEl) bootEl.classList.add('out');
        
        const osEl = document.getElementById('os');
        if (osEl) osEl.hidden = false;

        // 🛡️ Initialisation sécurisée des modules
        try {
          if (typeof Taskbar !== 'undefined') Taskbar.init();
          if (typeof Clock !== 'undefined') Clock.init();
          if (typeof StartMenu !== 'undefined') StartMenu.init();
          if (typeof Accessibility !== 'undefined') Accessibility.init();
          if (typeof K !== 'undefined') K.boot();
        } catch (e) { console.warn("Erreur init modules:", e); }

        // 🛡️ FIX : On ne définit onclick que si l'élément EXISTE
        const closeBtn = document.getElementById('tb-close');
        if (closeBtn && window.API?.win) {
          closeBtn.onclick = () => API.win.close();
        }

        // 🔊 Lecture du Jingle (enfin !)
        jingle.play()
          .then(() => console.log("🔊 Jingle lu avec succès"))
          .catch(err => console.error("❌ Erreur Audio:", err));

        setTimeout(() => { if(bootEl) bootEl.hidden = true; }, 320);
      }, 250);
      return;
    }
    const [p, m] = steps[i++];
    if (bar) bar.style.width = p + '%';
    if (msg) msg.textContent = m;
    setTimeout(tick, 200 + Math.random() * 160);
  };

  setTimeout(tick, 500);
})();