/* Astro Paquita V192 — lieux de révolution solaire enregistrés par compte/profil. */
(function(){
'use strict';
if(window.APForecastSolarLocations)return;
const ID='ap-forecast-rs-location-v192',q=s=>document.querySelector(s);
function profile(){return window.AstroTruth?.currentProfile?.()}
function storageKey(){
 const p=profile();if(!p)return null;
 const email=String(window.USER_CONNECTE?.email||'local').toLowerCase().trim();
 return 'ap:rs-places:v192:'+email+':'+String(p.profileId||p.legacyKey||'profile');
}
function getLocations(){
 const k=storageKey();if(!k)return{};
 try{const x=JSON.parse(localStorage.getItem(k)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch(e){return{}}
}
function validZone(tz){try{new Intl.DateTimeFormat('en',{timeZone:tz}).format(new Date());return true}catch(e){return false}}
function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function candidates(term){
 const t=normalize(term);if(t.length<2)return[];
 return (Array.isArray(window.VILLES)?window.VILLES:[]).filter(v=>normalize(v.n||'').includes(t)&&Number.isFinite(Number(v.lat))&&Number.isFinite(Number(v.lon))&&validZone(v.tz)).slice(0,18);
}
function cityMatch(text){
 const n=normalize(text),xs=candidates(n).filter(v=>normalize(v.n)===n||normalize(v.n+', '+(v.p||''))===n);
 return xs.length===1?xs[0]:null;
}
function message(t){const x=q('#ap-rs-status-v192');if(x)x.textContent=t}
function status(){
 const yr=Number(q('#ap-rs-year-v192')?.value||0),place=getLocations()[yr];
 message(place?'Lieu enregistré pour '+yr+' : '+place.city+' ('+place.lat+', '+place.lon+' ; '+place.tz+')':'Aucun lieu enregistré pour '+yr+' : les maisons de révolution solaire ne seront pas calculées.');
}
function store(){
 const year=Number(q('#ap-rs-year-v192')?.value),city=String(q('#ap-rs-city-v192')?.value||'').trim();
 let lat=q('#ap-rs-lat-v192')?.value||'',lon=q('#ap-rs-lon-v192')?.value||'',tz=String(q('#ap-rs-tz-v192')?.value||'').trim();
 if(!lat||!lon||!tz){const m=cityMatch(city);if(m){lat=String(m.lat);lon=String(m.lon);tz=m.tz}}
 const a=Number(lat),b=Number(lon);
 if(!Number.isInteger(year)||year<1800||year>2200||!city||lat===''||lon===''||!Number.isFinite(a)||!Number.isFinite(b)||Math.abs(a)>90||Math.abs(b)>180||!validZone(tz)){
  message('Saisissez une année, une ville, des coordonnées valides et un fuseau horaire IANA.');return;
 }
 const k=storageKey();if(!k)return;
 const all=getLocations();all[year]={city,lat:a,lon:b,tz};
 try{localStorage.setItem(k,JSON.stringify(all));status()}catch(e){message('Enregistrement impossible dans ce navigateur.')}
}
function remove(){
 const k=storageKey(),year=Number(q('#ap-rs-year-v192')?.value);if(!k)return;
 const all=getLocations();delete all[year];try{localStorage.setItem(k,JSON.stringify(all))}catch(e){}status()
}
function fill(){
 const year=Number(q('#ap-rs-year-v192')?.value),loc=getLocations()[year];
 for(const name of ['city','lat','lon','tz'])q('#ap-rs-'+name+'-v192').value=loc?loc[name]:'';
 status()
}
function offer(){
 const x=q('#ap-rs-city-v192'),list=q('#ap-rs-cities-v192');
 if(!x||!list)return;
 list.replaceChildren();
 for(const c of candidates(x.value)){const o=document.createElement('option');o.value=c.n;list.appendChild(o)}
 const city=cityMatch(x.value);
 if(city){q('#ap-rs-lat-v192').value=city.lat;q('#ap-rs-lon-v192').value=city.lon;q('#ap-rs-tz-v192').value=city.tz}
}
function attach(){
 const root=q('.ap-route-forecast'),button=q('#ap-run-forecast');if(!root||!button)return;
 if(q('#'+ID))return;
 const el=document.createElement('details');el.id=ID;el.className='ap-card';
 el.style.cssText='margin:14px 0;padding:12px 16px;border:1px solid #ded0d8;border-radius:14px';
 const html=[
 '<summary style="cursor:pointer;font-weight:700">Lieu des révolutions solaires (facultatif)</summary>',
 '<p class="ap-muted">Indiquez le lieu de présence à chaque anniversaire astrologique. Sans lieu, les maisons de la révolution solaire ne sont pas calculées.</p>',
 '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:9px">',
 '<label>Année<input id="ap-rs-year-v192" type="number" min="1800" max="2200" step="1" value="'+new Date().getFullYear()+'" style="width:100%;padding:9px"></label>',
 '<label>Ville<input id="ap-rs-city-v192" type="text" list="ap-rs-cities-v192" placeholder="Ville de présence" style="width:100%;padding:9px"></label>',
 '<label>Latitude<input id="ap-rs-lat-v192" type="number" min="-90" max="90" step="any" placeholder="43.29" style="width:100%;padding:9px"></label>',
 '<label>Longitude<input id="ap-rs-lon-v192" type="number" min="-180" max="180" step="any" placeholder="5.37" style="width:100%;padding:9px"></label>',
 '<label>Fuseau IANA<input id="ap-rs-tz-v192" type="text" placeholder="Europe/Paris" style="width:100%;padding:9px"></label>',
 '</div><datalist id="ap-rs-cities-v192"></datalist>',
 '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">',
 '<button type="button" id="ap-rs-save-v192">Enregistrer ce lieu</button>',
 '<button type="button" id="ap-rs-clear-v192">Effacer cette année</button></div>',
 '<p id="ap-rs-status-v192" class="ap-muted" style="margin-top:8px"></p>'
 ].join('');
 el.innerHTML=html;
 const block=button.closest('.ap-card')||button.parentElement;
 if(block?.parentElement)block.insertAdjacentElement('afterend',el);
 else root.appendChild(el);
 el.querySelector('#ap-rs-save-v192')?.addEventListener('click',store);
 el.querySelector('#ap-rs-clear-v192')?.addEventListener('click',remove);
 el.querySelector('#ap-rs-year-v192')?.addEventListener('change',fill);
 el.querySelector('#ap-rs-city-v192')?.addEventListener('input',offer);
 fill();
}
let pending=false;
const observer=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;if(document.body.classList.contains('ap-route-forecast'))attach()})});
function start(){observer.observe(q('#ap-final-root')||document.body,{childList:true,subtree:true});attach()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.APForecastSolarLocations={getLocations,version:'v192'};
})();