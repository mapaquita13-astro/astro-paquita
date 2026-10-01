/* Astro Paquita V167 — simplification de l'écran Prévisions.
   Aucun calcul astrologique modifié : uniquement l'ergonomie.
   Période + domaine = une seule prévision. Calendrier reste un accès séparé. */
(function(){
'use strict';
if(window.__AP_V167_FORECAST_UI__)return;
window.__AP_V167_FORECAST_UI__=true;
let obs=null,pending=false;
function q(s,r){return (r||document).querySelector(s);}
function apply(){
  pending=false;
  const screen=q('.ap-route-forecast .ap-forecast-screen');
  if(!screen)return;
  const tabs=q('.ap-forecast-mode',screen);
  if(tabs&&!tabs.dataset.v167){
    tabs.dataset.v167='1';
    tabs.innerHTML='<button class="ap-tab active" type="button" aria-current="page">Prévisions</button><button class="ap-tab" type="button" data-v167-calendar>Calendrier</button>';
    q('[data-v167-calendar]',tabs).onclick=function(){
      const target=q('.ap-navbtn[data-route="calendar"],.ap-mob-btn[data-route="calendar"],[data-route="calendar"]');
      if(target)target.click();
    };
  }
  const domainTitle=q('#ap-domain-anchor',screen);
  if(domainTitle)domainTitle.textContent='Choisissez un domaine';
  const note=q('.ap-forecast-note',screen);
  if(note)note.textContent='Choisissez d’abord quand vous voulez regarder, puis le domaine concerné. Les deux critères sont analysés ensemble.';
  const title=qa('[data-per]',screen);
  if(!q('.v167-forecast-explain',screen)){
    const h=screen.querySelector('.ap-forecast-form > h3');
    if(h){
      const p=document.createElement('p');
      p.className='ap-muted v167-forecast-explain';
      p.textContent='1. La période répond à « quand ? »  ·  2. Le domaine répond à « sur quoi ? »';
      h.insertAdjacentElement('afterend',p);
    }
  }
}
function qa(s,r){return Array.from((r||document).querySelectorAll(s));}
function schedule(){if(pending)return;pending=true;requestAnimationFrame(apply);}
function start(){apply();obs=new MutationObserver(schedule);obs.observe(q('#ap-final-root')||document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
