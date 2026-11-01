/* Astro Paquita V195 — générateur résilient avec lecture locale en cas de panne IA.
   Toutes les périodes utilisent AstroTruth.day / moteur V121.
   Un seul clic = un seul calcul, avec cache, annulation et délai IA borné. */
(function(){
'use strict';
if(window.__AP_V195_FORECAST__)return;
window.__AP_V195_FORECAST__=true;
window.__AP_V187_FORECAST__=true;
/* Neutralise les anciennes couches annuelles : V187 prend désormais toutes les périodes. */
window.__AP_V186_ANNUAL_FORECAST__=true;
window.__AP_V184_PAST_YEAR__=true;

const A=window.AstroTruth;
if(!A)return;

const DOMAINS=['amour','travail','argent','bienetre','famille','voyage'];
const memTruth=new Map(),memReport=new Map();
let jobSeq=0,computing=false;

const I18N={
 fr:{forecast:'Prévision personnalisée',analysis:'Calcul de votre prévision',cached:'Prévision déjà calculée',interpret:'Interprétation en cours…',unavailable:'Le service de rédaction automatique n’a pas répondu. La lecture personnalisée calculée reste disponible ci-dessous.',none:'Aucune tendance dominante ne ressort sur cette période.',fav:'Période plutôt favorable',del:'Période demandant davantage de prudence',mix:'Période contrastée',stable:'Période relativement stable',premium:'Cette période est réservée aux comptes Premium.',days:'jours'},
 en:{forecast:'Personal forecast',analysis:'Calculating your forecast',cached:'Forecast already calculated',interpret:'Preparing the interpretation…',unavailable:'The detailed interpretation is taking too long. The calculated trends remain available below.',none:'No dominant trend stands out for this period.',fav:'Rather favourable period',del:'Period requiring more caution',mix:'Mixed period',stable:'Relatively stable period',premium:'This period is reserved for Premium accounts.',days:'days'},
 es:{forecast:'Previsión personalizada',analysis:'Calculando tu previsión',cached:'Previsión ya calculada',interpret:'Preparando la interpretación…',unavailable:'La interpretación detallada está tardando demasiado. Las tendencias calculadas siguen disponibles.',none:'No destaca ninguna tendencia dominante en este período.',fav:'Período bastante favorable',del:'Período que requiere más prudencia',mix:'Período contrastado',stable:'Período relativamente estable',premium:'Este período está reservado a las cuentas Premium.',days:'días'},
 ar:{forecast:'توقع شخصي',analysis:'جارٍ حساب التوقع',cached:'تم حساب التوقع مسبقاً',interpret:'جارٍ إعداد التفسير…',unavailable:'يستغرق التفسير المفصل وقتاً طويلاً. تبقى الاتجاهات المحسوبة متاحة أدناه.',none:'لا يظهر اتجاه مهيمن خلال هذه الفترة.',fav:'فترة مواتية نسبياً',del:'فترة تتطلب مزيداً من الحذر',mix:'فترة متباينة',stable:'فترة مستقرة نسبياً',premium:'هذه الفترة مخصصة لحسابات Premium.',days:'أيام'}
};

const q=(s,r)=>(r||document).querySelector(s);
function lang(){return String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2)}
function tx(k){const t=I18N[lang()]||I18N.fr;return t[k]||I18N.fr[k]||k}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function fromIso(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(s||'')))return null;const d=new Date(s+'T12:00:00');return isNaN(d)?null:d}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function addMonths(d,n){const day=d.getDate(),x=new Date(d.getFullYear(),d.getMonth()+n,1,12),last=new Date(x.getFullYear(),x.getMonth()+1,0,12).getDate();x.setDate(Math.min(day,last));return x}
function today(){const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate(),12)}
function fmt(d,opt){return d.toLocaleDateString({fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'}[lang()]||'fr-FR',opt||{day:'numeric',month:'long',year:'numeric'})}
function period(){return q('.ap-route-forecast .ap-period-choice.active,[data-per].active')?.dataset.per||'mois'}
function domain(){return q('.ap-route-forecast .ap-domain-choice.active,[data-domain].active')?.dataset.domain||'all'}
function span(per){if(per==='jour'||per==='date')return 1;if(per==='semaine')return 7;if(per==='mois')return 30;if(per==='trimestre')return 90;return 365}
function start(per){
 if(per==='date'){const d=fromIso(q('#ap-forecast-date')?.value||'');if(d)return d}
 const d=fromIso(q('.ap-forecast-period-nav')?.dataset.v174Anchor||'');
 return d||today()
}
function rangeTitle(s,days){const e=addDays(s,days-1);return days===1?fmt(s):fmt(s)+' → '+fmt(e)}
function premiumAccess(){try{return document.body.classList.contains('ap-premium-user')||window.USER_CONNECTE?.role==='admin'||window.USER_CONNECTE?.premium===true}catch(e){return false}}
function freeAccess(){return document.body.classList.contains('ap-free-user')}
function showPremium(){
 let x=q('.ap-premium-lock-toast');
 if(x){x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),3200);return}
 try{if(typeof window.toast==='function'){window.toast(tx('premium'));return}}catch(e){}
 const e=q('#ap-forecast-error');if(e){e.textContent=tx('premium');e.classList.add('show')}
}
function setBusy(v){
 const l=q('#ap-forecast-loader');if(l)l.classList.toggle('show',!!v);
 const b=q('#ap-run-forecast');if(b)b.disabled=!!v
}
function setError(t){const e=q('#ap-forecast-error');if(e){e.textContent=t||'';e.classList.toggle('show',!!t)}}
function ensureProfile(){
 const p=A.currentProfile&&A.currentProfile();
 if(!p)throw new Error('Aucun profil actif.');
 try{A.activate&&A.activate(p.profileId||p.legacyKey)}catch(e){}
 try{
   if((typeof USER==='undefined'||!USER)&&typeof window.v37CalculerUserDepuisDonnees==='function'){
     window.v37CalculerUserDepuisDonnees({...p,__profileKey:p.legacyKey,__timeStatus:p.timeStatus||'exact'})
   }
 }catch(e){}
 return p
}
function profileCacheId(){
 const p=A.currentProfile&&A.currentProfile();
 return p?String(p.profileId||p.legacyKey||'profile')+'|'+String(p.birthDataVersion||p.updatedAt||''):'profile'
}
function cacheBase(s,days,dom,per){return ['ap','forecast','v195-compact-reading',profileCacheId(),per,iso(s),String(days),dom,lang(),String(A.TRUTH_VERSION||'truth')].join(':')}
function truthKey(s,days,dom,per){return cacheBase(s,days,dom,per)+':truth'}
function locationSnapshot(){try{return window.APForecastSolarLocations?.getLocations?.()||{}}catch(e){return{}}}
function locationFingerprint(){return JSON.stringify(locationSnapshot())}
function reportKey(s,days,dom,per){return cacheBase(s,days,dom,per)+':report-v195:'+locationFingerprint()}
function readJson(k){if(memTruth.has(k))return memTruth.get(k);try{const v=JSON.parse(localStorage.getItem(k)||'null');if(v)memTruth.set(k,v);return v}catch(e){return null}}
function writeJson(k,v){memTruth.set(k,v);try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function readReport(k){if(memReport.has(k))return memReport.get(k);try{const v=localStorage.getItem(k)||'';if(v)memReport.set(k,v);return v}catch(e){return''}}
function writeReport(k,v){if(!v)return;memReport.set(k,v);try{localStorage.setItem(k,v)}catch(e){}}
function cancelled(){const e=new Error('CANCELLED');e.code='CANCELLED';return e}

function bucketSpecs(s,days,per){
 const out=[];
 if(days===1){out.push({start:s,end:addDays(s,1),label:fmt(s,{weekday:'long',day:'numeric',month:'long',year:'numeric'}),signals:[]});return out}
 if(per==='semaine'){
   for(let i=0;i<7;i++){const a=addDays(s,i);out.push({start:a,end:addDays(a,1),label:fmt(a,{weekday:'short',day:'numeric',month:'short'}),signals:[]})}
   return out
 }
 if(per==='mois'){
   const size=7;
   for(let i=0;i<days;i+=size){const a=addDays(s,i),b=addDays(s,Math.min(days,i+size));out.push({start:a,end:b,label:fmt(a,{day:'numeric',month:'short'})+' → '+fmt(addDays(b,-1),{day:'numeric',month:'short'}),signals:[]})}
   return out
 }
 if(per==='trimestre'){
   for(let i=0;i<3;i++){const a=addMonths(s,i),b=i===2?addDays(s,days):addMonths(s,i+1);out.push({start:a,end:b,label:fmt(a,{month:'long',year:'numeric'}),signals:[]})}
   return out
 }
 for(let i=0;i<12;i++){const a=addMonths(s,i),b=i===11?addDays(s,days):addMonths(s,i+1);out.push({start:a,end:b,label:fmt(a,{month:'long',year:'numeric'}),signals:[]})}
 return out
}
function findBucket(bs,d){for(const b of bs)if(d>=b.start&&d<b.end)return b;return bs[bs.length-1]}
// Un aspect actif pendant plusieurs jours ne représente qu'une configuration.
function uniqueSignals(xs){
 const m=new Map();
 for(const x of xs||[]){
  if(!x)continue;
  const src=String(x.source||'').toLowerCase(),dest=String(x.target||'').toLowerCase();
  const asp=x.aspect===0||x.aspect!=null?String(x.aspect):'';
  const label=String(x.label||x.scenarios?.[0]||x.families?.[0]||'inconnu').toLowerCase().replace(/\s+/g,' ').trim();
  const key=[x.domain,x.polarity,(src||dest)?src+'|'+dest+'|'+asp:label].join('::');
  const old=m.get(key);
  if(!old||Math.abs(Number(x.force)||0)>Math.abs(Number(old.force)||0))m.set(key,x);
 }
 return [...m.values()];
}
function score(xs,dom){
 const a=uniqueSignals((xs||[]).filter(s=>dom==='all'||s.domain===dom));
 if(!a.length)return 0;
 let v=0;
 for(const x of a){const sign=x.polarity==='difficile'?-1:x.polarity==='positive'?1:0;v+=sign*Math.max(.1,Math.min(5,Math.abs(Number(x.force)||0)))}
 return Math.max(-5,Math.min(5,+(v/a.length).toFixed(2)));
}
async function scan(s,days,dom,per,progress,job){
 const ck=truthKey(s,days,dom,per),cached=readJson(ck);
 if(cached&&cached.days===days&&Array.isArray(cached.points)){progress?.(days,true);return cached}
 ensureProfile();
 const bs=bucketSpecs(s,days,per),all=[];
 const stride=days>=300?7:days>=90?2:1;
 const yieldEvery=days>=300?4:days>=90?6:days>=30?10:4;
 let visited=0;
 for(let i=0;i<days;i+=stride){
   visited++;
   if(job!==jobSeq)throw cancelled();
   const d=addDays(s,i),t=A.day(d,dom),sig=Array.isArray(t?.signals)?t.signals:[];
   if(sig.length){findBucket(bs,d).signals.push(...sig);all.push(...sig)}
   if(i===0||i+stride>=days||visited%yieldEvery===0){
     progress?.(Math.min(days,i+stride),false);
     await new Promise(r=>setTimeout(r,0));
     if(job!==jobSeq)throw cancelled()
   }
 }
 const points=bs.map(b=>{
   const unique=uniqueSignals(b.signals);
   const scores={};
   if(dom==='all')DOMAINS.forEach(x=>scores[x]=score(unique,x));else scores[dom]=score(unique,dom);
   const vals=Object.values(scores).map(Number).filter(Number.isFinite);
   const avg=vals.length?vals.reduce((a,c)=>a+c,0)/vals.length:0;
   const abs=vals.length?Math.max(...vals.map(Math.abs)):0;
   return {label:b.label,start:iso(b.start),end:iso(addDays(b.end,-1)),scores,polarity:avg>.35?'positive':avg<-.35?'difficult':abs>.8?'mixed':'calm',signalCount:unique.length,signals:unique.slice().sort((a,c)=>Math.abs(Number(c.force)||0)-Math.abs(Number(a.force)||0)).slice(0,8)}
 });
 const out={type:'ForecastTruth',engineVersion:A.ENGINE_VERSION,truthVersion:String(A.TRUTH_VERSION||'truth')+'+v188-verified',period:per,start:iso(s),end:iso(addDays(s,days-1)),days,domain:dom,samplingDays:stride,points,keyDates:stride===1?uniqueSignals(all.filter(x=>x&&(x.level==='exceptionnel'||x.level==='fort'||Number(x.force)>=2.2))).sort((a,b)=>Math.abs(Number(b.force)||0)-Math.abs(Number(a.force)||0)).slice(0,12):[]};
 writeJson(ck,out);
 return out
}
function stateOf(p,dom){
 const vals=dom==='all'?Object.values(p.scores||{}).map(Number):[Number(p.scores?.[dom]||0)];
 const sc=vals.length?vals.reduce((a,b)=>a+(Number.isFinite(b)?b:0),0)/vals.length:0;
 return sc>=1.25?'fav':sc<=-1.25?'del':Math.abs(sc)<.6?'stable':'mix'
}
function concreteHint(dom,state){
 const fr={
  argent:{fav:'Les questions d’argent offrent davantage de marge de manœuvre : démarches, négociations, rentrées ou décisions financières peuvent être plus fluides.',del:'Mieux vaut surveiller le budget, les dépenses, engagements ou décisions financières et éviter la précipitation.',mix:'Les finances demandent des arbitrages : certaines ouvertures peuvent coexister avec des dépenses ou contraintes à gérer.',stable:'La situation financière paraît relativement régulière, sans mouvement dominant.'},
  travail:{fav:'Les indicateurs astrologiques sont plutôt favorables ; ils ne prouvent ni promotion ni proposition professionnelle.',del:'Le travail demande davantage de prudence, d’organisation et de recul avant une décision importante.',mix:'Le contexte professionnel est contrasté, avec des possibilités mais aussi des ajustements à prévoir.',stable:'Le rythme professionnel paraît relativement régulier.'},
  amour:{fav:'Les échanges affectifs sont plus faciles et les rapprochements ou décisions à deux peuvent être favorisés.',del:'Les relations demandent plus de tact, de recul et de prudence dans les réactions.',mix:'La vie affective peut alterner rapprochements et tensions ou hésitations.',stable:'La vie affective paraît relativement stable.'},
  famille:{fav:'Le climat familial ou les questions de foyer peuvent avancer plus facilement.',del:'Les questions familiales ou de foyer demandent davantage de patience et d’organisation.',mix:'Le domaine familial peut mêler avancées et ajustements.',stable:'Le climat familial paraît relativement stable.'},
  bienetre:{fav:'Le rythme personnel est plus porteur pour retrouver de l’élan et de l’équilibre.',del:'Il est préférable de ménager son rythme et de ne pas trop tirer sur ses réserves.',mix:'Le niveau d’énergie peut être irrégulier et demande des ajustements.',stable:'Le rythme personnel paraît relativement régulier.'},
  voyage:{fav:'Les déplacements, projets de voyage ou démarches liées à l’extérieur sont plus fluides.',del:'Les déplacements ou projets de voyage demandent davantage d’anticipation et de vérifications.',mix:'Les projets de déplacement peuvent avancer mais avec quelques ajustements.',stable:'Aucun mouvement dominant ne ressort sur les déplacements.'},
  all:{fav:'La période offre globalement davantage d’ouvertures et de fluidité.',del:'La période demande globalement plus de prudence et d’anticipation.',mix:'La période est contrastée et demande de choisir ses moments.',stable:'La période paraît globalement assez stable.'}
 };
 if(lang()==='fr')return (fr[dom]||fr.all)[state]||fr.all[state];
 return tx(state)
}
function fallback(t,dom,note){
 const rows=(t.points||[]).map(p=>{const st=stateOf(p,dom);return '<div class="ap-aspect"><strong>'+esc(p.label)+'</strong><span>'+esc(tx(st))+'</span><span>'+esc(concreteHint(dom,st))+'</span></div>'}).join('');
 return (note?'<p class="ap-muted">'+esc(note)+'</p>':'')+(rows?'<div class="ap-aspect-list">'+rows+'</div>':'<p>'+esc(tx('none'))+'</p>')
}
function slimSignal(s){return {date:s.date,domain:s.domain,polarity:s.polarity,importance:s.level||null,
 source:s.source||null,target:s.target||null,aspect:s.aspect??null,label:s.label||null,
 scenarios:Array.isArray(s.scenarios)?s.scenarios.slice(0,2):[]}}
function publicTruth(t,methods){
 return {period:t.period,start:t.start,end:t.end,domain:t.domain,samplingDays:t.samplingDays,
  note:'Repères du moteur V121, dédoublonnés. Aucune validation des événements réels ni preuve de convergence de méthodes indépendantes.',
  points:(t.points||[]).map(p=>({period:{start:p.start,end:p.end,label:p.label},trend:p.polarity,indicators:p.signalCount,signals:(p.signals||[]).slice(0,5).map(slimSignal)})),
  keyDates:(t.keyDates||[]).slice(0,12).map(slimSignal),additionalMethods:methods||null}
}
function evidenceHtml(t){
 const french=lang()==='fr';
 const l=lang();
 const title=({fr:'Configurations astrologiques prises en compte',en:'Astrological signals considered',es:'Configuraciones astrológicas consideradas',ar:'التكوينات الفلكية المعتمدة'})[l]||'Configurations astrologiques prises en compte';
 const sampler=({fr:'Relevés espacés de {n} jours ; aucune date précise ne peut être déduite.',en:'Samples {n} days apart; exact dates cannot be inferred.',es:'Muestreo cada {n} días; no se pueden deducir fechas exactas.',ar:'تُؤخذ عينات كل {n} أيام، ولا يمكن استنتاج تواريخ دقيقة.'})[l];
 const daily=({fr:'Relevés quotidiens.',en:'Daily samples.',es:'Muestreo diario.',ar:'عينات يومية.'})[l];
 const sample=t.samplingDays>1?String(sampler||'Relevés espacés de {n} jours.').replace('{n}',String(t.samplingDays)):(daily||'Relevés quotidiens.');
 const rows=(t.points||[]).map(p=>{
  const a=(p.signals||[]).slice(0,3).map(x=>{
   const basis=[x.source,x.target,x.aspect===0||x.aspect!=null?String(x.aspect)+'°':null].filter(v=>v!==null&&v!==undefined&&v!=='').join(' · ');
   const item=basis||x.label||'';
   return item?'<li>'+esc(item)+'</li>':'';
  }).join('');
  return a?'<div style="margin-top:8px"><strong>'+esc(p.label)+'</strong><ul>'+a+'</ul></div>':'';
 }).join('');
 return '<details style="margin-top:18px;border:1px solid #dfd3de;border-radius:10px;padding:12px"><summary style="cursor:pointer;font-weight:700">'+esc(title)+'</summary><p>'+esc(sample)+'</p>'+rows+'</details>';
}
function techniquesHtml(methods){
 if(!methods)return '<p class="ap-muted" style="margin-top:14px">Les techniques complémentaires ne sont pas disponibles pour ce rapport.</p>';
 const fr=lang()==='fr';
 const langName={fr:'Méthodes complémentaires calculées',en:'Additional methods calculated',es:'Métodos adicionales calculados',ar:'الطرق الإضافية المحسوبة'}[lang()]||'Méthodes complémentaires calculées';
 const asText=a=>esc(a.source+' '+(a.aspectName||a.aspect+'°')+' '+a.target+' (orbe '+a.orb+'°'+(a.observedDate?', relevé '+a.observedDate:'')+')');
 const rows=(methods.points||[]).map(p=>{
  const slow=(p.slowTransits||[]).slice(0,4);
  const prog=(p.progressions||[]).slice(0,3);
  const statements=[];
  if(p.profection)statements.push('Profection : maison '+p.profection.house+' en '+p.profection.sign+', maître '+p.profection.lord);
  if(p.firdaria)statements.push('Firdaria '+p.firdaria.sect+' : '+p.firdaria.major+(p.firdaria.sub?' / '+p.firdaria.sub:''));
  if(slow.length)statements.push('Transits lents : '+slow.map(asText).join(' ; '));
  if(prog.length)statements.push('Progressions secondaires : '+prog.map(asText).join(' ; '));
  if(p.solarArcDirections?.length)statements.push('Directions d’arc solaire ('+p.solarArcDegrees+'°) : '+p.solarArcDirections.slice(0,3).map(asText).join(' ; '));
  if(!statements.length)statements.push('Aucun aspect complémentaire à 1° au relevé de cette période');
  return '<div style="margin:12px 0"><strong>'+esc(p.period)+'</strong><ul>'+statements.map(x=>'<li>'+x+'</li>').join('')+'</ul></div>';
 }).join('');
 const sol=(methods.solarReturns||[]).map(r=>'<li>'+esc(String(r.year)+' : '+r.instantUtc+' UTC'+(r.localDate?' ; heure locale '+r.localDate:'')+' ; orbe Soleil '+r.sunOrb+'°'+(r.houseCusps?' ; lieu '+r.location?.city+', Ascendant '+r.ascendant+'°, MC '+r.mc+'°, maisons '+r.houseSystem:' ; maisons non calculées (lieu non renseigné)')+
 (r.planets?.length?' ; planètes : '+r.planets.filter(p=>p.house).slice(0,10).map(p=>p.name+' maison '+p.house).join(', '):''))+'</li>').join('');
 const sky=methods.sky||null;
 const eclipses=(sky?.eclipses||[]).map(e=>'<li>'+esc(e.dateUtc.slice(0,16).replace('T',' ')+' UTC : éclipse '+e.type+' '+e.kind+', '+e.zodiac.sign+' '+e.zodiac.degree+'°'+(e.zodiac.wholeSignHouse?' (maison '+e.zodiac.wholeSignHouse+')':'')+(e.zodiac.natalContacts?.length?' ; contact natal '+e.zodiac.natalContacts.slice(0,2).map(x=>x.aspectName+' '+x.target+' (orbe '+x.orb+'°)').join(', '):''))+'</li>').join('');
 const stations=(sky?.retrogradeStations||[]).map(e=>'<li>'+esc(e.dateUtc.slice(0,10)+' : '+e.planet+' station '+e.motion+' en '+e.zodiac.sign)+'</li>').join('');
 const lunations=(sky?.lunations||[]).slice(0,24).map(e=>'<li>'+esc(e.dateUtc.slice(0,10)+' : '+e.type+' en '+e.zodiac.sign)+'</li>').join('');
 const slowCount=(methods.points||[]).reduce((n,p)=>n+(p.slowTransits||[]).length,0);
 const progressCount=(methods.points||[]).reduce((n,p)=>n+(p.progressions||[]).length,0);
 const countLine=fr?'Relevés : '+slowCount+' contact(s) de transits lents et '+progressCount+' contact(s) en progression secondaire (doublons mensuels possibles).':'Samples: '+slowCount+' slow-transit contacts and '+progressCount+' secondary progression contacts (some repeat across periods).';
 const status=methods.techniquesError?'<p class="ap-muted">Transits, progressions et cycles non disponibles : '+esc(methods.techniquesError)+'</p>':'';
 const skyStatus=methods.skyError?'<p class="ap-muted">Éclipses et lunaisons non disponibles : '+esc(methods.skyError)+'</p>':'';
 const note=fr?'Les aspects sont évalués avec 1° d’orbe aux dates d’échantillonnage ; l’absence d’aspect à ce relevé ne signifie pas qu’il n’existe aucun transit sur l’intervalle. Les maisons des révolutions solaires exigent le lieu de présence cette année-là.':'Aspects use a 1° orb at sampled dates. No aspect at a sample does not mean no aspect during the entire interval. Solar-return houses need the location for that year.';
 return status+skyStatus+'<p class="ap-muted" style="margin:12px 0">'+esc(countLine)+'</p><details style="margin-top:16px;border:1px solid #dfd3de;border-radius:10px;padding:12px"><summary style="cursor:pointer;font-weight:700">'+esc(langName)+'</summary><p>'+esc(note)+'</p>'+rows+(sol?'<p><strong>Révolutions solaires</strong></p><ul>'+sol+'</ul>':'')+(sky?'<p><strong>Éclipses sur la période</strong></p>'+(eclipses?'<ul>'+eclipses+'</ul>':'<p>Aucune éclipse sur la période.</p>')+(stations?'<p><strong>Stations et rétrogradations</strong></p><ul>'+stations+'</ul>':'')+(lunations?'<p><strong>Nouvelle et pleine lune</strong></p><ul>'+lunations+'</ul>':''):'<p>Éclipses et lunaisons indisponibles (éphéméride absente).</p>')+'</details>';
}
function localReading(t,methods){try{return window.APForecastReadableFallback?.render?.(t,methods,lang())||fallback(t,domain(),'')}catch(e){console.error('Lecture locale non disponible',e);return fallback(t,domain(),'')}}
function aiText(x){try{if(typeof window.texteClaude==='function')return window.texteClaude(x)||''}catch(e){}return x?.content?.[0]?.text||x?.text||''}
function htmlText(x){try{if(typeof window.formatRapport==='function')return window.formatRapport(x)}catch(e){}return String(x||'').split(/\n{2,}/).filter(Boolean).map(p=>'<p>'+esc(p)+'</p>').join('')}
function timeout(p,ms){
 let timer;
 return Promise.race([p,new Promise((_,rej)=>{timer=setTimeout(()=>{const e=new Error('TIMEOUT');e.code='TIMEOUT';rej(e)},ms)})])
   .finally(()=>clearTimeout(timer));
}
function failureNote(e){
 const message=String(e?.message||'').trim();
 if(e?.code==='TIMEOUT')return tx('unavailable');
 if(lang()!=='fr')return tx('unavailable');
 if(/OPENROUTER_KEY_MISSING|OPENROUTER_API_KEY|n.est pas configurée/i.test(message))return 'Le fournisseur d’interprétation IA n’est pas configuré sur le serveur. La configuration OpenRouter doit être vérifiée.';
 if(/429|Trop de requêtes|rate.limit|quota/i.test(message))return 'Le service d’interprétation limite actuellement les demandes. Vous pouvez réessayer.';
 if(/401|Non connecté|Session invalide/i.test(message))return 'Votre session a expiré. Reconnectez-vous pour obtenir votre interprétation.';
 if(/403|réservée aux profils Premium/i.test(message))return 'Votre accès Premium doit être vérifié pour générer cette interprétation.';
 return 'L’interprétation détaillée n’a pas abouti'+(message?': '+message.slice(0,180):'.');
}
function retryButton(){
 const labels={fr:'Réessayer l’interprétation',en:'Retry interpretation',es:'Reintentar la interpretación',ar:'إعادة محاولة التفسير'};
 return '<button type="button" id="ap-forecast-retry-ai" style="margin-top:14px;padding:12px 18px;border:0;border-radius:999px;background:#53164a;color:#fff;font-weight:700;cursor:pointer">'+esc(labels[lang()]||labels.fr)+'</button>';
}
function modeRule(s,days){const n=today(),e=addDays(s,days-1);if(e<n)return "La période est passée : propose une lecture rétrospective sans prétendre connaître les événements réellement vécus.";if(s>n)return "La période est future : formule des tendances et possibilités, jamais des certitudes.";return "La période touche le présent : distingue clairement ce qui est déjà écoulé et ce qui est à venir, sans inventer d’événements."}
async function interpret(t,s,days,dom,per,methods){
 if(typeof window.appelerClaude!=='function')throw new Error('IA indisponible');
 const f=window.APForecastReadableFallback;
 const compact=f&&typeof f.compact==='function'?f.compact(t,methods,lang()):publicTruth(t,methods);
 const system=`Tu rédiges des prévisions astrologiques Astro Paquita UNIQUEMENT à partir des données fournies. ${modeRule(s,days)}
Les techniques 'methods' contiennent des contacts calculés (transits lents, progressions secondaires, arc solaire, profections et firdaria), les retours solaires et les phénomènes astronomiques 'sky'. Les dates de contact échantillonnées ne sont pas des dates d'exactitude ; les éclipses et stations sont datées astronomiquement. Une éclipse mondiale n'est pas nécessairement visible sur place.
Rédige une interprétation personnalisée, concrète et lisible : une vue d'ensemble de 4 phrases ; puis chaque période, avec les transits lents significatifs, leur nature, leur domaine de vie si calculé et le rôle des méthodes complémentaires ; puis une synthèse des priorités. Évite les répétitions, les détails techniques inutiles et les déclarations générales de stabilité lorsque des signaux existent.
N'invente pas de positions, aspects, dates, maisons ou événements réels. Ne prétends pas à une promotion, rentrée d'argent, maladie ou rencontre certaine. Si une méthode manque, ne l'attribue pas au calcul. Pas d'avertissement répétitif, pas de probabilité chiffrée. Réponds uniquement dans la langue de language, sous forme de sections courtes.`;
 const model=days>=30?'claude-haiku-4-5':'claude-sonnet-4-6';
 const tokens=days>=300?2100:days>=90?1450:days>=30?1100:850;
 const isToday=days===1&&iso(s)===iso(today());
 const request=window.appelerClaude({
  feature:isToday?'forecast_today':'forecast_future',
  featureContext:{module:'forecast',period:per,mode:'compact_v195',domain:dom,start:iso(s),date:iso(s),days,truthVersion:t.truthVersion},
  model,max_tokens:tokens,system,
  messages:[{role:'user',content:JSON.stringify(compact)}]
 });
 const data=await timeout(request,65000);
 const result=aiText(data);
 if(!result||!result.trim()){const e=new Error('Le fournisseur IA a répondu sans texte exploitable.');e.code='EMPTY_AI_RESPONSE';throw e}
 return result;
}
function cancelCurrent(){jobSeq++;computing=false;setBusy(false)}
async function run(){
 const out=q('#ap-forecast-result');if(!out)return;
 const per=period(),dom=domain(),days=span(per),s=start(per);
 if(!s){setError('Choisissez une date valide.');return}
 if(freeAccess()&&!premiumAccess()&&!(days===1&&iso(s)===iso(today()))){showPremium();return}
 if(computing)cancelCurrent();
 const job=++jobSeq;computing=true;setBusy(true);setError('');
 out.innerHTML='<div class="ap-card"><h3>'+esc(rangeTitle(s,days))+'</h3><p id="ap-v187-progress" class="ap-muted">'+esc(tx('analysis'))+'…</p></div>';
 let t;
 try{
   t=await scan(s,days,dom,per,(n,cached)=>{if(job!==jobSeq)return;const e=q('#ap-v187-progress');if(e)e.textContent=cached?tx('cached'):tx('analysis')+' : '+n+'/'+days},job);
   if(job!==jobSeq)return;
 }catch(e){
   if(e?.code==='CANCELLED'||job!==jobSeq)return;
   console.error('Astro Paquita V187 scan :',e);
   setError(e?.message||'La prévision n’a pas pu être calculée.');
   out.innerHTML='';
   computing=false;setBusy(false);
   return
 }
 if(job!==jobSeq||!t)return;
 let methods=null;
 const mk=cacheBase(s,days,dom,per)+':techniques-v194:'+locationFingerprint();
 methods=readJson(mk);
 if(!methods){
  try{
   const M=window.APForecastMethods;
   if(!M||typeof M.compute!=='function')throw new Error('Module de calcul indisponible');
   const e=q('#ap-v187-progress');if(e)e.textContent='Calcul des transits lents, progressions et cycles annuels…';
   methods=await M.compute({A,profile:A.currentProfile(),truth:t,locations:locationSnapshot(),jobActive:()=>job===jobSeq});
   if(job!==jobSeq)return;
   writeJson(mk,methods);
  }catch(e){
   if(job!==jobSeq)return;
   console.error('Astro Paquita : calculs complémentaires indisponibles',e);
   // Ne pas bloquer les éclipses si une technique natale échoue.
   methods={engine:'calculs partiels',points:[],solarReturns:[],
    techniquesError:String(e?.details?.join(', ')||e?.message||'erreur inconnue').slice(0,180)};
 }
 }
 // Les phénomènes astronomiques indépendants restent accessibles, même si
 // un problème dans le thème natal bloque une autre méthode de calcul.
 if(!methods)methods={engine:'calculs partiels',points:[],solarReturns:[]};
 if(!methods.sky){
  const skyKey=cacheBase(s,days,dom,per)+':events-v191';
  let sky=readJson(skyKey);
  if(!sky){
   try{
    const engine=window.APForecastSkyEvents;
    if(!engine||typeof engine.compute!=='function')throw new Error('Éphéméride des éclipses absente');
    let natal;
    try{natal=A.natal(A.currentProfile())}
    catch(e){console.warn('Contacts natals non calculables pour les éclipses',e?.message||e);natal={positions:{},angles:{}}}
    sky=await engine.compute({truth:t,natal,jobActive:()=>job===jobSeq});
    if(job!==jobSeq)return;
    writeJson(skyKey,sky);
   }catch(e){
    if(job!==jobSeq)return;
    console.warn('Événements astronomiques indisponibles',e);
    methods={...methods,skyError:String(e?.message||'erreur inconnue').slice(0,180)};
   }
  }
  if(sky)methods={...methods,sky};
 }
 const rk=reportKey(s,days,dom,per),cachedReport=readReport(rk);
 out.innerHTML='<div class="ap-card ap-forecast-v174 ap-forecast-v187"><div class="ap-eyebrow">'+esc(tx('forecast'))+'</div><h2 style="margin:6px 0 14px">'+esc(rangeTitle(s,days))+'</h2><div class="ap-report" id="ap-v187-report">'+localReading(t,methods)+techniquesHtml(methods)+evidenceHtml(t)+'</div><div class="ap-loader show" id="ap-v187-ai"><i class="ap-spinner"></i><span>'+esc(tx('interpret'))+'</span></div></div>';
 const rep=q('#ap-v187-report'),ai=q('#ap-v187-ai');
 if(cachedReport){if(rep)rep.innerHTML=htmlText(cachedReport)+techniquesHtml(methods)+evidenceHtml(t);ai?.classList.remove('show');computing=false;setBusy(false);return}

 try{
   const txt=await interpret(t,s,days,dom,per,methods);
   if(job!==jobSeq)return;
   if(txt){if(rep)rep.innerHTML=htmlText(txt)+techniquesHtml(methods)+evidenceHtml(t);if(!methods?.techniquesError&&!methods?.skyError)writeReport(rk,txt)}
   else if(rep)rep.innerHTML='<p class="ap-muted">'+esc(tx('unavailable'))+'</p>'+localReading(t,methods)+techniquesHtml(methods)+evidenceHtml(t)+retryButton()
 }catch(e){
   if(job!==jobSeq)return;
   console.warn('Astro Paquita : échec de l’interprétation',e?.code||'',e?.message||'');
   if(rep)rep.innerHTML='<p class="ap-muted">'+esc(failureNote(e))+'</p>'+localReading(t,methods)+techniquesHtml(methods)+evidenceHtml(t)+retryButton()
 }finally{
   if(job===jobSeq){ai?.classList.remove('show');computing=false;setBusy(false)}
 }
}

window.addEventListener('click',function(ev){
 const t=ev.target?.closest?.('#ap-forecast-prev,#ap-forecast-next,#ap-run-forecast,#ap-forecast-retry-ai,[data-per]');
 if(!t||!document.body.classList.contains('ap-route-forecast'))return;
 if((t.id==='ap-forecast-prev'||t.id==='ap-forecast-next'||t.matches('[data-per]'))&&computing)cancelCurrent();
 if(t.id!=='ap-run-forecast'&&t.id!=='ap-forecast-retry-ai')return;
 const per=period(),days=span(per),s=start(per);
 if(freeAccess()&&!premiumAccess()&&!(days===1&&iso(s)===iso(today()))){
   ev.preventDefault();ev.stopImmediatePropagation();showPremium();return
 }
 ev.preventDefault();ev.stopImmediatePropagation();run()
},true);
})();
