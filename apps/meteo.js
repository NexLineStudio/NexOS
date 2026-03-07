/* NexOS — Météo (Open-Meteo, sans clé API) */
App.reg('meteo', () => WM.open({
  appId:'meteo', title:'Météo', icon:'🌤', w:520, h:480,
  render(el) {
    const WMO={0:'☀ Ciel dégagé',1:'🌤 Peu nuageux',2:'⛅ Nuageux',3:'☁ Couvert',45:'🌫 Brouillard',48:'🌫 Brouillard givrant',51:'🌦 Bruine légère',53:'🌦 Bruine',55:'🌧 Bruine forte',61:'🌧 Pluie légère',63:'🌧 Pluie',65:'🌧 Pluie forte',71:'🌨 Neige légère',73:'❄ Neige',75:'❄ Neige forte',80:'🌦 Averses',81:'🌧 Averses fortes',95:'⛈ Orage',96:'⛈ Orage avec grêle',99:'⛈ Orage violent'};
    const wdesc=c=>WMO[c]||'🌡 Conditions inconnues';

    el.style.cssText='display:flex;flex-direction:column;height:100%;';
    el.innerHTML=`
      <div class="toolbar">
        <input class="inp" id="m-city" type="text" placeholder="Ville (ex: Bordeaux)…" style="flex:1;" aria-label="Nom de la ville"/>
        <button class="btn btn-mint" id="m-search">🔍 Chercher</button>
      </div>
      <div id="m-body" style="flex:1;overflow-y:auto;padding:20px;">
        <div style="text-align:center;color:var(--muted);margin-top:60px;">
          <div style="font-size:3rem;">🌍</div>
          <div style="font-size:16px;margin-top:12px;">Entrez le nom d'une ville<br>pour voir la météo</div>
        </div>
      </div>`;

    const body  = el.querySelector('#m-body');
    const cityEl= el.querySelector('#m-city');

    const search = async () => {
      const city = cityEl.value.trim(); if(!city) return;
      body.innerHTML='<div style="text-align:center;padding:40px;font-size:16px;color:var(--muted);">⏳ Recherche en cours…</div>';
      const geo = await API.weather.geocode(city);
      if(geo.error||!geo.results?.length){ body.innerHTML=`<div style="padding:20px;color:var(--danger);font-size:15px;">❌ Ville introuvable : "${city}"</div>`; return; }
      const {latitude:lat,longitude:lon,name,country} = geo.results[0];
      const data = await API.weather.fetch(lat,lon);
      if(data.error){ body.innerHTML=`<div style="padding:20px;color:var(--danger);">❌ Erreur météo</div>`; return; }
      const c=data.current, d=data.daily;
      body.innerHTML=`
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:16px;color:var(--muted);margin-bottom:4px;">${name}, ${country}</div>
          <div style="font-size:72px;font-weight:800;color:var(--mint);">${Math.round(c.temperature_2m)}°</div>
          <div style="font-size:20px;margin:8px 0;">${wdesc(c.weathercode)}</div>
          <div style="display:flex;justify-content:center;gap:24px;color:var(--muted);font-size:14px;margin-top:8px;">
            <span>💨 ${c.windspeed_10m} km/h</span>
            <span>💧 ${c.relative_humidity_2m}%</span>
          </div>
        </div>
        <div style="font-size:15px;font-weight:700;color:var(--muted);margin-bottom:10px;padding:0 4px;">Prévisions 5 jours</div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          ${d.time.slice(0,5).map((t,i)=>{
            const date=new Date(t);
            const jour=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][date.getDay()];
            return `<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--surface2);border-radius:var(--r);font-size:14px;">
              <span style="width:36px;font-weight:700;">${jour}</span>
              <span style="flex:1;">${wdesc(d.weathercode[i])}</span>
              <span style="color:var(--muted);">${Math.round(d.temperature_2m_min[i])}°</span>
              <span style="width:4px;background:var(--border2);height:12px;border-radius:2px;"></span>
              <span style="font-weight:700;color:var(--mint);">${Math.round(d.temperature_2m_max[i])}°</span>
            </div>`;
          }).join('')}
        </div>`;
    };

    el.querySelector('#m-search').onclick=search;
    cityEl.onkeydown=e=>{ if(e.key==='Enter') search(); };
    // Bordeaux par défaut pour Nathan
    cityEl.value='Bordeaux';
    search();
  }
}));
