/* Astro Paquita — navigation temporelle des prévisions V121.
   Cette couche ne modifie aucun calcul astrologique : elle synchronise la période,
   le domaine et le profil actif avec le moteur V121 avant chaque génération. */
(function(){
'use strict';
if(window.__AP_V174_FORECAST_NAV__)return;
window.__AP_V174_FORECAST_NAV__=true;

const A=window.AstroTruth;
const META={fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'};
let running=false;
const q=(s,r)=> (r||document).querySelector(s);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
function lang(){return String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2);}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function fromIso(raw){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(raw||'')))return null;const d=new Date(raw+'T12:00:00');return isNaN(d)?null:d;}
function today(){const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate(),12);}
function activePeriod(){return q('.ap-route-forecast .ap-period-choice.active')?.dataset.per||'mois';}
function activeDomain(){return q('.ap-route-forecast .ap-domain-choice.active')?.dataset.domain||'all';}
function span(period){if(period==='jour'||period==='date')return 1;if(period==='semaine')return 7;if(period==='mois')return 30;if(period==='trimestre')return 90;return 365;}
function nav(){return q('.ap-route-forecast .ap-forecast-period-nav');}
function currentAnchor(period){
  if(period==='date'){
    const d=fromIso(q('#ap-forecast-date')?.value||'');
    if(d)return d;
  }
  const d=fromIso(nav()?.dataset.v174Anchor||'');
  return d||today();
}
function fmtShort(d){return d.toLocaleDateString(META[lang()]||META.fr,{day:'numeric',month:'short',year:'numeric'});}
function fmtLong(d){return d.toLocaleDateString(META[lang()]||META.fr,{day:'numeric',month:'long',year:'numeric'});}
function rangeText(start,days){const end=new Date(start);end.setDate(end.getDate()+Math.max(0,days-1));return days===1?fmtShort(start):fmtShort(start)+' → '+fmtShort(end);}
function fullRangeText(start,days){const end=new Date(start);end.setDate(end.getDate()+Math.max(0,days-1));return days===1?fmtLong(start):fmtLong(start)+' → '+fmtLong(end);}
function syncNav(forceToday){
  const n=nav();if(!n)return;
  const period=activePeriod();
  let start=forceToday?today():currentAnchor(period);
  if(period==='date'){
    const d=fromIso(q('#ap-forecast-date')?.value||'');if(d)start=d;
  }
  n.dataset.v174Anchor=iso(start);
  n.dataset.v174Days=String(span(period));
  const label=q('.ap-forecast-range-label',n);if(label)label.textContent=rangeText(start,span(period));
}
function shift(dir){
  const period=activePeriod(),days=span(period),start=currentAnchor(period);
  start.setDate(start.getDate()+dir*days);
  const n=nav();if(n){n.dataset.v174Anchor=iso(start);n.dataset.v174Days=String(days);}
  if(period==='date'){
    const input=q('#ap-forecast-date');if(input)input.value=iso(start);
  }
  const label=q('.ap-forecast-range-label');if(label)label.textContent=rangeText(start,days);
  const out=q('#ap-forecast-result');if(out)out.innerHTML='';
}
function legacyUserReady(){
  try{return typeof USER!=='undefined'&&!!USER&&!!USER.prenom;}catch(e){return false;}
}
function ensureLegacyProfile(){
  const p=A&&typeof A.currentProfile==='function'?A.currentProfile():null;
  if(!p)throw new Error('Aucun profil actif. Sélectionne ou crée un profil puis réessaie.');
  if(A&&typeof A.validation==='function'){
    const v=A.validation(p);
    if(!v||!v.ok)throw new Error('Le profil actif est incomplet. Vérifie la date, l’heure et le lieu de naissance.');
  }

  let activated=false;
  try{if(A&&typeof A.activate==='function')activated=!!A.activate(p.profileId||p.legacyKey);}catch(e){}

  /* Sécurité de compatibilité : certaines navigations de la nouvelle interface
     conservent bien le profil AstroTruth mais l'ancien objet USER de V121 peut
     avoir été remis à null. On le reconstruit alors avec la fonction V121 prévue
     pour cela, sans toucher aux calculs ni aux données de naissance. */
  if(!legacyUserReady()&&typeof window.v37CalculerUserDepuisDonnees==='function'){
    try{
      const payload={...p,__profileKey:p.legacyKey,__timeStatus:p.timeStatus||'exact'};
      activated=!!window.v37CalculerUserDepuisDonnees(payload)||activated;
    }catch(e){}
  }

  if(!legacyUserReady()){
    throw new Error('Le profil actif n’a pas pu être initialisé pour les prévisions. Recharge la page puis réessaie.');
  }
  return {profile:p,activated};
}
function setLegacySelection(domain,period){
  const map={all:'general',amour:'amour',travail:'travail',argent:'finances',bienetre:'sante',famille:'famille',voyage:'voyage'};
  const d=map[domain]||'general';
  try{domP=d;}catch(e){try{window.eval('domP='+JSON.stringify(d));}catch(_){} }
  try{perP=period;}catch(e){try{window.eval('perP='+JSON.stringify(period));}catch(_){} }
}
function setBusy(on){const l=q('#ap-forecast-loader');if(l)l.classList.toggle('show',!!on);const b=q('#ap-run-forecast');if(b)b.disabled=!!on;}
function setError(msg){const e=q('#ap-forecast-error');if(e){e.textContent=msg||'';e.classList.toggle('show',!!msg);}}
async function generate(){
  if(running)return;
  const out=q('#ap-forecast-result');if(!out)return;
  const period=activePeriod(),domain=activeDomain(),days=span(period),start=currentAnchor(period);
  const n=nav();if(n){n.dataset.v174Anchor=iso(start);n.dataset.v174Days=String(days);}
  running=true;setBusy(true);setError('');
  const title=fullRangeText(start,days);
  try{
    ensureLegacyProfile();
    if(typeof window.lancerPrevDepuis!=='function')throw new Error('Les prévisions sont momentanément indisponibles.');
    setLegacySelection(domain,period);
    out.innerHTML='<div class="ap-card"><h3>Prévisions · '+esc(title)+'</h3><p class="ap-muted">Analyse complète de la période sélectionnée…</p></div>';
    await window.lancerPrevDepuis(new Date(start),days,period);
    const legacy=q('#p-rapport');
    const html=legacy&&legacy.innerHTML?legacy.innerHTML.trim():'';
    out.innerHTML='<div class="ap-card ap-forecast-v174"><div class="ap-eyebrow">Prévision personnalisée</div><h2 style="margin:6px 0 14px">'+esc(title)+'</h2><div class="ap-report">'+(html||'<p>Aucun élément suffisamment marqué ne ressort sur cette période.</p>')+'</div></div>';
  }catch(e){
    console.error('Astro Paquita — génération prévisions :',e);
    const raw=String(e&&e.message||'');
    const msg=/Cannot read properties of null|reading ['\"]prenom['\"]/i.test(raw)
      ?'Le profil actif n’a pas été correctement chargé. Recharge la page puis relance la prévision.'
      :(raw||'La prévision n’a pas pu être générée.');
    setError(msg);out.innerHTML='';
  }finally{running=false;setBusy(false);}
}

document.addEventListener('click',function(ev){
  const t=ev.target&&ev.target.closest?ev.target.closest('#ap-forecast-prev,#ap-forecast-next,#ap-run-forecast,[data-per]'):null;
  if(!t||!document.body.classList.contains('ap-route-forecast'))return;
  if(t.matches('[data-per]')){setTimeout(()=>syncNav(true),0);return;}
  if(t.id==='ap-forecast-prev'||t.id==='ap-forecast-next'){
    ev.preventDefault();ev.stopImmediatePropagation();shift(t.id==='ap-forecast-prev'?-1:1);return;
  }
  if(t.id==='ap-run-forecast'){
    ev.preventDefault();ev.stopImmediatePropagation();generate();return;
  }
},true);

document.addEventListener('change',function(ev){
  if(ev.target&&ev.target.id==='ap-forecast-date'){setTimeout(()=>syncNav(false),0);}
},true);

let pending=false;
const obs=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;if(document.body.classList.contains('ap-route-forecast'))syncNav(false);});});
obs.observe(document.getElementById('ap-final-root')||document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>syncNav(false),{once:true});else syncNav(false);
})();
