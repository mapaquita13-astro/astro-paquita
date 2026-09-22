/* Astro Paquita — V133 nettoyage visuel et cohérence d'interface.
   Aucune logique astrologique n'est modifiée. */
(function(){
'use strict';
const PREMIUM_COPY={
  fr:{desc:'Mon avenir et sa chronologie, Le bon moment, les 24 mois qui comptent, la synastrie avancée et les analyses détaillées dans la langue choisie.',timeline:'Chronologie intégrée à Mon avenir',compare:'Comparaison dans Le bon moment',events:'Les 24 mois qui comptent'},
  en:{desc:'My Future and its timeline, Ideal Timing, the 24 key months, advanced synastry and detailed analyses in the selected language.',timeline:'Timeline integrated into My Future',compare:'Comparison inside Ideal Timing',events:'The 24 key months'},
  es:{desc:'Mi futuro y su cronología, El momento ideal, los 24 meses clave, la sinastría avanzada y los análisis detallados en el idioma elegido.',timeline:'Cronología integrada en Mi futuro',compare:'Comparación dentro de El momento ideal',events:'Los 24 meses clave'},
  ar:{desc:'مستقبلي وخطه الزمني، التوقيت الأنسب، أهم 24 شهرًا، التوافق المتقدم والتحليلات المفصلة باللغة المختارة.',timeline:'الخط الزمني مدمج في مستقبلي',compare:'المقارنة داخل التوقيت الأنسب',events:'أهم 24 شهرًا'}
};
function ensureStyle(){
  if(document.getElementById('ap-v128-cleanup-style'))return;
  const s=document.createElement('style');s.id='ap-v128-cleanup-style';s.textContent=`
  .ap-v128-clean-art{position:relative!important;overflow:hidden!important;isolation:isolate}
  .ap-v128-clean-art:after{content:'';position:absolute;inset:0;pointer-events:none;z-index:2;background:linear-gradient(90deg,rgba(31,13,31,.96) 0%,rgba(37,16,35,.82) 24%,rgba(38,17,36,.48) 43%,rgba(30,13,30,.12) 64%,transparent 82%)}
  .ap-v128-clean-art>img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:72% center!important;transform:scale(1.08);display:block!important}
  .ap-v128-card-art-clean{position:relative!important;overflow:hidden!important;background:#2d132c!important}
  .ap-v128-card-art-clean:after{content:'';position:absolute;inset:0;pointer-events:none;z-index:2;background:linear-gradient(90deg,rgba(39,17,37,.96) 0%,rgba(48,21,44,.82) 24%,rgba(43,19,40,.42) 46%,rgba(33,14,32,.08) 70%,transparent 88%)}
  .ap-v128-card-art-clean img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:74% center!important;transform:scale(1.10);display:block!important}
  .ap-v128-card-art-clean [class*="copy"],.ap-v128-card-art-clean [class*="text"]{position:relative;z-index:3}
  html[dir="rtl"] .ap-v128-clean-art:after,html[dir="rtl"] .ap-v128-card-art-clean:after{background:linear-gradient(270deg,rgba(31,13,31,.96) 0%,rgba(37,16,35,.82) 24%,rgba(38,17,36,.48) 43%,rgba(30,13,30,.12) 64%,transparent 82%)}
  @media(max-width:760px){.ap-v128-clean-art>img,.ap-v128-card-art-clean img{object-position:68% center!important;transform:scale(1.05)}}
  `;document.head.appendChild(s);
}
function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()}
function relevantCard(el){const t=text(el);return /portrait natal|mon avenir|relations|synastr|le bon moment|prévisions|previsions|forecast|future|natal portrait|relationships|mi futuro|relaciones/.test(t)}
function cleanCards(){
  ensureStyle();
  document.querySelectorAll('.ap121-feature,.ap100-feature-card,.service-card,.feature-card,[class*="feature-card"],[class*="service-card"]').forEach(card=>{
    if(!relevantCard(card))return;
    const img=card.querySelector('img');
    if(img){const holder=img.parentElement||card;holder.classList.add('ap-v128-card-art-clean');}
    const bgEls=[card,...card.querySelectorAll('[style*="background-image"]')];
    bgEls.forEach(el=>{if(el.style&&el.style.backgroundImage&&el.style.backgroundImage!=='none')el.classList.add('ap-v128-clean-art')});
  });
}
function cleanBanners(){
  document.querySelectorAll('.ap121-hero,.ap121-banner,.ap100-page-hero,#ap121-module-banner,[class*="hero"],[class*="banner"]').forEach(el=>{
    const st=getComputedStyle(el),bg=st.backgroundImage||'';
    if(bg&&bg!=='none'&&/url\(/.test(bg))el.classList.add('ap-v128-clean-art');
  });
}
function hideEmbeddedCopy(){
  document.querySelectorAll('.ap121-banner,.ap121-hero').forEach(b=>{
    const title=b.querySelector('h1,h2,.ap121-title,.ap121-hero-title');
    if(!title)return;
    b.querySelectorAll('.ap121-banner-copy,.decorative-copy,.image-copy').forEach(x=>{if(x!==title)x.style.setProperty('display','none','important')});
  });
}
function standaloneLabel(el){
  if(!el)return '';
  if(el.matches('a,button,[role="button"]'))return text(el);
  const h=el.querySelector('h1,h2,h3,h4,.ap121-title,.ap121-card-title,.title');
  return h?text(h):'';
}
function isProtected24Months(t){return /24\s*(mois|months|meses)|24\s*شهر/.test(t)}
function isStandaloneDuplicate(t){
  if(!t||isProtected24Months(t))return false;
  return /^(timeline(?:\s+de\s+vie)?(?:\s+10\s+ans)?|timeline\s+10\s+ans|life\s+timeline|10[- ]year\s+timeline|línea\s+de\s+vida|linea\s+de\s+vida|المخطط\s+الزمني|grands?\s+év[ée]nements?|major\s+events?|grandes?\s+eventos?|الأحداث\s+الكبرى|historique|mon\s+historique|history|my\s+history|historial|mi\s+historial|notifications?|notificaciones|الإشعارات)$/.test(t)
}
function hideStandalonePublicEntries(){
  const selectors=[
    '#ap121-home .ap121-feature','#ap121-home button','#ap121-home a',
    'nav a','nav button','.ap121-nav a','.ap121-nav button','.ap121-sidebar a','.ap121-sidebar button',
    '[onclick*="timeline"]','[onclick*="Timeline"]'
  ].join(',');
  document.querySelectorAll(selectors).forEach(el=>{
    if(el.closest('#section-modules')||el.closest('#ap121-future'))return;
    const label=standaloneLabel(el);
    if(isStandaloneDuplicate(label))el.style.setProperty('display','none','important');
  });
}
function removeLegacyMobileTools(){
  document.getElementById('ap-v30-tools')?.remove();
  document.querySelectorAll('#v30-home button').forEach(btn=>{
    const oc=String(btn.getAttribute('onclick')||'').toLowerCase();
    if(/v30gomodule\(['"](?:timeline|compare|journal)['"]\)/.test(oc))btn.remove();
  });
}
function cleanPremiumShowcase(){
  const code=String(window.AP_LANG||localStorage.getItem('astro-lang')||'fr').toLowerCase().slice(0,2);
  const c=PREMIUM_COPY[code]||PREMIUM_COPY.fr;
  const desc=document.querySelector('[data-ap="premium_desc"]');if(desc&&desc.textContent!==c.desc)desc.textContent=c.desc;
  const labels={premium_timeline:c.timeline,premium_compare:c.compare,premium_events:c.events};
  Object.entries(labels).forEach(([key,value])=>document.querySelectorAll(`[data-ap="${key}"]`).forEach(el=>{if(el.textContent!==value)el.textContent=value}));
}
function run(){cleanCards();cleanBanners();hideEmbeddedCopy();hideStandalonePublicEntries();removeLegacyMobileTools();cleanPremiumShowcase()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
new MutationObserver(()=>{clearTimeout(window.__apV128CleanupT);window.__apV128CleanupT=setTimeout(run,80)}).observe(document.documentElement,{childList:true,subtree:true});
})();
