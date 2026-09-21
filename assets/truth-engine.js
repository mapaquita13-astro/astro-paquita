/* Astro Paquita — compatibilité V132
   Ancien moteur parallèle V127 volontairement neutralisé.
   La V121 reste l’unique source de vérité pour les maisons, transits,
   prévisions, synastries et scores.
   Ce fichier est conservé parce que l'index V127 le charge encore ; il ne fait
   désormais qu'amorcer le nettoyage visuel V132, sans aucun calcul astrologique. */
(function(){
'use strict';
window.__AP_TRUTH_ENGINE_DISABLED__=true;
if(!document.querySelector('script[src*="assets/v128-visual-cleanup.js"]')){
  const s=document.createElement('script');
  s.src='assets/v128-visual-cleanup.js?v=132';
  s.defer=true;
  s.setAttribute('data-ap-v132-visual-cleanup','1');
  document.head.appendChild(s);
}
})();
