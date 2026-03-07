/* NexOS Boot */
(() => {
  const bootEl = document.getElementById('boot');
  const bar    = document.getElementById('boot-bar');
  const msg    = document.getElementById('boot-msg');
  const steps  = [[10,'Kernel…'],[30,'Modules…'],[55,'Services…'],[75,'Interface…'],[90,'Applications…'],[100,'Bienvenue !']];
  let i=0;
  const tick=()=>{
    if(i>=steps.length){
      setTimeout(()=>{
        bootEl.classList.add('out');
        document.getElementById('os').hidden=false;
        Taskbar.init(); Clock.init(); StartMenu.init(); K.boot();
        // Titlebar custom
        document.getElementById('tb-close').onclick= ()=>API.win.close();
        setTimeout(()=>bootEl.hidden=true, 320);
      },250); return;
    }
    const [p,m]=steps[i++]; bar.style.width=p+'%'; msg.textContent=m;
    setTimeout(tick, 200+Math.random()*160);
  };
  setTimeout(tick, 500);
})();
