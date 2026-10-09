/* Astro Paquita — journal minimal de consultation, sans prompt ni réponse IA.
   Les calculs V121 et l'historique personnel ne sont jamais modifiés. */
(function(){
'use strict';
if(window.__AP_V195_ACTIVITY__)return;
window.__AP_V195_ACTIVITY__=true;
const API='https://astro-paquita-backend.onrender.com';
const ROUTES=new Set(['natal','future','forecast','timing','relations','child','calendar']);
const PREMIUM=new Set(['future','timing','relations','child','calendar']);
let last='',at=0,busy=false;
function route(){
 const classes=document.body?String(document.body.className):'';
 const m=classes.match(/(?:^|\s)ap-route-([a-z]+)/);
 return m?m[1]:'';
}
function scan(){
 if(busy)return;
 const name=route();
 if(!ROUTES.has(name))return;
 if(PREMIUM.has(name)&&document.body.classList.contains('ap-free-user'))return;
 let token='',user=null,p=null;
 try{token=localStorage.getItem('astro-token')||'';user=window.USER_CONNECTE||null;
  p=window.AstroTruth&&typeof window.AstroTruth.currentProfile==='function'?window.AstroTruth.currentProfile():null;
 }catch(e){return;}
 if(!token||!user||!user.email)return;
 const key=String(user.email).toLowerCase()+'|'+name+'|'+String(p?.legacyKey||p?.profileId||'');
 if(key===last&&Date.now()-at<120000)return;
 busy=true;last=key;at=Date.now();
 const context={module:name,lang:String(localStorage.getItem('astro-lang')||'fr').slice(0,2)};
 if(p){context.profile_key=String(p.legacyKey||p.profileId||'').slice(0,180);context.profile_name=String(p.prenom||'').slice(0,100);}
 if(name==='forecast'){
  const el=document.querySelector('.ap-period-choice.active');if(el)context.period=String(el.dataset.per||'');
  const domain=document.querySelector('.ap-domain-choice.active');if(domain)context.domain=String(domain.dataset.domain||'');
 }
 fetch(API+'/api/activity/track',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({feature:name,context}),cache:'no-store'})
 .catch(()=>{}).finally(()=>{busy=false;});
}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;scan();});}
function init(){
 new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('click',()=>setTimeout(schedule,250),true);
 window.addEventListener('focus',schedule);
 schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
