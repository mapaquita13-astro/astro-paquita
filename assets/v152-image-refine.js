(function(){
'use strict';

const POSITIONS={
  'home.jpg':'50% 42%',
  'natal.jpg':'50% 34%',
  'future.jpg':'50% 45%',
  'futurebanner.jpg':'50% 45%',
  'forecast.jpg':'50% 42%',
  'relations.jpg':'50% 36%',
  'relationsbanner.jpg':'50% 36%',
  'profile.jpg':'50% 30%',
  'today.jpg':'50% 38%',
  'jupiter.jpg':'50% 40%'
};

function addStyle(){
  if(document.getElementById('ap-v152-image-style'))return;
  const s=document.createElement('style');
  s.id='ap-v152-image-style';
  s.textContent=`
  .ap-v151-split>.ap-v152-auto-copy{grid-column:2!important;grid-row:1!important;align-self:stretch!important;display:flex!important;flex-direction:column!important;justify-content:center!important;position:relative!important;inset:auto!important;width:auto!important;max-width:none!important;margin:0!important;padding:34px 38px!important;background:#fffaf2!important;color:#35102f!important;border:0!important;border-radius:0!important;box-shadow:none!important;text-shadow:none!important;transform:none!important;z-index:2!important}
  .ap-v151-split>.ap-v152-auto-copy h1,.ap-v151-split>.ap-v152-auto-copy h2,.ap-v151-split>.ap-v152-auto-copy h3,.ap-v151-split>.ap-v152-auto-copy p{position:static!important;color:inherit!important;text-shadow:none!important}
  #ap121-home .ap-v150-media-card>.pic,#ap121-home .ap-v150-media-card>.image,#ap121-home .ap-v150-media-card>.ap121-today-img{background-size:cover!important;background-repeat:no-repeat!important}
  #ap121-home .ap-v150-media-card>.pic:after,#ap121-home .ap-v150-media-card>.image:after,#ap121-home .ap-v150-media-card>.ap121-today-img:after{display:none!important;content:none!important}
  #ap121-home .ap-v150-media-card>.copy,#ap121-home .ap-v150-media-card>.ap121-copy{position:relative!important;inset:auto!important;transform:none!important;background:#fffaf2!important;color:#35102f!important;text-shadow:none!important}
  @media(max-width:760px){.ap-v151-split>.ap-v152-auto-copy{grid-column:1!important;grid-row:2!important;padding:22px 20px!important}}
  `;
  document.head.appendChild(s);
}

function urlFrom(value){
  const m=String(value||'').match(/url\((['"]?)(.*?)\1\)/i);
  return m&&m[2]?m[2]:'';
}
function fileName(url){
  try{return decodeURIComponent(String(url||'').split('?')[0].split('/').pop()||'').toLowerCase()}catch(e){return ''}
}
function preferredPosition(url){return POSITIONS[fileName(url)]||'50% 40%'}

function findCopy(el){
  let copy=el.querySelector(':scope > .ap121-hero-copy,:scope > .ap121-banner-copy,:scope > .hero-copy,:scope > .banner-copy,:scope > [class*="hero-copy"],:scope > [class*="banner-copy"]');
  if(copy)return copy;
  copy=[...el.children].find(ch=>{
    if(ch.matches('.ap121-brand,.pic,.image,[class*="media"],[class*="thumb"]'))return false;
    return !!ch.querySelector('h1,h2,h3')||(/^H[1-3]$/.test(ch.tagName));
  });
  if(copy)copy.classList.add('ap-v152-auto-copy');
  return copy||null;
}

function refineBanners(){
  document.querySelectorAll('.ap121-hero,.ap121-banner,#ap121-module-banner,[class*="page-hero"],[class*="module-banner"]').forEach(el=>{
    const copy=findCopy(el);if(!copy)return;
    let url='';
    try{url=urlFrom(getComputedStyle(el).backgroundImage)||urlFrom(el.style.backgroundImage)}catch(e){}
    if(!url&&el.classList.contains('ap-v151-split')){
      const css=el.style.getPropertyValue('--ap-v151-bg');url=urlFrom(css);
    }
    if(!url)return;
    el.style.setProperty('--ap-v151-bg',`url("${url.replace(/"/g,'\\"')}")`);
    el.style.setProperty('--ap-v151-pos',preferredPosition(url));
    el.style.setProperty('background-image','none','important');
    el.classList.add('ap-v151-split');
  });
}

function refineCards(){
  document.querySelectorAll('#ap121-home .ap-v150-media-card').forEach(card=>{
    const visual=[...card.children].find(el=>el.matches('.pic,.image,.ap121-today-img,[class*="media"],[class*="thumb"]'));
    if(!visual)return;
    let url='';
    try{url=urlFrom(getComputedStyle(visual).backgroundImage)||urlFrom(visual.style.backgroundImage)}catch(e){}
    const img=visual.querySelector('img');
    if(!url&&img)url=img.currentSrc||img.src||'';
    const pos=preferredPosition(url);
    visual.style.setProperty('background-position',pos,'important');
    visual.style.setProperty('background-size','cover','important');
    if(img){img.style.setProperty('object-fit','cover','important');img.style.setProperty('object-position',pos,'important')}
    [...visual.children].forEach(ch=>{if(ch.tagName!=='IMG')ch.style.setProperty('display','none','important')});
  });
}

function run(){addStyle();refineBanners();refineCards()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(run,90)}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class','src']});
setTimeout(run,250);setTimeout(run,900);setInterval(run,2000);
})();
