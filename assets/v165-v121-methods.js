/* Astro Paquita V165 — restauration des méthodes V121 restantes.
   - Mon avenir : reprend la méthode monthlyData() V121 (repère au milieu du mois),
     étendue à 24 mois sans changer sa formule.
   - Synastrie : délègue à analyserSynastrie() V121 afin que le type de relation
     change réellement les ancres étudiées (couple/famille/amitie/pro).
   Aucun calcul natal, maison, transit ou aspect V121 n'est réécrit ici. */
(function(){
'use strict';
if(window.__AP_V165_V121_METHODS__)return;
window.__AP_V165_V121_METHODS__=true;

const A=window.AstroTruth;
if(!A)return;
const UI_DOMAINS=['amour','travail','argent','bienetre','famille','voyage'];
const LEGACY_DOMAIN={amour:'amour',travail:'travail',argent:'finances',bienetre:'sante',famille:'famille',voyage:'voyage'};
const TX={
  fr:{synUnavailable:'La synastrie est temporairement indisponible.',missingSecond:'Le second profil est introuvable.',partnerIncomplete:'Le profil partenaire est incomplet.',analysis:'Analyse de la relation',loading:'Lecture personnalisée en cours…',relation:'Votre relation',none:'Aucune interprétation n’a été produite.',synFailed:'La synastrie n’a pas pu être générée.',cannot:'Impossible de générer la lecture pour le moment.',relAnalysis:'Analyse relationnelle',hero:'Le type de relation adapte l’analyse au contexte choisi : couple, famille, amitié ou travail.',dynamic:'Votre dynamique relationnelle',select:'Sélectionnez un profil et le type de lien. La lecture détaillée s’adaptera au contexte de la relation.',future:'La courbe donne un repère visuel mois par mois. Pour comprendre réellement une période, ouvrez les prévisions détaillées : elles analysent la période complète.',periods:'Périodes à retenir'},
  en:{synUnavailable:'Synastry is temporarily unavailable.',missingSecond:'The second profile could not be found.',partnerIncomplete:'The other profile is incomplete.',analysis:'Relationship analysis',loading:'Preparing your personalised reading…',relation:'Your relationship',none:'No interpretation was produced.',synFailed:'The synastry could not be generated.',cannot:'The reading cannot be generated right now.',relAnalysis:'Relationship analysis',hero:'The relationship type adapts the analysis to the chosen context: couple, family, friendship or work.',dynamic:'Your relationship dynamic',select:'Select a profile and the type of relationship. The detailed reading will adapt to the relationship context.',future:'The curve gives a month-by-month visual guide. For a full understanding of a period, open the detailed forecasts: they analyse the entire period.',periods:'Periods to remember'},
  es:{synUnavailable:'La sinastría no está disponible temporalmente.',missingSecond:'No se encuentra el segundo perfil.',partnerIncomplete:'El otro perfil está incompleto.',analysis:'Análisis de la relación',loading:'Preparando tu lectura personalizada…',relation:'Tu relación',none:'No se ha generado ninguna interpretación.',synFailed:'No se ha podido generar la sinastría.',cannot:'No se puede generar la lectura en este momento.',relAnalysis:'Análisis de la relación',hero:'El tipo de relación adapta el análisis al contexto elegido: pareja, familia, amistad o trabajo.',dynamic:'Tu dinámica relacional',select:'Selecciona un perfil y el tipo de relación. La lectura detallada se adaptará al contexto de la relación.',future:'La curva ofrece una referencia visual mes a mes. Para comprender realmente un período, abre las previsiones detalladas: analizan el período completo.',periods:'Períodos a recordar'},
  ar:{synUnavailable:'التوافق غير متاح مؤقتاً.',missingSecond:'تعذر العثور على الملف الثاني.',partnerIncomplete:'الملف الآخر غير مكتمل.',analysis:'تحليل العلاقة',loading:'جارٍ إعداد قراءتك المخصصة…',relation:'علاقتك',none:'لم يتم إنشاء أي تفسير.',synFailed:'تعذر إنشاء تحليل التوافق.',cannot:'لا يمكن إنشاء القراءة حالياً.',relAnalysis:'تحليل العلاقة',hero:'نوع العلاقة يكيّف التحليل مع السياق المختار: شراكة أو عائلة أو صداقة أو عمل.',dynamic:'ديناميكية علاقتك',select:'اختر ملفاً ونوع العلاقة. ستتكيف القراءة المفصلة مع سياق العلاقة.',future:'يقدم المنحنى دليلاً بصرياً شهراً بعد شهر. لفهم فترة كاملة افتح التوقعات المفصلة، فهي تحلل الفترة بأكملها.',periods:'فترات مهمة'}
};
let observer=null,scheduled=false,relationBusy=false;
function lang(){const l=String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2);return TX[l]?l:'fr';}
function tr(k){return TX[lang()][k]||TX.fr[k]||k;}
function q(s,r){return (r||document).querySelector(s);}
function qa(s,r){return Array.from((r||document).querySelectorAll(s));}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function clamp(n,a,b){n=Number(n)||0;return Math.max(a,Math.min(b,n));}
function iso(d){return A.isoDate?A.isoDate(d):d.toISOString().slice(0,10);}
function labels(){try{return A.labels?A.labels():{};}catch(e){return{};}}
function mapDomain(raw){
  const s=String(raw||'').toLowerCase();
  if(['amour','love','couple','relationship'].includes(s))return'amour';
  if(['travail','work','career','job'].includes(s))return'travail';
  if(['finances','finance','argent','money'].includes(s))return'argent';
  if(['sante','santé','bienetre','bien-être','health','daily','wellbeing'].includes(s))return'bienetre';
  if(['famille','family','home','children'].includes(s))return'famille';
  if(['voyage','travel'].includes(s))return'voyage';
  return'general';
}
function normalizeSignal(x,d){
  x=x||{};const dom=mapDomain(x.domain);const pol=x.polarite||x.polarity||x.pol||'mixte';
  const force=Number(x.force??x.strength??x.importance??0)||0;
  return {date:iso(d),domain:dom,domainLabel:labels()[dom]||dom,polarity:pol,level:x.niveau||x.level||'marque',force,
    label:x.label||(Array.isArray(x.scenarios)&&x.scenarios[0])||x.hint||'',scenarios:x.scenarios||[],source:x.source||null,target:x.target||null};
}
function rawMonthSignals(d){try{return typeof apV51Signals==='function'?(apV51Signals(d,'marque')||[]):[];}catch(e){return[];}}
function v121MonthScore(raw,uiDomain){
  const legacy=LEGACY_DOMAIN[uiDomain];
  const xs=(raw||[]).filter(x=>x&&((x.domain===legacy)||(legacy==='finances'&&x.domain==='argent')));
  let v=0,w=0;
  for(const x of xs){
    const f=Number(x.force||x.strength||0)||0;
    const sg=x.polarite==='difficile'?-1:x.polarite==='positive'?1:0;
    v+=sg*f;w+=Math.max(.5,f);
  }
  return w?clamp(v/w,-1,1):0;
}
function v121Period(start,months){
  const m=Math.max(1,Math.min(24,Number(months)||12));
  const base=start instanceof Date?start:new Date(start||new Date());
  const firstMonth=new Date(base.getFullYear(),base.getMonth(),1,12);
  const points=[],milestones=[];
  for(let i=0;i<m;i++){
    const d=new Date(firstMonth.getFullYear(),firstMonth.getMonth()+i,15,12);
    const raw=rawMonthSignals(d);
    const scores={};
    UI_DOMAINS.forEach(dom=>{scores[dom]=+(v121MonthScore(raw,dom)*5).toFixed(2);});
    const vals=Object.values(scores),abs=Math.max(0,...vals.map(Math.abs));
    const avg=vals.reduce((a,b)=>a+b,0)/Math.max(1,vals.length);
    const polarity=avg>1.25?'positive':avg<-1.25?'difficult':abs<.6?'calm':'mixed';
    const ns=raw.map(x=>normalizeSignal(x,d));
    points.push({month:iso(d).slice(0,7),scores,polarity,intensity:Math.round(abs*20),signals:ns.slice(0,10)});
    raw.filter(x=>x&&(x.niveau==='exceptionnel'||x.niveau==='fort'||Number(x.force||x.strength||0)>=2.2))
      .slice(0,4).forEach(x=>milestones.push(normalizeSignal(x,d)));
  }
  return {type:'PeriodTruth',engineVersion:A.ENGINE_VERSION,truthVersion:String(A.TRUTH_VERSION||'truth')+'+v165-v121-monthly',
    profileId:(A.currentProfile&&A.currentProfile()?.profileId)||null,start:iso(firstMonth),months:m,domainLabels:labels(),points,
    milestones:milestones.sort((a,b)=>String(a.date).localeCompare(String(b.date))),calculatedAt:new Date().toISOString(),
    method:'v121-monthly-midpoint'};
}
A.period=v121Period;
A.__V165_PERIOD_METHOD__='V121 monthlyData — midpoint 15';

function setValue(id,value){const e=document.getElementById(id);if(!e)return false;e.value=value==null?'':String(value);return true;}
function relationMode(txt){
  const s=String(txt||'').toLowerCase();
  if(s.includes('fam'))return'famille';
  if(s.includes('trav')||s.includes('pro'))return'pro';
  if(s.includes('ami'))return'amitie';
  return'couple';
}
function relationLoader(on){const e=q('#ap-rel-loader');if(e)e.classList.toggle('show',!!on);const b=q('#ap-rel-run');if(b)b.disabled=!!on;}
function relationError(msg){const e=q('#ap-rel-error');if(e){e.textContent=msg||'';e.classList.toggle('show',!!msg);}}
function prepareLegacyPartner(p,mode){
  if(!p)return false;
  setValue('y-prenom',p.prenom||'Profil');setValue('y-date',p.date||'');setValue('y-heure',p.heure||'');setValue('y-genre',p.genre||'N');
  setValue('y-lat',p.lat);setValue('y-lon',p.lon);setValue('y-tz',p.tz||'');setValue('y-ville',p.ville||'');
  const sel=document.getElementById('y-type-relation');
  if(sel){
    const values=Array.from(sel.options||[]).map(o=>o.value);
    if(values.includes(mode))sel.value=mode;
    try{if(typeof yActualiserTypeSynastrieV26==='function')yActualiserTypeSynastrieV26();else sel.dispatchEvent(new Event('change',{bubbles:true}));}catch(e){}
  }
  return true;
}
async function runLegacySynastry(ev){
  if(ev){ev.preventDefault();ev.stopImmediatePropagation();}
  if(relationBusy)return false;
  relationBusy=true;relationLoader(true);relationError('');
  const out=q('#ap-rel-result');
  try{
    if(typeof window.analyserSynastrie!=='function')throw new Error(tr('synUnavailable'));
    const id=q('#ap-rel-profile')?.value;const p=A.getProfileById?A.getProfileById(id):null;
    if(!p)throw new Error(tr('missingSecond'));
    try{const cur=A.currentProfile&&A.currentProfile();if(cur?.profileId&&A.activate)A.activate(cur.profileId);}catch(e){}
    const mode=relationMode(q('#ap-rel-type')?.value);
    if(!prepareLegacyPartner(p,mode))throw new Error(tr('partnerIncomplete'));
    if(out)out.innerHTML='<h3>'+esc(tr('analysis'))+'</h3><p class="ap-muted">'+esc(tr('loading'))+'</p>';
    await window.analyserSynastrie();
    const report=document.getElementById('y-rapport')?.innerHTML?.trim()||'';
    const title=document.getElementById('y-rapport-titre')?.textContent?.trim()||tr('relation');
    const err=document.getElementById('y-err');
    if(!report){const em=(err&&err.style.display!=='none')?(err.textContent||'').trim():'';throw new Error(em||tr('none'));}
    if(out)out.innerHTML='<div class="ap-eyebrow">'+esc(tr('relAnalysis'))+'</div><h2 style="margin:6px 0 14px">'+esc(title)+'</h2><div class="ap-report">'+report+'</div>';
  }catch(e){
    relationError(e&&e.message?e.message:tr('synFailed'));
    if(out)out.innerHTML='<h3>'+esc(tr('relAnalysis'))+'</h3><p>'+esc(tr('cannot'))+'</p>';
  }finally{relationBusy=false;relationLoader(false);}
  return false;
}
function bindRelations(){
  const b=q('.ap-route-relations #ap-rel-run');if(!b||b.dataset.v165==='1')return;
  b.dataset.v165='1';b.onclick=runLegacySynastry;
  const hero=q('.ap-route-relations .ap-hero-copy p');
  if(hero)hero.textContent=tr('hero');
  const out=q('#ap-rel-result');if(out&&!out.dataset.v165){out.dataset.v165='1';out.innerHTML='<h3>'+esc(tr('dynamic'))+'</h3><p>'+esc(tr('select'))+'</p>';}
}
function cleanFutureUi(){
  const sub=q('.ap-route-future .ap-subtitle');
  if(sub)sub.textContent=tr('future');
  qa('.ap-route-future .v161-summary-card em').forEach(e=>e.remove());
  const h=q('.ap-route-future .ap-future-milestones h3');if(h)h.textContent=tr('periods');
}
function apply(){scheduled=false;if(observer)observer.disconnect();try{bindRelations();cleanFutureUi();document.documentElement.removeAttribute('data-astro-methods');}finally{watch();}}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply);}
function watch(){if(!observer)observer=new MutationObserver(schedule);observer.observe(q('#ap-final-root')||document.body,{childList:true,subtree:true});}
function start(){watch();schedule();document.addEventListener('change',e=>{if(e.target&&(['ap-lang','ap-profile-lang'].includes(e.target.id)||e.target.classList?.contains('ap-lang-select')))setTimeout(schedule,0);},true);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
