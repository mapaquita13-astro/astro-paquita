/* Astro Paquita — V155 langage public des convergences.
   Présentation uniquement : aucun calcul astrologique, score, date, transit, maison ou aspect n'est modifié. */
(function(){
'use strict';

if(window.__AP_V155_CONVERGENCE_LANGUAGE__) return;
window.__AP_V155_CONVERGENCE_LANGUAGE__=true;

const COPY={
  fr:{
    concordant:'Plusieurs méthodes astrologiques concordent.',
    techTitle:'Pourquoi ce signal est solide ?',
    techExplain:'Plusieurs méthodes astrologiques distinctes vont dans le même sens. Cela renforce le signal dans le cadre de l’analyse astrologique, sans transformer un événement précis en certitude.',
    detailCount:n=>`${n} catégories de méthodes astrologiques distinctes`,
    very:'Signal très convergent',confirmed:'Signal confirmé',light:'Signal plus léger'
  },
  en:{
    concordant:'Several astrological methods point in the same direction.',
    techTitle:'Why is this signal considered strong?',
    techExplain:'Several distinct astrological methods point in the same direction. This strengthens the astrological signal without making any specific event certain.',
    detailCount:n=>`${n} distinct categories of astrological methods`,
    very:'Highly convergent signal',confirmed:'Confirmed signal',light:'Lighter signal'
  },
  es:{
    concordant:'Varios métodos astrológicos apuntan en la misma dirección.',
    techTitle:'¿Por qué se considera sólido este indicador?',
    techExplain:'Varios métodos astrológicos distintos apuntan en la misma dirección. Esto refuerza la señal dentro del análisis astrológico sin convertir un acontecimiento concreto en una certeza.',
    detailCount:n=>`${n} categorías distintas de métodos astrológicos`,
    very:'Señal muy convergente',confirmed:'Señal confirmada',light:'Señal más ligera'
  },
  ar:{
    concordant:'تتجه عدة طرق فلكية مستقلة في الاتجاه نفسه.',
    techTitle:'لماذا تُعد هذه الإشارة قوية؟',
    techExplain:'تتجه عدة طرق فلكية مستقلة في الاتجاه نفسه. وهذا يعزز الإشارة ضمن التحليل الفلكي من دون أن يجعل حدثًا محددًا مؤكدًا.',
    detailCount:n=>`${n} فئات مستقلة من الطرق الفلكية`,
    very:'إشارة شديدة التقارب',confirmed:'إشارة مؤكدة',light:'إشارة أخف'
  }
};
function lang(){const l=String(window.AP_LANG||localStorage.getItem('astro-lang')||document.documentElement.lang||'fr').toLowerCase().slice(0,2);return COPY[l]?l:'fr'}
function tx(k){return COPY[lang()][k]||COPY.fr[k]||k}
function norm(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}

/* Règle ajoutée aux futures générations du module 24 mois. */
const previousFetch=window.fetch;
function isEvents(body){
  if(!body||typeof body!=='object')return false;
  if(String(body.feature||'')==='events')return true;
  let text='';
  try{text=JSON.stringify(body)}catch(e){}
  const n=norm(text);
  return n.includes('24 mois')||n.includes('24 months')||n.includes('24 meses')||n.includes('evenements astrologiques majeurs');
}
const PUBLIC_RULES=`
ASTRO PAQUITA — LANGAGE PUBLIC DES CONVERGENCES
- Le nombre brut de « familles de techniques » est une donnée technique interne et ne doit pas être mis en avant dans la synthèse, la timeline, les titres ou les cartes principales.
- Dans la lecture publique, expliquer simplement que plusieurs méthodes astrologiques distinctes vont dans le même sens.
- Utiliser uniquement un niveau déjà justifié par les données source : « Signal très convergent », « Signal confirmé » ou « Signal plus léger ». Ne pas inventer un niveau à partir du seul nombre brut si la source ne qualifie pas l'intensité.
- Si le nombre brut est conservé, il doit apparaître uniquement dans un détail technique replié, sous la forme « X catégories de méthodes astrologiques distinctes », accompagné d'une explication en langage courant.
- Toujours préciser qu'une convergence astrologique n'est ni une probabilité statistique ni une garantie qu'un événement précis se produira.
- Ne jamais modifier les calculs, dates, scores, domaines ou techniques reçus du moteur.
`;
if(typeof previousFetch==='function'){
  window.fetch=function(input,init){
    try{
      const url=typeof input==='string'?input:(input&&input.url)||'';
      if(/\/api\/(?:claude|ai)(?:\?|$)/i.test(url)&&init&&typeof init.body==='string'){
        const body=JSON.parse(init.body);
        if(isEvents(body)){
          const copy=Object.assign({},body);
          const system=String(copy.system||'');
          if(!system.includes('ASTRO PAQUITA — LANGAGE PUBLIC DES CONVERGENCES'))copy.system=(system?system+'\n\n':'')+PUBLIC_RULES;
          const next=Object.assign({},init,{body:JSON.stringify(copy)});
          return previousFetch.call(this,input,next);
        }
      }
    }catch(e){}
    return previousFetch.call(this,input,init);
  };
}

function publicReplacement(text){
  let v=String(text||'');
  v=v.replace(/\b\d+\s+familles?\s+de\s+techniques\b/gi,tx('concordant'));
  v=v.replace(/\b\d+\s+technique\s+famil(?:y|ies)\b/gi,tx('concordant'));
  v=v.replace(/\b\d+\s+familias?\s+de\s+t[eé]cnicas\b/gi,tx('concordant'));
  v=v.replace(/Le nombre de familles indique combien de catégories de techniques astrologiques distinctes convergent sur cette période\. Il mesure la convergence technique, pas la probabilité qu[’']un événement précis se produise\.?/gi,tx('techExplain'));
  v=v.replace(/\bConvergence technique\b/gi,tx('techTitle'));
  return v;
}
function technicalReplacement(text){
  let v=String(text||'');
  v=v.replace(/\b(\d+)\s+familles?\s+de\s+techniques\b/gi,(_,n)=>tx('detailCount')(n));
  v=v.replace(/\b(\d+)\s+technique\s+famil(?:y|ies)\b/gi,(_,n)=>tx('detailCount')(n));
  v=v.replace(/\b(\d+)\s+familias?\s+de\s+t[eé]cnicas\b/gi,(_,n)=>tx('detailCount')(n));
  v=v.replace(/Le nombre de familles indique combien de catégories de techniques astrologiques distinctes convergent sur cette période\. Il mesure la convergence technique, pas la probabilité qu[’']un événement précis se produise\.?/gi,tx('techExplain'));
  v=v.replace(/\bConvergence technique\b/gi,tx('techTitle'));
  return v;
}
function cleanVisible(root){
  root=root||document.body;if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];let n;
  while((n=walker.nextNode()))nodes.push(n);
  nodes.forEach(node=>{
    const p=node.parentElement;if(!p||p.closest('script,style,noscript,textarea,pre,code'))return;
    const old=node.nodeValue||'';
    const inTechnical=!!p.closest('.ap-v154-detail,.ap-v154-tech');
    let v=inTechnical?technicalReplacement(old):publicReplacement(old);
    if(v!==old)node.nodeValue=v;
  });

  /* La synthèse V154 ne montre jamais le nombre brut. */
  root.querySelectorAll&&root.querySelectorAll('.ap-v154-stat small').forEach(el=>{
    if(/\d+\s+(?:familles?|technique famil|familias?)/i.test(el.textContent||''))el.textContent=tx('concordant');
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>cleanVisible(),{once:true});else cleanVisible();
let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>cleanVisible(),90)}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
setTimeout(()=>cleanVisible(),300);setTimeout(()=>cleanVisible(),1200);
})();
