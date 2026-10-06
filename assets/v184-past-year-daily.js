/* Astro Paquita V187 — générateur unique de prévisions.
   Toutes les périodes utilisent AstroTruth.day / moteur V121.
   Un seul clic = un seul calcul, avec cache, annulation et délai IA borné. */
(function(){
'use strict';
if(window.__AP_V187_FORECAST__)return;
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
 fr:{forecast:'Prévision personnalisée',analysis:'Calcul de votre prévision',cached:'Prévision déjà calculée',interpret:'Interprétation en cours…',unavailable:'L’interprétation détaillée prend trop de temps. Les tendances calculées restent disponibles ci-dessous.',none:'Aucune tendance dominante ne ressort sur cette période.',fav:'Période plutôt favorable',del:'Période demandant davantage de prudence',mix:'Période contrastée',stable:'Période relativement stable',premium:'Cette période est réservée aux comptes Premium.',days:'jours'},
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
function cacheBase(s,days,dom,per){return ['ap','forecast','v187',profileCacheId(),per,iso(s),String(days),dom,lang(),String(A.TRUTH_VERSION||'truth')].join(':')}
function truthKey(s,days,dom,per){return cacheBase(s,days,dom,per)+':truth'}
function reportKey(s,days,dom,per){return cacheBase(s,days,dom,per)+':report'}
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
function score(xs,dom){
 const a=(xs||[]).filter(s=>dom==='all'||s.domain===dom);
 if(!a.length)return 0;
 let v=0;
 for(const s of a){const sign=s.polarity==='difficile'?-1:s.polarity==='positive'?1:0;v+=sign*Math.max(1,Math.min(8,Number(s.force)||1))}
 return Math.max(-5,Math.min(5,+(v/Math.sqrt(a.length)).toFixed(2)))
}
async function scan(s,days,dom,per,progress,job){
 const ck=truthKey(s,days,dom,per),cached=readJson(ck);
 if(cached&&cached.days===days&&Array.isArray(cached.points)){progress?.(days,true);return cached}
 ensureProfile();
 const bs=bucketSpecs(s,days,per),all=[];
 const yieldEvery=days>=300?25:days>=90?15:days>=30?10:4;
 for(let i=0;i<days;i++){
   if(job!==jobSeq)throw cancelled();
   const d=addDays(s,i),t=A.day(d,dom),sig=Array.isArray(t?.signals)?t.signals:[];
   if(sig.length){findBucket(bs,d).signals.push(...sig);all.push(...sig)}
   if(i===0||i===days-1||i%yieldEvery===yieldEvery-1){
     progress?.(i+1,false);
     await new Promise(r=>setTimeout(r,0));
     if(job!==jobSeq)throw cancelled()
   }
 }
 const points=bs.map(b=>{
   const scores={};
   if(dom==='all')DOMAINS.forEach(x=>scores[x]=score(b.signals,x));else scores[dom]=score(b.signals,dom);
   const vals=Object.values(scores).map(Number).filter(Number.isFinite);
   const avg=vals.length?vals.reduce((a,c)=>a+c,0)/vals.length:0;
   const abs=vals.length?Math.max(...vals.map(Math.abs)):0;
   return {label:b.label,start:iso(b.start),end:iso(addDays(b.end,-1)),scores,polarity:avg>.35?'positive':avg<-.35?'difficult':abs>.8?'mixed':'calm',signalCount:b.signals.length,signals:b.signals.slice().sort((a,c)=>Math.abs(Number(c.force)||0)-Math.abs(Number(a.force)||0)).slice(0,8)}
 });
 const out={type:'ForecastTruth',engineVersion:A.ENGINE_VERSION,truthVersion:String(A.TRUTH_VERSION||'truth')+'+v187-unified',period:per,start:iso(s),end:iso(addDays(s,days-1)),days,domain:dom,points,keyDates:all.filter(x=>x&&(x.level==='exceptionnel'||x.level==='fort'||Number(x.force)>=2.2)).sort((a,b)=>Math.abs(Number(b.force)||0)-Math.abs(Number(a.force)||0)).slice(0,20)};
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
  travail:{fav:'Le contexte professionnel favorise les avancées, échanges, démarches ou décisions utiles.',del:'Le travail demande davantage de prudence, d’organisation et de recul avant une décision importante.',mix:'Le contexte professionnel est contrasté, avec des possibilités mais aussi des ajustements à prévoir.',stable:'Le rythme professionnel paraît relativement régulier.'},
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
function publicTruth(t){
 return {period:t.period,start:t.start,end:t.end,domain:t.domain,points:(t.points||[]).map(p=>({period:{start:p.start,end:p.end,label:p.label},trend:p.polarity,activity:p.signalCount?'marked':'quiet',signals:(p.signals||[]).slice(0,5).map(s=>({date:s.date,domain:s.domain,polarity:s.polarity,importance:s.level||null,scenarios:Array.isArray(s.scenarios)?s.scenarios.slice(0,2):[]}))})),keyDates:(t.keyDates||[]).slice(0,16).map(s=>({date:s.date,domain:s.domain,polarity:s.polarity,importance:s.level||null,scenarios:Array.isArray(s.scenarios)?s.scenarios.slice(0,2):[]}))}
}
function aiText(x){try{if(typeof window.texteClaude==='function')return window.texteClaude(x)||''}catch(e){}return x?.content?.[0]?.text||x?.text||''}
function htmlText(x){try{if(typeof window.formatRapport==='function')return window.formatRapport(x)}catch(e){}return String(x||'').split(/\n{2,}/).filter(Boolean).map(p=>'<p>'+esc(p)+'</p>').join('')}
function timeout(p,ms){return Promise.race([p,new Promise((_,rej)=>setTimeout(()=>{const e=new Error('TIMEOUT');e.code='TIMEOUT';rej(e)},ms))])}
function modeRule(s,days){const n=today(),e=addDays(s,days-1);if(e<n)return "La période est passée : propose une lecture rétrospective sans prétendre connaître les événements réellement vécus.";if(s>n)return "La période est future : formule des tendances et possibilités, jamais des certitudes.";return "La période touche le présent : distingue clairement ce qui est déjà écoulé et ce qui est à venir, sans inventer d’événements."}
async function interpret(t,s,days,dom,per){
 if(typeof window.appelerClaude!=='function')throw new Error('IA indisponible');
 const system=`Tu rédiges une prévision Astro Paquita à partir de données déjà calculées. Le calcul est interne et ne doit jamais apparaître dans le texte utilisateur.
INTERDICTIONS : ne cite ni planète, signe, maison, aspect, transit, degré, orbe, score, moteur, version technique, nombre de signaux ou méthode de calcul. Ne recopie pas de libellé technique.
Transforme les données en conséquences concrètes et compréhensibles dans le domaine demandé. Respecte strictement les dates et les fenêtres réellement marquées. ${modeRule(s,days)}
Structure : tendance générale ; périodes clés dans l’ordre chronologique ; meilleures périodes ; périodes de vigilance ; synthèse courte. Pour une journée, reste beaucoup plus concis. Évite le remplissage et les répétitions. Réponds intégralement dans la langue demandée.`;
 const tokens=days>=300?1800:days>=90?1500:days>=30?1300:1000;
 const req=window.appelerClaude({feature:'forecast_future',featureContext:{module:'forecast',period:per,mode:'unified_v187',domain:dom,start:iso(s),truthVersion:t.truthVersion},model:'claude-sonnet-4-6',max_tokens:tokens,system,messages:[{role:'user',content:JSON.stringify({language:lang(),module:'forecast',requestedDomain:dom,data:publicTruth(t)})}]});
 const data=await timeout(req,18000);
 return aiText(data)
}
function cancelCurrent(){jobSeq++;computing=false;setBusy(false)}
async function run(){
 const out=q('#ap-forecast-result');if(!out)return;
 const per=period(),dom=domain(),days=span(per),s=start(per);
 if(!s){setError('Choisissez une date valide.');return}
 if(per!=='jour'&&freeAccess()&&!premiumAccess()){showPremium();return}
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
   return
 }finally{
   if(job===jobSeq){computing=false;setBusy(false)}
 }
 if(job!==jobSeq||!t)return;

 const rk=reportKey(s,days,dom,per),cachedReport=readReport(rk);
 out.innerHTML='<div class="ap-card ap-forecast-v174 ap-forecast-v187"><div class="ap-eyebrow">'+esc(tx('forecast'))+'</div><h2 style="margin:6px 0 14px">'+esc(rangeTitle(s,days))+'</h2><div class="ap-report" id="ap-v187-report">'+fallback(t,dom,'')+'</div><div class="ap-loader show" id="ap-v187-ai"><i class="ap-spinner"></i><span>'+esc(tx('interpret'))+'</span></div></div>';
 const rep=q('#ap-v187-report'),ai=q('#ap-v187-ai');
 if(cachedReport){if(rep)rep.innerHTML=htmlText(cachedReport);ai?.classList.remove('show');return}

 try{
   const txt=await interpret(t,s,days,dom,per);
   if(job!==jobSeq)return;
   if(txt){if(rep)rep.innerHTML=htmlText(txt);writeReport(rk,txt)}
   else if(rep)rep.innerHTML=fallback(t,dom,tx('unavailable'))
 }catch(e){
   if(job!==jobSeq)return;
   if(rep)rep.innerHTML=fallback(t,dom,tx('unavailable'))
 }finally{
   if(job===jobSeq)ai?.classList.remove('show')
 }
}

window.addEventListener('click',function(ev){
 const t=ev.target?.closest?.('#ap-forecast-prev,#ap-forecast-next,#ap-run-forecast,[data-per]');
 if(!t||!document.body.classList.contains('ap-route-forecast'))return;
 if((t.id==='ap-forecast-prev'||t.id==='ap-forecast-next'||t.matches('[data-per]'))&&computing)cancelCurrent();
 if(t.id!=='ap-run-forecast')return;
 const per=period();
 if(per!=='jour'&&freeAccess()&&!premiumAccess()){
   ev.preventDefault();ev.stopImmediatePropagation();showPremium();return
 }
 ev.preventDefault();ev.stopImmediatePropagation();run()
},true);
})();
