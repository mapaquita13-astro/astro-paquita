/* Astro Paquita V182 — séparation stricte Compte gratuit / Premium.
   Compte gratuit : Accueil, Portrait natal, Prévisions d'aujourd'hui, Profil.
   Les écrans Premium ne sont ni affichés ni accessibles par la navigation.
   Aucun calcul astrologique V121 n'est modifié. */
(function(){
'use strict';
if(window.__AP_V182_FREE_PREMIUM_GUARD__)return;
window.__AP_V182_FREE_PREMIUM_GUARD__=true;

const API='https://astro-paquita-backend.onrender.com';
const PREMIUM_ROUTES=new Set(['future','timing','relations','child','calendar']);
let access='checking';
let applying=false;

function token(){try{return localStorage.getItem('astro-token')||'';}catch(e){return'';}}
function currentRoute(){
  const cls=[...document.body.classList].find(x=>x.indexOf('ap-route-')===0);
  return cls?cls.slice('ap-route-'.length):'';
}
function markHidden(el){
  if(!el||el.dataset.apFreeHidden==='1')return;
  el.dataset.apFreeHidden='1';
  el.dataset.apFreeDisplay=el.style.display||'';
  el.style.setProperty('display','none','important');
}
function restoreHidden(){
  document.querySelectorAll('[data-ap-free-hidden="1"]').forEach(el=>{
    const d=el.dataset.apFreeDisplay||'';
    el.style.removeProperty('display');
    if(d)el.style.display=d;
    delete el.dataset.apFreeHidden;
    delete el.dataset.apFreeDisplay;
  });
}
function goHome(){
  const b=document.querySelector('.ap-navbtn[data-route="home"],.ap-mob-btn[data-route="home"],[data-route="home"]');
  if(b){setTimeout(()=>b.click(),0);return;}
  try{location.hash='home';}catch(e){}
}
function forceTodayForecast(){
  if(currentRoute()!=='forecast')return false;
  const day=document.querySelector('.ap-period-choice[data-per="jour"], [data-per="jour"]');
  const active=document.querySelector('.ap-period-choice.active,[data-per].active');
  if(day&&active!==day){
    day.click();
    return true;
  }
  const nav=document.querySelector('.ap-forecast-period-nav');
  if(nav){
    const n=new Date();
    const iso=[n.getFullYear(),String(n.getMonth()+1).padStart(2,'0'),String(n.getDate()).padStart(2,'0')].join('-');
    nav.dataset.v174Anchor=iso;
    nav.dataset.v174Days='1';
  }
  return false;
}
function applyFree(){
  if(applying)return;
  applying=true;
  try{
    document.body.classList.remove('ap-access-checking','ap-premium-user');
    document.body.classList.add('ap-free-user');

    const route=currentRoute();
    if(PREMIUM_ROUTES.has(route)){
      goHome();
      return;
    }

    document.querySelectorAll('[data-route]').forEach(el=>{
      if(PREMIUM_ROUTES.has(String(el.dataset.route||'')))markHidden(el);
    });

    if(route==='forecast'){
      if(forceTodayForecast())return;
      document.querySelectorAll('[data-per]').forEach(el=>{
        if(String(el.dataset.per||'')!=='jour')markHidden(el);
      });
      markHidden(document.getElementById('ap-forecast-prev'));
      markHidden(document.getElementById('ap-forecast-next'));
      document.querySelectorAll('.ap-route-forecast [data-route="calendar"],.ap-forecast-screen [data-route="calendar"]').forEach(markHidden);
      const note=document.querySelector('.ap-forecast-note');
      if(note)note.textContent="Compte gratuit : votre prévision personnalisée d’aujourd’hui.";
      const heading=document.querySelector('.ap-forecast-form h3');
      if(heading&&/période/i.test(heading.textContent||''))heading.textContent="Aujourd’hui";
    }

    // Le raccourci Prévisions reste accessible sur l'accueil, mais ne promet plus
    // les périodes Premium.
    document.querySelectorAll('[data-route="forecast"] p').forEach(p=>{
      if(/jour|semaine|mois|trimestre|année|date précise/i.test(p.textContent||'')){
        p.textContent="Votre lecture personnalisée pour aujourd’hui.";
      }
    });
  }finally{applying=false;}
}
function applyPremium(){
  document.body.classList.remove('ap-access-checking','ap-free-user');
  document.body.classList.add('ap-premium-user');
  restoreHidden();
}
function apply(){
  if(access==='free')applyFree();
  else if(access==='premium')applyPremium();
}
async function resolveAccess(){
  document.body.classList.add('ap-access-checking');
  const t=token();
  if(!t){access='free';apply();return;}
  try{
    const r=await fetch(API+'/api/me?ts='+Date.now(),{
      headers:{Authorization:'Bearer '+t},cache:'no-store'
    });
    if(!r.ok)throw new Error('account');
    const u=await r.json();
    if(window.USER_CONNECTE&&typeof window.USER_CONNECTE==='object')Object.assign(window.USER_CONNECTE,u);
    access=(u&&((u.role==='admin')||u.premium===true))?'premium':'free';
  }catch(e){
    // En cas de doute, on ne laisse jamais apparaître du contenu Premium.
    access='free';
  }
  apply();
}

const style=document.createElement('style');
style.id='ap-v182-access-style';
style.textContent=`
body.ap-access-checking [data-route="future"],
body.ap-access-checking [data-route="timing"],
body.ap-access-checking [data-route="relations"],
body.ap-access-checking [data-route="child"],
body.ap-access-checking [data-route="calendar"],
body.ap-free-user [data-route="future"],
body.ap-free-user [data-route="timing"],
body.ap-free-user [data-route="relations"],
body.ap-free-user [data-route="child"],
body.ap-free-user [data-route="calendar"]{display:none!important}
body.ap-free-user.ap-route-forecast [data-per]:not([data-per="jour"]),
body.ap-free-user.ap-route-forecast #ap-forecast-prev,
body.ap-free-user.ap-route-forecast #ap-forecast-next,
body.ap-free-user.ap-route-forecast [data-route="calendar"]{display:none!important}
body.ap-free-user .ap-mobile-nav{justify-content:space-around}
`;
document.head.appendChild(style);

document.addEventListener('click',function(ev){
  if(access!=='free')return;
  const routeEl=ev.target&&ev.target.closest?ev.target.closest('[data-route]'):null;
  if(routeEl&&PREMIUM_ROUTES.has(String(routeEl.dataset.route||''))){
    ev.preventDefault();ev.stopImmediatePropagation();goHome();return;
  }
  const per=ev.target&&ev.target.closest?ev.target.closest('[data-per]'):null;
  if(per&&String(per.dataset.per||'')!=='jour'){
    ev.preventDefault();ev.stopImmediatePropagation();forceTodayForecast();return;
  }
  const nav=ev.target&&ev.target.closest?ev.target.closest('#ap-forecast-prev,#ap-forecast-next'):null;
  if(nav){ev.preventDefault();ev.stopImmediatePropagation();return;}
  const run=ev.target&&ev.target.closest?ev.target.closest('#ap-run-forecast'):null;
  if(run){
    const active=document.querySelector('[data-per].active');
    if(!active||String(active.dataset.per||'')!=='jour'){
      ev.preventDefault();ev.stopImmediatePropagation();forceTodayForecast();
    }
  }
},true);

let scheduled=false;
const obs=new MutationObserver(()=>{
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;apply();});
});
function start(){
  obs.observe(document.getElementById('ap-final-root')||document.body,{childList:true,subtree:true});
  resolveAccess();
  window.addEventListener('focus',()=>{if(document.visibilityState!=='hidden')resolveAccess();});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')resolveAccess();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
