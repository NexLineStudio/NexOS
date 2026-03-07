# NexOS — Electron

OS desktop en HTML/CSS/JS via Electron. Accès réel aux fichiers + navigateur intégré.

## Installation

```bash
# 1. Extrais le zip dans un dossier
# 2. Ouvre un terminal dans ce dossier
cd NexOS-electron

# 3. Installe Electron (une seule fois, ~150Mo)
npm install

# 4. Lance NexOS
npm start
```

## Structure
```
NexOS-electron/
├── main.js          ← Process Electron principal (IPC filesystem, fenêtre)
├── preload.js       ← Bridge sécurisé → expose window.NexAPI au renderer
├── index.html       ← Shell du bureau
├── core/
│   ├── kernel.js          EventBus + ProcessManager
│   ├── window-manager.js  Fenêtres drag/resize
│   ├── taskbar.js         Taskbar + AppLauncher + StartMenu
│   ├── boot.js            Séquence de démarrage
│   ├── design-system.css  Variables + tokens
│   ├── desktop.css        Bureau + titlebar + taskbar
│   └── window.css         Fenêtres
└── apps/
    ├── browser/     Navigateur web intégré (webview Electron)
    ├── explorer/    Explorateur fichiers PC (accès réel)
    ├── editor/      Éditeur texte (open/save fichiers réels)
    ├── terminal/    Shell NexOS (commandes built-in)
    ├── taskmanager/ Processus NexOS
    └── settings/    Thème, accessibilité, infos système
```

## Ajouter une app
```js
// apps/monappp/monappp.js
(() => {
  AppLauncher.register('monappp', () => {
    WindowManager.open({
      appId: 'monappp', title: 'Mon App', icon: '🚀',
      width: 600, height: 400,
      render(el) {
        el.innerHTML = '<p style="padding:20px">Bonjour NexOS</p>';
      }
    });
  });
})();
```
Puis dans `index.html` : ajouter `<script src="apps/monappp/monappp.js">` + icône bureau + entrée start menu.

## API système disponible dans les apps
```js
// Filesystem
await window.NexAPI.fs.readdir(path)      // liste un dossier
await window.NexAPI.fs.readfile(path)     // lit un fichier
await window.NexAPI.fs.writefile(path, content)
await window.NexAPI.fs.mkdir(path)
await window.NexAPI.fs.delete(path)
await window.NexAPI.fs.rename(old, new)
await window.NexAPI.fs.open(path)         // ouvre avec l'app système
await window.NexAPI.fs.pickdir()          // dialog choisir dossier
await window.NexAPI.fs.pickfile(filters)  // dialog choisir fichier
await window.NexAPI.fs.savedialog(name)   // dialog enregistrer sous

// Système
await window.NexAPI.sys.info()  // hostname, username, RAM, CPU, etc.

// Fenêtre
window.NexAPI.win.minimize()
window.NexAPI.win.maximize()
window.NexAPI.win.close()
```


NexOS v0.2 — Architecture complète
Application desktop construite avec Electron (Node.js). Zéro framework front-end, HTML/CSS/JS vanilla pur.
Lancement : npm install puis npm start dans le dossier.

Fichiers racine

main.js — Process principal Electron. Crée la fenêtre (sans barre native, frame: false). Expose toutes les APIs système via IPC : lecture/écriture fichiers, dialogs, suppression, renommage, ouverture avec l'app système, météo (Open-Meteo sans clé API), infos système (RAM, CPU, hostname...). Gère aussi les boutons minimize/maximize/close de la titlebar custom.
preload.js — Bridge contextIsolation. Expose window.API au renderer avec 3 namespaces : API.fs (filesystem), API.sys (infos système), API.win (contrôle fenêtre), API.weather (météo).
index.html — Shell HTML. Contient le boot screen, la titlebar custom, le bureau, la couche fenêtres (#win-layer), la taskbar (collée en bas via position:absolute;bottom:0), et le menu démarrer. Charge tous les scripts dans l'ordre : kernel → wm → taskbar → apps → boot.


core/

style.css — Toute la CSS en un seul fichier. Variables CSS (--mint #3ecf8e, --bg, --surface, --surface2, --surface3, --border, --text, --muted...). Police Nunito (Google Fonts). Styles du boot, titlebar, bureau, taskbar, menu démarrer, système de fenêtres (.win, .win-bar, .win-body, .win-resize, .win-dot), et composants réutilisables (.btn, .inp, .toolbar, .statusbar).
kernel.js — Singleton K. EventBus (on/off/emit), ProcessManager (spawn/kill/list), gestion du focus et z-index des fenêtres, uptime, shutdown.
wm.js — Singleton WM. WM.open({appId, title, icon, w, h, render}) crée une fenêtre draggable et redimensionnable. Une seule instance par appId. Gère close/minimize/restore/maximize. Le drag se fait via pointermove sur la barre de titre. Le resize via le coin bas-droite.
taskbar.js — Singleton Taskbar (écoute les events kernel pour se mettre à jour), Clock (horloge bas droite), StartMenu (grille 3 colonnes avec les 12 apps), App (registre d'apps : App.reg(id, fn) et App.open(id)).
boot.js — Séquence de démarrage animée (barre de progression, messages). Initialise Taskbar, Clock, StartMenu, K.boot(), branche les boutons titlebar sur API.win.


apps/ — Chaque app est un fichier JS autonome qui appelle App.reg('id', () => WM.open({...})). La fonction render(el, pid) reçoit le div.win-body et le remplit.

navigateur.js — Balise <webview> Electron. Barre d'adresse, boutons précédent/suivant/reload, barre de progression de chargement, 5 bookmarks (Google, YouTube, GitHub, NexLine, Wikipedia).
fichiers.js — Explorateur fichiers complet. Sidebar avec favoris (Home, Bureau, Télécharg., Documents, Images, Musique, disques C/D/E). Navigation avec historique (boutons ◀▶), bouton parent, raccourci home. Liste triée (dossiers d'abord). Double-clic pour ouvrir. Menu contextuel clic droit (ouvrir, ouvrir dans bloc-notes, renommer, supprimer). Affichage taille des fichiers.
bloc-notes.js — Éditeur texte. Numéros de ligne synchronisés au scroll. Lecture/écriture vrais fichiers via API.fs. Ctrl+S pour sauvegarder. Écoute l'event editor:open pour être ouvert depuis l'explorateur.
calculatrice.js — Calculatrice complète avec mémoire d'opération, affichage de l'expression, support clavier, opérateurs ÷ × − +, touches %, ±, C.
meteo.js — Météo via Open-Meteo (gratuit, sans clé). Geocoding par nom de ville. Température actuelle, conditions, vent, humidité. Prévisions 5 jours. Codes WMO traduits en français avec emojis.
horloge.js — 3 onglets : Horloge (digitale + analogique canvas), Chronomètre (start/pause/reset/tours), Réveil (input time + setInterval).
galerie.js — Ouvre des images via dialog (API.fs.pickimages). Affichage principal + colonne de vignettes. Navigation ◀▶ + touches clavier. Chemins en file:// pour accès local.
musique.js — Lecteur audio HTML5 (new Audio()). Ouvre des fichiers mp3/wav/ogg/flac. Barre de progression seekable, volume, liste de lecture, navigation entre pistes.
calendrier.js — Calendrier mensuel avec navigation mois. Grille 7 colonnes (lundi→dimanche). Mise en évidence du jour actuel. Ajout/suppression d'événements par jour (stockés en mémoire dans eventsStore).
dessin.js — Paint complet. Canvas redimensionnable via ResizeObserver. Outils : crayon, pinceau, rectangle, cercle, ligne, gomme, remplissage (flood fill). Palette 16 couleurs + color picker custom. Taille de pinceau via slider. Annuler (historique 30 étapes). Sauvegarder en PNG.
terminal.js — Shell NexOS. Commandes : help, clear, echo, version, date, uptime, ps, sysinfo. Historique ↑↓.
parametres.js — 3 onglets : Apparence (6 couleurs d'accent, taille de police), Accessibilité (réduire animations, contraste élevé), Système (grille d'infos issues de API.sys.info()).


Conventions à respecter pour ajouter une app :

Créer apps/monapp.js avec App.reg('monapp', () => WM.open({appId:'monapp', title:'...', icon:'emoji', w:700, h:480, render(el){ /* remplir el */ }}))
Ajouter <script src="apps/monapp.js"> dans index.html avant core/boot.js
Ajouter l'app dans le tableau APPS de StartMenu dans core/taskbar.js
