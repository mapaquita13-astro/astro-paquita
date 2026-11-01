/* Astro Paquita V190 — calculs complémentaires de prévisions, sans modifier V121.
   Ephemerides : AstroTruth.computeProfile -> moteur astronomique V121 existant.
   Les aspects ne sont émis que s'ils sont calculés à <= 1° d'orbe.
   Révolution solaire : instant de retour du Soleil calculé, sans maisons (lieu de RS inconnu).
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
function numericPos(r,name){return finite(r?.pos?.[name])?Number(r.pos[name]):null}
function natalPos(n,name){if(name==='Ascendant')return finite(n.angles?.ascendant)?Number(n.angles.ascendant):null;if(name==='MC')return finite(n.angles?.mc)?Number(n.angles.mc):null;return finite(n.positions?.[name])?Number(n.positions[name]):null}
function houseOf(lon,asc){if(!finite(lon)||!finite(asc))return null;return mod(Math.floor(Number(lon)/30)-Math.floor(Number(asc)/30),12)+1}
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
 function positionAt(d){
  const key=d.toISOString().slice(0,16);
  if(cache.has(key))return cache.get(key);
  const fake={...profile,date:civil(d),heure:String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0'),timeStatus:'exact'};
  const value=A.computeProfile(fake);
  cache.set(key,value);
  return value;
 }
 function progress(date){
  const age=diffYears(date,birth);
  const base=new Date(birth);
  const hm=String(profile.heure||'12:00').split(':').map(Number);
  base.setUTCHours(Number.isFinite(hm[0])?hm[0]:12,Number.isFinite(hm[1])?hm[1]:0,0,0);
  return positionAt(new Date(base.getTime()+age*86400000));
 }
 function solarReturn(year){
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
  const p=positionAt(when);
  return {instantLocalReference:iso(when)+' '+String(when.getUTCHours()).padStart(2,'0')+':'+String(when.getUTCMinutes()).padStart(2,'0'),referenceZone:profile.tz,
    method:'retour du Soleil à sa longitude natale; coordonnées planétaires seulement; maisons RS non calculées',
    sunOrb:+angle(numericPos(p,'Soleil'),sun).toFixed(3),
    aspects:aspectsBetween(p,n,['Vénus','Mars','Jupiter','Saturne','Uranus','Neptune','Pluton'],['Soleil','Lune','Vénus','Mars','Ascendant','MC'],10,'revolution_solaire')};
 }
 return {n,birth,positionAt,progress,solarReturn,sect:sectOf(n)};
}
async function compute({A,profile,truth,jobActive}){
 if(!A||typeof A.computeProfile!=='function'||!profile)throw Error('Moteur natal indisponible');
 const eng=makeEngine(A,profile);
 if((profile.timeStatus||'exact')!=='exact')eng.sect=null;
 const points=[];
 for(let i=0;i<(truth.points||[]).length;i++){
  if(jobActive&&!jobActive())throw Error('CALC_CANCELLED');
  const b=truth.points[i],from=fromIso(b.start),to=fromIso(b.end);
  if(!from||!to)continue;
  const d=new Date((from.getTime()+to.getTime())/2);
  const trans=eng.positionAt(d);
  const progressed=eng.progress(d);
  points.push({period:b.label,date:iso(d),
    slowTransits:aspectsBetween(trans,eng.n,LONG,NATAL_TARGETS,9,'transit_lent'),
    progressions:aspectsBetween(progressed,eng.n,PROG,['Soleil','Lune','Vénus','Mars','Saturne','Ascendant','MC'],7,'progression_secondaire'),
    profection:profection(d,eng.birth,eng.n.angles?.ascendant),
    firdaria:firdaria(d,eng.birth,eng.sect?.sect)});
  if(i%3===2)await new Promise(resolve=>setTimeout(resolve,0));
 }
 const solarYears=[...new Set([Number(truth.start.slice(0,4))-1,Number(truth.start.slice(0,4)),Number(truth.end.slice(0,4))])].sort((a,b)=>a-b);
 const candidates=[];
 for(const year of solarYears){if(jobActive&&!jobActive())throw Error('CALC_CANCELLED');
  try{const sr=eng.solarReturn(year);if(sr)candidates.push({year,...sr})}catch(e){console.warn('Retour solaire non disponible',year,e?.message||e)}
 }
 candidates.sort((a,b)=>a.instantLocalReference.localeCompare(b.instantLocalReference));
 const prior=candidates.filter(x=>x.instantLocalReference.slice(0,10)<truth.start).slice(-1);
 const inPeriod=candidates.filter(x=>x.instantLocalReference.slice(0,10)>=truth.start&&x.instantLocalReference.slice(0,10)<=truth.end);
 const solarReturns=[...prior,...inPeriod];
 return {engine:'V121 + calculs complémentaires V190',orbDegrees:1,precision:'relevés au milieu de chaque segment ; recherches des aspects au relevé seulement',
  natalTimeStatus:profile.timeStatus||'exact',sect:eng.sect,points,solarReturns,
  unavailable:['éclipses : non calculées (éphéméride des nœuds/lunaisons absente de ce module)','maisons de révolution solaire : ville de présence annuelle non renseignée']};
}
window.APForecastMethods={compute,version:'v190',_test:{angle,profection,firdaria,sectOf,birthdayAge,signed}};
})();