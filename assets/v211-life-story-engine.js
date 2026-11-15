/* Astro Paquita V211 — Chronologie complète de vie.
 * Calcul astronomique local, sans IA ni appels réseau, depuis la naissance
 * jusqu'à 100 ans. Tous les domaines examinés automatiquement.
 * Les événements proposés sont des INTERPRÉTATIONS (y compris dans le passé),
 * jamais des événements biographiques vérifiés.
 */
(function(){
'use strict';
if(window.APLifeStory)return;
const DAY=86400000,YEAR=365.2425*DAY,ANGLES=[0,60,90,120,180],SLOW=['Jupiter','Saturne','Uranus','Neptune','Pluton'],PROG=['Soleil','Lune','Vénus','Mars'],ARC=['Soleil','Lune','Vénus','Mars','Jupiter','Saturne'];
const RULERS=['Mars','Vénus','Mercure','Lune','Soleil','Mercure','Vénus','Mars','Jupiter','Saturne','Saturne','Jupiter'];
const norm=x=>(x%360+360)%360,dist=(x,y)=>Math.abs(norm(x-y+180)-180),iso=x=>new Date(x).toISOString().slice(0,10),valid=x=>x!==null&&x!==undefined&&x!==''&&Number.isFinite(Number(x));
const position=(map,k)=>{let a=map?.[k];if(!valid(a)&&k==='Vénus')a=map?.Venus;return valid(a)?Number(a):null};
const pause=()=>new Promise(r=>setTimeout(r,0));
function cusps(n){
 const x=n?.houses;if(!x)return null;
 const a=Array.isArray(x)?(x.length>=13?x.slice(1,13):x.slice(0,12)):Array.from({length:12},(_,i)=>x['H'+(i+1)]??x[i+1]??x[String(i+1)]);
 return a.length===12&&a.every(valid)?a.map(Number):null;
}
function houseOf(p,c){
 if(p===null||!c)return null;
 for(let i=0;i<12;i++){const width=norm(c[(i+1)%12]-c[i]);if(width&&norm(p-c[i])<width)return i+1}
 return null;
}
function makeTargets(n){
 const c=cusps(n);if(!c)return null;
 const t=[];
 for(const h of [2,3,4,5,7,8,9,10,12])t.push({name:'Maison '+h,longitude:c[h-1],house:h,type:'cusp'});
 // Ruler targets only if the natal planet is not already an exact house cusp.
 const rules={};for(const h of [2,3,4,5,7,8,9,10,12])rules[h]=RULERS[Math.floor(norm(c[h-1])/30)];
 for(const [name,lon] of Object.entries(n.positions||{})){
  const k=name==='Venus'?'Vénus':name;
  if(!['Soleil','Lune','Mercure','Vénus','Mars','Jupiter','Saturne'].includes(k)||!valid(lon))continue;
  const groups=Object.keys(rules).map(Number).filter(h=>rules[h]===k);
  t.push({name:k,longitude:Number(lon),house:houseOf(Number(lon),c),type:'ruler',groups});
 }
 return {targets:t,rules};
}
function areas(t){
 if(t.type==='cusp')return [t.house];
 return t.groups||[];
}
function add(h,body,method,at,orb,aspect,t){
 const hs=areas(t);if(!hs.length)return null;
 return {method,at,orb,aspect,body,target:t.name,targetType:t.type,houses:hs,sourceHouse:t.house};
}
function eventArea(a){
 const out=[];
 for(const h of a.houses){
  if([3,4,8,12].includes(h))out.push('famille');
  if([5,9].includes(h))out.push('enfants');
  if(h===7)out.push('couple');
  if(h===10)out.push('carriere');
  if(h===4)out.push('logement');
  if([2,8].includes(h))out.push('finances');
 }
 return [...new Set(out)];
}
function significance(bucket,age){
 const methods=new Set(bucket.map(x=>x.method));
 const structurals=['arc','progression','primaire'].filter(m=>methods.has(m));
 const keyTargets=bucket.filter(x=>x.targetType==='cusp');
 const bodies=new Set(bucket.map(x=>x.body));
 const exact=bucket.filter(x=>x.orb<=0.3).length;
 // Three distinct computational families, at least one long-duration
 // and one structural measurement, an actual house cusp and 2 source bodies.
 const supported=methods.size>=3&&structurals.length>=1&&keyTargets.length>=1&&bodies.size>=2;
 const score=methods.size*3+structurals.length*2+Math.min(4,keyTargets.length)+Math.min(4,exact);
 return {supported,score,methods,bodies,keyTargets};
}
function titleAndCopy(domain,window,age,past){
 const h=window.filter(x=>x.aspect===90||x.aspect===180),f=window.filter(x=>x.aspect===60||x.aspect===120),hard=h.length>=f.length+2;
 const sources=window.map(x=>x.body).join(' ').toLowerCase();
 const phrase=past?'Cette phase a pu correspondre':'Cette phase pourrait correspondre';
 if(domain==='famille'){
  const houses=new Set(window.flatMap(x=>x.houses));
  if(!houses.has(3)&&!houses.has(4)&&!houses.has(8))return null;
  if(hard&&h.length>=3&&[...houses].filter(x=>[3,4,8,12].includes(x)).length>=2&&/saturne|pluton|uranus/.test(sources)){
   return {label:'Épreuve majeure dans la famille',tone:'difficile',
    detail:phrase+' à un bouleversement touchant plusieurs proches, à une rupture familiale ou à un deuil. Les responsabilités, les liens et la vie quotidienne ont pu en être durablement transformés.'};
  }
  if(hard&&age>=5)return {label:'Période familiale éprouvante',tone:'difficile',detail:phrase+' à une situation lourde concernant le foyer ou des proches, avec des tensions, une séparation ou des responsabilités nouvelles.'};
  return null;
 }
 if(domain==='enfants'){
  if(age<18)return null;
  const hs=new Set(window.flatMap(x=>x.houses));
  if(!hs.has(5)&&!hs.has(9))return null;
  const x=window.filter(z=>z.houses.includes(age>=40?9:5));
  const ms=new Set(x.map(z=>z.method));
  if(ms.size<3||!x.some(z=>z.targetType==='cusp'))return null;
  const isGrand=age>=42&&hs.has(9)&&!hs.has(5);
  return {label:isGrand?'Tournant important dans la descendance':'Étape importante concernant un enfant',tone:'mixte',
   detail:phrase+(isGrand?' à un changement de place au sein de la famille, éventuellement lié aux enfants devenus adultes ou aux petits-enfants.':' à une naissance, à un changement concernant les enfants ou à une responsabilité familiale nouvelle. Cette période ne désigne pas une naissance certaine.')};
 }
 if(domain==='couple'){
  if(age<17)return null;
  if(hard&&/saturne|uranus|pluton/.test(sources))return {label:'Tournant difficile dans la vie affective',tone:'difficile',detail:phrase+' à une crise de couple, une mise à distance, une séparation ou une refonte profonde d’un engagement. La question centrale porte sur la continuité du lien et les choix personnels.'};
  if(!hard&&f.length>=3)return {label:'Engagement ou évolution du couple',tone:'favorable',detail:phrase+' à une rencontre importante, une officialisation, un mariage ou une décision donnant davantage de place à une relation durable.'};
  return null;
 }
 if(domain==='carriere'){
  if(age<6)return null;
  if(age<17)return {label:'Changement important dans le parcours scolaire',tone:hard?'difficile':'favorable',detail:phrase+' à une évolution marquante de la scolarité, à un changement d’établissement ou à une nouvelle orientation qui a influencé la suite du parcours.'};
  if(age>=68)return null;
  if(age>=56&&/saturne|pluton/.test(sources))return {label:'Réorganisation de la fin de carrière',tone:'mixte',detail:phrase+' à une réduction ou cessation d’activité, à une préparation de la retraite ou à un changement du rythme professionnel.'};
  if(hard&&/saturne|uranus|pluton/.test(sources))return {label:'Changement professionnel sous tension',tone:'difficile',detail:phrase+' à une rupture de contrat, une restructuration, un conflit professionnel ou à l’obligation de trouver une nouvelle place.'};
  if(!hard&&f.length>=3)return {label:'Progression professionnelle importante',tone:'favorable',detail:phrase+' à une promotion, une nomination, un nouveau poste ou une responsabilité qui améliore durablement la situation professionnelle.'};
  return null;
 }
 if(domain==='logement'){
  if(age<18)return null;
  if(hard&&/saturne|uranus|pluton/.test(sources))return {label:'Changement imposé du cadre de vie',tone:'difficile',detail:phrase+' à un déménagement difficile, à une séparation du foyer ou à des travaux et décisions matérielles contraignantes.'};
  if(!hard&&f.length>=3)return {label:'Changement important de logement',tone:'favorable',detail:phrase+' à une installation durable, à un achat immobilier, à une vente ou à un déménagement choisi.'};
  return null;
 }
 if(domain==='finances'){
  if(age<18)return null;
  if(hard&&/saturne|pluton/.test(sources))return {label:'Réorganisation financière importante',tone:'difficile',detail:phrase+' à une perte de revenus, un endettement, un partage patrimonial ou à des dépenses inhabituelles demandant des décisions concrètes.'};
  if(!hard&&f.length>=3)return {label:'Évolution favorable du patrimoine',tone:'favorable',detail:phrase+' à une augmentation de ressources, à une opération patrimoniale ou à une amélioration financière durable.'};
  return null;
 }
 return null;
}
function assemble(hits,birth,now){
 const raw=[];
 const anchors=hits.filter(x=>x.method==='arc'||x.method==='progression'||x.method==='primaire');
 const byArea={};for(const h of hits)for(const d of eventArea(h))(byArea[d]||(byArea[d]=[])).push(h);
 for(const anchor of anchors){
  const age=(anchor.at-birth)/YEAR;if(age<0||age>100)continue;
  for(const domain of eventArea(anchor)){
   const group=(byArea[domain]||[]).filter(x=>Math.abs(x.at-anchor.at)<=60*DAY);
   const info=significance(group,age);
   if(!info.supported)continue;
   const typed=titleAndCopy(domain,group,age,anchor.at<now);
   if(!typed)continue;
   raw.push({at:anchor.at,age,domain,...typed,score:info.score});
  }
 }
 raw.sort((a,b)=>b.score-a.score);
 const chosen=[];
 for(const e of raw){
  const hiatus=e.domain==='enfants'?5*YEAR:e.domain==='famille'?4*YEAR:3*YEAR;
  if(chosen.some(s=>s.domain===e.domain&&Math.abs(s.at-e.at)<hiatus))continue;
  chosen.push(e);
 }
 chosen.sort((a,b)=>b.score-a.score||a.at-b.at);
 const final=[];
 for(const e of chosen){
  // Keep only the strongest event within each rolling 12-month window,
  // even when several themes peak on the same date.
  if(final.some(x=>Math.abs(x.instant-e.at)<365*DAY))continue;
  final.push({instant:e.at,date:iso(e.at),from:iso(e.at-21*DAY),to:iso(e.at+21*DAY),age:Math.floor(e.age),domain:e.domain,tone:e.tone,title:e.label,detail:e.detail,period:e.at<now?'passe':'avenir',score:e.score});
 }
 // Present the strongest chapters in chronological order.
 return final.sort((a,b)=>a.instant-b.instant).slice(0,30).map(({instant,...item})=>item);
}
function tick(out,index,at,method,p,targets,orb){
 for(const [body,longitude] of Object.entries(p)){
  if(longitude===null||!Number.isFinite(longitude))continue;
  for(const t of targets){
   const separation=dist(longitude,t.longitude);
   for(const aspect of ANGLES){
    const gap=Math.abs(separation-aspect);
    if(gap>orb)continue;
    const key=[method,body,t.name,aspect].join('/');
    const last=index.get(key);
    if(last&&Math.abs(at-last.at)<50*DAY){if(gap<last.orb){last.at=at;last.orb=gap}continue}
    const hit=add(null,body,method,at,gap,aspect,t);
    if(hit){out.push(hit);index.set(key,hit)}
   }
  }
 }
}
function birthMillis(A,p){const x=A.computeProfile(p);return {jd:Number(x.jd),ms:(Number(x.jd)-2440587.5)*DAY}}
function positionFactory(A,p){
 const astro=window.Astronomy;
 const libNames={Soleil:'Sun',Lune:'Moon',Mercure:'Mercury','Vénus':'Venus',Mars:'Mars',Jupiter:'Jupiter',Saturne:'Saturn',Uranus:'Uranus',Neptune:'Neptune',Pluton:'Pluto'};
 function fallback(jd){
  const utc=new Date((jd-2440587.5)*DAY),ds=[String(utc.getUTCDate()).padStart(2,'0'),String(utc.getUTCMonth()+1).padStart(2,'0'),utc.getUTCFullYear()].join('/');
  const fake={...p,date:ds,heure:String(utc.getUTCHours()).padStart(2,'0')+':'+String(utc.getUTCMinutes()).padStart(2,'0'),tz:'Etc/UTC',timeStatus:'exact'};
  return A.computeProfile(fake).pos;
 }
 function at(jd){
  if(typeof window.calcPos==='function')return window.calcPos(jd);
  if(astro?.GeoVector&&astro?.Ecliptic){
   const date=new Date((jd-2440587.5)*DAY),pos={};
   for(const [name,body] of Object.entries(libNames)){try{pos[name]=astro.Ecliptic(astro.GeoVector(body,date,true)).elon}catch(e){}}
   if(Object.keys(pos).length>=5)return pos;
  }
  return fallback(jd);
 }
 return at;
}
async function compute({A,profile,alive,progress}){
 if(!A?.natal||!A?.computeProfile||!profile)throw Error('Profil incomplet.');
 if((profile.timeStatus||'exact')==='unknown')throw Error('Heure de naissance nécessaire pour cette étude.');
 const {jd,ms:birth}=birthMillis(A,profile),nat=A.natal(profile),base=makeTargets(nat);
 if(!base)throw Error('Maisons du thème natal indisponibles.');
 const at=positionFactory(A,profile),stop=birth+100*YEAR,now=Date.now();
 const birthSun=position(nat.positions,'Soleil');
 if(birthSun===null)throw Error('Soleil natal indisponible');
 const raw=[],index=new Map(),isAlive=()=>{if(alive&&!alive())throw Error('CALC_CANCELLED')};
 const sourceNames=[...SLOW,...PROG];
 const filter=(p,keys)=>Object.fromEntries(keys.map(k=>[k,position(p,k)]).filter(x=>x[1]!==null));
 // 10-day step for slow transits: 1° is not claimed minute-exact.
 progress?.('Analyse des grandes périodes',0.05);
 for(let t=birth,i=0;t<=stop;t+=10*DAY,i++){
  isAlive();
  const pos=at(t/DAY+2440587.5);
  tick(raw,index,t,'transit',filter(pos,SLOW),base.targets,.65);
  if(i%125===0){progress?.('Recherche des périodes marquantes',.05+.53*(t-birth)/(stop-birth));await pause()}
 }
 // Secondary progressions + solar arc sampled every ~45 calendar days.
 index.clear();progress?.('Croisement des périodes',.6);
 for(let age=0,i=0;age<=100;age+=.125,i++){
  isAlive();
  const t=birth+age*YEAR,pr=at(jd+age);
  tick(raw,index,t,'progression',filter(pr,PROG),base.targets,.65);
  const moved=position(pr,'Soleil');
  if(moved!==null){
   const arc=norm(moved-birthSun);
   const directed=Object.fromEntries(ARC.map(k=>[k,position(nat.positions,k)]).filter(x=>x[1]!==null).map(([k,x])=>[k,norm(x+arc)]));
   tick(raw,index,t,'arc',directed,base.targets,.65);
  }
  if(i%50===0){progress?.('Croisement des périodes',.6+.23*age/100);await pause()}
 }
 // The complete primary directions module is optional corroboration.
 progress?.('Vérification des dates fortes',.84);
 try{
  if(window.APPrimaryDirections?.compute){
   const p=window.APPrimaryDirections.compute(A,profile,iso(birth),iso(stop));
   for(const x of p.points||[]){
    isAlive();const t=Date.parse(x.date+'T12:00:00Z');
    const tname=x.significator||'';
    const target=base.targets.find(v=>v.name===tname||('Maison '+v.house)===tname);
    if(!target)continue;
    const o=add(null,x.promissor,'primaire',t,0,x.aspect,target);
    if(o)raw.push(o);
   }
  }
 }catch(e){console.warn('Directions primaires non disponibles',e)}
 progress?.('Rédaction de la chronologie',.95);isAlive();
 const results=assemble(raw,birth,now);
 progress?.('Terminé',1);
 return {version:'v211',birth:iso(birth),end:iso(stop),events:results,rawCount:raw.length,profileId:profile.profileId||profile.legacyKey,signature:profile.birthDataVersion||''};
}
window.APLifeStory={version:'v211',compute,_test:{cusps,houseOf,makeTargets,eventArea,significance,titleAndCopy,assemble}};
})();