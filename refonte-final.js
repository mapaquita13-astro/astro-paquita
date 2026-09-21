/* Astro Paquita — compatibilité V128.
   Neutralise complètement l'ancienne interface V127 et charge uniquement
   la couche V128 qui habille la V121 existante. */
(function(){
'use strict';
function neutraliseV127(){
  const root=document.getElementById('ap-final-root');
  if(root){root.innerHTML='';root.style.setProperty('display','none','important');}
  if(document.body){
    document.body.classList.remove('ap-final-active','ap-auth-open');
    [...document.body.classList].filter(c=>c.indexOf('ap-route-')===0).forEach(c=>document.body.classList.remove(c));
  }
  document.querySelectorAll('.ap-shell,.ap-mobile-nav,.ap-toast').forEach(el=>{
    if(root&&!root.contains(el))el.remove();
  });
}
function load(){
  neutraliseV127();
  if(document.querySelector('script[data-ap-v128-loader]'))return;
  const s=document.createElement('script');
  s.src='assets/refonte-final.js?v=128.4';
  s.defer=true;
  s.dataset.apV128Loader='1';
  document.head.appendChild(s);
}
window.addEventListener('pageshow',neutraliseV127);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
