/* Astro Paquita — Structured Truth Layer
   Built on top of the validated V121 astronomical engine.
   This file does not replace astronomical calculations: it normalizes their output. */
(function(){
'use strict';
const ENGINE_VERSION='v121';
const TRUTH_VERSION='truth-2026.09.20';
const CALC_CACHE_PREFIX='ap:calc:v2:';
const PROFILE_REGISTRY_KEY='ap:profile-registry:v2';
const DOMAIN_ALIASES={
  amour:['love','couple','relationship','amour'],
  travail:['work','career','job','travail'],
  argent:['money','finance','argent'],
  bienetre:['health','wellbeing','sante','bienetre','daily'],
  famille:['family','home','famille','children'],
  voyage:['travel','voyage']
};
const DOMAIN_LABELS={fr:{amour:'Amour',travail:'Travail',argent:'Argent',bienetre:'Bien-être',famille:'Famille',voyage:'Voyage'},en:{amour:'Love',travail:'Work',argent:'Money',bienetre:'Well-being',famille:'Family',voyage:'Travel'},es:{amour:'Amor',travail:'Trabajo',argent:'Dinero',bienetre:'Bienestar',famille:'Familia',voyage:'Viajes'},ar:{amour:'الحب',travail:'العمل',argent:'المال',bienetre:'العافية',famille:'العائلة',voyage:'السفر'}};
function uuid(){return (typeof crypto!=='undefined'&&crypto.randomUUID)?crypto.randomUUID():'p-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);}
function safeJson(v){try{return JSON.parse(v);}catch(e){return null;}}
function getLang(){return String(localStorage.getItem('astro-lang')||((typeof AP_LANG!=='undefined'&&AP_LANG)||'fr')).toLowerCase().slice(0,2);}
function labels(){return DOMAIN_LABELS[getLang()]||DOMAIN_LABELS.fr;}
function norm360(v){v=Number(v);return Number.isFinite(v)?((v%360)+360)%360:null;}
function isoDate(d){if(typeof d==='string'){const m=d.match(/^\d{4}-\d{2}-\d{2}$/);if(m)return d;}const x=d instanceof Date?d:new Date(d);if(isNaN(x))return null;return [x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-');}
function addDays(d,n){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()+n);return x;}
function addMonths(d,n){const x=new Date(d.getFullYear(),d.getMonth(),1);x.setMonth(x.getMonth()+n);return x;}
function dateFrToISO(raw){if(typeof parseDate==='function')return parseDate(String(raw||''));const m=String(raw||'').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);return m?`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`:null;}
function isIana(tz){if(!tz||typeof tz!=='string')return false;try{new Intl.DateTimeFormat('en-US',{timeZone:tz}).format();return tz.includes('/');}catch(e){return false;}}
function profileVersion(p){return [p.date||'',p.heure||'',p.ville||'',p.lat||'',p.lon||'',p.tz||'',p.timeStatus||'exact'].join('|');}
function legacyProfiles(){try{return typeof getProfils==='function'?getProfils():{};}catch(e){return {};}}
function registry(){return safeJson(localStorage.getItem(PROFILE_REGISTRY_KEY))||{};}
function migrateProfiles(){
  const ps=legacyProfiles(), reg=registry(); let dirty=false, regDirty=false;
  Object.keys(ps).forEach(k=>{
    const p=ps[k]||{};
    if(!p.profileId){p.profileId=(reg[k]&&reg[k].profileId)||uuid();dirty=true;}
    if(!p.birthDataVersion){p.birthDataVersion=profileVersion(p);dirty=true;}
    if(!p.timeStatus)p.timeStatus='exact';
    reg[k]={profileId:p.profileId,birthDataVersion:p.birthDataVersion};regDirty=true;
  });
  if(dirty&&typeof setProfils==='function')try{setProfils(ps);}catch(e){}
  if(regDirty)try{localStorage.setItem(PROFILE_REGISTRY_KEY,JSON.stringify(reg));}catch(e){}
  return ps;
}
function listProfiles(){const ps=migrateProfiles();return Object.entries(ps).map(([legacyKey,p])=>({...p,legacyKey}));}
function getProfileById(id){return listProfiles().find(p=>p.profileId===id)||null;}
function currentProfile(){
  const ps=listProfiles();
  const active=(typeof V37_ACTIVE_PROFILE_KEY!=='undefined'&&localStorage.getItem(V37_ACTIVE_PROFILE_KEY))||'';
  let p=ps.find(x=>x.legacyKey===active)||null;
  if(!p&&typeof USER!=='undefined'&&USER){p=ps.find(x=>String(x.prenom||'')===String(USER.prenom||'')&&String(x.date||'')===String(USER.dateRaw||''))||null;}
  return p||ps[0]||null;
}
function validation(p){
  const errors=[]; if(!p)errors.push('profile_missing');
  if(p&&!p.prenom)errors.push('name_missing');
  if(p&&!dateFrToISO(p.date))errors.push('date_invalid');
  if(p&&(String(p.lat??'').trim()===''||!Number.isFinite(Number(p.lat))))errors.push('latitude_missing');
  if(p&&(String(p.lon??'').trim()===''||!Number.isFinite(Number(p.lon))))errors.push('longitude_missing');
  if(p&&!isIana(p.tz))errors.push('timezone_invalid');
  const ts=(p&&p.timeStatus)||'exact';
  if(p&&ts!=='unknown'&&!/^\d{1,2}:\d{2}$/.test(String(p.heure||'')))errors.push('time_invalid');
  return {ok:!errors.length,errors,timeStatus:ts};
}
function computeProfile(p){
  const val=validation(p); if(!val.ok){const e=new Error('Birth data incomplete');e.kind='data';e.details=val.errors;throw e;}
  const dateISO=dateFrToISO(p.date), timeStatus=p.timeStatus||'exact';
  const heure=timeStatus==='unknown'?'12:00':String(p.heure||'12:00');
  const u=convUTC(dateISO,heure,p.tz); const jd=julianDay(u.y,u.m,u.d,u.h); const pos=calcPos(jd);
  let AS=null,MC=null,cusps=null,houseSystem='unavailable';
  if(timeStatus!=='unknown'){
    const ax=calcASMC(jd,Number(p.lat),Number(p.lon)); AS=ax.AS; MC=ax.MC;
    if(typeof prevHouseCuspsV80==='function'){cusps=prevHouseCuspsV80(AS,MC,jd,Number(p.lat),Number(p.lon));houseSystem=(cusps&&cusps._system)||'Placidus';}
  }
  return {profileId:p.profileId||null,birthDataVersion:p.birthDataVersion||profileVersion(p),prenom:p.prenom,dateISO,dateRaw:p.date,heure:timeStatus==='unknown'?null:heure,timeStatus,lat:Number(p.lat),lon:Number(p.lon),tz:p.tz,ville:p.ville||'',genre:p.genre||'N',jd,pos,AS,MC,cusps,houseSystem,confidence:{planets:'high',angles:timeStatus==='exact'?'high':timeStatus==='approx'?'reduced':'unavailable',houses:timeStatus==='exact'?'high':timeStatus==='approx'?'reduced':'unavailable'}};
}
function natal(p){
  p=p||currentProfile(); const key=CALC_CACHE_PREFIX+'natal:'+((p&&p.profileId)||'none')+':'+((p&&p.birthDataVersion)||profileVersion(p||{}))+':'+ENGINE_VERSION+':'+TRUTH_VERSION;
  const cached=safeJson(localStorage.getItem(key)); if(cached)return cached;
  const c=computeProfile(p); const out={type:'NatalTruth',engineVersion:ENGINE_VERSION,truthVersion:TRUTH_VERSION,profileId:c.profileId,birthDataVersion:c.birthDataVersion,identity:{prenom:c.prenom,date:c.dateISO,time:c.heure,timeStatus:c.timeStatus,place:c.ville,timezone:c.tz,coordinates:{lat:c.lat,lon:c.lon}},positions:c.pos,angles:{ascendant:c.AS,mc:c.MC},houses:c.cusps,houseSystem:c.houseSystem,confidence:c.confidence,calculatedAt:new Date().toISOString()};
  try{localStorage.setItem(key,JSON.stringify(out));}catch(e){} return out;
}
function mapDomain(raw){const s=String(raw||'').toLowerCase();for(const [k,arr] of Object.entries(DOMAIN_ALIASES)){if(arr.some(a=>s===a||s.includes(a)))return k;}return 'general';}
function normalizeSignal(s,date){const d=mapDomain(s.domain);return {date:isoDate(date||s.date),domain:d,domainLabel:labels()[d]||d,polarity:s.polarite||s.polarity||'mixte',level:s.niveau||s.level||'marque',force:Number(s.force||s.strength||0),score:Number(s.score||0),label:s.label||'',families:s.coreFamilies||s.families||s.familles||[],signatures:s.signatures||[],scenarios:s.scenarios||[]};}
function day(date,domain){
  if(typeof USER==='undefined'||!USER)throw Object.assign(new Error('No active profile'),{kind:'data'});
  const d=date instanceof Date?date:new Date(String(date)+'T12:00:00'); if(isNaN(d))throw Object.assign(new Error('Invalid date'),{kind:'data'});
  const key=CALC_CACHE_PREFIX+'day:'+isoDate(d)+':'+(domain||'all')+':'+ENGINE_VERSION+':'+TRUTH_VERSION+':'+(currentProfile()?.profileId||'legacy');
  const cached=safeJson(localStorage.getItem(key)); if(cached)return cached;
  let rows=[];
  try{rows=(typeof apV51Signals==='function'?apV51Signals(d,'marque'):[])||[];}catch(e){}
  if(!rows.length&&typeof apDailyMicroAllV84==='function'){
    try{const jd=typeof apJDFromDate==='function'?apJDFromDate(d):julianDay(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate(),12);const r=apDailyMicroAllV84(jd,USER.pos,USER.AS,USER.MC,{});if(Array.isArray(r))rows=r;}catch(e){}
  }
  let signals=rows.map(x=>normalizeSignal(x,d)); if(domain&&domain!=='all')signals=signals.filter(x=>x.domain===domain);
  const signed=signals.reduce((n,s)=>n+(s.polarity==='difficile'?-1:s.polarity==='positive'?1:0)*Math.max(1,s.force),0);
  const out={type:'DayTruth',engineVersion:ENGINE_VERSION,truthVersion:TRUTH_VERSION,profileId:currentProfile()?.profileId||null,date:isoDate(d),domain:domain||'all',signals,polarity:signed>1?'positive':signed<-1?'difficult':signals.length?'mixed':'calm',intensity:signals.length?Math.min(100,Math.round(signals.reduce((a,b)=>a+Math.max(1,b.score||b.force*10),0)/signals.length)):0};
  try{localStorage.setItem(key,JSON.stringify(out));}catch(e){} return out;
}
function emptyDomainScore(){return {amour:0,travail:0,argent:0,bienetre:0,famille:0,voyage:0};}
function scoreSignals(signals){const out=emptyDomainScore(),cnt=emptyDomainScore();signals.forEach(s=>{if(!(s.domain in out))return;const sign=s.polarity==='difficile'?-1:s.polarity==='positive'?1:0;out[s.domain]+=sign*Math.max(1,Math.min(8,s.force||1));cnt[s.domain]++;});Object.keys(out).forEach(k=>{out[k]=cnt[k]?Math.max(-5,Math.min(5,+(out[k]/Math.sqrt(cnt[k])).toFixed(2))):0;});return out;}
function period(start,months,options){
  if(typeof USER==='undefined'||!USER)throw Object.assign(new Error('No active timed profile'),{kind:'data',code:'timed_profile_required'});
  options=options||{}; const m=Math.max(1,Math.min(24,Number(months)||12)); const base=start instanceof Date?start:new Date(start||new Date()); const month0=new Date(base.getFullYear(),base.getMonth(),1);
  const key=CALC_CACHE_PREFIX+'period:'+isoDate(month0)+':'+m+':'+ENGINE_VERSION+':'+TRUTH_VERSION+':'+(currentProfile()?.profileId||'legacy'); const cached=safeJson(localStorage.getItem(key));if(cached&&!options.force)return cached;
  const points=[],milestones=[];
  for(let i=0;i<m;i++){
    const first=addMonths(month0,i), samples=[new Date(first.getFullYear(),first.getMonth(),5),new Date(first.getFullYear(),first.getMonth(),15),new Date(first.getFullYear(),first.getMonth(),25)];
    let sig=[];samples.forEach(d=>{try{sig=sig.concat(day(d,'all').signals);}catch(e){}});const scores=scoreSignals(sig);
    const avg=Object.values(scores).reduce((a,b)=>a+b,0)/6; const abs=Math.max(...Object.values(scores).map(Math.abs)); const polarity=avg>.35?'positive':avg<-.35?'difficult':abs>.8?'mixed':'calm';
    points.push({month:isoDate(first).slice(0,7),scores,polarity,intensity:Math.round(Math.min(100,abs*20)),signals:sig.sort((a,b)=>Math.abs(b.force)-Math.abs(a.force)).slice(0,10)});
    sig.filter(s=>s.level==='exceptionnel'||s.level==='fort').slice(0,4).forEach(s=>milestones.push(s));
  }
  const out={type:'PeriodTruth',engineVersion:ENGINE_VERSION,truthVersion:TRUTH_VERSION,profileId:currentProfile()?.profileId||null,start:isoDate(month0),months:m,domainLabels:labels(),points,milestones:milestones.sort((a,b)=>String(a.date).localeCompare(String(b.date))),calculatedAt:new Date().toISOString()};
  try{localStorage.setItem(key,JSON.stringify(out));}catch(e){}return out;
}
function angleDelta(a,b){let d=Math.abs(norm360(a)-norm360(b));return d>180?360-d:d;}
function relationship(profileA,profileB,relationType){
  const A=computeProfile(profileA),B=computeProfile(profileB); const aspDefs=[{angle:0,name:'conjunction',nature:'mixed'},{angle:60,name:'sextile',nature:'constructive'},{angle:90,name:'square',nature:'challenging'},{angle:120,name:'trine',nature:'constructive'},{angle:180,name:'opposition',nature:'challenging'}];
  const bodies=['Soleil','Lune','Mercure','Vénus','Mars','Jupiter','Saturne','Uranus','Neptune','Pluton','Noeud']; const aspects=[];
  bodies.forEach(pa=>bodies.forEach(pb=>{const va=A.pos[pa],vb=B.pos[pb];if(!Number.isFinite(Number(va))||!Number.isFinite(Number(vb)))return;const d=angleDelta(va,vb);const lum=(['Soleil','Lune'].includes(pa)||['Soleil','Lune'].includes(pb));const orbMax=lum?6:4;let best=null;aspDefs.forEach(x=>{const orb=Math.abs(d-x.angle);if(orb<=orbMax&&(!best||orb<best.orb))best={...x,orb};});if(best)aspects.push({bodyA:pa,bodyB:pb,aspect:best.name,angle:best.angle,nature:best.nature,orb:+best.orb.toFixed(2),strength:+Math.max(0,1-best.orb/orbMax).toFixed(3)});}));
  aspects.sort((a,b)=>b.strength-a.strength); const constructive=aspects.filter(a=>a.nature==='constructive').reduce((n,a)=>n+a.strength,0),challenging=aspects.filter(a=>a.nature==='challenging').reduce((n,a)=>n+a.strength,0);
  return {type:'RelationshipTruth',engineVersion:ENGINE_VERSION,truthVersion:TRUTH_VERSION,relationType:relationType||'Amour',profileA:{profileId:A.profileId,prenom:A.prenom},profileB:{profileId:B.profileId,prenom:B.prenom},aspects,summary:{constructive:+constructive.toFixed(2),challenging:+challenging.toFixed(2),balance:+(constructive-challenging).toFixed(2)},karmicContacts:aspects.filter(a=>(a.bodyA==='Noeud'||a.bodyB==='Noeud'||a.bodyA==='Saturne'||a.bodyB==='Saturne')&&a.strength>.45).slice(0,8)};
}
function saveProfile(p){
  const ps=legacyProfiles(); const item={...p}; if(!item.profileId)item.profileId=uuid(); item.birthDataVersion=profileVersion(item); item.timeStatus=item.timeStatus||'exact';
  const old=Object.entries(ps).find(([,x])=>x&&x.profileId===item.profileId); const key=old?old[0]:'profile_'+item.profileId;
  ps[key]=item; if(typeof setProfils==='function')setProfils(ps); migrateProfiles(); return {...item,legacyKey:key};
}
function removeProfile(id){const ps=legacyProfiles();const hit=Object.entries(ps).find(([,x])=>x&&x.profileId===id);if(!hit)return false;delete ps[hit[0]];if(typeof setProfils==='function')setProfils(ps);return true;}
function activate(id){const p=getProfileById(id);if(!p)return false;if(!validation(p).ok)return false;if(typeof V37_ACTIVE_PROFILE_KEY!=='undefined')localStorage.setItem(V37_ACTIVE_PROFILE_KEY,p.legacyKey);if((p.timeStatus||'exact')==='unknown')return true;let ok=false;try{if(typeof v37CalculerUserDepuisDonnees==='function')ok=!!v37CalculerUserDepuisDonnees(p);}catch(e){}return ok;}
window.AstroTruth={ENGINE_VERSION,TRUTH_VERSION,labels,isIana,validation,listProfiles,getProfileById,currentProfile,computeProfile,natal,day,period,relationship,saveProfile,removeProfile,activate,mapDomain,isoDate,addDays,addMonths};
try{migrateProfiles();}catch(e){}
})();
