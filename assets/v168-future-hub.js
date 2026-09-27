/* Astro Paquita V168 — Mon avenir sans graphique ni tendances 12/24 mois.
   Interface uniquement. Aucun calcul astrologique n'est ajouté ou modifié. */
(function(){
'use strict';
if(window.__AP_V168_FUTURE_HUB__)return;
window.__AP_V168_FUTURE_HUB__=true;
let observer=null,pending=false,applying=false;
function q(s,r){return (r||document).querySelector(s);}
function qa(s,r){return Array.from((r||document).querySelectorAll(s));}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function go(route){
  const el=q('.ap-navbtn[data-route="'+route+'"],.ap-mob-btn[data-route="'+route+'"],[data-route="'+route+'"]');
  if(el){el.click();return true;}
  return false;
}
function legacyEventsButton(){
  return qa('button,a').find(el=>{
    if(el.closest('#ap-final-root'))return false;
    const t=(el.textContent||'').toLowerCase();
    return t.includes('événements majeurs')||t.includes('grands événements')||t.includes('24 mois qui comptent');
  })||null;
}
function canOpenEvents(){
  return typeof window.v100OpenModule==='function'||typeof window.irVersModule==='function'||!!legacyEventsButton();
}
function openEvents(){
  try{if(typeof window.v100OpenModule==='function'){window.v100OpenModule('evenements');return;}}catch(e){}
  try{if(typeof window.irVersModule==='function'){window.irVersModule('evenements');return;}}catch(e){}
  const b=legacyEventsButton();if(b)b.click();
}
function installCss(){if(q('#ap-v168-css'))return;const s=document.createElement('style');s.id='ap-v168-css';s.textContent=`
.ap-future-hub-v168{max-width:1080px;margin:0 auto}.v168-intro{max-width:760px;margin-bottom:24px}.v168-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.v168-card{position:relative;min-height:210px;border:1px solid rgba(77,39,67,.13);background:#fffaf3;border-radius:26px;padding:24px;text-align:left;cursor:pointer;box-shadow:0 10px 28px rgba(65,31,55,.05);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}.v168-card:hover{transform:translateY(-2px);box-shadow:0 15px 34px rgba(65,31,55,.08);border-color:rgba(99,48,84,.22)}.v168-icon{width:46px;height:46px;border-radius:16px;background:#f4e9dc;display:grid;place-items:center;color:#5c2c53;font-size:23px;margin-bottom:18px}.v168-card h2{font:600 29px/1.05 'Cormorant Garamond',Georgia,serif;color:#45213d;margin:0 0 9px}.v168-card p{margin:0;color:#766970;font-size:13px;line-height:1.65;max-width:420px}.v168-arrow{position:absolute;right:21px;bottom:18px;font-size:24px;color:#865d70}.v168-note{margin-top:18px;padding:15px 18px;border-radius:18px;background:#f4eadf;color:#6d5d64;font-size:12px;line-height:1.6}.v168-note strong{color:#4d3043}.v168-events{background:linear-gradient(145deg,#fffaf3,#f7ecdf)}
@media(max-width:720px){.v168-grid{grid-template-columns:1fr}.v168-card{min-height:178px;padding:21px}.v168-card h2{font-size:26px}.ap-future-hub-v168 .ap-title{margin-bottom:8px}}
`;document.head.appendChild(s);}
function render(){
  if(!document.body.classList.contains('ap-route-future'))return;
  const page=q('#ap-page');if(!page)return;
  if(q('#ap-v168-future',page))return;
  const eventCard=canOpenEvents()?`<button class="v168-card v168-events" type="button" data-v168-events><div class="v168-icon">✦</div><h2>Événements majeurs</h2><p>Voir uniquement les périodes réellement marquantes, sans transformer chaque mois en grand tournant.</p><span class="v168-arrow">→</span></button>`:'';
  page.innerHTML=`<section id="ap-v168-future" class="ap-future-hub-v168"><div class="ap-eyebrow">Votre avenir</div><h1 class="ap-title">Qu’avez-vous envie de regarder ?</h1><p class="ap-subtitle v168-intro">Plus de graphique ni de tendances générales difficiles à interpréter. Choisissez directement l’analyse qui répond à votre question.</p><div class="v168-grid"><button class="v168-card" type="button" data-v168-route="forecast"><div class="v168-icon">☽</div><h2>Mes prévisions</h2><p>Choisissez une période et un domaine : aujourd’hui, semaine, mois, 3 mois, 12 mois ou une date précise.</p><span class="v168-arrow">→</span></button><button class="v168-card" type="button" data-v168-route="timing"><div class="v168-icon">◌</div><h2>Le bon moment</h2><p>Recherchez les fenêtres les plus intéressantes pour un objectif précis, sur la période que vous choisissez.</p><span class="v168-arrow">→</span></button><button class="v168-card" type="button" data-v168-route="calendar"><div class="v168-icon">▦</div><h2>Mon calendrier</h2><p>Choisissez une date pour consulter la lecture détaillée de cette journée.</p><span class="v168-arrow">→</span></button>${eventCard}</div><div class="v168-note"><strong>Principe :</strong> Astro Paquita ne calcule plus une tendance générale juste pour remplir cet écran. Les calculs sont lancés seulement quand vous choisissez l’analyse qui vous intéresse.</div></section>`;
  qa('[data-v168-route]',page).forEach(b=>b.onclick=()=>go(b.dataset.v168Route));
  const ev=q('[data-v168-events]',page);if(ev)ev.onclick=openEvents;
}
function apply(){if(applying)return;pending=false;applying=true;try{if(observer)observer.disconnect();installCss();render();}finally{applying=false;watch();}}
function schedule(){if(pending||applying)return;pending=true;requestAnimationFrame(apply);}
function watch(){if(!observer)observer=new MutationObserver(schedule);observer.observe(q('#ap-final-root')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}
function start(){installCss();watch();schedule();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
