/* Astro Paquita V167 — simplification de l'écran Prévisions.
   Aucun calcul astrologique modifié : uniquement l'ergonomie.
   Période + domaine = une seule prévision. Calendrier reste un accès séparé. */
(function(){
'use strict';
if(window.__AP_V167_FORECAST_UI__)return;
window.__AP_V167_FORECAST_UI__=true;
let obs=null,pending=false;
function q(s,r){return (r||document).querySelector(s);}
function qa(s,r){return Array.from((r||document).querySelectorAll(s));}
function currentLang(){return String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2);}
function healthLabel(){return ({fr:'Santé',en:'Health',es:'Salud',ar:'الصحة'})[currentLang()]||'Santé';}
function ensureHealthButton(screen){
  const grid=q('.ap-domain-choice-grid',screen);
  if(!grid||q('[data-domain="sante"]',grid))return;
  const b=document.createElement('button');
  b.type='button';
  b.className='ap-domain-choice';
  b.dataset.domain='sante';
  b.innerHTML='<i>⚕</i><span>'+healthLabel()+'</span>';
  try{if(typeof state!=='undefined'&&state.domain==='sante')b.classList.add('active');}catch(e){}
  b.onclick=function(){
    try{if(typeof state!=='undefined')state.domain='sante';}catch(e){}
    qa('[data-domain]',screen).forEach(x=>x.classList.toggle('active',x===b));
  };
  const family=q('[data-domain="famille"]',grid);
  if(family)grid.insertBefore(b,family);else grid.appendChild(b);
}
function apply(){
  pending=false;
  const screen=q('.ap-route-forecast .ap-forecast-screen');
  if(!screen)return;
  ensureHealthButton(screen);
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
function schedule(){if(pending)return;pending=true;requestAnimationFrame(apply);}
function start(){apply();obs=new MutationObserver(schedule);obs.observe(q('#ap-final-root')||document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
