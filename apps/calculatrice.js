/* NexOS — Calculatrice */
App.reg('calculatrice', () => WM.open({
  appId:'calculatrice', title:'Calculatrice', icon:'🔢', w:320, h:480,
  render(el) {
    el.style.cssText='display:flex;flex-direction:column;height:100%;background:var(--surface);';
    el.innerHTML=`
      <div style="padding:16px 16px 8px;text-align:right;">
        <div id="c-expr" style="font-size:14px;color:var(--muted);min-height:20px;font-family:var(--mono);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">&nbsp;</div>
        <div id="c-disp" style="font-size:42px;font-weight:800;font-family:var(--mono);color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">0</div>
      </div>
      <div id="c-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:10px 12px 14px;flex:1;"></div>`;

    const disp = el.querySelector('#c-disp');
    const expr = el.querySelector('#c-expr');
    const grid = el.querySelector('#c-grid');
    let cur='0', prev='', op='', fresh=false;

    const BTNS=[
      ['C','±','%','÷'],
      ['7','8','9','×'],
      ['4','5','6','−'],
      ['1','2','3','+'],
      ['0','.',null,'='],
    ];

    BTNS.forEach(row=>row.forEach(lbl=>{
      if(lbl===null){ const sp=document.createElement('div'); grid.appendChild(sp); return; }
      const b=document.createElement('button');
      const isOp=['÷','×','−','+','='].includes(lbl);
      const isClear=lbl==='C';
      b.style.cssText=`
        border-radius:var(--r2);font-size:20px;font-weight:700;
        padding:0;min-height:56px;
        background:${lbl==='='?'var(--mint)':isClear?'var(--surface3)':isOp?'var(--surface3)':'var(--surface2)'};
        color:${lbl==='='?'var(--bg)':isOp&&!isClear?'var(--mint)':'var(--text)'};
        transition:filter var(--fast);
        ${lbl==='0'?'grid-column:span 2;':''}`;
      b.textContent=lbl;
      b.onmouseover=()=>b.style.filter='brightness(1.15)';
      b.onmouseleave=()=>b.style.filter='';
      b.onclick=()=>press(lbl);
      grid.appendChild(b);
    }));

    const press=lbl=>{
      if(lbl==='C'){ cur='0'; prev=''; op=''; expr.textContent=''; disp.textContent='0'; return; }
      if(lbl==='±'){ cur=String(-parseFloat(cur)||0); disp.textContent=cur; return; }
      if(lbl==='%'){ cur=String(parseFloat(cur)/100); disp.textContent=cur; return; }
      if(['÷','×','−','+'].includes(lbl)){
        prev=cur; op=lbl; fresh=true;
        expr.textContent=cur+' '+lbl; return;
      }
      if(lbl==='='){
        if(!op) return;
        const a=parseFloat(prev), b=parseFloat(cur);
        const ops={'÷':a/b,'×':a*b,'−':a-b,'+':a+b};
        const res=ops[op];
        expr.textContent=prev+' '+op+' '+cur+' =';
        cur=String(Number.isFinite(res)?parseFloat(res.toFixed(10)):0);
        op=''; fresh=true; disp.textContent=cur; return;
      }
      if(lbl==='.'){ if(fresh){ cur='0.'; fresh=false; } else if(!cur.includes('.')) cur+='.'; disp.textContent=cur; return; }
      if(fresh){ cur=lbl; fresh=false; } else cur=cur==='0'?lbl:cur+lbl;
      disp.textContent=cur;
    };

    document.addEventListener('keydown', e=>{
      const map={'0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9','+':'+','-':'−','*':'×','/':'÷','Enter':'=','=':'=','.':'.','Escape':'C','Backspace':'back'};
      const k=map[e.key];
      if(!k) return;
      if(k==='back'){ cur=cur.length>1?cur.slice(0,-1):'0'; disp.textContent=cur; }
      else press(k);
    });
  }
}));
