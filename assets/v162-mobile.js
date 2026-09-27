/* Astro Paquita V162 — ajustements d'interface observés en vidéo.
   Aucun thème, transit, maison, aspect ou score n'est recalculé ici. */
(function(){
'use strict';
if(window.__AP_V162_MOBILE__)return;
window.__AP_V162_MOBILE__=true;
let observer=null,scheduled=false,applying=false;

function validProfile(){
  try{
    const p=window.AstroTruth&&AstroTruth.currentProfile&&AstroTruth.currentProfile();
    return !!(p&&AstroTruth.validation&&AstroTruth.validation(p).ok);
  }catch(e){return false;}
}
function routeName(){
  const b=document.body;
  if(!b)return'';
  const m=String(b.className||'').match(/\bap-route-([^\s]+)/);
  return m?m[1]:'';
}
function homeNoProfile(){
  if(routeName()!=='home'||validProfile())return;
  const sky=document.querySelector('.ap-home-sky');
  if(!sky)return;
  const strong=sky.querySelector('strong'),desc=sky.querySelector('span'),btn=sky.querySelector('button[data-route]');
  if(strong)strong.textContent='Créez votre profil de naissance';
  if(desc)desc.textContent='Votre date, votre heure et votre lieu de naissance sont nécessaires avant toute lecture personnalisée.';
  if(btn){btn.dataset.route='profile';btn.textContent='Créer mon profil →';}
}
function emptyProfileAction(){
  const action=document.querySelector('.ap-mobile-action');
  if(!action)return;
  const empty=!validProfile();
  action.classList.toggle('ap-v162-empty-profile',empty);
  if(empty)action.setAttribute('aria-label','Créer mon profil de naissance');
}
function profilePage(){
  if(routeName()!=='profile')return;
  const title=document.querySelector('.ap-route-profile #ap-page>section>.ap-title');
  const sub=document.querySelector('.ap-route-profile #ap-page>section>.ap-subtitle');
  if(title)title.textContent='Mes profils';
  if(sub)sub.textContent='Créez votre profil de naissance, choisissez le profil actif ou modifiez ses informations. Les calculs restent toujours rattachés au bon profil.';
  const newBtn=document.getElementById('ap-new-profile');
  if(newBtn&&!validProfile())newBtn.textContent='+ Créer mon profil';
}
function missingProfilePage(){
  if(validProfile())return;
  const page=document.getElementById('ap-page');
  if(!page)return;
  const section=page.querySelector(':scope > section');
  if(!section)return;
  const title=section.querySelector('.ap-title');
  const sub=section.querySelector('.ap-subtitle');
  const btn=section.querySelector('[data-route="profile"]');
  if(!title||!sub||!btn)return;
  const txt=(sub.textContent||'').toLowerCase();
  if(!txt.includes('profil')&&!txt.includes('birth'))return;
  section.classList.add('ap-v162-profile-required');
  title.textContent='Profil de naissance requis';
  sub.textContent='Créez d’abord votre profil de naissance pour activer les calculs astrologiques personnalisés.';
  btn.textContent='Créer mon profil';
}
function apply(){
  if(applying)return;
  applying=true;scheduled=false;
  try{
    if(observer)observer.disconnect();
    emptyProfileAction();
    homeNoProfile();
    profilePage();
    missingProfilePage();
    document.documentElement.dataset.astroV162Mobile='20260927';
  }finally{
    applying=false;
    if(observer){
      const root=document.getElementById('ap-final-root')||document.body;
      if(root)observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    }
  }
}
function schedule(){
  if(scheduled||applying)return;
  scheduled=true;
  requestAnimationFrame(apply);
}
function start(){
  const root=document.getElementById('ap-final-root');
  if(!root){setTimeout(start,80);return;}
  observer=new MutationObserver(schedule);
  apply();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
