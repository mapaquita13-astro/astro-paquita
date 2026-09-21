/* Astro Paquita — compatibilité V128.
   La V127 autonome est neutralisée : cette entrée racine charge désormais
   uniquement la couche d'interface V128 qui habille la V121 existante. */
(function(){
'use strict';
function load(){
  if(document.querySelector('script[src*="assets/refonte-final.js"]'))return;
  const s=document.createElement('script');
  s.src='assets/refonte-final.js?v=128.2';
  s.defer=true;
  document.head.appendChild(s);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
