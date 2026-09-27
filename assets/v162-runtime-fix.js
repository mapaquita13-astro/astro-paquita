/* Astro Paquita V162d — raccord runtime entre le moteur V121 et la nouvelle interface.
   IMPORTANT : ce fichier ne recalcule aucun thème, transit, maison ou aspect.
   Il normalise uniquement les sorties V121 déjà calculées pour l'interface V162. */
(function(){
'use strict';
if(window.__AP_V162D_RUNTIME_FIX__)return;
const A=window.AstroTruth;
if(!A)return;
window.__AP_V162D_RUNTIME_FIX__=true;

const ADAPTER_VERSION='v162d-adapter-20260927';
const CACHE_PREFIX='ap:v162d:';
const UI_DOMAINS=['amour','travail','argent','bienetre','famille','voyage'];

function safeJson(raw){try{return JSON.parse(raw);}catch(e){return null;}}
function legacyUser(){
  try{return (typeof USER!=='undefined'&&USER)?USER:(window.USER||null);}catch(e){return window.USER||null;}
}
function activeProfile(){try{return A.currentProfile?A.currentProfile():null;}catch(e){return null;}}
function ensureUser(){
  let u=legacyUser();
  const p=activeProfile();
  const mismatch=p&&u&&(
    String(u.prenom||'')!==String(p.prenom||'') ||
    String(u.dateRaw||'')!==String(p.date||'') ||
    Math.abs(Number(u.lat)-Number(p.lat))>.00001 ||
    Math.abs(Number(u.lon)-Number(p.lon))>.00001
  );
  if(p&&(!u||mismatch)){
    try{A.activate&&A.activate(p.profileId);}catch(e){}
    u=legacyUser();
  }
  return u;
}
function lang(){return String(localStorage.getItem('astro-lang')||'fr').toLowerCase().slice(0,2);}
function generalLabel(){return ({fr:'Général',en:'General',es:'General',ar:'عام'})[lang()]||'Général';}
function mapDomain(raw){
  const s=String(raw||'').toLowerCase();
  const exact=(arr)=>arr.some(x=>s===x||s.includes(x));
  if(exact(['love','couple','relationship','amour']))return 'amour';
  if(exact(['work','career','job','travail']))return 'travail';
  if(exact(['money','finance','finances','argent']))return 'argent';
  if(exact(['health','wellbeing','sante','bienetre','daily']))return 'bienetre';
  if(exact(['family','home','children','famille']))return 'famille';
  if(exact(['travel','voyage']))return 'voyage';
  return 'general';
}
function normalizeSignal(s,date){
  s=s||{};
  const domain=mapDomain(s.domain||s.selection);
  const importance=Number(s.importance||0);
  const force=Number(s.force??s.strength??s.importance??0);
  const score=Number(s.score??(importance?Math.min(100,Math.round(importance*20)):0));
  const labels=A.labels?A.labels():{};
  const aspect=(s.aspect===0||s.aspect)?Number(s.aspect):null;
  const technicalLabel=s.source
    ? String(s.source)+(aspect!==null?' '+aspect+'°':'')+(s.target?' · '+String(s.target):'')
    : '';
  return {
    date:A.isoDate(date||s.date),
    domain,
    domainLabel:labels[domain]||(domain==='general'?generalLabel():domain),
    polarity:s.polarite||s.polarity||s.pol||'mixte',
    level:s.niveau||s.level||(s.importance!=null?'quotidien':'marque'),
    force:Number.isFinite(force)?force:0,
    score:Number.isFinite(score)?score:0,
    label:s.label||technicalLabel||s.hint||'',
    families:s.coreFamilies||s.families||s.familles||(s.source?[s.source]:[]),
    signatures:s.signatures||[],
    scenarios:s.scenarios||(s.hint?[s.hint]:[]),
    source:s.source||null,
    target:s.target||null,
    hour:Number.isFinite(Number(s.heure))?Number(s.heure):null,
    aspect,
    personal:!!s.personal
  };
}
function cacheKey(kind,parts){return CACHE_PREFIX+kind+':'+parts.join(':');}
function profileCacheParts(){
  const p=activeProfile();
  return [String(p?.profileId||'legacy'),String(p?.birthDataVersion||'legacy')];
}
function readCache(key){try{return safeJson(localStorage.getItem(key));}catch(e){return null;}}
function writeCache(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(e){}return value;}
function microRows(d,u){
  if(typeof apDailyMicroAllV84!=='function')return [];
  try{
    const jd=typeof apJDFromDate==='function'
      ? apJDFromDate(d)
      : julianDay(d.getUTCFullYear(),d.getUTCMonth()+1,d.getUTCDate(),12);
    const r=apDailyMicroAllV84(jd,u.pos,u.AS,u.MC,{});
    if(Array.isArray(r))return r;
    if(r&&Array.isArray(r.signals))return r.signals;
  }catch(e){}
  return [];
}
function fixedDay(date,domain){
  const u=ensureUser();
  if(!u)throw Object.assign(new Error('No active profile'),{kind:'data'});
  const d=date instanceof Date?date:new Date(String(date)+'T12:00:00');
  if(isNaN(d))throw Object.assign(new Error('Invalid date'),{kind:'data'});
  const iso=A.isoDate(d), wanted=(domain&&domain!=='all')?String(domain):null;
  const key=cacheKey('day',[...profileCacheParts(),iso,wanted||'all',ADAPTER_VERSION]);
  const cached=readCache(key);if(cached)return cached;

  let majorRows=[];
  try{majorRows=(typeof apV51Signals==='function'?apV51Signals(d,'marque'):[])||[];}catch(e){}
  let signals=majorRows.map(x=>normalizeSignal(x,d));
  if(wanted)signals=signals.filter(x=>x.domain===wanted);

  // V121 renvoie le micro-climat sous la forme {signals:[...]}, et non comme un tableau.
  // On l'utilise seulement quand aucun signal majeur pertinent n'existe pour la demande.
  if(!signals.length){
    let micro=microRows(d,u).map(x=>normalizeSignal(x,d));
    if(wanted)micro=micro.filter(x=>x.domain===wanted);
    signals=micro;
  }

  const signed=signals.reduce((n,s)=>{
    const sign=s.polarity==='difficile'?-1:s.polarity==='positive'?1:0;
    return n+sign*Math.max(.1,Number(s.force)||0);
  },0);
  const avgIntensity=signals.length
    ? signals.reduce((a,b)=>a+Math.max(1,Number(b.score)||Math.abs(Number(b.force)||0)*20),0)/signals.length
    : 0;
  const out={
    type:'DayTruth',
    engineVersion:A.ENGINE_VERSION,
    truthVersion:String(A.TRUTH_VERSION||'truth')+'+'+ADAPTER_VERSION,
    profileId:activeProfile()?.profileId||null,
    date:iso,
    domain:domain||'all',
    signals,
    polarity:signed>.75?'positive':signed<-.75?'difficult':signals.length?'mixed':'calm',
    intensity:Math.min(100,Math.round(avgIntensity))
  };
  return writeCache(key,out);
}
function emptyScores(){return {amour:0,travail:0,argent:0,bienetre:0,famille:0,voyage:0};}
function scoreSignals(signals){
  const out=emptyScores(),cnt=emptyScores();
  (signals||[]).forEach(s=>{
    if(!UI_DOMAINS.includes(s.domain))return;
    const sign=s.polarity==='difficile'?-1:s.polarity==='positive'?1:0;
    out[s.domain]+=sign*Math.max(.1,Math.min(8,Number(s.force)||0));
    cnt[s.domain]++;
  });
  Object.keys(out).forEach(k=>{
    out[k]=cnt[k]?Math.max(-5,Math.min(5,+(out[k]/Math.sqrt(cnt[k])).toFixed(2))):0;
  });
  return out;
}
function addMonths(d,n){return A.addMonths?A.addMonths(d,n):new Date(d.getFullYear(),d.getMonth()+n,1);}
function fixedPeriod(start,months,options){
  const u=ensureUser();
  if(!u)throw Object.assign(new Error('No active timed profile'),{kind:'data',code:'timed_profile_required'});
  options=options||{};
  const m=Math.max(1,Math.min(24,Number(months)||12));
  const base=start instanceof Date?start:new Date(start||new Date());
  const month0=new Date(base.getFullYear(),base.getMonth(),1);
  const key=cacheKey('period',[...profileCacheParts(),A.isoDate(month0),m,ADAPTER_VERSION]);
  const cached=readCache(key);if(cached&&!options.force)return cached;
  const points=[],milestones=[];
  for(let i=0;i<m;i++){
    const first=addMonths(month0,i);
    const samples=[5,15,25].map(day=>new Date(first.getFullYear(),first.getMonth(),day,12,0,0));
    let sig=[];
    samples.forEach(d=>{try{sig=sig.concat(fixedDay(d,'all').signals||[]);}catch(e){}});
    const scores=scoreSignals(sig);
    const vals=Object.values(scores),avg=vals.reduce((a,b)=>a+b,0)/Math.max(1,vals.length);
    const abs=Math.max(0,...vals.map(Math.abs));
    const polarity=avg>.35?'positive':avg<-.35?'difficult':abs>.8?'mixed':'calm';
    const top=[...sig].sort((a,b)=>Math.abs(Number(b.force)||0)-Math.abs(Number(a.force)||0)).slice(0,10);
    points.push({month:A.isoDate(first).slice(0,7),scores,polarity,intensity:Math.round(Math.min(100,abs*20)),signals:top});
    sig.filter(s=>s.level==='exceptionnel'||s.level==='fort').slice(0,4).forEach(s=>milestones.push(s));
  }
  const out={
    type:'PeriodTruth',
    engineVersion:A.ENGINE_VERSION,
    truthVersion:String(A.TRUTH_VERSION||'truth')+'+'+ADAPTER_VERSION,
    profileId:activeProfile()?.profileId||null,
    start:A.isoDate(month0),months:m,
    domainLabels:A.labels?A.labels():{},
    points,
    milestones:milestones.sort((a,b)=>String(a.date).localeCompare(String(b.date))),
    calculatedAt:new Date().toISOString()
  };
  return writeCache(key,out);
}

A.day=fixedDay;
A.period=fixedPeriod;
A.__V162_ADAPTER_VERSION__=ADAPTER_VERSION;

// Nettoyage d'un libellé technique visible dans la vidéo : V121 est le moteur interne,
// il n'a pas à être affiché comme suffixe des intentions utilisateur.
let uiScheduled=false;
function fixVisibleUi(){
  uiScheduled=false;
  document.querySelectorAll('.ap-route-timing .ap-profile-row .ap-muted').forEach(el=>{
    if(/Analyse sectorielle\s*V121/i.test(el.textContent||''))el.textContent='Analyse sectorielle';
    el.style.display='block';
    el.style.marginTop='3px';
  });
  document.documentElement.dataset.astroV162Adapter=ADAPTER_VERSION;
}
function scheduleUi(){if(uiScheduled)return;uiScheduled=true;requestAnimationFrame(fixVisibleUi);}
const obs=new MutationObserver(scheduleUi);
if(document.documentElement)obs.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleUi,{once:true});
else scheduleUi();
})();
