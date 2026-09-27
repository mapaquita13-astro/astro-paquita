/* Astro Paquita V171 — finition visuelle uniquement.
   Cette couche ne touche ni aux calculs astrologiques, ni aux méthodes V121,
   ni aux données des profils. Elle remet les visuels validés au premier plan. */
(function(){
'use strict';
if(window.__AP_V171_VISUAL_POLISH__)return;
window.__AP_V171_VISUAL_POLISH__=true;

const VISUALS={
  natal:{img:'assets/img/natal.jpg',kicker:'Votre carte du ciel',quote:'Un portrait de fond, lisible et personnel.'},
  future:{img:'assets/img/future.jpg',kicker:'Votre horizon',quote:'Choisissez la lecture qui vous est utile.'},
  forecast:{img:'assets/img/forecast.jpg',kicker:'Vos prévisions',quote:'Une période, un domaine, une lecture claire.'},
  timing:{img:'assets/img/futureBanner.jpg',kicker:'Le bon moment',quote:'Chercher les périodes les plus porteuses pour votre objectif.'},
  child:{img:'assets/img/profile.jpg',kicker:'Portrait enfant',quote:'Comprendre ses forces, ses sensibilités et ses besoins.'},
  calendar:{img:'assets/img/today.jpg',kicker:'Votre calendrier',quote:'Le détail d’une journée quand vous en avez besoin.'},
  profile:{img:'assets/img/profile.jpg',kicker:'Vos profils',quote:'Des données de naissance précises pour des calculs fiables.'}
};

function routeName(){
  const cls=[...document.body.classList].find(x=>x.indexOf('ap-route-')===0);
  return cls?cls.slice(9):'';
}

function ensureStyle(){
  if(document.getElementById('ap-v171-visual-style'))return;
  const s=document.createElement('style');
  s.id='ap-v171-visual-style';
  s.textContent=`
    .ap-v171-visual{
      position:relative; min-height:172px; border-radius:24px; overflow:hidden;
      margin:0 0 22px; background-size:cover; background-position:center;
      box-shadow:0 18px 44px rgba(62,35,54,.12); isolation:isolate;
    }
    .ap-v171-visual::before{
      content:""; position:absolute; inset:0;
      background:linear-gradient(90deg,rgba(51,25,47,.82) 0%,rgba(75,38,67,.58) 42%,rgba(75,38,67,.12) 78%,rgba(75,38,67,.04) 100%);
      z-index:-1;
    }
    .ap-v171-visual::after{
      content:""; position:absolute; inset:auto 0 0; height:48%;
      background:linear-gradient(0deg,rgba(250,244,235,.12),transparent); z-index:-1;
    }
    .ap-v171-visual-copy{
      min-height:172px; display:flex; flex-direction:column; justify-content:flex-end;
      width:min(580px,74%); padding:30px 34px; color:#fff8ee;
      text-shadow:0 2px 12px rgba(28,12,26,.32);
    }
    .ap-v171-visual-copy small{
      display:block; margin-bottom:8px; font:700 12px/1.2 Lato,Arial,sans-serif;
      letter-spacing:.18em; text-transform:uppercase; color:#efd9a8;
    }
    .ap-v171-visual-copy strong{
      display:block; font:600 clamp(30px,4vw,46px)/.98 "Cormorant Garamond",Georgia,serif;
      letter-spacing:-.02em;
    }
    .ap-v171-visual-copy span{
      display:block; margin-top:9px; max-width:500px; font:500 15px/1.45 Lato,Arial,sans-serif;
      color:rgba(255,248,238,.94);
    }
    .ap-route-relations .ap-hero-card{
      box-shadow:0 18px 44px rgba(62,35,54,.12);
      border-radius:24px!important; overflow:hidden;
    }
    .ap-route-relations .ap-hero-card::after{
      content:""; position:absolute; inset:0; pointer-events:none;
      background:linear-gradient(90deg,rgba(51,25,47,.18),transparent 70%);
    }
    .ap-route-home .ap-home-landscape,
    .ap-route-home .ap-hero-card,
    .ap-route-home .ap-tile{
      box-shadow:0 14px 34px rgba(62,35,54,.10);
    }
    @media(max-width:760px){
      .ap-v171-visual{min-height:128px;border-radius:18px;margin:0 0 18px;background-position:center 38%;}
      .ap-v171-visual::before{background:linear-gradient(90deg,rgba(51,25,47,.80),rgba(75,38,67,.42) 58%,rgba(75,38,67,.06));}
      .ap-v171-visual-copy{min-height:128px;width:82%;padding:20px 18px;}
      .ap-v171-visual-copy small{font-size:10px;margin-bottom:5px;letter-spacing:.15em;}
      .ap-v171-visual-copy strong{font-size:29px;line-height:1;}
      .ap-v171-visual-copy span{font-size:13.5px;line-height:1.35;margin-top:6px;}
    }
    @media(max-width:390px){
      .ap-v171-visual-copy{width:88%;}
      .ap-v171-visual-copy strong{font-size:27px;}
    }
  `;
  document.head.appendChild(s);
}

function enhance(){
  ensureStyle();
  const route=routeName();
  if(!route||route==='home'||route==='relations')return;
  const data=VISUALS[route];
  if(!data)return;
  const section=document.querySelector('#ap-page > section');
  if(!section||section.querySelector(':scope > .ap-v171-visual'))return;
  const visual=document.createElement('div');
  visual.className='ap-v171-visual';
  visual.style.backgroundImage=`url("${data.img}")`;
  visual.innerHTML=`<div class="ap-v171-visual-copy"><small>Astro Paquita</small><strong>${data.kicker}</strong><span>${data.quote}</span></div>`;
  section.insertBefore(visual,section.firstChild);
}

let queued=false;
function schedule(){
  if(queued)return; queued=true;
  requestAnimationFrame(()=>{queued=false;enhance();});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
})();
