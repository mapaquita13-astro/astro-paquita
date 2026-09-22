/* Astro Paquita — compatibilité V133
   Ancien moteur parallèle V127 volontairement neutralisé.
   La V121 reste l’unique source de vérité pour les maisons, transits,
   prévisions, synastries et scores.
   Ce fichier est conservé parce que l'index V127 le charge encore ; il ne fait
   désormais qu'amorcer le nettoyage visuel V133, sécuriser la maintenance et
   désactiver l'ancienne interface de notifications, sans aucun calcul astrologique. */
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

function disableLegacyNotifications(){
  try{
    localStorage.removeItem('ap-notifications');
    for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&k.indexOf('ap-notified-')===0)localStorage.removeItem(k)}
  }catch(e){}
  document.getElementById('ap-notification-badge')?.remove();
  window.apEnableNotifications=async function(){
    try{localStorage.removeItem('ap-notifications')}catch(e){}
    document.getElementById('ap-notification-badge')?.remove();
    return false;
  };
  window.apCheckUpcomingWindows=function(){document.getElementById('ap-notification-badge')?.remove();return []};
}

if(!document.querySelector('script[src*="assets/v128-visual-cleanup.js"]')){
  const s=document.createElement('script');
  s.src='assets/v128-visual-cleanup.js?v=133';
  s.defer=true;
  s.setAttribute('data-ap-v133-visual-cleanup','1');
  document.head.appendChild(s);
}
secureMaintenanceBypass();
disableLegacyNotifications();
})();
