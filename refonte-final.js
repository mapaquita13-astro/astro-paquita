/* Astro Paquita — compatibilité V128.
   Neutralise complètement l'ancienne interface V127 et charge uniquement
   les couches V128 qui habillent la V121 existante. */
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
function addScript(src,attr){if(document.querySelector('script['+attr+']'))return;const s=document.createElement('script');s.src=src;s.defer=true;s.setAttribute(attr,'1');document.head.appendChild(s)}
function load(){
  neutraliseV127();
  addScript('assets/refonte-final.js?v=128.7','data-ap-v128-loader');
  addScript('assets/v128-hotfix.js?v=128.7','data-ap-v128-hotfix');
  addScript('assets/v128-visual-cleanup.js?v=128.7','data-ap-v128-cleanup');
}
window.addEventListener('pageshow',neutraliseV127);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
