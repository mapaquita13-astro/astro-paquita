/* Astro Paquita V194 — correction de la liaison aux calculs natals V121.
   Ephemerides : AstroTruth.computeProfile -> moteur astronomique V121 existant.
   Les aspects ne sont émis que s'ils sont calculés à <= 1° d'orbe.
   Révolution solaire : maisons uniquement si lieu de présence précisément fourni.
   Firdaria : ordre jour/nuit, noeuds en fin de cycle, année moyenne 365,2425 j.
*/
(function(){
'use strict';
if(window.APForecastMethods)return;
const SIGNS=['Bélier','Taureau','Gémeaux','Cancer','Lion','Vierge','Balance','Scorpion','Sagittaire','Capricorne','Verseau','Poissons'];
const RULERS=['Mars','Vénus','Mercure','Lune','Soleil','Mercure','Vénus','Mars','Jupiter','Saturne','Saturne','Jupiter'];
const LONG=['Jupiter','Saturne','Uranus','Neptune','Pluton'];
const PROG=['Soleil','Lune','Mercure','Vénus','Mars'];
const NATAL_TARGETS=['Soleil','Lune','Mercure','Vénus','Mars','Jupiter','Saturne','Ascendant','MC'];
const ASPECTS=[0,60,90,120,180];
const NAMES={'0':'conjonction','60':'sextile','90':'carré','120':'trigone','180':'opposition'};
const YEARS=365.2425;
const RAD=Math.PI/180;
function finite(x){return x!==null&&x!==undefined&&x!==''&&Number.isFinite(Number(x))}
function mod(x,m){return ((x%m)+m)%m}
function angle(x,y){return Math.abs(mod(x-y+180,360)-180)}
function signed(x,y){return mod(x-y+180,360)-180}
function iso(d){return [d.getUTCFullYear(),String(d.getUTCMonth()+1).padStart(2,'0'),String(d.getUTCDate()).padStart(2,'0')].join('-')}
function fromIso(s){const d=new Date(String(s)+'T12:00:00Z');return Number.isNaN(d.getTime())?null:d}
function civil(d){return [String(d.getUTCDate()).padStart(2,'0'),String(d.getUTCMonth()+1).padStart(2,'0'),d.getUTCFullYear()].join('/')}
function birthDate(p){const s=String(p.date||'').trim(),m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);if(m)return new Date(Date.UTC(+m[3],+m[2]-1,+m[1],12));if(/^\d{4}-\d\d-\d\d$/.test(s))return fromIso(s);return null}
function diffYears(a,b){return (a.getTime()-b.getTime())/(YEARS*86400000)}
function birthdayAge(date,birth){let age=date.getUTCFullYear()-birth.getUTCFullYear();const m=date.getUTCMonth()-birth.getUTCMonth();if(m<0||(m===0&&date.getUTCDate()<birth.getUTCDate()))age--;return Math.max(0,age)}
function positionValue(map,name){
 const direct=map?.[name];
 if(finite(direct))return Number(direct);
 // Le moteur historique V121 utilise "Venus", la couche récente "Vénus".
 if(name==='Vénus'&&finite(map?.Venus))return Number(map.Venus);
 if(name==='Venus'&&finite(map?.['Vénus']))return Number(map['Vénus']);
 return null;
}
function numericPos(r,name){return positionValue(r?.pos,name)}
function natalPos(n,name){
 if(name==='Ascendant')return finite(n.angles?.ascendant)?Number(n.angles.ascendant):null;
 if(name==='MC')return finite(n.angles?.mc)?Number(n.angles.mc):null;
 return positionValue(n.positions,name);
}
function houseOf(lon,asc){if(!finite(lon)||!finite(asc))return null;return mod(Math.floor(Number(lon)/30)-Math.floor(Number(asc)/30),12)+1}
function cuspsAsArray(data){
 if(!data)return null;
 const x=Array.isArray(data)?(data.length>=13?data.slice(1,13):data.slice(0,12)):Array.from({length:12},(_,i)=>data['H'+(i+1)]??data[i+1]??data[String(i+1)]);
 if(x.length!==12||x.some(n=>!finite(n)))return null;
 return x.map(Number);
}
function placidusHouse(lon,cusps){
 if(!finite(lon)||!cusps)return null;
 for(let i=0;i<12;i++){
  const from=mod(cusps[i],360),to=mod(cusps[(i+1)%12],360);
  const width=mod(to-from,360),offset=mod(Number(lon)-from,360);
  if(width>0&&offset<width)return i+1;
 }
 return null;
}
function aspectsBetween(current,natal,sourceNames,targets,max,group){
 const xs=[];
 for(const source of sourceNames){
  const a=numericPos(current,source);if(a===null)continue;
  for(const target of targets){
   const b=natalPos(natal,target);if(b===null)continue;
   const distance=angle(a,b);
   for(const aspect of ASPECTS){
    const orb=Math.abs(distance-aspect);
    if(orb<=1.000001)xs.push({method:group,source,target,aspect,aspectName:NAMES[aspect],orb:+orb.toFixed(3),natalHouse:houseOf(b,natal.angles?.ascendant),transitHouse:houseOf(a,natal.angles?.ascendant)});
   }
  }
 }
 return xs.sort((a,b)=>a.orb-b.orb).slice(0,max);
}
function sectOf(n){
 const sun=natalPos(n,'Soleil');
 const jd=Number(n?.rawJd);
 const lat=Number(n?.latitude),lon=Number(n?.longitude);
 if(!finite(sun)||!finite(jd)||!finite(lat)||!finite(lon)||Math.abs(lat)>90)return null;
 const T=(jd-2451545.0)/36525;
 const gmst=mod(280.46061837+360.98564736629*(jd-2451545.0)+0.000387933*T*T-T*T*T/38710000,360);
 const eps=(23.439291-0.0130042*T)*RAD, l=sun*RAD,phi=lat*RAD;
 const ra=Math.atan2(Math.sin(l)*Math.cos(eps),Math.cos(l));
 const dec=Math.asin(Math.sin(eps)*Math.sin(l));
 const hour=(mod(gmst+lon,360)*RAD)-ra;
 const alt=Math.asin(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(hour))/RAD;
 if(Math.abs(alt)<2)return {sect:'indéterminé',altitude:+alt.toFixed(2)};
 return {sect:alt>0?'diurne':'nocturne',altitude:+alt.toFixed(2)};
}
const DAY=[['Soleil',10],['Vénus',8],['Mercure',13],['Lune',9],['Saturne',11],['Jupiter',12],['Mars',7]];
const NIGHT=[['Lune',9],['Saturne',11],['Jupiter',12],['Mars',7],['Soleil',10],['Vénus',8],['Mercure',13]];
function firdaria(date,birth,sect){
 if(!birth||(sect!=='diurne'&&sect!=='nocturne'))return null;
 const age=diffYears(date,birth);if(age<0)return null;
 const order=sect==='diurne'?DAY:NIGHT;
 const cycle=mod(age,75);
 const majors=[...order,['Nœud Nord',3],['Nœud Sud',2]];
 let elapsed=0;
 for(const [name,years] of majors){
  if(cycle>=elapsed+years){elapsed+=years;continue}
  const duration=years,offset=cycle-elapsed;
  let sub=null;
  if(duration>3){
   const pos=order.findIndex(([n])=>n===name);
   const subIndex=Math.max(0,Math.min(6,Math.floor(offset/(duration/7))));
   sub=order[(pos+subIndex)%7][0];
  }
  return {sect,major:name,sub,majorStartAge:+elapsed.toFixed(3),years:duration,variant:'noeuds en fin de cycle'};
 }
 return null;
}
function profection(date,birth,asc){
 if(!birth||date.getTime()<birth.getTime()||!finite(asc))return null;
 const age=birthdayAge(date,birth),house=(age%12)+1;
 const signIndex=mod(Math.floor(asc/30)+age,12);
 return {age,house,sign:SIGNS[signIndex],lord:RULERS[signIndex],houseSystem:'signes entiers'};
}
function makeEngine(A,profile){
 const natalRaw=A.computeProfile(profile);
 const natal=A.natal(profile);
 const birth=birthDate(profile);
 if(!birth)throw Error('Date de naissance manquante');
 const n={...natal,rawJd:natalRaw.jd,latitude:profile.lat,longitude:profile.lon};
 const cache=new Map();
 function positionAt(d,geo){
  const loc=geo&&finite(geo.lat)&&finite(geo.lon)?geo:null;
  const latitude=loc?Number(loc.lat):Number(profile.lat),longitude=loc?Number(loc.lon):Number(profile.lon);
  const key=d.toISOString().slice(0,16)+'|'+latitude+','+longitude;
  if(cache.has(key))return cache.get(key);
  const jd=d.getTime()/86400000+2440587.5;
  let value;
  // Le moteur V121 fournit directement des fonctions astronomiques capables
  // de calculer un JD UTC sans fabriquer un profil de naissance fictif.
  if(typeof window.calcPos==='function'&&typeof window.calcASMC==='function'){
   const pos=window.calcPos(jd);
   const angles=window.calcASMC(jd,latitude,longitude);
   let cusps=null;
   if(typeof window.prevHouseCuspsV80==='function'){
    try{cusps=window.prevHouseCuspsV80(angles.AS,angles.MC,jd,latitude,longitude)}
    catch(e){console.warn('Maisons Placidus non calculables pour ce lieu',e?.message||e)}
   }
   value={jd,pos,AS:angles.AS,MC:angles.MC,cusps,houseSystem:cusps?cusps._system||'Placidus':null};
  }else{
   // Compatibilité : "UTC" était rejeté par AstroTruth.isIana().
   // Etc/UTC est reconnu et assure le même instant sans décalage de fuseau.
   const fake={...profile,date:civil(d),
    heure:String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0'),
    tz:'Etc/UTC',timeStatus:'exact',lat:latitude,lon:longitude};
   value=A.computeProfile(fake);
  }
  cache.set(key,value);
  return value;
 }
 function progress(date){
  const age=diffYears(date,birth);
  // UTC calculé par le moteur natal validé, évite de traiter l'heure locale comme UTC.
  const base=new Date((Number(natalRaw.jd)-2440587.5)*86400000);
  return positionAt(new Date(base.getTime()+age*86400000));
 }
 function solarReturn(year,location){
  const sun=natalPos(n,'Soleil');if(sun===null)return null;
  const start=new Date(Date.UTC(year,birth.getUTCMonth(),birth.getUTCDate(),12)-4*86400000);
  let lo=null,hi=null,lv=null;
  for(let k=0;k<=9;k++){
   const d=new Date(start.getTime()+k*86400000);
   const pos=positionAt(d),v=numericPos(pos,'Soleil');
   if(v===null)return null;
   const delta=signed(v,sun);
   if(lv!==null&&lv<=0&&delta>=0&&Math.abs(delta-lv)<8){lo=new Date(d.getTime()-86400000);hi=d;break}
   lv=delta;
  }
  if(!lo)return null;
  for(let i=0;i<14;i++){
   const middle=new Date(Math.round((lo.getTime()+hi.getTime())/120000)*60000);
   const difference=signed(numericPos(positionAt(middle),'Soleil'),sun);
   if(difference<0)lo=middle;else hi=middle;
  }
  const when=new Date(Math.round((lo.getTime()+hi.getTime())/120000)*60000);
  const valid=location&&finite(location.lat)&&finite(location.lon)&&Math.abs(Number(location.lat))<=90&&Math.abs(Number(location.lon))<=180;
  const geo=valid?{city:String(location.city||''),lat:Number(location.lat),lon:Number(location.lon),tz:String(location.tz||'UTC')}:null;
  const p=positionAt(when,geo);
  let localDate=null;
  if(geo){try{localDate=new Intl.DateTimeFormat('fr-FR',{timeZone:geo.tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(when)}
   catch(e){localDate=null}}
  return {instantUtc:when.toISOString(),localDate,referenceZone:geo?.tz||null,location:geo,
    method:geo?'révolution solaire : retour exact du Soleil natal ; angles et maisons recalculés au lieu fourni':'retour du Soleil natal ; maisons indisponibles sans lieu de présence',
    sunOrb:+angle(numericPos(p,'Soleil'),sun).toFixed(3),
    ascendant:geo&&finite(p.AS)?+Number(p.AS).toFixed(3):null,
    mc:geo&&finite(p.MC)?+Number(p.MC).toFixed(3):null,
    houseSystem:geo&&p.cusps?(p.houseSystem||'Placidus'):null,
    houseCusps:geo&&p.cusps?p.cusps:null,
    planets:geo?Object.entries(p.pos||{}).filter(([,lon])=>finite(lon)).map(([name,lon])=>({name,longitude:+Number(lon).toFixed(3),house:placidusHouse(lon,cuspsAsArray(p.cusps))})):[],
    aspects:aspectsBetween(p,n,['Lune','Vénus','Mars','Jupiter','Saturne','Uranus','Neptune','Pluton'],['Soleil','Lune','Vénus','Mars','Ascendant','MC'],14,'revolution_solaire')};
 }
 return {n,birth,positionAt,progress,solarReturn,sect:sectOf(n)};
}
async function compute({A,profile,truth,jobActive,locations}){
 if(!A||typeof A.computeProfile!=='function'||!profile)throw Error('Moteur natal indisponible');
 const eng=makeEngine(A,profile);
 const preciseBirth=(profile.timeStatus||'exact')==='exact';
 if(!preciseBirth)eng.sect=null;
 const points=[];
 for(let i=0;i<(truth.points||[]).length;i++){
  if(jobActive&&!jobActive())throw Error('CALC_CANCELLED');
  const b=truth.points[i],from=fromIso(b.start),to=fromIso(b.end);
  if(!from||!to)continue;
  const d=new Date((from.getTime()+to.getTime())/2);
  const progressed=preciseBirth?eng.progress(d):null;
  const natalSun=natalPos(eng.n,'Soleil'),progSun=numericPos(progressed,'Soleil');
  const solarArc=preciseBirth&&natalSun!==null&&progSun!==null?mod(progSun-natalSun,360):null;
  const solarArcChart=solarArc===null?null:{pos:Object.fromEntries(Object.entries(eng.n.positions||{}).filter(([,lon])=>finite(lon)).map(([key,lon])=>[key,mod(Number(lon)+solarArc,360)]))};
  const solarArcDirections=solarArcChart?aspectsBetween(solarArcChart,eng.n,['Soleil','Lune','Mercure','Vénus','Mars','Jupiter','Saturne','Uranus','Neptune','Pluton'],NATAL_TARGETS,10,'direction_arc_solaire'):[];
  // Les transits lents sont testés à intervalles de six jours maximum.
  // Chaque configuration est dédoublonnée en conservant son orbe le plus serré.
  const slowCandidates=new Map();
  const duration=Math.max(0,Math.round((to.getTime()-from.getTime())/86400000));
  const offsets=new Set([0,duration]);
  for(let day=0;day<=duration;day+=6)offsets.add(day);
  for(const offset of [...offsets].sort((a,b)=>a-b)){
   if(jobActive&&!jobActive())throw Error('CALC_CANCELLED');
   const date=new Date(from.getTime()+offset*86400000);
   const trans=eng.positionAt(date);
   const aspects=aspectsBetween(trans,eng.n,LONG,preciseBirth?NATAL_TARGETS:NATAL_TARGETS.filter(x=>x!=='Lune'&&x!=='Ascendant'&&x!=='MC'),40,'transit_lent');
   for(const a of aspects){
    const key=[a.source,a.target,a.aspect].join('|');
    const prior=slowCandidates.get(key);
    if(!prior||a.orb<prior.orb)slowCandidates.set(key,{...a,observedDate:iso(date)});
   }
  }
  const slowTransits=[...slowCandidates.values()].sort((a,b)=>a.orb-b.orb).slice(0,12);
  points.push({period:b.label,date:iso(d),
    slowTransits,
    progressions:progressed?aspectsBetween(progressed,eng.n,PROG,['Soleil','Lune','Vénus','Mars','Saturne','Ascendant','MC'],7,'progression_secondaire'):[],
    solarArcDegrees:solarArc===null?null:+solarArc.toFixed(3),
    solarArcDirections,
    profection:profection(d,eng.birth,eng.n.angles?.ascendant),
    firdaria:firdaria(d,eng.birth,eng.sect?.sect)});
  if(i%2===1)await new Promise(resolve=>setTimeout(resolve,0));
 }
 const solarYears=[...new Set([Number(truth.start.slice(0,4))-1,Number(truth.start.slice(0,4)),Number(truth.end.slice(0,4))])].sort((a,b)=>a-b);
 const candidates=[];
 for(const year of (preciseBirth?solarYears:[])){if(jobActive&&!jobActive())throw Error('CALC_CANCELLED');
  try{const sr=eng.solarReturn(year,locations?.[year]);if(sr)candidates.push({year,...sr})}catch(e){console.warn('Retour solaire non disponible',year,e?.message||e)}
 }
 candidates.sort((a,b)=>a.instantUtc.localeCompare(b.instantUtc));
 const prior=candidates.filter(x=>x.instantUtc.slice(0,10)<truth.start).slice(-1);
 const inPeriod=candidates.filter(x=>x.instantUtc.slice(0,10)>=truth.start&&x.instantUtc.slice(0,10)<=truth.end);
 const solarReturns=[...prior,...inPeriod];
 return {engine:'V121 + calculs complémentaires V194',orbDegrees:1,precision:'transits lents relevés tous les 6 jours au maximum ; progressions relevées au milieu du segment ; aucune prétention à un relevé des exactitudes à la minute',
  natalTimeStatus:profile.timeStatus||'exact',sect:eng.sect,points,solarReturns,
  unavailable:[...(!solarReturns.some(x=>x.houseCusps)?['maisons de révolution solaire : renseigner les coordonnées du lieu de présence de chaque année concernée']:[]),
    ...(!preciseBirth?['progressions précises, direction d’arc solaire, révolution solaire et firdaria : heure natale exacte manquante']:[])]};
}
window.APForecastMethods={compute,version:'v194',_test:{angle,profection,firdaria,sectOf,birthdayAge,signed}};
})();