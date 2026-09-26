/* Astro Paquita — V160 chargeur du moteur historique uniquement.
   L'interface publique est désormais construite séparément par V160. */
(function(){
'use strict';
function loadOnce(src,marker){
  const base=src.split('?')[0];
  if(document.querySelector(`script[${marker}]`)||document.querySelector(`script[src*="${base}"]`))return;
  const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute(marker,'1');document.head.appendChild(s);
}
function neutraliseAncienneCoque(){
  const root=document.getElementById('ap-final-root');
  if(root){root.innerHTML='';root.style.setProperty('display','none','important')}
  if(document.body){document.body.classList.remove('ap-final-active','ap-auth-open');[...document.body.classList].filter(c=>c.indexOf('ap-route-')===0).forEach(c=>document.body.classList.remove(c))}
}
function boot(){
  neutraliseAncienneCoque();
  /* Ce fichier contient les fonctions historiques et les calculs à conserver. */
  loadOnce('assets/refonte-final.js?v=160-core','data-ap-v160-core');
}
window.addEventListener('pageshow',neutraliseAncienneCoque);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
