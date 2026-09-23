(function(){
'use strict';

function addStyle(){
  if(document.getElementById('ap-v150-image-style'))return;
  const s=document.createElement('style');
  s.id='ap-v150-image-style';
  s.textContent=`
  .ap-v150-media-card{display:grid!important;grid-template-rows:minmax(220px,280px) auto!important;gap:0!important;overflow:hidden!important;border-radius:22px!important;background:#fffaf2!important}
  .ap-v150-media-card>.pic,.ap-v150-media-card>.ap121-today-img,.ap-v150-media-card>.image,.ap-v150-media-card>[class*="thumb"],.ap-v150-media-card>[class*="media"]{position:relative!important;grid-row:1!important;min-height:220px!important;height:clamp(220px,26vw,280px)!important;max-height:280px!important;overflow:hidden!important;border-radius:22px 22px 0 0!important;background-size:cover!important;background-position:center center!important;background-repeat:no-repeat!important}
  .ap-v150-media-card>.pic img,.ap-v150-media-card>.ap121-today-img img,.ap-v150-media-card>.image img,.ap-v150-media-card>[class*="thumb"] img,.ap-v150-media-card>[class*="media"] img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center center!important;display:block!important;border-radius:0!important;transform:none!important}
  .ap-v150-media-card>.pic>:not(img),.ap-v150-media-card>.ap121-today-img>:not(img),.ap-v150-media-card>.image>:not(img){display:none!important}
  .ap-v150-media-card>.copy,.ap-v150-media-card>.ap121-copy,.ap-v150-media-card>[class*="copy"],.ap-v150-media-card>[class*="content"],.ap-v150-media-card>[class*="text"]{position:relative!important;grid-row:2!important;display:block!important;margin:0!important;padding:18px 20px 20px!important;background:#fffaf2!important;color:#35102f!important;border-radius:0 0 22px 22px!important;z-index:2!important;text-shadow:none!important}
  .ap-v150-media-card>.copy h1,.ap-v150-media-card>.copy h2,.ap-v150-media-card>.copy h3,.ap-v150-media-card>.copy p,.ap-v150-media-card>[class*="copy"] h1,.ap-v150-media-card>[class*="copy"] h2,.ap-v150-media-card>[class*="copy"] h3,.ap-v150-media-card>[class*="copy"] p{position:static!important;color:inherit!important;text-shadow:none!important;margin-left:0!important;margin-right:0!important}
  .ap-v150-media-card .ap-v128-card-art-clean img,.ap-v150-media-card.ap-v128-card-art-clean img,.ap-v150-media-card .ap-v128-clean-art>img{object-fit:cover!important;object-position:center center!important;transform:none!important}
  .ap-v150-media-card .ap-v128-card-art-clean:after,.ap-v150-media-card .ap-v128-clean-art:after{display:none!important}
  @media(max-width:760px){.ap-v150-media-card{grid-template-rows:minmax(180px,220px) auto!important}.ap-v150-media-card>.pic,.ap-v150-media-card>.ap121-today-img,.ap-v150-media-card>.image,.ap-v150-media-card>[class*="thumb"],.ap-v150-media-card>[class*="media"]{min-height:180px!important;height:220px!important;max-height:220px!important}}
  `;
  document.head.appendChild(s);
}

function hasBackgroundImage(el){
  try{const bg=getComputedStyle(el).backgroundImage||'';return bg&&bg!=='none'&&/url\(/.test(bg)}catch(e){return false}
}

function markCards(){
  const selectors='.ap121-feature,.ap100-feature-card,.service-card,.feature-card,[class*="feature-card"],[class*="service-card"]';
  document.querySelectorAll(selectors).forEach(card=>{
    const directVisual=[...card.children].some(el=>el.matches('.pic,.ap121-today-img,.image,[class*="thumb"],[class*="media"]')||hasBackgroundImage(el));
    const directCopy=[...card.children].some(el=>el.matches('.copy,.ap121-copy,[class*="copy"],[class*="content"],[class*="text"]'));
    if(directVisual&&directCopy)card.classList.add('ap-v150-media-card');
  });
}

function run(){addStyle();markCards()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(run,80)}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(run,300);setTimeout(run,1200);
})();
