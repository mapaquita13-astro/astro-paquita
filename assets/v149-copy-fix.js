/* Astro Paquita — V149 finition des textes publics + raccord V150 confidentialité.
   Affichage uniquement : aucun calcul astrologique n'est modifié. */
(function(){
'use strict';

if(!document.querySelector('script[src*="privacy-guard-v150.js"]')){
  const s=document.createElement('script');
  s.src='assets/privacy-guard-v150.js?v=150';
  s.async=false;
  s.setAttribute('data-ap-v150-privacy','1');
  document.head.appendChild(s);
}

// V151 — règles de restitution des prévisions annuelles.
// Cette couche agit uniquement sur le prompt éditorial et ne touche jamais aux calculs V121.
if(!document.querySelector('script[src*="v151-annual-forecast-guard.js"]')){
  const s=document.createElement('script');
  s.src='assets/v151-annual-forecast-guard.js?v=151';
  s.async=false;
  s.setAttribute('data-ap-v151-annual-forecast-guard','1');
  document.head.appendChild(s);
}

// V152 — règles de restitution des temps forts sur 24 mois.
// Cette couche cible uniquement le module events et ne modifie aucun calcul astrologique.
if(!document.querySelector('script[src*="v152-events-24m-guard.js"]')){
  const s=document.createElement('script');
  s.src='assets/v152-events-24m-guard.js?v=152';
  s.async=false;
  s.setAttribute('data-ap-v152-events-24m-guard','1');
  document.head.appendChild(s);
}

// V153 — représentation mensuelle en colonnes indépendantes.
// La V153 transforme uniquement l'affichage du graphique existant ; les scores mensuels restent ceux de la V121.
if(!document.querySelector('script[src*="v153-monthly-bars.js"]')){
  const s=document.createElement('script');
  s.src='assets/v153-monthly-bars.js?v=153';
  s.async=false;
  s.setAttribute('data-ap-v153-monthly-bars','1');
  document.head.appendChild(s);
}

// V154 — présentation éditoriale des rapports 24 mois.
// Synthèse, frise et détail uniquement : les résultats astrologiques d'origine restent inchangés.
if(!document.querySelector('script[src*="v154-report-editorial.js"]')){
  const s=document.createElement('script');
  s.src='assets/v154-report-editorial.js?v=154';
  s.async=false;
  s.setAttribute('data-ap-v154-report-editorial','1');
  document.head.appendChild(s);
}

const RULES=[
  [/La\s+(?:V\s*121\s+)?ne renvoie pas assez de matière pour ce domaine sur(?:\s+\{?year\}?|\s+\d{4})?\.?\s*(?:Aucun tracé artificiel n[’']est fabriqué\.)?/gi,'Aucune tendance suffisamment nette n’est disponible pour ce domaine sur cette période.'],
  [/La\s+ne renvoie pas assez de matière pour ce domaine sur(?:\s+\{?year\}?|\s+\d{4})?\.?\s*(?:Aucun tracé artificiel n[’']est fabriqué\.)?/gi,'Aucune tendance suffisamment nette n’est disponible pour ce domaine sur cette période.'],
  [/(?:V\s*121\s+)?does not return enough material for this area in(?:\s+\{?year\}?|\s+\d{4})?\.?\s*(?:No artificial curve is generated\.)?/gi,'No sufficiently clear trend is available for this area over this period.'],
  [/^\s*does not return enough material for this area in(?:\s+\{?year\}?|\s+\d{4})?\.?\s*(?:No artificial curve is generated\.)?/gi,'No sufficiently clear trend is available for this area over this period.'],
  [/(?:V\s*121\s+)?no devuelve suficiente información para esta área en(?:\s+\{?year\}?|\s+\d{4})?\.?\s*(?:No se fabrica ninguna curva artificial\.)?/gi,'No hay una tendencia suficientemente clara disponible para esta área en este período.'],
  [/^\s*no devuelve suficiente información para esta área en(?:\s+\{?year\}?|\s+\d{4})?\.?\s*(?:No se fabrica ninguna curva artificial\.)?/gi,'No hay una tendencia suficientemente clara disponible para esta área en este período.'],
  [/لا تعيد\s+(?:V\s*121\s+)?مادة كافية لهذا المجال خلال(?:\s+\{?year\}?|\s+\d{4})?\.?\s*(?:لا يتم إنشاء منحنى اصطناعي\.)?/gi,'لا يتوفر اتجاه واضح بما يكفي لهذا المجال خلال هذه الفترة.'],
  [/La courbe utilise les activations(?:\s+V\s*121)? réelles de chaque mois, y compris les tendances faibles, sans les transformer en événements\.?/gi,'La courbe présente les tendances astrologiques de chaque mois, y compris les plus discrètes.'],
  [/The curve uses the real(?:\s+V\s*121)? activations for each month, including weaker trends, without turning them into events\.?/gi,'The curve presents the astrological trends for each month, including subtler ones.'],
  [/La curva utiliza las activaciones(?:\s+V\s*121)? reales de cada mes, incluidas las tendencias débiles, sin convertirlas en eventos\.?/gi,'La curva presenta las tendencias astrológicas de cada mes, incluidas las más sutiles.'],
  [/يستخدم المنحنى تفعيلات(?:\s+V\s*121)? الحقيقية لكل شهر، بما في ذلك الاتجاهات الضعيفة، دون تحويلها إلى أحداث\.?/gi,'يعرض المنحنى الاتجاهات الفلكية لكل شهر، بما في ذلك الاتجاهات الأكثر دقة.'],
  [/\bMeilleure journée de l[’']année\b/gi,'Pic de convergence de l’année'],
  [/\bVigilance maximale de l[’']année\b/gi,'Pic de vigilance de l’année'],
  [/Rien ne laisse penser que cela se produit sous contrainte\s*[—-]\s*les données indiquent clairement une évolution favorable, voulue\.?/gi,'La configuration souligne fortement ce domaine sans permettre, à elle seule, de déterminer si l’évolution sera choisie ou contrainte.'],
  [/\bV\s*121\b/gi,'']
];

function clean(root){
  root=root||document.body;if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];let n;
  while((n=walker.nextNode()))nodes.push(n);
  nodes.forEach(node=>{
    const p=node.parentElement;if(!p||p.closest('script,style,noscript,textarea,pre,code'))return;
    const old=node.nodeValue||'';let v=old;
    for(const [re,to] of RULES)v=v.replace(re,to);
    v=v.replace(/[ \t]{2,}/g,' ').replace(/\s+([,.;:!?])/g,'$1');
    if(v!==old)node.nodeValue=v;
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>clean(),{once:true});else clean();
let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>clean(),70)}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
setTimeout(()=>clean(),250);setTimeout(()=>clean(),1000);
})();