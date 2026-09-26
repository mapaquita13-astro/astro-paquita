/* Astro Paquita — chargeur V159 stable. */
(function(){
'use strict';
if(window.__AP_V159_LOADER__)return;
window.__AP_V159_LOADER__=true;
window.__AP_V156_PRODUCT_COHERENCE__=true;
if(!document.querySelector('link[href*="v157-design-system.css"]')){
  const l=document.createElement('link');l.rel='stylesheet';l.href='assets/v157-design-system.css?v=159';l.setAttribute('data-ap-v159-design','1');document.head.appendChild(l);
}
if(!document.querySelector('script[src*="v157-editorial-guard.js"]')){
  const s=document.createElement('script');s.src='assets/v157-editorial-guard.js?v=159';s.async=false;s.setAttribute('data-ap-v159-editorial','1');document.head.appendChild(s);
}
if(!document.querySelector('script[src*="v159-stable-ui.js"]')){
  const s=document.createElement('script');s.src='assets/v159-stable-ui.js?v=159';s.async=false;s.setAttribute('data-ap-v159-stable-ui','1');document.head.appendChild(s);
}
if(!document.querySelector('script[src*="v158-report-premium.js"]')){
  const s=document.createElement('script');s.src='assets/v158-report-premium.js?v=159';s.async=false;s.setAttribute('data-ap-v159-report-premium','1');document.head.appendChild(s);
}
})();
