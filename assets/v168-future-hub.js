/* Astro Paquita V168 — Mon avenir sans graphique ni tendances 12/24 mois.
   Interface uniquement. Aucun calcul astrologique n'est ajouté ou modifié. */
(function(){
'use strict';
if(window.__AP_V168_FUTURE_HUB__)return;
window.__AP_V168_FUTURE_HUB__=true;
let observer=null,pending=false,applying=false;
function q(s,r){return (r||document).querySelector(s);}
function qa(s,r){return Array.from((r||document).querySelectorAll(s));}
function go(route){
  const el=q('.ap-navbtn[data-route="'+route+'"],.ap-mob-btn[data-route="'+route+'"],[data-route="'+route+'"]');
  if(el){el.click();return true;}
  return false;
}
function installCss(){if(q('#ap-v168-css'))return;const s=document.createElement('style');s.id='ap-v168-css';s.textContent=`
.ap-future-hub-v168{max-width:1080px;margin:0 auto}.v168-intro{max-width:760px;margin-bottom:26px}.v168-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.v168-card{position:relative;min-height:220px;border:1px solid rgba(77,39,67,.13);background:#fffaf3;border-radius:26px;padding:25px;text-align:left;cursor:pointer;box-shadow:0 10px 28px rgba(65,31,55,.05);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}.v168-card:hover{transform:translateY(-2px);box-shadow:0 15px 34px rgba(65,31,55,.08);border-color:rgba(99,48,84,.22)}.v168-icon{width:48px;height:48px;border-radius:16px;background:#f4e9dc;display:grid;place-items:center;color:#5c2c53;font-size:24px;margin-bottom:19px}.v168-card h2{font:600 30px/1.05 'Cormorant Garamond',Georgia,serif;color:#45213d;margin:0 0 10px}.v168-card p{margin:0;color:#665a60;font-size:15px;line-height:1.65;max-width:420px}.v168-arrow{position:absolute;right:21px;bottom:18px;font-size:25px;color:#865d70}
@media(max-width:900px){.v168-grid{grid-template-columns:1fr}.v168-card{min-height:180px;padding:22px}.v168-card h2{font-size:28px}.v168-card p{font-size:16px}.ap-future-hub-v168 .ap-title{margin-bottom:8px}}
`;document.head.appendChild(s);}
function render(){
  if(!document.body.classList.contains('ap-route-future'))return;
  const page=q('#ap-page');if(!page)return;
  if(q('#ap-v168-future',page))return;
  page.innerHTML=`<section id="ap-v168-future" class="ap-future-hub-v168"><div class="ap-eyebrow">Votre avenir</div><h1 class="ap-title">Qu’avez-vous envie de regarder ?</h1><p class="ap-subtitle v168-intro">Choisissez directement l’analyse qui vous intéresse.</p><div class="v168-grid"><button class="v168-card" type="button" data-v168-route="forecast"><div class="v168-icon">☽</div><h2>Mes prévisions</h2><p>Choisissez une période et un domaine : aujourd’hui, semaine, mois, 3 mois, 12 mois ou une date précise.</p><span class="v168-arrow">→</span></button><button class="v168-card" type="button" data-v168-route="timing"><div class="v168-icon">◌</div><h2>Le bon moment</h2><p>Recherchez les fenêtres les plus intéressantes pour un objectif précis, sur la période que vous choisissez.</p><span class="v168-arrow">→</span></button><button class="v168-card" type="button" data-v168-route="calendar"><div class="v168-icon">▦</div><h2>Mon calendrier</h2><p>Choisissez une date pour consulter la lecture détaillée de cette journée.</p><span class="v168-arrow">→</span></button></div></section>`;
  qa('[data-v168-route]',page).forEach(b=>b.onclick=()=>go(b.dataset.v168Route));
}
function apply(){if(applying)return;pending=false;applying=true;try{if(observer)observer.disconnect();installCss();render();}finally{applying=false;watch();}}
function schedule(){if(pending||applying)return;pending=true;requestAnimationFrame(apply);}
function watch(){if(!observer)observer=new MutationObserver(schedule);observer.observe(q('#ap-final-root')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}
function start(){installCss();watch();schedule();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
