/* Astro Paquita — compatibilité V132
   Ancien moteur parallèle V127 volontairement neutralisé.
   La V121 reste l’unique source de vérité pour les maisons, transits,
   prévisions, synastries et scores.
   Ce fichier est conservé parce que l'index V127 le charge encore ; il ne fait
   désormais qu'amorcer le nettoyage visuel V132 et sécuriser la maintenance,
   sans aucun calcul astrologique. */
(function(){
'use strict';
window.__AP_TRUTH_ENGINE_DISABLED__=true;

function secureMaintenanceBypass(){
  try{
    const url=new URL(location.href);
    if(url.searchParams.has('maintenance_preview')){
      url.searchParams.delete('maintenance_preview');
      history.replaceState(history.state,'',url.pathname+(url.searchParams.toString()?'?'+url.searchParams.toString():'')+url.hash);
    }
    localStorage.removeItem('astro-maintenance-bypass');
  }catch(e){}
  if(typeof window.verifierMaintenanceSite==='function'){
    setTimeout(()=>{try{window.verifierMaintenanceSite()}catch(e){}},0);
  }
}

if(!document.querySelector('script[src*="assets/v128-visual-cleanup.js"]')){
  const s=document.createElement('script');
  s.src='assets/v128-visual-cleanup.js?v=132';
  s.defer=true;
  s.setAttribute('data-ap-v132-visual-cleanup','1');
  document.head.appendChild(s);
}
secureMaintenanceBypass();
})();
