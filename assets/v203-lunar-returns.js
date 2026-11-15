/* Astro Paquita V203 — exact lunar return timestamps (tropical geocentric longitude).
   Independent of event descriptions; no claim that a return causes an event. */
(function(){
'use strict';
if(window.APLunarReturns)return;
const DAY=86400000;
const mod=x=>(x%360+360)%360;
const signed=x=>mod(x+180)-180;
const value=(obj,key)=>{const v=obj?.[key]??(key==='Vénus'?obj?.Venus:null);return v===null||v===undefined||v===''||!Number.isFinite(Number(v))?null:Number(v);};
const iso=t=>new Date(t).toISOString().slice(0,10);
const fmt=(t,tz)=>{try{return new Intl.DateTimeFormat('fr-FR',{timeZone:tz||'Europe/Paris',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(t))}catch(e){return new Date(t).toISOString()}};
function cusps12(x){if(!x)return null;const a=Array.isArray(x)?(x.length>=13?x.slice(1,13):x.slice(0,12)):Array.from({length:12},(_,i)=>x['H'+(i+1)]??x[i+1]??x[String(i+1)]);return a.length===12&&a.every(v=>v!==null&&Number.isFinite(Number(v)))?a.map(Number):null}
function house(lon,cusps){if(lon===null||!cusps)return null;for(let i=0;i<12;i++){const from=mod(cusps[i]),width=mod(cusps[(i+1)%12]-from);if(width&&mod(lon-from)<width)return i+1}return null}
async function compute({A,profile,start,end,location,jobActive}){
 if(!A?.natal||!profile||typeof window.calcPos!=='function')throw Error('Éphéméride lunaire indisponible');
 const n=A.natal(profile),natalMoon=value(n.positions,'Lune');
 if(natalMoon===null)throw Error('Lune natale non calculée');
 const a=Date.parse(start+'T00:00:00Z'),b=Date.parse(end+'T23:59:59Z');
 if(!Number.isFinite(a)||!Number.isFinite(b)||b<a)throw Error('Période de calcul invalide');
 const memo=new Map();
 function at(t){const key=Math.round(t/60000);if(memo.has(key))return memo.get(key);const pos=window.calcPos(t/DAY+2440587.5),moon=value(pos,'Lune');if(moon===null)throw Error('Lune transit indisponible');const x={pos,moon};memo.set(key,x);return x}
 function delta(t){return signed(at(t).moon-natalMoon)}
 function bisect(lo,hi){for(let i=0;i<28&&hi-lo>30000;i++){const mid=(lo+hi)/2;if(delta(mid)<0)lo=mid;else hi=mid}return Math.round((lo+hi)/120000)*60000}
 const place=location&&Number.isFinite(Number(location.lat))&&Number.isFinite(Number(location.lon))&&location.tz?location:null;
 const startScan=a-29*DAY,out=[];
 let previous=startScan,prev=delta(previous),checks=0;
 for(let now=startScan+DAY;now<=b+DAY;now+=DAY){
  if(jobActive&&!jobActive())throw Error('CALC_CANCELLED');
  const d=delta(now);
  // Ignore the +180/-180 wrap and only solve a true crossing near 0°.
  if(prev<=0&&d>=0&&d-prev>0&&d-prev<28){
   const t=bisect(previous,now),row=at(t);
   if(t>=a-29*DAY&&t<=b){
    let houses=null,angles=null;
    if(place&&typeof window.calcASMC==='function'&&typeof window.prevHouseCuspsV80==='function'){
     try{const jd=t/DAY+2440587.5;angles=window.calcASMC(jd,Number(place.lat),Number(place.lon));houses=cusps12(window.prevHouseCuspsV80(angles.AS,angles.MC,jd,Number(place.lat),Number(place.lon)))}catch(e){}
    }
    const occupants=Object.entries(row.pos||{}).filter(([name,v])=>value(row.pos,name)!==null).map(([name,v])=>({name,house:house(Number(v),houses)}));
    out.push({date:iso(t),instantUtc:new Date(t).toISOString(),localDate:fmt(t,place?.tz||profile.tz),orbMoon:+Math.abs(delta(t)).toFixed(3),housesAvailable:!!houses,houseV:occupants.filter(x=>x.house===5).map(x=>x.name),houseIX:occupants.filter(x=>x.house===9).map(x=>x.name),method:'revolution_lunaire'});
   }
  }
  previous=now;prev=d;checks++;
  if(checks%30===0)await new Promise(resolve=>setTimeout(resolve,0));
 }
 const active=out.filter(x=>x.instantUtc.slice(0,10)>=start&&x.instantUtc.slice(0,10)<=end),prior=out.filter(x=>x.instantUtc.slice(0,10)<start).slice(-1);
 return {version:'v203',returns:[...prior,...active],houseLocation:place?{city:place.city,tz:place.tz}:null,method:'Lunar longitude tropical exact crossing with 1-minute bisection',notes:'Angles et maisons uniquement pour un lieu expressément renseigné'};
}
window.APLunarReturns={version:'v203',compute};
})();