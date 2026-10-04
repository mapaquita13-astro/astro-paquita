/* Astro Paquita V183 — prévisions annuelles historiques sans blocage.
   Pour une période annuelle entièrement passée, cette couche réutilise la synthèse
   mensuelle V121 déjà exposée par AstroTruth.period() au lieu de relancer 365 analyses
   quotidiennes. Les autres périodes et les calculs astrologiques V121 restent inchangés. */
(function(){
'use strict';
if(window.__AP_V183_PAST_ANNUAL__)return;
window.__AP_V183_PAST_ANNUAL__=true;

const A=window.AstroTruth;
if(!A)return;
let running=false;
const q=(s,r)=> (r||document).querySelector(s);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lang=()=>String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2);
const LOCALE={fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'};
const DOMAIN_LABEL={fr:{all:'Tous les domaines',amour:'Amour',travail:'Travail',argent:'Argent',bienetre:'Bien-être',famille:'Famille',voyage:'Voyage'},en:{all:'All areas',amour:'Love',travail:'Work',argent:'Money',bienetre:'Well-being',famille:'Family',voyage:'Travel'},es:{all:'Todos los ámbitos',amour:'Amor',travail:'Trabajo',argent:'Dinero',bienetre:'Bienestar',famille:'Familia',voyage:'Viajes'},ar:{all:'كل المجالات',amour:'الحب',travail:'العمل',argent:'المال',bienetre:'الرفاه',famille:'العائلة',voyage:'السفر'}};
const TX={
 fr:{eyebrow:'Prévision personnalisée',loading:'Analyse de l’année sélectionnée…',ai:'Interprétation de l’année en cours…',timeout:'L’interprétation détaillée a dépassé le délai prévu. Voici la synthèse astrologique calculée mois par mois.',unavailable:'Le service d’interprétation est momentanément indisponible. Voici la synthèse astrologique calculée mois par mois.',failed:'La prévision annuelle n’a pas pu être générée.',favorable:'favorable',delicate:'plus délicat',stable:'stable',mixed:'contrasté',calm:'calme',month:'Mois',domain:'Domaine',signal:'Repère principal',noSignal:'Aucun signal particulièrement marqué.'},
 en:{eyebrow:'Personal forecast',loading:'Analysing the selected year…',ai:'Preparing the yearly interpretation…',timeout:'The detailed interpretation took too long. Here is the month-by-month astrological summary.',unavailable:'The interpretation service is temporarily unavailable. Here is the month-by-month astrological summary.',failed:'The annual forecast could not be generated.',favorable:'favourable',delicate:'more delicate',stable:'stable',mixed:'mixed',calm:'calm',month:'Month',domain:'Area',signal:'Main marker',noSignal:'No particularly strong signal.'},
 es:{eyebrow:'Previsión personalizada',loading:'Analizando el año seleccionado…',ai:'Preparando la interpretación anual…',timeout:'La interpretación detallada ha superado el tiempo previsto. Aquí tienes la síntesis astrológica mes a mes.',unavailable:'El servicio de interpretación no está disponible temporalmente. Aquí tienes la síntesis astrológica mes a mes.',failed:'No se ha podido generar la previsión anual.',favorable:'favorable',delicate:'más delicado',stable:'estable',mixed:'mixto',calm:'tranquilo',month:'Mes',domain:'Ámbito',signal:'Indicador principal',noSignal:'No hay ninguna señal especialmente marcada.'},
 ar:{eyebrow:'توقع شخصي',loading:'جارٍ تحليل السنة المختارة…',ai:'جارٍ إعداد تفسير السنة…',timeout:'استغرق التفسير المفصل وقتاً أطول من المتوقع. إليك الخلاصة الفلكية شهراً بشهر.',unavailable:'خدمة التفسير غير متاحة مؤقتاً. إليك الخلاصة الفلكية شهراً بشهر.',failed:'تعذر إنشاء التوقع السنوي.',favorable:'مواتٍ',delicate:'أكثر حساسية',stable:'مستقر',mixed:'متباين',calm:'هادئ',month:'الشهر',domain:'المجال',signal:'المؤشر الرئيسي',noSignal:'لا توجد إشارة بارزة بشكل خاص.'}
};
function tr(k){return (TX[lang()]||TX.fr)[k]||TX.fr[k]||k;}
function fromIso(raw){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(raw||'')))return null;const d=new Date(raw+'T12:00:00');return isNaN(d)?null:d;}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x;}
function today(){const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate(),12);}
function activePeriod(){return q('.ap-route-forecast .ap-period-choice.active')?.dataset.per||'';}
function activeDomain(){return q('.ap-route-forecast .ap-domain-choice.active')?.dataset.domain||'all';}
function nav(){return q('.ap-route-forecast .ap-forecast-period-nav');}
function anchor(){return fromIso(nav()?.dataset.v174Anchor||'');}
function isFullyPastAnnual(){
 if(!document.body.classList.contains('ap-route-forecast')||activePeriod()!=='annee')return false;
 const start=anchor();if(!start)return false;
 const end=addDays(start,364);
 return end<today();
}
function fmtDate(d){return d.toLocaleDateString(LOCALE[lang()]||LOCALE.fr,{day:'numeric',month:'long',year:'numeric'});}
function fmtMonth(ym){const d=fromIso(String(ym||'')+'-15');return d?d.toLocaleDateString(LOCALE[lang()]||LOCALE.fr,{month:'long',year:'numeric'}):String(ym||'');}
function rangeTitle(start){return fmtDate(start)+' → '+fmtDate(addDays(start,364));}
function setBusy(on){const l=q('#ap-forecast-loader');if(l)l.classList.toggle('show',!!on);const b=q('#ap-run-forecast');if(b)b.disabled=!!on;}
function setError(msg){const e=q('#ap-forecast-error');if(e){e.textContent=msg||'';e.classList.toggle('show',!!msg);}}
function aiText(data){
 try{if(typeof window.texteClaude==='function')return window.texteClaude(data)||'';}catch(e){}
 return data?.content?.[0]?.text||data?.text||'';
}
function reportHtml(text){
 try{if(typeof window.formatRapport==='function')return window.formatRapport(text);}catch(e){}
 return String(text||'').split(/\n{2,}/).filter(Boolean).map(x=>'<p>'+esc(x)+'</p>').join('');
}
function scoreLabel(score){score=Number(score)||0;if(score>=1.25)return tr('favorable');if(score<=-1.25)return tr('delicate');if(Math.abs(score)<.6)return tr('stable');return tr('mixed');}
function pointScore(point,domain){
 const scores=point&&point.scores||{};
 if(domain!=='all')return Number(scores[domain])||0;
 const vals=Object.values(scores).map(Number).filter(Number.isFinite);
 return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;
}
function pointSignals(point,domain){
 const xs=Array.isArray(point&&point.signals)?point.signals:[];
 return (domain==='all'?xs:xs.filter(s=>String(s.domain||'')===domain)).slice(0,4);
}
function slimTruth(t,domain,start){
 const end=addDays(start,364);
 const points=(t.points||[]).filter(p=>{
   const d=fromIso(String(p.month||'')+'-15');return d&&d>=start&&d<=end;
 }).slice(0,12).map(p=>({
   month:p.month,
   polarity:p.polarity,
   intensity:p.intensity,
   scores:domain==='all'?p.scores:{[domain]:p.scores?.[domain]??0},
   signals:pointSignals(p,domain)
 }));
 const milestones=(t.milestones||[]).filter(s=>{
   const d=fromIso(s.date);return d&&d>=start&&d<=end&&(domain==='all'||s.domain===domain);
 }).slice(0,20);
 return {type:'ForecastTruth',engineVersion:t.engineVersion,truthVersion:t.truthVersion,start:iso(start),end:iso(end),months:points.length,domain,points,milestones};
}
function fallbackHtml(truth,domain,note){
 const dl=(DOMAIN_LABEL[lang()]||DOMAIN_LABEL.fr)[domain]||(DOMAIN_LABEL.fr[domain]||domain);
 const rows=(truth.points||[]).map(p=>{
   const sig=(p.signals||[])[0];const label=sig&&(sig.label||(Array.isArray(sig.scenarios)&&sig.scenarios[0]))||tr('noSignal');
   return '<div class="ap-aspect"><strong>'+esc(fmtMonth(p.month))+'</strong><span>'+esc(dl)+'</span><span>'+esc(scoreLabel(pointScore(p,domain)))+'</span><span>'+esc(label)+'</span></div>';
 }).join('');
 return (note?'<p class="ap-muted">'+esc(note)+'</p>':'')+(rows?'<div class="ap-aspect-list">'+rows+'</div>':'<p>'+esc(tr('noSignal'))+'</p>');
}
function timeout(promise,ms){return Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(Object.assign(new Error('AI_TIMEOUT'),{code:'AI_TIMEOUT'})),ms))]);}
async function interpret(truth,start,domain){
 if(typeof window.appelerClaude!=='function')throw Object.assign(new Error('AI_UNAVAILABLE'),{code:'AI_UNAVAILABLE'});
 const dl=(DOMAIN_LABEL[lang()]||DOMAIN_LABEL.fr)[domain]||(DOMAIN_LABEL.fr[domain]||domain);
 const system=`Tu interprètes uniquement les données astrologiques structurées fournies par Astro Paquita. La période demandée est entièrement passée : il s'agit d'une lecture astrologique rétrospective, pas d'une connaissance des événements réellement vécus. N'invente aucun fait biographique. Respecte strictement les mois, domaines, intensités, polarités et signaux fournis. Structure la réponse avec : 1) fil général de la période ; 2) lecture mois par mois en insistant seulement sur les mois réellement marqués ; 3) périodes les plus favorables ; 4) périodes plus délicates ; 5) synthèse. Une période calme reste calme. Réponds dans la langue demandée.`;
 const payload={language:lang(),module:'forecast_historical_year',requestedRange:{start:iso(start),end:iso(addDays(start,364))},domain:dl,truth};
 const req=window.appelerClaude({feature:'forecast_future',featureContext:{module:'forecast',period:'annee',mode:'historical_monthly',domain,start:iso(start),truthVersion:truth.truthVersion},model:'claude-sonnet-4-6',max_tokens:2400,system,messages:[{role:'user',content:JSON.stringify(payload)}]});
 const data=await timeout(req,90000);
 return aiText(data);
}
async function generatePastAnnual(){
 if(running)return;
 const out=q('#ap-forecast-result');const start=anchor();if(!out||!start)return;
 const domain=activeDomain();
 running=true;setBusy(true);setError('');
 out.innerHTML='<div class="ap-card"><h3>'+esc(rangeTitle(start))+'</h3><p class="ap-muted">'+esc(tr('loading'))+'</p></div>';
 try{
   if(typeof A.period!=='function')throw new Error('PERIOD_ENGINE_UNAVAILABLE');
   /* 13 mois demandés pour couvrir proprement un intervalle glissant de 365 jours ;
      slimTruth conserve ensuite uniquement les 12 points mensuels situés dans la plage. */
   const period=A.period(new Date(start),13);
   const truth=slimTruth(period,domain,start);
   if(!truth.points.length)throw new Error('NO_MONTHLY_DATA');
   out.innerHTML='<div class="ap-card ap-forecast-v174 ap-forecast-v183"><div class="ap-eyebrow">'+esc(tr('eyebrow'))+'</div><h2 style="margin:6px 0 14px">'+esc(rangeTitle(start))+'</h2><div class="ap-loader show"><i class="ap-spinner"></i><span>'+esc(tr('ai'))+'</span></div><div class="ap-report ap-v183-report"></div></div>';
   const report=q('.ap-v183-report',out);
   try{
     const text=await interpret(truth,start,domain);
     if(report)report.innerHTML=text?reportHtml(text):fallbackHtml(truth,domain,tr('unavailable'));
   }catch(e){
     const note=e&&e.code==='AI_TIMEOUT'?tr('timeout'):tr('unavailable');
     if(report)report.innerHTML=fallbackHtml(truth,domain,note);
   }
   const l=q('.ap-loader',out);if(l)l.classList.remove('show');
 }catch(e){
   console.error('Astro Paquita — prévision annuelle passée V183 :',e);
   setError(tr('failed'));out.innerHTML='';
 }finally{running=false;setBusy(false);}
}

/* Le listener est placé sur window en capture : il intervient avant la couche V174,
   mais seulement pour le cas annuel entièrement passé. Tout le reste continue vers V174. */
window.addEventListener('click',function(ev){
 const t=ev.target&&ev.target.closest?ev.target.closest('#ap-run-forecast'):null;
 if(!t||!isFullyPastAnnual())return;
 ev.preventDefault();ev.stopImmediatePropagation();
 generatePastAnnual();
},true);
})();
