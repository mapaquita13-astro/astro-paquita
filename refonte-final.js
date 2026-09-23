/* Astro Paquita — chargeur de compatibilité interface V152 */
(function(){
'use strict';
function neutraliseAncienneInterface(){
  const root=document.getElementById('ap-final-root');
  if(root){root.innerHTML='';root.style.setProperty('display','none','important')}
  if(document.body){
    document.body.classList.remove('ap-final-active','ap-auth-open');
    [...document.body.classList].filter(c=>c.indexOf('ap-route-')===0).forEach(c=>document.body.classList.remove(c));
  }
}
function loadOnce(src,marker){
  if(document.querySelector(`script[${marker}]`)||document.querySelector(`script[src*="${src.split('?')[0]}"]`))return;
  const s=document.createElement('script');
  s.src=src;
  s.async=false;
  s.setAttribute(marker,'1');
  document.head.appendChild(s);
}
function ensureActiveLayer(){
  neutraliseAncienneInterface();
  loadOnce('assets/refonte-final.js?v=152','data-ap-active-loader');
  loadOnce('assets/v150-image-frame-fix.js?v=150','data-ap-v150-image-frame-fix');
  loadOnce('assets/v151-banner-home-fix.js?v=151','data-ap-v151-banner-home-fix');
  loadOnce('assets/v152-image-refine.js?v=152','data-ap-v152-image-refine');
}
function ensureQuestionGuard(done){
  if(document.querySelector('script[src*="assets/v139-question-guard.js"]')){done();return}
  const s=document.createElement('script');
  s.src='assets/v139-question-guard.js?v=139';
  s.async=false;
  s.setAttribute('data-ap-question-guard','1');
  s.onload=done;
  s.onerror=done;
  document.head.appendChild(s);
}
function boot(){ensureQuestionGuard(ensureActiveLayer)}
window.addEventListener('pageshow',neutraliseAncienneInterface);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
