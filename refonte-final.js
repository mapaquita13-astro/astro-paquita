/* Astro Paquita — chargeur de compatibilité interface */
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
  s.src='assets/refonte-final.js?v=136';
  s.defer=true;
  s.setAttribute('data-ap-active-loader','1');
  document.head.appendChild(s);
}
function ensurePublicCleanup(){
  if(document.querySelector('script[src*="assets/v136-public-cleanup.js"]'))return;
  const s=document.createElement('script');
  s.src='assets/v136-public-cleanup.js?v=136';
  s.defer=true;
  s.setAttribute('data-ap-public-cleanup','1');
  document.head.appendChild(s);
}
function boot(){ensureActiveLayer();ensurePublicCleanup()}
window.addEventListener('pageshow',()=>{neutraliseAncienneInterface();ensurePublicCleanup()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
