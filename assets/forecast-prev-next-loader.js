/* Astro Paquita — chargement standard du module Prévisions compilé.
   La navigation est intégrée dans refonte-v127-base.js ; plus de fetch+eval dynamique.
   Aucun calcul du moteur V121 n'est modifié. */
(function(){
'use strict';
if(window.__AP_FORECAST_NAV_LOADER__)return;
window.__AP_FORECAST_NAV_LOADER__=true;
window.__AP_FORECAST_BASE_READY__=new Promise((resolve,reject)=>{
 if(window.__ASTRO_PAQUITA_BUILD__){resolve(true);return;}
 const existing=document.getElementById('ap-compiled-v127-base');
 if(existing){if(existing.dataset.loaded==='1')resolve(true);
   else {existing.addEventListener('load',()=>resolve(true),{once:true});existing.addEventListener('error',()=>reject(new Error('Interface des prévisions indisponible')),{once:true});}
   return;
 }
 const el=document.createElement('script');
 el.id='ap-compiled-v127-base';el.src='assets/refonte-v127-base.js?v=20261009-compiled-forecast';
 el.async=false;
 el.onload=()=>{el.dataset.loaded='1';resolve(true);};
 el.onerror=()=>reject(new Error('Impossible de charger le module des prévisions.'));
 document.head.appendChild(el);
});
})();
