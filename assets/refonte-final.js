/* Astro Paquita V161 — bootstrap sécurisé.
   Le moteur astrologique V121 reste inchangé. Cette entrée attend que le DOM
   et AstroTruth soient prêts avant de charger l'interface V161. */
(function(){
'use strict';
if(window.__AP_V161_BOOTSTRAP__)return;
window.__AP_V161_BOOTSTRAP__=true;
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
  s.onerror=function(){console.error('Astro Paquita V161 : chargement impossible',src);};
  document.head.appendChild(s);
}
function start(){
  const root=document.getElementById('ap-final-root');
  if(!root||!window.AstroTruth){
    attempts++;
    if(attempts<240)setTimeout(start,50);
    else console.error('Astro Paquita V161 : DOM ou AstroTruth indisponible après attente.');
    return;
  }
  load('assets/refonte-v127-base.js?v=20260927-v161b','ap-v161-base',function(){
    load('assets/v161-logic.js?v=20260927-v161b','ap-v161-logic');
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
