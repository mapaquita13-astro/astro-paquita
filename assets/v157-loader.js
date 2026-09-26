/* Astro Paquita — chargeur V157. */
(function(){
'use strict';
if(window.__AP_V157_LOADER__)return;
window.__AP_V157_LOADER__=true;
// V157 remplace l'ancienne couche visuelle V156, sans toucher aux calculs V121.
window.__AP_V156_PRODUCT_COHERENCE__=true;
if(!document.querySelector('link[href*="v157-design-system.css"]')){
  const l=document.createElement('link');
  l.rel='stylesheet';
  l.href='assets/v157-design-system.css?v=157.1';
  l.setAttribute('data-ap-v157-design','1');
  document.head.appendChild(l);
}
if(!document.querySelector('script[src*="v157-total-rethink.js"]')){
  const s=document.createElement('script');
  s.src='assets/v157-total-rethink.js?v=157.1';
  s.async=false;
  s.setAttribute('data-ap-v157-total-rethink','1');
  document.head.appendChild(s);
}
if(!document.querySelector('script[src*="v157-editorial-guard.js"]')){
  const s=document.createElement('script');
  s.src='assets/v157-editorial-guard.js?v=157.1';
  s.async=false;
  s.setAttribute('data-ap-v157-editorial-guard','1');
  document.head.appendChild(s);
}
})();