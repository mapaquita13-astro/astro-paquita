/* Astro Paquita V191: events astronomiques datés (Astronomy Engine, MIT).
   SearchGlobalSolarEclipse reports worldwide events, not local visibility.
   Zodiac contacts are symbolic astrological data, not scientific causal claims. */
(function(){
'use strict';
if(window.APForecastSkyEvents)return;
const ANGLES=[0,60,90,120,180];
const LABELS={0:'conjonction',60:'sextile',90:'carré',120:'trigone',180:'opposition'};
const BODIES=['Soleil','Lune','Mercure','Vénus','Mars','Jupiter','Saturne','Uranus','Neptune','Pluton'];
const OUTER=['Mercure','Vénus','Mars','Jupiter','Saturne','Uranus','Neptune','Pluton'];
const EN={Mercure:'Mercury','Vénus':'Venus',Mars:'Mars',Jupiter:'Jupiter',Saturne:'Saturn',Uranus:'Uranus',Neptune:'Neptune',Pluton:'Pluto'};
const SIGNS=['Bélier','Taureau','Gémeaux','Cancer','Lion','Vierge','Balance','Scorpion','Sagittaire','Capricorne','Verseau','Poissons'];
const DAY=86400000;
function dateOnly(d){return d.toISOString().slice(0,10)}
function isoDay(s){const d=new Date(s+'T00:00:00.000Z');return Number.isFinite(+d)?d:null}
function norm(v){return ((v%360)+360)%360}
function distance(a,b){return Math.abs(norm(a-b+180)-180)}
function delta(a,b){return norm(a-b+180)-180}
function coordOf(n,body){if(body==='Ascendant')return n.angles?.ascendant;if(body==='MC')return n.angles?.mc;return n.positions?.[body]}
function contacts(lon,n){
 const out=[];for(const b of [...BODIES,'Ascendant','MC']){
  const target=coordOf(n,b);
  if(target===null||target===undefined||!Number.isFinite(Number(target)))continue;
  const d=distance(lon,Number(target));
  for(const asp of ANGLES){const orb=Math.abs(d-asp);if(orb<=1.00001)out.push({target:b,aspect:asp,aspectName:LABELS[asp],orb:+orb.toFixed(3)})}
 }
 return out.sort((x,y)=>x.orb-y.orb).slice(0,8);
}
function placement(lon,n){
 const signIndex=Math.floor(norm(lon)/30),nAsc=coordOf(n,'Ascendant');
 return {longitude:+norm(lon).toFixed(3),sign:SIGNS[signIndex],degree:+(norm(lon)%30).toFixed(3),
  wholeSignHouse:Number.isFinite(Number(nAsc))&&nAsc!==null?((signIndex-Math.floor(norm(Number(nAsc))/30)+12)%12)+1:null,
  natalContacts:contacts(lon,n)};
}
function kindName(type,kind){
 const names=type==='solaire'?{partial:'partielle',annular:'annulaire',total:'totale',hybrid:'hybride'}:{penumbral:'pénombrale',partial:'partielle',total:'totale'};
 return names[kind]||String(kind);
}
function sunLon(lib,d){return norm(lib.SunPosition(d).elon)}
function moonLon(lib,d){return norm(lib.Ecliptic(lib.GeoVector('Moon',d,true)).elon)}
function collectEclipse(lib,search,next,start,end,type,natal){
 let result=search(new Date(start.getTime()-DAY));
 const out=[];
 for(let i=0;i<24&&result;i++){
  const d=result.peak.date;
  if(d.getTime()>end.getTime())break;
  if(d.getTime()>=start.getTime()){
   const lon=type==='solaire'?sunLon(lib,d):moonLon(lib,d);
   out.push({type,kind:kindName(type,result.kind),dateUtc:d.toISOString(),
    peakUtc:d.toISOString(),placeVisibility:'non évaluée',zodiac:placement(lon,natal),
    source:'Astronomy Engine: '+(type==='solaire'?'SearchGlobalSolarEclipse':'SearchLunarEclipse')});
  }
  result=next(result.peak);
 }
 return out;
}
function collectLunations(lib,start,end,natal){
 const out=[];
 for(const [angle,name] of [[0,'nouvelle lune'],[180,'pleine lune']]){
  let after=new Date(start.getTime()-DAY);
  for(let i=0;i<24;i++){
   const item=lib.SearchMoonPhase(angle,after,40);
   if(!item)break;
   const d=item.date;
   if(d.getTime()>end.getTime())break;
   if(d.getTime()>=start.getTime()){
    const lon=angle===0?sunLon(lib,d):moonLon(lib,d);
    out.push({type:name,dateUtc:d.toISOString(),zodiac:placement(lon,natal)});
   }
   after=new Date(d.getTime()+DAY);
  }
 }
 return out.sort((a,b)=>a.dateUtc.localeCompare(b.dateUtc));
}
function speed(lib,body,d){
 const at=new Date(d.getTime()-12*3600000),after=new Date(d.getTime()+12*3600000);
 return delta(lib.EclipticLongitude(body,after),lib.EclipticLongitude(body,at));
}
function stations(lib,start,end,natal,alive){
 const out=[];const begin=new Date(start.getTime()-3*DAY),last=new Date(end.getTime()+3*DAY);
 for(const planet of OUTER){
  if(alive&&!alive())throw Error('CALC_CANCELLED');
  const eng=EN[planet];let prev=begin,prevSpeed=speed(lib,eng,prev);
  for(let at=new Date(prev.getTime()+6*DAY);at<=last;at=new Date(at.getTime()+6*DAY)){
   const currentSpeed=speed(lib,eng,at);
   if(prevSpeed*currentSpeed<0){
    let low=new Date(prev),high=new Date(at),speed0=prevSpeed;
    for(let k=0;k<18;k++){
     const mid=new Date((low.getTime()+high.getTime())/2),sm=speed(lib,eng,mid);
     if(speed0*sm<=0)high=mid;
     else{low=mid;speed0=sm}
    }
    const date=new Date((low.getTime()+high.getTime())/2);
    if(date>=start&&date<=end){
     const lon=lib.EclipticLongitude(eng,date);
     out.push({planet,dateUtc:date.toISOString(),motion:currentSpeed<0?'rétrograde':'direct',zodiac:placement(lon,natal),method:'longitude géocentrique de date / vitesse par différence centrée sur 24 h'});
    }
   }
   prev=at;prevSpeed=currentSpeed;
  }
 }
 return out.sort((a,b)=>a.dateUtc.localeCompare(b.dateUtc));
}
async function compute({truth,natal,jobActive}){
 const lib=window.Astronomy;if(!lib||typeof lib.SearchLunarEclipse!=='function')throw Error('Éphéméride astronomique indisponible');
 const start=isoDay(truth.start),end=isoDay(truth.end);
 if(!start||!end||end<start)throw Error('Période de prévision invalide');
 const finish=new Date(end.getTime()+DAY-1);
 const solar=collectEclipse(lib,lib.SearchGlobalSolarEclipse,lib.NextGlobalSolarEclipse,start,finish,'solaire',natal);
 const lunar=collectEclipse(lib,lib.SearchLunarEclipse,lib.NextLunarEclipse,start,finish,'lunaire',natal);
 if(jobActive&&!jobActive())throw Error('CALC_CANCELLED');
 await new Promise(r=>setTimeout(r,0));
 const lunations=collectLunations(lib,start,finish,natal);
 if(jobActive&&!jobActive())throw Error('CALC_CANCELLED');
 await new Promise(r=>setTimeout(r,0));
 const retrogradeStations=stations(lib,start,finish,natal,jobActive);
 return {engine:'Astronomy Engine MIT (eclipses, lunaisons, stations)',eventsVersion:'v191',
   eclipses:[...solar,...lunar].sort((a,b)=>a.dateUtc.localeCompare(b.dateUtc)),
   lunations,retrogradeStations,
   notes:['Éclipses solaires globales : visibilité locale non déduite.','Contacts au natal sous 1° d’orbe.','Les lunaisons ordinaires ne sont pas des éclipses.']};
}
window.APForecastSkyEvents={version:'v191',compute,_test:{placement,kindName,delta,distance}};
})();