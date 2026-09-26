/* Astro Paquita — V160 chargeur unique.
   Une seule interface publique. Les calculs astrologiques historiques ne sont pas modifiés. */
(function(){
'use strict';
if(window.__AP_V160_LOADER__)return;
window.__AP_V160_LOADER__=true;
window.__AP_TRUTH_ENGINE_DISABLED__=true;
window.__AP_V156_PRODUCT_COHERENCE__=true;
try{document.documentElement.classList.add('ap160-booting')}catch(e){}

function loadScript(src,marker){
 const base=src.split('?')[0];
 if(document.querySelector(`script[${marker}]`)||document.querySelector(`script[src*="${base}"]`))return;
 const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute(marker,'1');(document.head||document.documentElement).appendChild(s);
}
function loadStyle(href,marker){
 const base=href.split('?')[0];
 if(document.querySelector(`link[${marker}]`)||document.querySelector(`link[href*="${base}"]`))return;
 const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(marker,'1');(document.head||document.documentElement).appendChild(l);
}
function disableLegacyNotifications(){
 try{localStorage.removeItem('ap-notifications');for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&k.indexOf('ap-notified-')===0)localStorage.removeItem(k)}}catch(e){}
 document.getElementById('ap-notification-badge')?.remove();window.apEnableNotifications=async()=>false;window.apCheckUpcomingWindows=()=>[];
}
function secureMaintenanceBypass(){try{const url=new URL(location.href);if(url.searchParams.has('maintenance_preview')){url.searchParams.delete('maintenance_preview');history.replaceState(history.state,'',url.pathname+(url.searchParams.toString()?'?'+url.searchParams.toString():'')+url.hash)}localStorage.removeItem('astro-maintenance-bypass')}catch(e){}}
function protectChildAccess(){if(window.__AP_V160_CHILD_GUARD__)return;window.__AP_V160_CHILD_GUARD__=true;document.addEventListener('click',e=>{const target=e.target&&e.target.closest&&e.target.closest('#ap-v130-child-card');if(!target)return;let connected=false;try{connected=!!(localStorage.getItem('astro-token')||window.USER_CONNECTE&&window.USER_CONNECTE.email)}catch(err){}if(!connected){e.preventDefault();e.stopPropagation();if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();if(typeof window.ouvrirCompte==='function')window.ouvrirCompte()}},true)}

/* Technique conservée : confidentialité + portrait enfant. */
loadScript('assets/privacy-guard-v150.js?v=160','data-ap-v160-privacy');
loadScript('assets/v141-child-portrait.js?v=160','data-ap-v160-child');

/* Nouvelle application : aucune ancienne couche V128–V159 n'est chargée. */
loadStyle('assets/v160-from-scratch.css?v=160','data-ap-v160-style');
loadScript('assets/v160-editorial-core.js?v=160','data-ap-v160-editorial');
loadScript('assets/v160-from-scratch.js?v=160','data-ap-v160-ui');

protectChildAccess();secureMaintenanceBypass();disableLegacyNotifications();
setTimeout(()=>document.documentElement.classList.remove('ap160-booting'),4000);
})();