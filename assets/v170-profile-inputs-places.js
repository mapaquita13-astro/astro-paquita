/* Astro Paquita V170.2 — saisie profil + recherche mondiale des villes et villages.
   Les calculs astrologiques V121 ne sont pas modifiés.
   Recherche principale Open-Meteo, complétée par Photon/OSM pour les petites communes,
   villages et hameaux. Le fuseau IANA est résolu au moment du choix du lieu. */
(function(){
'use strict';
if(window.__AP_V170_PROFILE_INPUTS_PLACES__)return;
window.__AP_V170_PROFILE_INPUTS_PLACES__=true;

const GEO_URL='https://geocoding-api.open-meteo.com/v1/search';
const PHOTON_URL='https://photon.komoot.io/api/';
const TZ_URL='https://api.open-meteo.com/v1/forecast';
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
    if(d.length===3&&Number(d.slice(0,2))>23){h=d.slice(0,1);m=d.slice(1);}
    else if(d.length>=3){h=d.slice(0,2);m=d.slice(2);}
    else{h=d;m='';}
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
function uniqParts(parts){
  const out=[];
  for(const x of parts.map(v=>String(v||'').trim()).filter(Boolean)){
    if(!out.some(y=>y.toLowerCase()===x.toLowerCase()))out.push(x);
  }
  return out;
}
function resultLabel(v){
  return uniqParts([v.postcode,v.admin4,v.admin3,v.admin2,v.admin1,v.country]).filter(x=>x!==v.name).slice(0,4).join(' · ');
}
function localMatches(q){
  try{
    if(!Array.isArray(window.VILLES))return[];
    const s=q.toLowerCase();
    return window.VILLES.filter(v=>String((v.n||'')+' '+(v.p||'')).toLowerCase().includes(s)).slice(0,10).map(v=>({
      name:v.n,country:v.p||'',admin1:'',postcode:'',latitude:Number(v.lat),longitude:Number(v.lon),timezone:v.tz||'',source:'local'
    })).filter(v=>v.name&&Number.isFinite(v.latitude)&&Number.isFinite(v.longitude));
  }catch(e){return[];}
}
async function openMeteoMatches(q){
  const url=GEO_URL+'?name='+encodeURIComponent(q)+'&count=40&language=fr&format=json';
  const r=await fetch(url,{headers:{'Accept':'application/json'}});
  if(!r.ok)throw new Error('Open-Meteo indisponible');
  const data=await r.json();
  return Array.isArray(data.results)?data.results.map(v=>({
    id:'om-'+(v.id||''),
    name:v.name||'',
    country:v.country||v.country_code||'',
    admin1:v.admin1||'',admin2:v.admin2||'',admin3:v.admin3||'',admin4:v.admin4||'',
    postcode:v.postcodes?.[0]||v.postcode||'',
    latitude:Number(v.latitude),longitude:Number(v.longitude),
    timezone:v.timezone||'',source:'openmeteo'
  })).filter(v=>v.name&&Number.isFinite(v.latitude)&&Number.isFinite(v.longitude)):[];
}
function photonPlaceFeature(f){
  const p=f&&f.properties||{};
  const key=String(p.osm_key||'').toLowerCase();
  const value=String(p.osm_value||p.type||'').toLowerCase();
  const accepted=new Set(['city','town','village','hamlet','municipality','borough','suburb','quarter','neighbourhood','locality','isolated_dwelling']);
  if(!(key==='place'||accepted.has(value)))return null;
  const c=Array.isArray(f.geometry?.coordinates)?f.geometry.coordinates:[];
  const lon=Number(c[0]),lat=Number(c[1]);
  if(!p.name||!Number.isFinite(lat)||!Number.isFinite(lon))return null;
  return {
    id:'ph-'+String(p.osm_type||'')+'-'+String(p.osm_id||''),
    name:p.name,
    country:p.country||p.countrycode||'',
    admin1:p.state||'',admin2:p.county||'',admin3:p.city||p.district||'',admin4:'',
    postcode:p.postcode||'',
    latitude:lat,longitude:lon,timezone:'',source:'photon'
  };
}
async function photonMatches(q){
  const url=PHOTON_URL+'?q='+encodeURIComponent(q)+'&limit=35&lang=fr';
  const r=await fetch(url,{headers:{'Accept':'application/json'}});
  if(!r.ok)throw new Error('Photon indisponible');
  const data=await r.json();
  return Array.isArray(data.features)?data.features.map(photonPlaceFeature).filter(Boolean):[];
}
function mergePlaces(){
  const out=[],seen=new Set();
  for(const list of arguments){
    for(const v of (list||[])){
      const key=[String(v.name||'').toLowerCase(),Number(v.latitude).toFixed(3),Number(v.longitude).toFixed(3)].join('|');
      if(seen.has(key))continue;
      seen.add(key);out.push(v);
    }
  }
  return out.slice(0,35);
}
async function resolveTimezone(v){
  if(v.timezone)return v.timezone;
  const url=TZ_URL+'?latitude='+encodeURIComponent(v.latitude)+'&longitude='+encodeURIComponent(v.longitude)+'&current=temperature_2m&forecast_days=1&timezone=auto';
  const r=await fetch(url,{headers:{'Accept':'application/json'}});
  if(!r.ok)throw new Error('Fuseau horaire introuvable');
  const data=await r.json();
  if(!data.timezone||!String(data.timezone).includes('/'))throw new Error('Fuseau horaire introuvable');
  return String(data.timezone);
}
function renderPlaces(res,rows){
  if(!res)return;
  if(!rows.length){
    res.innerHTML='<div class="ap-note" style="margin-top:8px">Aucun lieu trouvé. Essayez le nom de la ville, du village ou du hameau, éventuellement avec le pays.</div>';
    return;
  }
  res.innerHTML=rows.map((v,i)=>'<button type="button" class="ap-profile-row" data-v170-place="'+i+'" style="width:100%;cursor:pointer;text-align:left;margin-top:5px"><div class="ap-avatar">⌖</div><div><strong>'+esc(v.name)+'</strong><small>'+esc(resultLabel(v)||v.country||'')+(v.timezone?' · '+esc(v.timezone):'')+'</small></div></button>').join('');
  res._v170Places=rows;
  res.querySelectorAll('[data-v170-place]').forEach(b=>b.addEventListener('click',async()=>{
    const v=res._v170Places[Number(b.dataset.v170Place)];if(!v)return;
    const search=document.getElementById('ap-p-city-search'),lat=document.getElementById('ap-p-lat'),lon=document.getElementById('ap-p-lon'),tz=document.getElementById('ap-p-tz');
    if(!search||!lat||!lon||!tz)return;
    search.value=v.name;
    search.dataset.v170Selected='';
    lat.value=String(v.latitude);lon.value=String(v.longitude);tz.value='';
    res.innerHTML='<div class="ap-note" style="margin-top:8px">Validation du lieu et du fuseau horaire…</div>';
    try{
      const zone=await resolveTimezone(v);
      tz.value=zone;
      search.dataset.v170Selected='1';
      search.dataset.v170PlaceLabel=resultLabel(v)||v.country||'';
      res.innerHTML='<div class="ap-note" style="margin-top:8px">✓ '+esc(v.name)+(resultLabel(v)?' · '+esc(resultLabel(v)):'')+' · '+esc(zone)+'</div>';
    }catch(e){
      lat.value='';lon.value='';tz.value='';
      res.innerHTML='<div class="ap-error show" style="margin-top:8px">Impossible de valider le fuseau horaire de ce lieu. Choisissez une autre proposition ou réessayez.</div>';
    }
  }));
}
function bindWorldCitySearch(search,res){
  if(!search||!res||search.dataset.v170World)return;
  search.dataset.v170World='1';
  search.setAttribute('autocomplete','off');
  search.placeholder='Ville, village ou hameau — monde entier';
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
    else res.innerHTML='<div class="ap-note" style="margin-top:8px">Recherche mondiale…</div>';
    debounceTimer=setTimeout(async()=>{
      const results=[];
      const settled=await Promise.allSettled([openMeteoMatches(q),photonMatches(q)]);
      for(const x of settled)if(x.status==='fulfilled')results.push(x.value);
      if(serial!==requestSerial)return;
      const rows=mergePlaces(local,...results);
      renderPlaces(res,rows);
      if(!rows.length&&settled.every(x=>x.status==='rejected')){
        res.innerHTML='<div class="ap-note" style="margin-top:8px">La recherche mondiale est momentanément indisponible. Réessayez dans quelques instants.</div>';
      }
    },320);
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