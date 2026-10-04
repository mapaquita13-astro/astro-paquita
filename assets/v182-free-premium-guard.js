/* Astro Paquita V182.1 — séparation claire Compte gratuit / Premium.
   Compte gratuit : les fonctions Premium restent visibles avec un cadenas,
   mais leur contenu n'est jamais ouvert. Prévisions gratuites = aujourd'hui.
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
function toastPremium(){
  let x=document.querySelector('.ap-premium-lock-toast');
  if(!x){
    x=document.createElement('div');
    x.className='ap-premium-lock-toast';
    x.innerHTML='<strong>🔒 Réservé aux comptes Premium</strong><span>Cette fonctionnalité est visible pour vous montrer ce que comprend l’abonnement Premium.</span>';
    document.body.appendChild(x);
  }
  x.classList.add('show');
  clearTimeout(x._t);
  x._t=setTimeout(()=>x.classList.remove('show'),3200);
}
function goHome(){
  const b=document.querySelector('.ap-navbtn[data-route="home"],.ap-mob-btn[data-route="home"],[data-route="home"]');
  if(b){setTimeout(()=>b.click(),0);return;}
  try{location.hash='home';}catch(e){}
}
function addLock(el){
  if(!el)return;
  el.classList.add('ap-premium-locked');
  el.setAttribute('aria-disabled','true');
  el.setAttribute('title','Réservé aux comptes Premium');
  if(!el.querySelector(':scope > .ap-lock-badge')){
    const badge=document.createElement('span');
    badge.className='ap-lock-badge';
    badge.textContent='🔒';
    badge.setAttribute('aria-hidden','true');
    el.appendChild(badge);
  }
}
function removeLocks(){
  document.querySelectorAll('.ap-premium-locked').forEach(el=>{
    el.classList.remove('ap-premium-locked');
    el.removeAttribute('aria-disabled');
    el.removeAttribute('title');
  });
  document.querySelectorAll('.ap-lock-badge').forEach(x=>x.remove());
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

    // Les modules Premium restent visibles mais sont clairement verrouillés.
    document.querySelectorAll('[data-route]').forEach(el=>{
      if(PREMIUM_ROUTES.has(String(el.dataset.route||'')))addLock(el);
    });

    if(route==='forecast'){
      if(forceTodayForecast())return;
      document.querySelectorAll('[data-per]').forEach(el=>{
        if(String(el.dataset.per||'')!=='jour')addLock(el);
      });
      addLock(document.getElementById('ap-forecast-prev'));
      addLock(document.getElementById('ap-forecast-next'));
      document.querySelectorAll('.ap-route-forecast [data-route="calendar"],.ap-forecast-screen [data-route="calendar"]').forEach(addLock);
      const note=document.querySelector('.ap-forecast-note');
      if(note)note.textContent="Compte gratuit : la prévision d’aujourd’hui est incluse. Les autres périodes portent un cadenas Premium.";
    }

    document.querySelectorAll('[data-route="forecast"] p').forEach(p=>{
      if(/jour|semaine|mois|trimestre|année|date précise/i.test(p.textContent||'')){
        p.textContent="Aujourd’hui inclus · autres périodes 🔒 Premium.";
      }
    });
  }finally{applying=false;}
}
function applyPremium(){
  document.body.classList.remove('ap-access-checking','ap-free-user');
  document.body.classList.add('ap-premium-user');
  removeLocks();
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
    // En cas de doute, on traite le compte comme gratuit.
    access='free';
  }
  apply();
}

const style=document.createElement('style');
style.id='ap-v182-access-style';
style.textContent=`
.ap-premium-locked{position:relative!important;opacity:.72;cursor:pointer!important}
.ap-premium-locked .ap-lock-badge{position:absolute;right:8px;top:7px;display:inline-flex;align-items:center;justify-content:center;min-width:23px;height:23px;padding:0 5px;border-radius:999px;background:#fff7e8;border:1px solid rgba(181,139,66,.45);box-shadow:0 2px 8px rgba(67,20,61,.08);font-size:12px;line-height:1;z-index:4}
.ap-navbtn.ap-premium-locked .ap-lock-badge{top:50%;transform:translateY(-50%);right:10px}
.ap-home-shortcuts .ap-premium-locked .ap-lock-badge,.ap-card.ap-premium-locked .ap-lock-badge{right:10px;top:10px}
.ap-period-choice.ap-premium-locked{padding-right:34px!important}
.ap-premium-lock-toast{position:fixed;left:50%;bottom:26px;transform:translate(-50%,20px);width:min(430px,calc(100vw - 28px));z-index:99999;background:#3f1739;color:#fff;border-radius:14px;padding:13px 16px;box-shadow:0 12px 32px rgba(35,12,31,.28);opacity:0;pointer-events:none;transition:.2s;text-align:left}
.ap-premium-lock-toast.show{opacity:1;transform:translate(-50%,0)}
.ap-premium-lock-toast strong{display:block;font-size:14px;margin-bottom:3px}.ap-premium-lock-toast span{display:block;font-size:12px;line-height:1.4;color:#eaddea}
`;
document.head.appendChild(style);

document.addEventListener('click',function(ev){
  if(access!=='free')return;
  const routeEl=ev.target&&ev.target.closest?ev.target.closest('[data-route]'):null;
  if(routeEl&&PREMIUM_ROUTES.has(String(routeEl.dataset.route||''))){
    ev.preventDefault();ev.stopImmediatePropagation();toastPremium();return;
  }
  const per=ev.target&&ev.target.closest?ev.target.closest('[data-per]'):null;
  if(per&&String(per.dataset.per||'')!=='jour'){
    ev.preventDefault();ev.stopImmediatePropagation();toastPremium();return;
  }
  const nav=ev.target&&ev.target.closest?ev.target.closest('#ap-forecast-prev,#ap-forecast-next'):null;
  if(nav){ev.preventDefault();ev.stopImmediatePropagation();toastPremium();return;}
  const run=ev.target&&ev.target.closest?ev.target.closest('#ap-run-forecast'):null;
  if(run){
    const active=document.querySelector('[data-per].active');
    if(!active||String(active.dataset.per||'')!=='jour'){
      ev.preventDefault();ev.stopImmediatePropagation();forceTodayForecast();toastPremium();
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
