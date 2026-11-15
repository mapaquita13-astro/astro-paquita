/* Astro Paquita — Placidus semi-arc 3D primary directions V202.
   Implements true proportional diurnal/nocturnal semi-arcs with celestial
   latitude, natal RAMC and significator's proportional mundane position.
   Direct + converse, in mundo (real body) and in zodiaco (ecliptic aspects).
   Naibod and Ptolemy static keys. Not all historical variants (fixed stars,
   antiscions, bounds, mundane aspects, converse-birth variants) are enabled. */
(function(){
'use strict';
if(window.APPrimaryDirections)return;
const RAD=Math.PI/180,DEG=180/Math.PI,DAY=86400000,YEAR=365.2425,NAIBOD=0.98564733;
const NAMES=['Soleil','Lune','Mercure','Vénus','Mars','Jupiter','Saturne','Uranus','Neptune','Pluton'];
const EN={Soleil:'Sun',Lune:'Moon',Mercure:'Mercury','Vénus':'Venus',Mars:'Mars',Jupiter:'Jupiter',Saturne:'Saturn',Uranus:'Uranus',Neptune:'Neptune',Pluton:'Pluto'};
const num=x=>x!==null&&x!==undefined&&x!==''&&Number.isFinite(Number(x));
const mod=x=>(x%360+360)%360;
const signed=x=>mod(x+180)-180;
const pos=(map,k)=>{const v=map?.[k]??(k==='Vénus'?map?.Venus:null);return num(v)?Number(v):null};
const iso=ms=>new Date(ms).toISOString().slice(0,10);
function obliquity(jd){const t=(jd-2451545)/36525;return (23+26/60+21.448/3600-(46.815*t+0.00059*t*t-0.001813*t*t*t)/3600)*RAD}
function eq(lon,lat,eps){
 const l=mod(lon)*RAD,b=lat*RAD;
 const x=Math.cos(b)*Math.cos(l),y=Math.cos(b)*Math.sin(l)*Math.cos(eps)-Math.sin(b)*Math.sin(eps);
 const z=Math.cos(b)*Math.sin(l)*Math.sin(eps)+Math.sin(b)*Math.cos(eps);
 return {ra:mod(Math.atan2(y,x)*DEG),dec:Math.asin(Math.min(1,Math.max(-1,z)))*DEG,lon:mod(lon),lat};
}
function semi(c,lat){
 const v=Math.tan(lat*RAD)*Math.tan(c.dec*RAD);
 if(!Number.isFinite(v)||Math.abs(v)>=1)return null;
 const ad=Math.asin(v)*DEG;return {day:90+ad,night:90-ad,ad};
}
function seat(c,ramc,lat){
 const sa=semi(c,lat);if(!sa)return null;
 const d=signed(c.ra-ramc);
 let upper=Math.abs(d)<=sa.day+1e-8;
 let f=upper?d/sa.day:signed(d-180)/sa.night;
 if(!Number.isFinite(f)||Math.abs(f)>1.0001)return null;
 f=Math.max(-1,Math.min(1,f));
 return {upper,f,arc:upper?sa.day:sa.night,ramc,ra:c.ra,declination:c.dec,meridianDistance:d};
}
function latitudes(jd){
 const astronomy=window.Astronomy, out={};
 if(!astronomy?.GeoVector||!astronomy?.Ecliptic)return out;
 try{
  const date=new Date((jd-2440587.5)*DAY);
  for(const [name,code] of Object.entries(EN)){
   try{const x=astronomy.Ecliptic(astronomy.GeoVector(code,date,true));if(num(x?.elat))out[name]=Number(x.elat)}catch(e){}
  }
 }catch(e){}
 return out;
}
function build(A,p,options){
 const raw=A.computeProfile(p),n=A.natal(p),jd=Number(raw.jd),lat=Number(p.lat);
 if(!Number.isFinite(jd)||!num(n.angles?.mc)||!num(n.angles?.ascendant)||!num(lat)||Math.abs(lat)>=66)throw Error('Directions primaires : coordonnées ou heure de naissance incompatibles');
 const eps=obliquity(jd),birth=(jd-2440587.5)*DAY,ramc=eq(Number(n.angles.mc),0,eps).ra;
 const astronomicalLat=latitudes(jd);
 const realLatitudeReady=!!(window.Astronomy?.Ecliptic&&window.Astronomy?.GeoVector);
 const points={};for(const name of NAMES){const lon=pos(n.positions,name);if(lon===null)continue;const beta=num(astronomicalLat[name])?astronomicalLat[name]:null;points[name]={lon,beta,equatorial:beta===null?null:eq(lon,beta,eps),zodiacal:eq(lon,0,eps)}}
 const asc=Number(n.angles.ascendant),mc=Number(n.angles.mc);
 points.Ascendant={lon:asc,beta:0,equatorial:eq(asc,0,eps)};
 points.Descendant={lon:mod(asc+180),beta:0,equatorial:eq(asc+180,0,eps)};
 points.MC={lon:mc,beta:0,equatorial:eq(mc,0,eps)};
 points.IC={lon:mod(mc+180),beta:0,equatorial:eq(mc+180,0,eps)};
 const S=points.Soleil?.lon,M=points.Lune?.lon;
 if(S!==undefined&&M!==undefined){
  // Night/day sect from actual solar altitude relative to horizon
  const sun=points.Soleil.equatorial||points.Soleil.zodiacal,location=seat(sun,ramc,lat);
  if(location){
   const fortune=mod(asc+(location.upper?M-S:S-M));
   points.Fortune={lon:fortune,beta:0,equatorial:eq(fortune,0,eps)};
  }
 }
 return {points,lat,eps,ramc,birth,realLatitudeReady,jd,method:'Placidus semi-arcs 3D (proportional temporal position)'};
}
function compute(A,p,startISO,endISO,options){
 options=options||{};
 const chart=build(A,p,options);
 const from=Date.parse(startISO+'T00:00:00Z'),to=Date.parse(endISO+'T23:59:59Z');
 const key=options.key==='ptolemy'?1:NAIBOD;
 const signif=['Ascendant','Descendant','MC','IC','Soleil','Lune','Mercure','Vénus','Mars','Jupiter','Saturne','Fortune'];
 const out=[];
 const emit=(prom,sign,kind,aspect,cP)=>{
  const seatS=seat(sign.equatorial||sign.zodiacal,chart.ramc,chart.lat);
  const semiP=semi(cP,chart.lat);
  if(!seatS||!semiP)return;
  const base=mod(chart.ramc+(seatS.upper?0:180)+seatS.f*(seatS.upper?semiP.day:semiP.night));
  for(const direction of ['directe','converse']){
   const arc=direction==='directe'?mod(cP.ra-base):mod(base-cP.ra);
   const age=arc/key;
   if(age>115||age<=0.15)continue;
   const ms=chart.birth+age*YEAR*DAY;
   if(ms<from||ms>to)continue;
   out.push({date:iso(ms),method:'direction_primaire_placidus',kind,direction,promissor:prom,significator:sign.name,aspect,arc:+arc.toFixed(4),age:+age.toFixed(3),key:options.key==='ptolemy'?'Ptolémée (1°/an)':'Naibod (0,98564733°/an)',latitude:kind==='in_mundo'?cP.lat:0,orb:0,seatSignificator:seatS.upper?'diurne':'nocturne'});
  }
 }
 for(const n of signif){
  const s=chart.points[n];if(!s?.equatorial&&!s?.zodiacal)continue;
  const sign={...s,name:n};
  for(const name of NAMES){
   if(n===name)continue;
   const pnt=chart.points[name];if(!pnt)continue;
   // Mundo uses actual celestial latitude. If unavailable it is omitted, not approximated.
   if(pnt.equatorial)emit(name,sign,'in_mundo',0,pnt.equatorial);
   for(const aspect of [0,60,90,120,180]){
    // Zodiacal positions/aspect points lie on ecliptic (latitude zero).
    for(const side of aspect===0||aspect===180?[1]:[1,-1]){
     const c=eq(pnt.lon+aspect*side,0,chart.eps);
     emit(name,sign,'in_zodiaco',aspect,c);
    }
   }
  }
 }
 out.sort((a,b)=>a.date.localeCompare(b.date)||a.age-b.age);
 const dedup=[];
 const seen=new Set();
 for(const x of out){const k=[x.date,x.direction,x.kind,x.promissor,x.significator,x.aspect].join('|');if(!seen.has(k)){seen.add(k);dedup.push(x)}}
 return {method:chart.method,version:'v202',key:options.key||'naibod',realLatitudeReady:chart.realLatitudeReady,scope:'Placidus semi-arcs, in mundo conjunctions with real latitude (only when Astronomy Engine supplies it), zodiacal 0/60/90/120/180, direct/converse, significators ASC/DSC/MC/IC + seven classical planets + Fortune',points:dedup,limitations:['No fixed stars, antiscia, bounds, progressed key or mundane aspects beyond conjunctions.','Dates are symbolic direction-key dates, not clinical or statistical forecasts.'],source:'Method: true Placidus proportional semi-arc, astronomical latitude when available.'};
}
window.APPrimaryDirections={version:'v202',compute,_test:{eq,semi,seat,obliquity}};
})();