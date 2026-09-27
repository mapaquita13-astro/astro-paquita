/* Astro Paquita V170 — ergonomie profil + recherche mondiale des lieux.
   Cette couche ne modifie aucun calcul astrologique V121. */
(function(){
'use strict';
if(window.__AP_V170_PROFILE_INPUTS_PLACES__)return;
window.__AP_V170_PROFILE_INPUTS_PLACES__=true;

const GEO_URL='https://geocoding-api.open-meteo.com/v1/search';
let debounceTimer=null;
let requestSerial=0;

function digits(v,n){return String(v||'').replace(/\D/g,'').slice(0,n);}
function maskDateValue(v){
  const d=digits(v,8);
  if(d.length<=2)return d;
  if(d.length<=4)return d.slice(0,2)+'/'+d.slice(2);
  return d.slice(0,2)+'/'+d.slice(2,4)+'/'+d.slice(4);
}
function maskTimeValue(v){
  const raw=String(v||'');
  if(raw.includes(':')){
    const parts=raw.split(':');
    const h=digits(parts[0],2),m=digits(parts.slice(1).join(''),2);
    return m.length?h+':'+m:h;
  }
  const d=digits(raw,4);
  if(d.length<=2)return d;
  return d.slice(0,2)+':'+d.slice(2);
}
function normalizeTimeOnBlur(v){
  const raw=String(v||'').trim();
  if(!raw)return'';
  let h='',m='';
  if(raw.includes(':')){
    const p=raw.split(':');h=digits(p[0],2);m=digits(p.slice(1).join(''),2);
  }else{
    const d=digits(raw,4);
    if(d.length===3&&Number(d.slice(0,2))>23){h=d.slice(0,1);m=d.slice(1);}else if(d.length>=3){h=d.slice(0,2);m=d.slice(2);}else{h=d;m='';}
  }
  if(h&&m.length===2)return String(Number(h)).padStart(2,'0')+':'+m;
  return maskTimeValue(raw);
}
function bindMask(input,type){
  if(!input||input.dataset.v170Mask)return;
  input.dataset.v170Mask='1';
  input.setAttribute('inputmode','numeric');
  input.setAttribute('autocomplete','off');
  input.maxLength=type==='date'?10:5;
  input.addEventListener('input',()=>{
    const start=input.selectionStart||0,oldLen=input.value.length;
    input.value=type==='date'?maskDateValue(input.value):maskTimeValue(input.value);
    const delta=input.value.length-oldLen;
    try{input.setSelectionRange(Math.max(0,start+delta),Math.max(0,start+delta));}catch(e){}
  });
  input.addEventListener('blur',()=>{
    input.value=type==='date'?maskDateValue(input.value):normalizeTimeOnBlur(input.value);
  });
}

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function resultLabel(v){
  const parts=[v.admin4,v.admin3,v.admin2,v.admin1,v.country].filter(Boolean);
  const uniq=[];for(const x of parts){if(!uniq.includes(x)&&x!==v.name)uniq.push(x);}
  return uniq.slice(0,3).join(' · ');
}
function localMatches(q){
  try{
    if(!Array.isArray(window.VILLES))return[];
    const s=q.toLowerCase();
    return window.VILLES.filter(v=>String((v.n||'')+' '+(v.p||'')).toLowerCase().includes(s)).slice(0,8).map(v=>({
      name:v.n,country:v.p||'',admin1:'',latitude:Number(v.lat),longitude:Number(v.lon),timezone:v.tz||'',source:'local'
    }));
  }catch(e){return[];}
}
async function worldMatches(q){
  const url=GEO_URL+'?name='+encodeURIComponent(q)+'&count=25&language=fr&format=json';
  const r=await fetch(url,{headers:{'Accept':'application/json'}});
  if(!r.ok)throw new Error('Recherche de lieux indisponible');
  const data=await r.json();
  return Array.isArray(data.results)?data.results.map(v=>({
    id:v.id,name:v.name||'',country:v.country||v.country_code||'',admin1:v.admin1||'',admin2:v.admin2||'',admin3:v.admin3||'',admin4:v.admin4||'',
    latitude:Number(v.latitude),longitude:Number(v.longitude),timezone:v.timezone||'',source:'world'
  })).filter(v=>v.name&&Number.isFinite(v.latitude)&&Number.isFinite(v.longitude)&&v.timezone):[];
}
function mergePlaces(a,b){
  const out=[],seen=new Set();
  for(const v of [...a,...b]){
    const key=[String(v.name).toLowerCase(),Number(v.latitude).toFixed(3),Number(v.longitude).toFixed(3)].join('|');
    if(seen.has(key))continue;seen.add(key);out.push(v);
  }
  return out.slice(0,25);
}
function renderPlaces(res,rows){
  if(!res)return;
  if(!rows.length){res.innerHTML='<div class="ap-note" style="margin-top:8px">Aucun lieu trouvé. Essayez le nom du village, de la ville ou un code postal.</div>';return;}
  res.innerHTML=rows.map((v,i)=>`<button type="button" class="ap-profile-row" data-v170-place="${i}" style="width:100%;cursor:pointer;text-align:left;margin-top:5px"><div class="ap-avatar">⌖</div><div><strong>${esc(v.name)}</strong><small>${esc(resultLabel(v)||v.country||'')} · ${esc(v.timezone)}</small></div></button>`).join('');
  res._v170Places=rows;
  res.querySelectorAll('[data-v170-place]').forEach(b=>b.addEventListener('click',()=>{
    const v=res._v170Places[Number(b.dataset.v170Place)];if(!v)return;
    const search=document.getElementById('ap-p-city-search'),lat=document.getElementById('ap-p-lat'),lon=document.getElementById('ap-p-lon'),tz=document.getElementById('ap-p-tz');
    if(search){search.value=v.name;search.dataset.v170Selected='1';search.dataset.v170PlaceLabel=resultLabel(v)||v.country||'';}
    if(lat)lat.value=String(v.latitude);if(lon)lon.value=String(v.longitude);if(tz)tz.value=v.timezone;
    res.innerHTML='';
  }));
}
function bindWorldCitySearch(search,res){
  if(!search||!res||search.dataset.v170World)return;
  search.dataset.v170World='1';
  search.setAttribute('autocomplete','off');
  search.placeholder='Ville, village ou code postal — monde entier';
  // Remplace le gestionnaire local V127. La base embarquée reste un secours instantané.
  search.oninput=null;
  search.addEventListener('input',()=>{
    search.dataset.v170Selected='';
    const lat=document.getElementById('ap-p-lat'),lon=document.getElementById('ap-p-lon'),tz=document.getElementById('ap-p-tz');
    if(lat)lat.value='';if(lon)lon.value='';if(tz)tz.value='';
    const q=search.value.trim();
    clearTimeout(debounceTimer);
    if(q.length<2){res.innerHTML='';return;}
    const serial=++requestSerial;
    const local=localMatches(q);
    if(local.length)renderPlaces(res,local);
    debounceTimer=setTimeout(async()=>{
      try{
        const world=await worldMatches(q);
        if(serial!==requestSerial)return;
        renderPlaces(res,mergePlaces(local,world));
      }catch(e){
        if(serial!==requestSerial)return;
        if(!local.length)res.innerHTML='<div class="ap-note" style="margin-top:8px">Recherche mondiale momentanément indisponible. Réessayez dans quelques instants.</div>';
      }
    },280);
  });
}
function enhanceProfileForm(){
  const date=document.getElementById('ap-p-date');
  const time=document.getElementById('ap-p-heure');
  const city=document.getElementById('ap-p-city-search');
  const res=document.getElementById('ap-city-results');
  bindMask(date,'date');bindMask(time,'time');bindWorldCitySearch(city,res);
}
function start(){
  enhanceProfileForm();
  const root=document.getElementById('ap-final-root')||document.body;
  const obs=new MutationObserver(()=>enhanceProfileForm());
  obs.observe(root,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
