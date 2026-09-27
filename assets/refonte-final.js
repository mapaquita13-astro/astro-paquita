/* Astro Paquita V164 — bootstrap sécurisé.
   Le moteur astrologique V121 reste inchangé. Cette entrée charge d’abord
   la couche de vérité structurée, puis le raccord de données, l’interface V127,
   la présentation V161 et enfin la restauration ciblée des méthodes V121. */
(function(){
'use strict';
if(window.__AP_V161_BOOTSTRAP__)return;
window.__AP_V161_BOOTSTRAP__=true;
const VER='20260927-v164';
let attempts=0;
function load(src,id,onload){
  const existing=document.getElementById(id);
  if(existing){
    if(existing.dataset.loaded==='1'){if(onload)onload();return;}
    if(onload)existing.addEventListener('load',onload,{once:true});
    return;
  }
  const s=document.createElement('script');
  s.id=id;
  s.src=src;
  s.async=false;
  s.onload=function(){s.dataset.loaded='1';if(onload)onload();};
  s.onerror=function(){console.error('Astro Paquita V164 : chargement impossible',src);};
  document.head.appendChild(s);
}
function ensureCss(){
  let l=document.getElementById('ap-v161-css');
  if(l){l.href='assets/refonte-final.css?v='+VER;return;}
  l=document.createElement('link');
  l.id='ap-v161-css';
  l.rel='stylesheet';
  l.href='assets/refonte-final.css?v='+VER;
  document.head.appendChild(l);
}
function loadInterface(){
  ensureCss();
  load('assets/v162-runtime-fix.js?v='+VER,'ap-v162d-runtime',function(){
    load('assets/v162-markdown-fix.js?v='+VER,'ap-v162f-markdown',function(){
      load('assets/refonte-v127-base.js?v='+VER,'ap-v161-base',function(){
        load('assets/v161-logic.js?v='+VER,'ap-v161-logic',function(){
          load('assets/v164-analysis-restore.js?v='+VER,'ap-v164-analysis',function(){
            load('assets/v162-mobile.js?v='+VER,'ap-v162-mobile');
          });
        });
      });
    });
  });
}
function start(){
  const root=document.getElementById('ap-final-root');
  if(!root){
    attempts++;
    if(attempts<240)setTimeout(start,50);
    else console.error('Astro Paquita V164 : #ap-final-root introuvable.');
    return;
  }
  if(window.AstroTruth){loadInterface();return;}
  load('assets/truth-engine.js?v='+VER,'ap-v161-truth',function(){
    if(window.AstroTruth)loadInterface();
    else console.error('Astro Paquita V164 : AstroTruth non initialisé après chargement.');
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
