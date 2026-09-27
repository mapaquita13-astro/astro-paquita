/* Astro Paquita V164 — restauration ciblée des méthodes d’analyse V121.
   Objectif : ne pas réinventer les prévisions. La période utilise lancerPrevDepuis()
   et donc scannerJours()/les règles de granularité V121. Le calendrier ne lance
   l’analyse complète d’une journée qu’après clic sur la date.
   Cette couche ne modifie aucun calcul natal, transit, maison ou aspect. */
(function(){
'use strict';
if(window.__AP_V164_ANALYSIS_RESTORE__)return;
window.__AP_V164_ANALYSIS_RESTORE__=true;

let observer=null, scheduled=false, running=false;

function q(s,r){return (r||document).querySelector(s);}
function qa(s,r){return Array.from((r||document).querySelectorAll(s));}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function route(){const m=(document.body.className||'').match(/\bap-route-([^\s]+)/);return m?m[1]:'';}
function fmtDate(v){const d=v instanceof Date?v:new Date(String(v)+'T12:00:00');return isNaN(d)?String(v||''):d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});}
function currentProfile(){try{return window.AstroTruth&&AstroTruth.currentProfile?AstroTruth.currentProfile():null;}catch(e){return null;}}
function activateCurrent(){try{const p=currentProfile();if(p&&p.profileId&&AstroTruth.activate)AstroTruth.activate(p.profileId);}catch(e){}}
function legacyAvailable(){return typeof window.lancerPrevDepuis==='function'&&q('#p-rapport')&&q('#p-res');}
function setLegacySelection(domain,period){
  const map={all:'general',amour:'amour',travail:'travail',argent:'finances',bienetre:'sante',famille:'famille',voyage:'voyage'};
  const d=map[domain]||'general';
  try{domP=d;}catch(e){try{window.eval('domP='+JSON.stringify(d));}catch(_){} }
  try{perP=period;}catch(e){try{window.eval('perP='+JSON.stringify(period));}catch(_){} }
  return d;
}
function activeDomain(){return q('.ap-domain-choice.active')?.dataset.domain||'all';}
function activePeriod(){return q('.ap-period-choice.active')?.dataset.per||'mois';}
function startAndDays(period){
  let start=new Date();start=new Date(start.getFullYear(),start.getMonth(),start.getDate(),12);
  let days=30;
  if(period==='jour')days=1;
  else if(period==='semaine')days=7;
  else if(period==='mois')days=30; // valeur V121 originale
  else if(period==='trimestre')days=90;
  else if(period==='annee')days=365;
  else if(period==='date'){
    const raw=q('#ap-forecast-date')?.value||'';
    const d=raw?new Date(raw+'T12:00:00'):null;
    if(d&&!isNaN(d))start=d;
    days=1;
  }
  return {start,days};
}
function periodTitle(period,start){
  if(period==='jour'||period==='date')return 'Votre journée du '+start.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
  if(period==='semaine')return 'Votre synthèse de la semaine';
  if(period==='mois')return 'Votre synthèse du mois';
  if(period==='trimestre')return 'Votre synthèse des 3 prochains mois';
  if(period==='annee')return 'Votre synthèse des 12 prochains mois';
  return 'Votre synthèse';
}
function setForecastBusy(on){
  const l=q('#ap-forecast-loader');if(l)l.classList.toggle('show',!!on);
  const b=q('#ap-run-forecast');if(b)b.disabled=!!on;
}
function forecastError(msg){const e=q('#ap-forecast-error');if(e){e.textContent=msg||'';e.classList.toggle('show',!!msg);}}

async function runLegacyForecast(){
  if(running)return;
  const out=q('#ap-forecast-result');if(!out)return;
  if(!legacyAvailable()){
    forecastError('La méthode V121 de prévision n’est pas disponible sur cette page.');
    return;
  }
  running=true;setForecastBusy(true);forecastError('');activateCurrent();
  const period=activePeriod(),domain=activeDomain(),cfg=startAndDays(period);
  setLegacySelection(domain,period);
  out.innerHTML='<div class="ap-card"><h3>'+esc(periodTitle(period,cfg.start))+'</h3><p class="ap-muted">Analyse de la période en cours…</p></div>';
  try{
    await window.lancerPrevDepuis(cfg.start,cfg.days,period);
    const legacy=q('#p-rapport');
    const html=legacy&&legacy.innerHTML?legacy.innerHTML.trim():'';
    out.innerHTML='<div class="ap-card ap-forecast-v164"><div class="ap-eyebrow">Prévision personnalisée</div><h2 style="margin:6px 0 14px">'+esc(periodTitle(period,cfg.start))+'</h2><div class="ap-report">'+(html||'<p>Aucun élément suffisamment marqué ne ressort sur cette période.</p>')+'</div></div>';
  }catch(e){
    forecastError((e&&e.message)?e.message:'La prévision n’a pas pu être générée.');
    out.innerHTML='';
  }finally{running=false;setForecastBusy(false);}
}

function bindForecast(){
  const b=q('#ap-run-forecast');if(!b||b.dataset.v164==='1')return;
  b.dataset.v164='1';
  b.onclick=function(ev){if(ev){ev.preventDefault();ev.stopImmediatePropagation();}runLegacyForecast();return false;};
  // Les compteurs internes de signaux n'ont aucune utilité utilisateur.
  qa('#ap-forecast-result .ap-card').forEach(function(card){
    const t=(card.textContent||'').toLowerCase();
    if(/signaux favorables|signaux plus délicats|signaux marqués|faits calculés/.test(t))card.remove();
  });
}

function calendarCard(){
  const grid=q('.ap-route-calendar .ap-grid');
  if(!grid)return null;
  return qa('.ap-card',grid).find(function(c){return c.classList.contains('ap-span-4');})||null;
}
function setCalendarLoading(dateISO){
  const card=calendarCard();if(!card)return;
  card.innerHTML='<h3>'+esc(fmtDate(dateISO))+'</h3><div class="ap-loader show"><i class="ap-spinner"></i><span>Interprétation de la journée en cours…</span></div><p class="ap-muted">Le détail de la journée est calculé uniquement parce que vous avez choisi cette date.</p>';
}
async function runLegacyDay(dateISO){
  if(running||!legacyAvailable())return;
  running=true;activateCurrent();setCalendarLoading(dateISO);setLegacySelection('all','jour');
  const d=new Date(dateISO+'T12:00:00');
  try{
    await window.lancerPrevDepuis(d,1,'jour');
    const html=q('#p-rapport')?.innerHTML?.trim()||'';
    const card=calendarCard();
    if(card)card.innerHTML='<div class="ap-eyebrow">Journée sélectionnée</div><h3>'+esc(fmtDate(dateISO))+'</h3><div class="ap-report">'+(html||'<p>La journée reste globalement calme.</p>')+'</div>';
  }catch(e){
    const card=calendarCard();if(card)card.innerHTML='<h3>'+esc(fmtDate(dateISO))+'</h3><div class="ap-error show">'+esc(e&&e.message?e.message:'Analyse indisponible.')+'</div>';
  }finally{running=false;}
}
function bindCalendar(){
  const page=q('.ap-route-calendar #ap-page');if(!page)return;
  const card=calendarCard();
  if(card&&!card.dataset.v164Intro){
    card.dataset.v164Intro='1';
    const list=q('.ap-aspect-list',card);
    if(list)list.innerHTML='<p class="ap-muted">Cliquez sur une date du calendrier pour ouvrir l’analyse complète de cette journée.</p>';
  }
  qa('.ap-route-calendar [data-day]').forEach(function(b){
    if(b.dataset.v164==='1')return;
    b.dataset.v164='1';
    const original=b.onclick;
    b.onclick=function(ev){
      const dateISO=b.dataset.day;
      if(typeof original==='function')original.call(b,ev);
      setTimeout(function(){runLegacyDay(dateISO);},0);
      return false;
    };
  });
}

function cleanTechnicalCopy(){
  qa('#ap-final-root small,#ap-final-root p,#ap-final-root span').forEach(function(el){
    const t=(el.textContent||'').trim();
    if(/^Analyse sectorielle V121$/i.test(t))el.textContent='Analyse personnalisée';
    if(/^(faits calculés|signaux calculés|nombre de faits calculés)$/i.test(t))el.remove();
  });
}

function apply(){
  scheduled=false;
  if(observer)observer.disconnect();
  try{
    const r=route();
    if(r==='forecast')bindForecast();
    if(r==='calendar')bindCalendar();
    cleanTechnicalCopy();
    document.documentElement.dataset.astroAnalysis='v164-v121-restored';
  }finally{watch();}
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply);}
function watch(){
  if(!observer)observer=new MutationObserver(schedule);
  observer.observe(q('#ap-final-root')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
}
function start(){watch();schedule();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
