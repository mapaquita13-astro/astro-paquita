(function(){
'use strict';

function addStyle(){
  if(document.getElementById('ap-v151-banner-style'))return;
  const s=document.createElement('style');
  s.id='ap-v151-banner-style';
  s.textContent=`
  .ap-v151-split{display:grid!important;grid-template-columns:minmax(0,1.08fr) minmax(330px,.92fr)!important;grid-template-rows:auto!important;min-height:360px!important;overflow:hidden!important;border-radius:24px!important;background:#fffaf2!important;border:1px solid rgba(91,40,83,.12)!important;box-shadow:0 18px 48px rgba(69,30,59,.10)!important;position:relative!important;background-image:none!important}
  .ap-v151-split:before{content:''!important;display:block!important;grid-column:1!important;grid-row:1!important;min-height:360px!important;background-image:var(--ap-v151-bg)!important;background-size:cover!important;background-position:var(--ap-v151-pos,center center)!important;background-repeat:no-repeat!important;background-color:#241528!important}
  .ap-v151-split>.ap121-hero-copy,.ap-v151-split>.ap121-banner-copy,.ap-v151-split>.hero-copy,.ap-v151-split>.banner-copy,.ap-v151-split>[class*="hero-copy"],.ap-v151-split>[class*="banner-copy"]{grid-column:2!important;grid-row:1!important;align-self:stretch!important;display:flex!important;flex-direction:column!important;justify-content:center!important;position:relative!important;inset:auto!important;width:auto!important;max-width:none!important;margin:0!important;padding:34px 38px!important;background:#fffaf2!important;color:#35102f!important;border:0!important;border-radius:0!important;box-shadow:none!important;text-shadow:none!important;transform:none!important;z-index:2!important}
  .ap-v151-split>.ap121-hero-copy h1,.ap-v151-split>.ap121-hero-copy h2,.ap-v151-split>.ap121-hero-copy h3,.ap-v151-split>.ap121-banner-copy h1,.ap-v151-split>.ap121-banner-copy h2,.ap-v151-split>.ap121-banner-copy h3,.ap-v151-split>[class*="hero-copy"] h1,.ap-v151-split>[class*="hero-copy"] h2,.ap-v151-split>[class*="banner-copy"] h1,.ap-v151-split>[class*="banner-copy"] h2{color:#35102f!important;text-shadow:none!important;position:static!important}
  .ap-v151-split>.ap121-hero-copy p,.ap-v151-split>.ap121-banner-copy p,.ap-v151-split>[class*="hero-copy"] p,.ap-v151-split>[class*="banner-copy"] p{color:#6d5968!important;text-shadow:none!important;position:static!important}
  .ap-v151-split>.ap121-brand{grid-column:1/-1!important;grid-row:1!important;align-self:start!important;position:relative!important;z-index:4!important;background:linear-gradient(180deg,rgba(255,250,242,.98),rgba(255,250,242,.84),transparent)!important;color:#35102f!important}
  .ap-v151-split>.decorative-copy,.ap-v151-split>.image-copy{display:none!important}

  #ap121-home .ap121-feature.ap-v150-media-card>.pic,#ap121-home .ap121-feature.ap-v150-media-card>.ap121-today-img,#ap121-home .ap121-feature.ap-v150-media-card>.image{height:250px!important;min-height:250px!important;max-height:250px!important;background-size:cover!important;background-position:center center!important}
  #ap121-home .ap121-feature.ap-v150-media-card>.pic img,#ap121-home .ap121-feature.ap-v150-media-card>.ap121-today-img img,#ap121-home .ap121-feature.ap-v150-media-card>.image img{width:100%!important;height:250px!important;object-fit:cover!important;object-position:center center!important}
  #ap121-home .ap121-feature.ap-v150-media-card>.copy{min-height:145px!important;display:flex!important;flex-direction:column!important;justify-content:center!important}

  .ap-v151-focus-top:before{background-position:center 28%!important}
  .ap-v151-focus-upper:before{background-position:center 38%!important}
  .ap-v151-focus-center:before{background-position:center center!important}

  @media(max-width:900px){.ap-v151-split{grid-template-columns:minmax(0,1fr) minmax(300px,.95fr)!important}.ap-v151-split:before{min-height:330px!important}.ap-v151-split>.ap121-hero-copy,.ap-v151-split>.ap121-banner-copy,.ap-v151-split>[class*="hero-copy"],.ap-v151-split>[class*="banner-copy"]{padding:28px 26px!important}}
  @media(max-width:760px){.ap-v151-split{grid-template-columns:1fr!important;grid-template-rows:220px auto!important;min-height:0!important}.ap-v151-split:before{grid-column:1!important;grid-row:1!important;min-height:220px!important;height:220px!important}.ap-v151-split>.ap121-hero-copy,.ap-v151-split>.ap121-banner-copy,.ap-v151-split>.hero-copy,.ap-v151-split>.banner-copy,.ap-v151-split>[class*="hero-copy"],.ap-v151-split>[class*="banner-copy"]{grid-column:1!important;grid-row:2!important;padding:22px 20px!important}.ap-v151-split>.ap121-brand{grid-column:1!important;grid-row:1!important}#ap121-home .ap121-feature.ap-v150-media-card>.pic,#ap121-home .ap121-feature.ap-v150-media-card>.ap121-today-img,#ap121-home .ap121-feature.ap-v150-media-card>.image,#ap121-home .ap121-feature.ap-v150-media-card>.pic img,#ap121-home .ap121-feature.ap-v150-media-card>.ap121-today-img img,#ap121-home .ap121-feature.ap-v150-media-card>.image img{height:205px!important;min-height:205px!important;max-height:205px!important}}
  `;
  document.head.appendChild(s);
}

function imageUrl(bg){
  const m=String(bg||'').match(/url\((['"]?)(.*?)\1\)/i);
  return m&&m[2]?`url("${m[2].replace(/"/g,'\\"')}")`:'';
}

function hasTextCopy(el){
  return !!el.querySelector('.ap121-hero-copy,.ap121-banner-copy,.hero-copy,.banner-copy,[class*="hero-copy"],[class*="banner-copy"]');
}

function focusClass(el){
  const t=String(el.textContent||'').toLowerCase();
  if(/portrait natal|natal portrait|retrato natal|الخريطة/.test(t))return 'ap-v151-focus-upper';
  if(/avenir|future|futuro|مستقبل/.test(t))return 'ap-v151-focus-center';
  if(/relation|synastr|relationship|relacion|العلاقات/.test(t))return 'ap-v151-focus-upper';
  return 'ap-v151-focus-center';
}

function splitBanners(){
  const candidates=document.querySelectorAll('.ap121-hero,.ap121-banner,#ap121-module-banner,[class*="page-hero"],[class*="module-banner"]');
  candidates.forEach(el=>{
    if(el.classList.contains('ap-v151-split')||!hasTextCopy(el))return;
    let bg='';
    try{bg=imageUrl(getComputedStyle(el).backgroundImage)||imageUrl(el.style.backgroundImage)}catch(e){}
    if(!bg)return;
    el.style.setProperty('--ap-v151-bg',bg);
    el.style.setProperty('background-image','none','important');
    el.classList.add('ap-v151-split',focusClass(el));
  });
}

function recenterHomeCards(){
  document.querySelectorAll('#ap121-home .ap121-feature.ap-v150-media-card').forEach(card=>{
    const visual=[...card.children].find(el=>el.matches('.pic,.ap121-today-img,.image'));
    if(!visual)return;
    visual.style.setProperty('background-size','cover','important');
    visual.style.setProperty('background-position','center center','important');
    visual.querySelectorAll('img').forEach(img=>{
      img.style.setProperty('object-fit','cover','important');
      img.style.setProperty('object-position','center center','important');
    });
  });
}

function run(){addStyle();splitBanners();recenterHomeCards()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(run,90)}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
setTimeout(run,300);setTimeout(run,1000);setInterval(run,2200);
})();
