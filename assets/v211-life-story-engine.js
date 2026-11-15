/* Astro Paquita V212 — Chronologie complète de vie.
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
 const targets=[],rules={};
 for(let h=1;h<=12;h++){
  rules[h]=RULERS[Math.floor(norm(c[h-1])/30)];
  targets.push({name:'Maison '+h,longitude:c[h-1],house:h,type:'cusp',groups:[h],roles:{[h]:'cusp'}});
 }
 const supported=['Soleil','Lune','Mercure','Vénus','Mars','Jupiter','Saturne','Uranus','Neptune','Pluton'];
 for(const name of supported){
  const lon=position(n.positions,name);
  if(lon===null)continue;
  const occupied=houseOf(lon,c),groups=new Set(),roles={};
  if(occupied){groups.add(occupied);roles[occupied]='occupant'}
  for(let h=1;h<=12;h++){
   if(rules[h]===name){
    groups.add(h);
    roles[h]=roles[h]?'occupant+maitre':'maitre';
   }
  }
  if(groups.size)targets.push({name,longitude:lon,house:occupied,type:'planet',groups:[...groups],roles});
 }
 return {targets,rules,cusps:c};
}
function areas(t){return t.groups||[];}

function add(h,body,method,at,orb,aspect,t){
 const hs=areas(t);if(!hs.length)return null;
 return {method,at,orb,aspect,body,target:t.name,targetType:t.type,houses:hs,targetHouse:t.house,
  roles:t.roles||{},sourceHouse:t.house};
}
/* All twelve natal houses contribute. Areas overlap only where the underlying
 * house meanings overlap; house VIII/XII never imply a relative's death. */
const AREAS={
 1:['identite'],2:['ressources'],3:['etudes_entourage'],4:['famille','logement'],
 5:['enfants','creation'],6:['sante_rythme','travail_quotidien'],7:['couple','associations'],
 8:['transmission','ressources'],9:['voyages_etudes','descendance'],
 10:['carriere'],11:['projets_amis'],12:['retrait_transition']
};
function eventArea(hit){
 return [...new Set(hit.houses.flatMap(h=>AREAS[h]||[]))];
}

function significance(bucket,age,domain){
 const byMethod=new Set(bucket.map(x=>x.method));
 const differentSources=new Set(bucket.map(x=>x.method+'|'+x.body));
 const distinctBodies=new Set(bucket.map(x=>x.body));
 const relevantHouses=Object.entries(AREAS).filter(([h,names])=>names.includes(domain)).map(([h])=>Number(h));
 const direct=bucket.filter(x=>x.houses.some(h=>relevantHouses.includes(h)&&
  ['cusp','occupant','occupant+maitre'].includes(x.roles?.[h])));
 const structurals=['arc','progression','primaire'].filter(m=>byMethod.has(m));
 const strict=byMethod.has('transit')&&structurals.length>0&&byMethod.size>=2&&
  differentSources.size>=3&&distinctBodies.size>=2&&direct.length>=1;
 const strong=byMethod.size>=3;
 const score=byMethod.size*4+Math.min(5,direct.length)+Math.min(5,new Set(bucket.map(x=>x.target)).size)+
  Math.min(4,bucket.filter(x=>x.orb<=.25).length)+ (strong?5:0);
 return {supported:strict,score,strong,byMethod,direct};
}
function titleAndCopy(domain,signal,age,past){
 const uniq=new Map();
 for(const s of signal)uniq.set(s.method+'|'+s.body+'|'+s.target+'|'+s.aspect,s);
 const rows=[...uniq.values()],hard=rows.filter(x=>[90,180].includes(x.aspect)),
 soft=rows.filter(x=>[60,120].includes(x.aspect));
 const challenging=hard.length>=soft.length+2,hopeful=soft.length>=hard.length+2;
 const pre=past?'Cette période a pu correspondre':'Cette période pourrait correspondre';
 const subs=new Set(rows.flatMap(x=>x.houses)),source=new Set(rows.map(x=>x.body));
 const has=(h)=>subs.has(h);
 const why=(t)=>({tone:challenging?'difficile':hopeful?'favorable':'mixte',...t});
 switch(domain){
 case 'identite':
  if(age<9)return null;
  return why({label:'Un tournant dans les choix personnels',detail:pre+
   ' à un changement de priorités, d’autonomie ou de manière de conduire sa vie. Une décision importante a pu modifier les relations, le rythme quotidien ou les objectifs personnels.'});
 case 'ressources':
  if(age<18)return null;
  return why({label:'Réorganisation des ressources et du patrimoine',detail:pre+
   (challenging?' à des obligations financières, à un partage, à des dépenses ou à une remise à plat des revenus. Des choix concrets ont pu être nécessaires pour retrouver un équilibre.':
   ' à une évolution des revenus, à une opération patrimoniale ou à un engagement financier de longue durée. Les conditions matérielles ont pu prendre une importance nouvelle.')});
 case 'etudes_entourage':
  if(age<5)return null;
  return why({label:age<=24?'Une étape importante des études et de la formation':'Un changement autour des proches ou de la communication',
   detail:age<=24?pre+' à un changement de cursus, une orientation, un apprentissage décisif ou à une nouvelle indépendance. Cette étape a pu réorienter le parcours scolaire ou professionnel.':
    pre+' à un changement concernant les frères et sœurs, le voisinage, les déplacements réguliers ou la manière de communiquer avec l’entourage. De nouvelles responsabilités ont pu s’organiser.'});
 case 'famille':
  if(!has(4))return null;
  if(challenging)return why({label:'Une période de changement familial exigeante',detail:pre+
   ' à une réorganisation du foyer, des relations avec les parents ou de la vie familiale. Un éloignement, une responsabilité nouvelle ou une épreuve vécue par un proche peut faire partie des manifestations possibles, sans permettre de conclure à un décès.'});
  if(hopeful)return why({label:'Une évolution favorable du foyer et de la famille',detail:pre+
   ' à une installation, un rapprochement familial ou à une nouvelle étape de vie partagée. Les liens et la stabilité du cadre de vie ont pu prendre une place particulière.'});
  return null;
 case 'logement':
  if(age<16)return null;
  return why({label:'Un changement du lieu ou du cadre de vie',detail:pre+
   ' à un déménagement, des travaux, un projet immobilier ou une réorganisation du foyer. La question du lieu de résidence et de la stabilité matérielle a pu devenir centrale.'});
 case 'enfants':
  if(age<17)return null;
  if(!has(5))return null;
  if(age<=49)return why({label:'Une étape majeure autour des enfants',detail:pre+
   ' à une grossesse, à une naissance ou à un événement modifiant la place des enfants dans la vie quotidienne. Une parentalité nouvelle peut s’inscrire dans cette période, sans qu’une naissance soit la seule interprétation possible.'});
  return why({label:'Une étape importante concernant les enfants adultes',detail:pre+
   ' à une décision ou à un changement de vie vécu par un enfant, susceptible de transformer l’organisation familiale, les liens ou les responsabilités de chacun.'});
 case 'creation':
  if(age<10)return null;
  return why({label:'Un projet personnel ou créatif prend de l’ampleur',detail:pre+
   ' à la réalisation d’un projet, au développement d’une passion ou à une nouvelle place donnée à l’expression personnelle. Cette étape peut aussi concerner les loisirs ou les relations affectives.'});
 case 'sante_rythme':
  if(age<5)return null;
  return why({label:'Une modification importante du rythme de vie',detail:pre+
   ' à une réorganisation des habitudes, des obligations, du repos ou des capacités de récupération. Il ne s’agit pas d’un diagnostic, mais d’une période où le fonctionnement quotidien peut demander des ajustements.'});
 case 'travail_quotidien':
  if(age<16||age>73)return null;
  return why({label:'Une transformation du quotidien professionnel',detail:pre+
   ' à un changement d’horaires, de conditions de travail, d’équipe ou de responsabilités concrètes. Les contraintes matérielles et l’organisation des journées ont pu être particulièrement importantes.'});
 case 'couple':
  if(age<17)return null;
  return why({label:'Un tournant dans la vie affective ou conjugale',detail:pre+
   (challenging?' à une remise en question d’un engagement, à des désaccords ou à une nouvelle distance dans le couple. Il peut être question de renégocier le lien, sans que cela annonce automatiquement un divorce.':
    ' à une relation qui prend une place nouvelle, à un engagement, à une vie commune ou à une redéfinition du fonctionnement du couple.')});
 case 'associations':
  if(age<18)return null;
  return why({label:'Un changement dans les engagements et partenariats',detail:pre+
   ' à la signature, à la fin ou à la transformation d’un accord important, professionnel ou personnel. Une association, une collaboration ou une décision contractuelle a pu peser sur la suite.'});
 case 'transmission':
  if(age<16)return null;
  return why({label:'Une période de transmission et de partage',detail:pre+
   ' à une succession, un partage de biens, une indemnité ou une réorganisation des ressources communes. La question de ce qui se transmet ou se partage peut devenir déterminante, sans impliquer nécessairement un décès.'});
 case 'voyages_etudes':
  if(age<12)return null;
  return why({label:age<25?'Une ouverture par les études ou les voyages':'Un changement d’horizon important',detail:pre+
   ' à des études approfondies, à un voyage, à une installation plus lointaine ou à un élargissement des perspectives. Cette étape peut modifier durablement la manière de se projeter.'});
 case 'descendance':
  if(age<38)return null;
  if(!has(9))return null;
  return why({label:'Un tournant autour de la descendance',detail:pre+
   ' à une évolution importante chez les enfants devenus adultes ou les petits-enfants. Une arrivée dans la famille fait partie des possibilités, sans pouvoir être déterminée par ce seul secteur.'});
 case 'carriere':
  if(age<6)return null;
  if(age<17)return why({label:'Une évolution de la scolarité ou de l’orientation',detail:pre+
   ' à un changement d’établissement ou à une décision qui oriente les apprentissages et les possibilités futures.'});
  if(age>=70)return why({label:'Une nouvelle place dans la vie sociale',detail:pre+
   ' à la reconnaissance d’un parcours, à un engagement associatif ou à une redéfinition du rôle dans la société, indépendamment de l’emploi.'});
  if(age>=57)return why({label:'Un tournant dans la fin de carrière ou la retraite',detail:pre+
   ' à une évolution des responsabilités, à une diminution d’activité, à une cessation d’emploi ou à la préparation d’une retraite.'});
  return why({label:'Une étape marquante de la carrière et du statut',detail:pre+
   (challenging?' à une restructuration, une rupture de contrat ou une responsabilité devenue plus difficile. Un nouveau choix professionnel peut en avoir découlé.':
   ' à une prise de fonction, une reconnaissance, une promotion ou à un changement durable de situation professionnelle.')});
 case 'projets_amis':
  if(age<8)return null;
  return why({label:'Une étape importante dans les projets et les relations amicales',detail:pre+
   ' à un nouveau réseau, à un projet collectif, à un engagement associatif ou à un changement significatif dans les amitiés. Les soutiens et les projets de long terme ont pu évoluer.'});
 case 'retrait_transition':
  if(age<16)return null;
  return why({label:'Une période de retrait ou de réorientation personnelle',detail:pre+
   ' à un besoin de recul, à la fin d’un cycle, à un temps de solitude choisie ou subie, ou à une réorganisation intérieure. Rien ici ne permet de présumer une maladie ou un décès.'});
 default:return null;
 }
}

function assemble(hits,birth,now){
 const raw=[],anchors=hits.filter(x=>x.method==='arc'||x.method==='progression'||x.method==='primaire');
 const byArea={};
 for(const h of hits)for(const d of eventArea(h))(byArea[d]||(byArea[d]=[])).push(h);
 for(const anchor of anchors){
  const age=(anchor.at-birth)/YEAR;if(age<3||age>100)continue;
  for(const domain of eventArea(anchor)){
   const nearby=(byArea[domain]||[]).filter(x=>Math.abs(x.at-anchor.at)<=75*DAY);
   const evidence=significance(nearby,age,domain);
   if(!evidence.supported)continue;
   const entry=titleAndCopy(domain,nearby,age,anchor.at<now);
   if(!entry)continue;
   raw.push({at:anchor.at,age,domain,...entry,score:evidence.score});
  }
 }
 // Independent qualitative chapter selection: the birth of a child is not
 // hidden just because a generic money trigger has a slightly higher score.
 raw.sort((a,b)=>b.score-a.score||a.at-b.at);
 const distinct=[];
 for(const x of raw){
  if(distinct.some(y=>y.domain===x.domain&&Math.abs(y.at-x.at)<(x.domain==='enfants'?4:2.5)*YEAR))continue;
  distinct.push(x);
 }
 // Merge concurrent themes into one chapter; never print several unrelated
 // headlines on the same day, or repeat the same scenario in adjacent months.
 const clusters=[];
 for(const x of distinct.sort((a,b)=>a.at-b.at)){
  let near=clusters.find(z=>Math.abs(z.at-x.at)<=120*DAY);
  if(!near){near={at:x.at,items:[]};clusters.push(near)}
  if(!near.items.some(z=>z.domain===x.domain))near.items.push(x);
 }
 const rank=cluster=>Math.max(...cluster.items.map(x=>x.score))+
   Math.min(4,new Set(cluster.items.map(x=>x.domain)).size);
 const kept=[];
 for(const x of clusters.sort((a,b)=>rank(b)-rank(a)||a.at-b.at)){
  if(kept.some(y=>Math.abs(y.at-x.at)<365*DAY))continue;
  kept.push(x);
 }
 // Balanced coverage of the entire life: choose the most significant
 // chapters in EACH decade rather than keeping only the earliest decades.
 const selected=[],perDecade=new Map(),themeCounts=new Map();
 const maxTheme=domain=>domain==='ressources'?3:domain==='famille'?3:domain==='enfants'?3:4;
 const redundant=(a,b)=>[['enfants','creation'],['famille','logement'],
   ['couple','associations'],['ressources','transmission'],['carriere','travail_quotidien']].some(pair=>pair.includes(a)&&pair.includes(b));
 for(const cluster of kept.sort((a,b)=>rank(b)-rank(a)||a.at-b.at)){
  const decade=Math.max(0,Math.min(9,Math.floor(((cluster.at-birth)/YEAR)/10)));
  if((perDecade.get(decade)||0)>=3)continue;
  let options=cluster.items.filter(x=>(themeCounts.get(x.domain)||0)<maxTheme(x.domain));
  if(!options.length)continue;
  options=options.sort((a,b)=>
   (b.score-2*(themeCounts.get(b.domain)||0))-(a.score-2*(themeCounts.get(a.domain)||0)));
  const natalChild=options.find(x=>x.domain==='enfants'&&x.age>=18&&x.age<=49);
  const main=natalChild||options[0],other=options.find(x=>x!==main&&!redundant(x.domain,main.domain));
  const themes=other?[main,other]:[main];
  themes.forEach(x=>themeCounts.set(x.domain,(themeCounts.get(x.domain)||0)+1));
  perDecade.set(decade,(perDecade.get(decade)||0)+1);
  selected.push({at:cluster.at,items:themes,score:rank(cluster)});
 }
 const out=[];
 for(const cluster of selected.sort((a,b)=>a.at-b.at)){
  const focused=cluster.items,main=focused[0],time=cluster.at;
  const title=focused.length===1?main.label:main.label+' — '+focused[1].label.toLowerCase();
  const detail=focused.map(x=>x.detail).join(' ');
  out.push({date:iso(time),from:iso(time-45*DAY),to:iso(time+45*DAY),
   age:Math.floor((time-birth)/YEAR),domain:main.domain,tone:main.tone,
   title,detail,period:time<now?'passe':'avenir',score:cluster.score});
 }
 return out.sort((a,b)=>a.date.localeCompare(b.date));
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
 const localBirth=/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/.exec(String(profile.date||''));
 const birthDay=localBirth?localBirth[3]+'-'+localBirth[2].padStart(2,'0')+'-'+localBirth[1].padStart(2,'0'):/^\d{4}-\d{2}-\d{2}$/.test(String(profile.date||''))?profile.date:iso(birth);
 const milestone={date:birthDay,from:birthDay,to:birthDay,age:0,domain:'identite',tone:'neutre',title:'Naissance',detail:'Le début de ce parcours, à partir de la date de naissance enregistrée.',period:'passe',verified:true};
 const results=[milestone,...assemble(raw,birth,now)];
 progress?.('Terminé',1);
 return {version:'v212',birth:iso(birth),end:iso(stop),events:results,rawCount:raw.length,profileId:profile.profileId||profile.legacyKey,signature:profile.birthDataVersion||''};
}
window.APLifeStory={version:'v212',compute,_test:{cusps,houseOf,makeTargets,eventArea,significance,titleAndCopy,assemble}};
})();