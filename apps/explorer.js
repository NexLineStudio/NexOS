/**
 * NexOS Explorateur de fichiers
 * Utilise l'API File System Access quand disponible, sinon drag & drop.
 */

(() => {

  const style = document.createElement('style');
  style.textContent = `
    .explorer-wrap {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .explorer-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--surface-2);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .explorer-path {
      flex: 1;
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--text-muted);
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-sm);
      padding: 4px 10px;
    }
    .explorer-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .explorer-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
    .explorer-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      gap: 12px;
      color: var(--text-muted);
      text-align: center;
      padding: 24px;
    }
    .explorer-empty .big-icon { font-size: 3rem; opacity: .4; }
    .explorer-empty p { font-size: var(--text-sm); line-height: 1.6; }
    .explorer-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: var(--r-sm);
      cursor: default;
      transition: background var(--t-fast);
      font-size: var(--text-sm);
    }
    .explorer-item:hover { background: var(--surface-2); }
    .explorer-item .item-icon { font-size: 1.2rem; flex-shrink: 0; }
    .explorer-item .item-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .explorer-item .item-size { color: var(--text-muted); font-family: var(--font-mono); font-size: var(--text-xs); flex-shrink: 0; }
    .explorer-statusbar {
      padding: 4px 16px;
      background: var(--surface-2);
      border-top: 1px solid var(--border);
      font-size: var(--text-xs);
      color: var(--text-muted);
      flex-shrink: 0;
    }
    .explorer-dropzone {
      border: 2px dashed var(--mint-border);
      border-radius: var(--r-md);
      margin: 16px;
      padding: 24px;
      text-align: center;
      color: var(--text-muted);
      font-size: var(--text-sm);
      transition: border-color var(--t-fast), background var(--t-fast);
    }
    .explorer-dropzone.dragover { border-color: var(--mint); background: var(--mint-soft); }
  `;
  document.head.appendChild(style);

  const fmt = (bytes) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  };

  class ExplorerApp {
    constructor(el) {
      this.files = [];

      el.innerHTML = `
        <div class="explorer-wrap">
          <div class="explorer-toolbar">
            <button class="btn btn-ghost" id="ex-open" aria-label="Ouvrir un dossier">📂 Ouvrir dossier</button>
            <span class="explorer-path" id="ex-path">Aucun dossier ouvert</span>
          </div>
          <div class="explorer-body">
            <div class="explorer-list" id="ex-list">
              <div class="explorer-empty">
                <span class="big-icon">📁</span>
                <p>Glissez-déposez des fichiers ici,<br>ou cliquez sur « Ouvrir dossier ».</p>
                <div class="explorer-dropzone" id="ex-drop" aria-label="Zone de dépôt">
                  Déposez vos fichiers ici
                </div>
              </div>
            </div>
          </div>
          <div class="explorer-statusbar" id="ex-status">0 élément</div>
        </div>
      `;

      this.listEl   = el.querySelector('#ex-list');
      this.pathEl   = el.querySelector('#ex-path');
      this.statusEl = el.querySelector('#ex-status');
      const drop    = el.querySelector('#ex-drop');

      el.querySelector('#ex-open').addEventListener('click', () => this._openDir());

      // Drag & Drop
      drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('dragover'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
      drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('dragover'); this._fromDrop(e.dataTransfer.files); });
    }

    _render() {
      if (!this.files.length) return;
      this.listEl.innerHTML = '';
      this.files.forEach(f => {
        const icon = f.type.startsWith('image') ? '🖼' : f.type.includes('pdf') ? '📕' : f.name.endsWith('.js') || f.name.endsWith('.py') || f.name.endsWith('.html') ? '📄' : '📄';
        const item = document.createElement('div');
        item.className = 'explorer-item';
        item.setAttribute('role', 'listitem');
        item.innerHTML = `
          <span class="item-icon" aria-hidden="true">${icon}</span>
          <span class="item-name">${f.name}</span>
          <span class="item-size">${fmt(f.size)}</span>
        `;
        this.listEl.appendChild(item);
      });
      this.statusEl.textContent = `${this.files.length} élément${this.files.length > 1 ? 's' : ''}`;
    }

    _fromDrop(fileList) {
      this.files = Array.from(fileList);
      this.pathEl.textContent = `${this.files.length} fichier(s) déposé(s)`;
      this._render();
    }

    async _openDir() {
      if ('showDirectoryPicker' in window) {
        try {
          const dir = await window.showDirectoryPicker();
          this.files = [];
          this.pathEl.textContent = dir.name;
          for await (const [name, handle] of dir) {
            if (handle.kind === 'file') {
              const f = await handle.getFile();
              this.files.push(f);
            }
          }
          this._render();
        } catch (e) { /* annulé */ }
      } else {
        // Fallback : input file multiple
        const inp = document.createElement('input');
        inp.type = 'file'; inp.multiple = true;
        inp.addEventListener('change', () => { this._fromDrop(inp.files); });
        inp.click();
      }
    }
  }

  AppLauncher.register('explorer', () => {
    WindowManager.open({
      appId: 'explorer',
      title: 'Fichiers',
      icon: '📁',
      width: 680,
      height: 460,
      render: (el) => new ExplorerApp(el),
    });
  });

})();
