/* Astro Paquita — restauration de la navigation Précédent / Suivant des prévisions.
   Le moteur V121 reste inchangé : cette couche ne modifie que l'ancrage temporel
   et l'interface du module Prévisions détaillées. */
(function(){
'use strict';
if(window.__AP_FORECAST_NAV_LOADER__)return;
window.__AP_FORECAST_NAV_LOADER__=true;

const BASE='assets/refonte-v127-base.js';

function patchedSource(src){
  const daysRx=/function forecastDays\(\)\{.*?\}\nfunction renderForecast\(\)\{/s;
  const renderRx=/function renderForecast\(\)\{.*?\}\nasync function runForecast\(\)\{/s;

  if(!daysRx.test(src)||!renderRx.test(src)){
    throw new Error('Structure Prévisions détaillées non reconnue : correction non appliquée.');
  }

  src=src.replace(daysRx,`function forecastAnchor(){
 const raw=String(state.forecastDate||'');
 if(/^\\d{4}-\\d{2}-\\d{2}$/.test(raw)){
   const d=new Date(raw+'T12:00:00');
   if(!isNaN(d))return new Date(d.getFullYear(),d.getMonth(),d.getDate());
 }
 const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate());
}
function forecastSpanDays(){const p=state.forecastPeriod;if(p==='jour'||p==='date')return 1;if(p==='semaine')return 7;if(p==='mois')return 31;if(p==='trimestre')return 92;return 365;}
function forecastDays(){const start=forecastAnchor();return{start,days:forecastSpanDays()};}
function forecastRangeLabel(){const fd=forecastDays(),end=AstroTruth.addDays(fd.start,Math.max(0,fd.days-1)),opt={day:'numeric',month:'short',year:'numeric'},a=fmtDate(AstroTruth.isoDate(fd.start),opt),b=fmtDate(AstroTruth.isoDate(end),opt);return fd.days===1?a:a+' → '+b;}
function shiftForecast(dir){const d=forecastAnchor();d.setDate(d.getDate()+forecastSpanDays()*dir);state.forecastDate=AstroTruth.isoDate(d);renderForecast();setTimeout(()=>document.getElementById('ap-run-forecast')?.click(),0);}
function renderForecast(){`);

  src=src.replace(renderRx,`function renderForecast(){
 if(!requireProfile())return;
 const domLabels=AstroTruth.labels();
 const periods=[['semaine','Cette semaine'],['mois','Ce mois'],['trimestre','3 prochains mois'],['annee','12 prochains mois'],['date','Date précise'],['jour','Aujourd’hui']];
 const navTxt=lang()==='en'?{prev:'Previous',next:'Next'}:lang()==='es'?{prev:'Anterior',next:'Siguiente'}:lang()==='ar'?{prev:'السابق',next:'التالي'}:{prev:'Précédent',next:'Suivant'};
 const today=AstroTruth.isoDate(new Date());
 document.getElementById('ap-page').innerHTML=\`<style>
 .ap-forecast-period-nav{display:grid;grid-template-columns:minmax(105px,auto) 1fr minmax(105px,auto);align-items:center;gap:10px;margin:18px 0 8px}
 .ap-forecast-range-label{text-align:center;font-weight:800;color:#53164a;line-height:1.35;font-size:15px}
 #ap-forecast-prev,#ap-forecast-next{background:#efe7f2;color:#53164a;border:1px solid #decfe0}
 @media(max-width:760px){
   .ap-forecast-period-nav{grid-template-columns:1fr 1fr;grid-template-areas:'range range' 'prev next';gap:10px 12px;margin:20px 0 12px}
   .ap-forecast-range-label{grid-area:range;font-size:17px;line-height:1.35;padding:0 4px;white-space:normal}
   #ap-forecast-prev{grid-area:prev;width:100%;min-width:0;padding:13px 8px!important}
   #ap-forecast-next{grid-area:next;width:100%;min-width:0;padding:13px 8px!important}
 }
 </style><section class="ap-forecast-screen"><div class="ap-eyebrow">Des analyses claires et personnalisées</div><h1 class="ap-title">\${esc(tr('forecast'))}</h1><div class="ap-card ap-forecast-form"><div class="ap-tabs ap-forecast-mode"><button class="ap-tab active" type="button">Par période</button><button class="ap-tab" type="button" id="ap-domain-jump">Par domaine</button><button class="ap-tab" type="button" data-route="calendar">Calendrier</button></div><h3>Choisissez une période</h3><div class="ap-period-choice-grid">\${periods.map(([v,l])=>\`<button class="ap-period-choice \${state.forecastPeriod===v?'active':''}" data-per="\${v}">\${l}</button>\`).join('')}</div>\${state.forecastPeriod==='date'?\`<div class="ap-field"><label>Date</label><input type="date" id="ap-forecast-date" value="\${esc(state.forecastDate||today)}"></div>\`:''}<div class="ap-forecast-period-nav"><button type="button" id="ap-forecast-prev" class="ap-btn">← \${esc(navTxt.prev)}</button><div class="ap-forecast-range-label">\${esc(forecastRangeLabel())}</div><button type="button" id="ap-forecast-next" class="ap-btn">\${esc(navTxt.next)} →</button></div><h3 id="ap-domain-anchor">Choisissez un ou plusieurs domaines</h3><div class="ap-domain-choice-grid"><button class="ap-domain-choice \${state.domain==='all'?'active':''}" data-domain="all"><i>✦</i><span>Tous</span></button>\${DOMAINS.map(d=>\`<button class="ap-domain-choice \${state.domain===d?'active':''}" data-domain="\${d}"><i>\${DOMAIN_ICON[d]}</i><span>\${esc(domLabels[d])}</span></button>\`).join('')}</div><button id="ap-run-forecast" class="ap-btn ap-btn-primary ap-wide-btn">Générer mes prévisions →</button><div class="ap-note ap-forecast-note">Une analyse personnalisée, adaptée à votre thème et à vos objectifs.</div><div id="ap-forecast-loader" class="ap-loader"><i class="ap-spinner"></i><span>\${esc(tr('loading'))}</span></div><div id="ap-forecast-error" class="ap-error"></div></div><div id="ap-forecast-result"></div></section>\`;
 document.querySelectorAll('[data-per]').forEach(b=>b.onclick=()=>{state.forecastPeriod=b.dataset.per;if(state.forecastPeriod==='date'&&!state.forecastDate)state.forecastDate=today;renderForecast();});
 document.querySelectorAll('[data-domain]').forEach(b=>b.onclick=()=>{state.domain=b.dataset.domain;document.querySelectorAll('[data-domain]').forEach(x=>x.classList.toggle('active',x===b));});
 document.querySelectorAll('[data-route]').forEach(x=>x.onclick=()=>route(x.dataset.route));
 document.getElementById('ap-domain-jump').onclick=()=>document.getElementById('ap-domain-anchor').scrollIntoView({behavior:'smooth',block:'center'});
 document.getElementById('ap-forecast-prev').onclick=()=>{if(state.forecastPeriod==='date')state.forecastDate=document.getElementById('ap-forecast-date')?.value||state.forecastDate||today;shiftForecast(-1);};
 document.getElementById('ap-forecast-next').onclick=()=>{if(state.forecastPeriod==='date')state.forecastDate=document.getElementById('ap-forecast-date')?.value||state.forecastDate||today;shiftForecast(1);};
 const di=document.getElementById('ap-forecast-date');if(di)di.onchange=()=>{state.forecastDate=di.value||today;renderForecast();};
 document.getElementById('ap-run-forecast').onclick=runForecast;
}
async function runForecast(){`);

  return src+'\n//# sourceURL=assets/refonte-v127-base.js?forecast-prev-next\n';
}

window.__AP_FORECAST_BASE_READY__=fetch(BASE+'?v=20260930-prev-next2',{cache:'no-store'})
 .then(r=>{if(!r.ok)throw new Error('Chargement du module Prévisions impossible.');return r.text();})
 .then(src=>patchedSource(src))
 .then(src=>{(0,eval)(src);return true;})
 .catch(err=>{console.error('Astro Paquita — navigation Prévisions :',err);throw err;});
})();
