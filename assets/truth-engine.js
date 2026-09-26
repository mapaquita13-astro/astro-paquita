/* Astro Paquita — V159 chargeur stabilisé.
   Cette couche ne modifie aucun calcul astrologique. Elle évite le lancement simultané
   des anciennes couches visuelles et laisse V157/V158 être l'unique interface publique. */
(function(){
'use strict';
if(window.__AP_V159_STABLE_LOADER__)return;
window.__AP_V159_STABLE_LOADER__=true;
window.__AP_TRUTH_ENGINE_DISABLED__=true;
window.__AP_V156_PRODUCT_COHERENCE__=true;

function loadOnce(src,marker){
  const base=src.split('?')[0];
  if(document.querySelector(`script[${marker}]`)||document.querySelector(`script[src*="${base}"]`))return;
  const s=document.createElement('script');
  s.src=src;
  s.async=false;
  s.setAttribute(marker,'1');
  (document.head||document.documentElement).appendChild(s);
}

function disableLegacyNotifications(){
  try{
    localStorage.removeItem('ap-notifications');
    for(let i=localStorage.length-1;i>=0;i--){
      const k=localStorage.key(i);
      if(k&&k.indexOf('ap-notified-')===0)localStorage.removeItem(k);
    }
  }catch(e){}
  document.getElementById('ap-notification-badge')?.remove();
  window.apEnableNotifications=async function(){return false};
  window.apCheckUpcomingWindows=function(){return []};
}

function secureMaintenanceBypass(){
  try{
    const url=new URL(location.href);
    if(url.searchParams.has('maintenance_preview')){
      url.searchParams.delete('maintenance_preview');
      history.replaceState(history.state,'',url.pathname+(url.searchParams.toString()?'?'+url.searchParams.toString():'')+url.hash);
    }
    localStorage.removeItem('astro-maintenance-bypass');
  }catch(e){}
}

function protectChildAccess(){
  if(window.__AP_V159_CHILD_GUARD__)return;
  window.__AP_V159_CHILD_GUARD__=true;
  document.addEventListener('click',e=>{
    const target=e.target&&e.target.closest&&e.target.closest('#ap-v130-child-card');
    if(!target)return;
    let connected=false;
    try{connected=!!(localStorage.getItem('astro-token')||window.USER_CONNECTE&&window.USER_CONNECTE.email)}catch(err){}
    if(!connected){
      e.preventDefault();e.stopPropagation();
      if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
      if(typeof window.ouvrirCompte==='function')window.ouvrirCompte();
    }
  },true);
}

/* Fonctions techniques conservées. Aucune ancienne coque visuelle n'est relancée. */
loadOnce('assets/privacy-guard-v150.js?v=159','data-ap-v159-privacy');
loadOnce('assets/v141-child-portrait.js?v=159','data-ap-v159-child');
loadOnce('assets/v157-loader.js?v=159','data-ap-v159-interface');

protectChildAccess();
secureMaintenanceBypass();
disableLegacyNotifications();
})();
