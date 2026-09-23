/* Astro Paquita — chargeur de compatibilité interface V149 */
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
function ensureActiveLayer(){
  neutraliseAncienneInterface();
  if(document.querySelector('script[src*="assets/refonte-final.js"]'))return;
  const s=document.createElement('script');
  s.src='assets/refonte-final.js?v=149';
  s.async=false;
  s.setAttribute('data-ap-active-loader','1');
  document.head.appendChild(s);
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
