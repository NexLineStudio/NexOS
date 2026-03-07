/**
 * NexOS Éditeur de texte
 */

(() => {

  const style = document.createElement('style');
  style.textContent = `
    .editor-wrap {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .editor-toolbar {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: var(--surface-2);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .editor-filename {
      margin-left: auto;
      font-size: var(--text-xs);
      color: var(--text-muted);
      font-family: var(--font-mono);
    }
    .editor-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    .editor-lines {
      padding: 12px 10px 12px 6px;
      background: #0e1117;
      color: var(--text-dim);
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      line-height: 1.7;
      text-align: right;
      user-select: none;
      min-width: 40px;
      overflow: hidden;
      flex-shrink: 0;
      border-right: 1px solid var(--border);
    }
    .editor-lines span { display: block; }
    .editor-textarea {
      flex: 1;
      background: var(--surface);
      color: var(--text);
      border: none;
      outline: none;
      resize: none;
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      line-height: 1.7;
      padding: 12px 16px;
      caret-color: var(--mint);
    }
    .editor-statusbar {
      padding: 4px 16px;
      background: var(--surface-2);
      border-top: 1px solid var(--border);
      font-size: var(--text-xs);
      color: var(--text-muted);
      font-family: var(--font-mono);
      display: flex;
      gap: 20px;
      flex-shrink: 0;
    }
  `;
  document.head.appendChild(style);

  class EditorApp {
    constructor(el) {
      this.filename = 'sans-titre.txt';
      this.modified = false;

      el.innerHTML = `
        <div class="editor-wrap">
          <div class="editor-toolbar">
            <button class="btn btn-ghost" id="ed-new"  aria-label="Nouveau fichier">Nouveau</button>
            <button class="btn btn-ghost" id="ed-open" aria-label="Ouvrir un fichier">Ouvrir</button>
            <button class="btn btn-ghost" id="ed-save" aria-label="Télécharger">Sauvegarder</button>
            <input type="file" id="ed-file-input" hidden accept="*/*" />
            <span class="editor-filename" id="ed-fname">${this.filename}</span>
          </div>
          <div class="editor-body">
            <div class="editor-lines" id="ed-lines" aria-hidden="true"><span>1</span></div>
            <textarea class="editor-textarea" id="ed-area"
              aria-label="Zone d'édition" spellcheck="false"
              placeholder="Commencez à écrire…"></textarea>
          </div>
          <div class="editor-statusbar">
            <span id="ed-lines-count">1 ligne</span>
            <span id="ed-chars-count">0 caractère</span>
          </div>
        </div>
      `;

      this.area     = el.querySelector('#ed-area');
      this.linesEl  = el.querySelector('#ed-lines');
      this.fnameEl  = el.querySelector('#ed-fname');
      this.linesCount = el.querySelector('#ed-lines-count');
      this.charsCount = el.querySelector('#ed-chars-count');
      const fileInput = el.querySelector('#ed-file-input');

      this.area.addEventListener('input', () => this._update());
      this.area.addEventListener('scroll', () => this.linesEl.scrollTop = this.area.scrollTop);

      el.querySelector('#ed-new').addEventListener('click', () => this._new());
      el.querySelector('#ed-save').addEventListener('click', () => this._save());
      el.querySelector('#ed-open').addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', e => this._load(e.target.files[0]));

      this._update();
    }

    _update() {
      const text = this.area.value;
      const lines = text.split('\n');
      this.linesEl.innerHTML = lines.map((_, i) => `<span>${i + 1}</span>`).join('');
      this.linesCount.textContent = `${lines.length} ligne${lines.length > 1 ? 's' : ''}`;
      this.charsCount.textContent = `${text.length} caractère${text.length > 1 ? 's' : ''}`;
    }

    _new() {
      if (this.area.value && !confirm('Abandonner les modifications ?')) return;
      this.area.value = '';
      this.filename = 'sans-titre.txt';
      this.fnameEl.textContent = this.filename;
      this._update();
    }

    _save() {
      const blob = new Blob([this.area.value], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = this.filename;
      a.click();
      URL.revokeObjectURL(a.href);
    }

    _load(file) {
      if (!file) return;
      this.filename = file.name;
      this.fnameEl.textContent = file.name;
      const reader = new FileReader();
      reader.onload = e => { this.area.value = e.target.result; this._update(); };
      reader.readAsText(file);
    }
  }

  AppLauncher.register('editor', () => {
    WindowManager.open({
      appId: 'editor',
      title: 'Éditeur',
      icon: '📝',
      width: 720,
      height: 500,
      render: (el) => new EditorApp(el),
    });
  });

})();
