# NexOS

> OS desktop complet tournant sur Electron — HTML/CSS/JS vanilla, zéro framework.  
> Accès réel au système de fichiers, navigateur intégré, et une suite d'apps natives.

![Version](https://img.shields.io/badge/version-0.2-3ecf8e?style=flat-square) ![Electron](https://img.shields.io/badge/Electron-Node.js-5b8fff?style=flat-square) ![Stack](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-orange?style=flat-square)

---

## Table des matières

- [Pour les utilisateurs](#-pour-les-utilisateurs)
  - [Installation](#installation)
  - [Apps incluses](#apps-incluses)
- [Pour les développeurs](#-pour-les-développeurs)
  - [Architecture](#architecture)
  - [API système](#api-système)
  - [Ajouter une app](#ajouter-une-app)

---

# 👤 Pour les utilisateurs

## Installation

### ✅ Méthode recommandée — Exécutable (aucun prérequis)

Télécharge directement le `.exe` depuis les [**Releases GitHub**](../../releases) et lance-le. C'est tout.

> Pas besoin de Node.js, npm, ou quoi que ce soit d'autre.

---

### 🛠️ Méthode manuelle — Depuis les sources

> **Prérequis :** Node.js installé sur ta machine.

```bash
# 1. Extraire l'archive dans un dossier
# 2. Ouvrir un terminal dans ce dossier

cd NexOS-electron

# 3. Installer les dépendances (une seule fois, ~150 Mo)
npm install

# 4. Lancer NexOS
npm start
```

---

## Apps incluses

NexOS embarque **12 applications** nativement :

| Icône | App | Description |
|-------|-----|-------------|
| 🌐 | **Navigateur** | Navigateur web complet avec WebView Electron, historique, 5 bookmarks |
| 📁 | **Explorateur de fichiers** | Navigation dans tes vrais fichiers, menu contextuel, favoris sidebar |
| 📝 | **Bloc-notes** | Éditeur texte avec numéros de ligne, lecture/écriture de fichiers réels, Ctrl+S |
| 🧮 | **Calculatrice** | Opérations complètes avec mémoire, support clavier, affichage de l'expression |
| 🌤️ | **Météo** | Données Open-Meteo (sans clé API), géocodage par ville, prévisions 5 jours |
| 🕐 | **Horloge** | Horloge digitale + analogique, chronomètre avec tours, réveil |
| 🖼️ | **Galerie** | Visionneuse d'images locale avec vignettes et navigation clavier |
| 🎵 | **Lecteur audio** | Supporte mp3 / wav / ogg / flac, liste de lecture, barre de progression |
| 📅 | **Calendrier** | Vue mensuelle, ajout et suppression d'événements par jour |
| 🎨 | **Dessin** | Paint complet — crayon, formes, gomme, flood fill, palette, annulation, export PNG |
| 💻 | **Terminal** | Shell NexOS avec commandes built-in et historique ↑↓ |
| ⚙️ | **Paramètres** | Thème (6 couleurs d'accent), accessibilité, infos système |

---

# 🛠️ Pour les développeurs

## Architecture

```
NexOS-electron/
│
├── main.js          ← Process principal Electron (fenêtre, IPC, APIs système)
├── preload.js       ← Bridge contextIsolation → expose window.NexAPI au renderer
├── index.html       ← Shell du bureau (boot, titlebar, bureau, taskbar, start menu)
│
├── core/
│   ├── kernel.js          → EventBus + ProcessManager (singleton K)
│   ├── wm.js              → Window Manager — drag, resize, focus (singleton WM)
│   ├── taskbar.js         → Taskbar, Clock, StartMenu, registre d'apps (singleton App)
│   ├── boot.js            → Séquence de démarrage animée
│   └── style.css          → Toute la CSS (variables, composants, fenêtres)
│
└── apps/
    ├── navigateur.js
    ├── fichiers.js
    ├── bloc-notes.js
    ├── calculatrice.js
    ├── meteo.js
    ├── horloge.js
    ├── galerie.js
    ├── musique.js
    ├── calendrier.js
    ├── dessin.js
    ├── terminal.js
    └── parametres.js
```

**Règle d'or :** chaque app est un fichier JS autonome qui ne dépend que de `App`, `WM` et `window.NexAPI`.

---

## API système

Toutes les APIs sont exposées via `window.NexAPI` (bridge `preload.js` → `main.js`).

### `NexAPI.fs` — Filesystem

```js
await NexAPI.fs.readdir(path)           // Liste le contenu d'un dossier
await NexAPI.fs.readfile(path)          // Lit un fichier (retourne string)
await NexAPI.fs.writefile(path, content)// Écrit dans un fichier
await NexAPI.fs.mkdir(path)             // Crée un dossier
await NexAPI.fs.delete(path)            // Supprime fichier ou dossier
await NexAPI.fs.rename(oldPath, newPath)// Renomme / déplace
await NexAPI.fs.open(path)              // Ouvre avec l'app système native
await NexAPI.fs.pickdir()               // Dialog : choisir un dossier
await NexAPI.fs.pickfile(filters)       // Dialog : choisir un fichier
await NexAPI.fs.savedialog(filename)    // Dialog : enregistrer sous
```

### `NexAPI.sys` — Système

```js
await NexAPI.sys.info()
// → { hostname, username, platform, ram, cpu, ... }
```

### `NexAPI.win` — Contrôle de la fenêtre

```js
NexAPI.win.minimize()
NexAPI.win.maximize()
NexAPI.win.close()
```

---

## Ajouter une app

### 1. Créer le fichier `apps/monappp.js`

```js
(() => {
  App.reg('monappp', () => {
    WM.open({
      appId: 'monappp',
      title: 'Mon App',
      icon: '🚀',
      w: 600,
      h: 400,
      render(el) {
        el.innerHTML = `<p style="padding:20px">Bonjour NexOS</p>`;
      }
    });
  });
})();
```

### 2. Charger le script dans `index.html`

Ajouter **avant** `core/boot.js` :

```html
<script src="apps/monappp.js"></script>
```

### 3. Enregistrer l'app dans le Start Menu

Dans `core/taskbar.js`, ajouter une entrée dans le tableau `APPS` :

```js
{ id: 'monappp', label: 'Mon App', icon: '🚀' }
```

> Optionnel : ajouter une icône sur le bureau dans `index.html`.

---

## Conventions

- Une seule instance par `appId` — `WM.open()` gère ça automatiquement.
- Toute logique métier reste dans le `render(el)` de l'app.
- Pas de framework, pas de bundler — JS vanilla uniquement.
- Pour communiquer entre apps, utiliser l'EventBus : `K.emit('event', data)` / `K.on('event', cb)`.

---

*NexOS v0.2 — NexLine Studio*
