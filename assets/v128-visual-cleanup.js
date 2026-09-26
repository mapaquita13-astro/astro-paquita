/* Astro Paquita — V147 nettoyage visuel et cohérence d'interface.
   Aucune logique astrologique n'est modifiée. */
(function(){
'use strict';

// V157 devient l'unique coque visuelle publique. On la démarre avant les couches suivantes
// et on neutralise l'ancien tableau de bord V156 pour éviter tout empilement d'interfaces.
if(!window.__AP_V157_BOOTSTRAP__){
  window.__AP_V157_BOOTSTRAP__=true;
  window.__AP_V156_PRODUCT_COHERENCE__=true;
  if(!document.querySelector('script[src*="v157-loader.js"]')){
    const v157=document.createElement('script');
    v157.src='assets/v157-loader.js?v=157';
    v157.async=false;
    v157.setAttribute('data-ap-v157-bootstrap','1');
    document.head.appendChild(v157);
  }
}

const PREMIUM_COPY={
  fr:{desc:'Votre thème, vos prévisions, les temps forts, Le bon moment, la synastrie avancée et les analyses détaillées dans la langue choisie.',timeline:'Chronologie intégrée aux Temps forts',compare:'Comparaison dans Le bon moment',events:'Temps forts · 12 mois + horizon 24 mois'},
  en:{desc:'Your chart, forecasts, key periods, Ideal Timing, advanced synastry and detailed readings in the selected language.',timeline:'Timeline integrated into Key periods',compare:'Comparison inside Ideal Timing',events:'Key periods · 12 months + 24-month horizon'},
  es:{desc:'Tu carta, previsiones, períodos clave, El mejor momento, la sinastría avanzada y los análisis detallados en el idioma elegido.',timeline:'Cronología integrada en Períodos clave',compare:'Comparación dentro de El mejor momento',events:'Períodos clave · 12 meses + horizonte de 24 meses'},
  ar:{desc:'خريطتك وتوقعاتك والفترات المهمة والتوقيت الأنسب والتوافق المتقدم والتحليلات المفصلة باللغة المختارة.',timeline:'الخط الزمني مدمج في الفترات المهمة',compare:'المقارنة داخل التوقيت الأنسب',events:'الفترات المهمة · 12 شهرًا + أفق 24 شهرًا'}
};
function ensureStyle(){
  if(document.getElementById('ap-v128-cleanup-style'))return;
  const s=document.createElement('style');s.id='ap-v128-cleanup-style';s.textContent=`
  #ap121-story,#ap100-compare-date-btn,#ap-notification-badge{display:none!important}
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
    const img=card.querySelector('img');if(img){const holder=img.parentElement||card;holder.classList.add('ap-v128-card-art-clean')}
    const bgEls=[card,...card.querySelectorAll('[style*="background-image"]')];bgEls.forEach(el=>{if(el.style&&el.style.backgroundImage&&el.style.backgroundImage!=='none')el.classList.add('ap-v128-clean-art')});
  });
}
function cleanBanners(){document.querySelectorAll('.ap121-hero,.ap121-banner,.ap100-page-hero,#ap121-module-banner,[class*="hero"],[class*="banner"]').forEach(el=>{const st=getComputedStyle(el),bg=st.backgroundImage||'';if(bg&&bg!=='none'&&/url\(/.test(bg))el.classList.add('ap-v128-clean-art')})}
function hideEmbeddedCopy(){document.querySelectorAll('.ap121-banner,.ap121-hero').forEach(b=>{b.querySelectorAll('.decorative-copy,.image-copy').forEach(x=>x.style.setProperty('display','none','important'));b.querySelectorAll('.ap121-banner-copy').forEach(x=>x.style.removeProperty('display'))})}
function standaloneLabel(el){if(!el)return '';if(el.matches('a,button,[role="button"]'))return text(el);const h=el.querySelector('h1,h2,h3,h4,.ap121-title,.ap121-card-title,.title');return h?text(h):''}
function isProtected24Months(t){return /24\s*(mois|months|meses)|24\s*شهر/.test(t)}
function isStandaloneDuplicate(t){
  if(!t||isProtected24Months(t))return false;
  return /^(timeline(?:\s+de\s+vie)?(?:\s+10\s+ans)?|timeline\s+10\s+ans|life\s+timeline|10[- ]year\s+timeline|línea\s+de\s+vida|linea\s+de\s+vida|المخطط\s+الزمني|grands?\s+év[ée]nements?|major\s+events?|grandes?\s+eventos?|الأحداث\s+الكبرى|historique|mon\s+historique|history|my\s+history|historial|mi\s+historial|notifications?|notificaciones|الإشعارات|votre\s+avenir\s+racont[ée]|avenir\s+racont[ée]|your\s+future\s+story|future\s+story|futuro\s+narrado|المستقبل\s+المروي|comparer\s+(?:plusieurs\s+)?dates|comparateur\s+de\s+dates|compare\s+(?:several\s+)?dates|date\s+comparator|comparar\s+(?:varias\s+)?fechas|comparador\s+de\s+fechas|مقارنة\s+(?:عدة\s+)?تواريخ)$/i.test(t)
}
function hideStandalonePublicEntries(){
  const selectors=['#ap121-home .ap121-feature','#ap121-home button','#ap121-home a','nav a','nav button','.ap121-nav a','.ap121-nav button','.ap121-sidebar a','.ap121-sidebar button','[onclick*="timeline" i]','[onclick*="compare" i]','#ap121-future .ap121-feature'].join(',');
  document.querySelectorAll(selectors).forEach(el=>{const label=standaloneLabel(el);if(isStandaloneDuplicate(label))el.style.setProperty('display','none','important')});
  document.getElementById('ap121-story')?.style.setProperty('display','none','important');
}
function removeLegacyMobileTools(){document.getElementById('ap-v30-tools')?.remove();document.querySelectorAll('#v30-home button').forEach(btn=>{const oc=String(btn.getAttribute('onclick')||'').toLowerCase();if(/v30gomodule\(['"](?:timeline|compare|journal)['"]\)/.test(oc))btn.remove()})}
function cleanPremiumShowcase(){
  const code=String(window.AP_LANG||localStorage.getItem('astro-lang')||'fr').toLowerCase().slice(0,2),c=PREMIUM_COPY[code]||PREMIUM_COPY.fr;
  const desc=document.querySelector('[data-ap="premium_desc"]');if(desc&&desc.textContent!==c.desc)desc.textContent=c.desc;
  const labels={premium_timeline:c.timeline,premium_compare:c.compare,premium_events:c.events};Object.entries(labels).forEach(([key,value])=>document.querySelectorAll(`[data-ap="${key}"]`).forEach(el=>{if(el.textContent!==value)el.textContent=value}));
}
function run(){cleanCards();cleanBanners();hideEmbeddedCopy();hideStandalonePublicEntries();removeLegacyMobileTools();cleanPremiumShowcase()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
new MutationObserver(()=>{clearTimeout(window.__apV128CleanupT);window.__apV128CleanupT=setTimeout(run,80)}).observe(document.documentElement,{childList:true,subtree:true});
setInterval(run,1800);
})();