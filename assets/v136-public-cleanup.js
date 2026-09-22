/* Astro Paquita — nettoyage public V136
   Cette couche ne modifie aucun calcul astrologique. */
(function(){
'use strict';

function addStyle(){
  if(document.getElementById('ap-v136-public-style'))return;
  const s=document.createElement('style');
  s.id='ap-v136-public-style';
  s.textContent=`
    #mod-question,#ap-v130-question-card{display:none!important}
    .ap-v136-selected,
    button.ap-v136-selected,
    [role="button"].ap-v136-selected{
      background:linear-gradient(135deg,#5b2853,#744064)!important;
      color:#fff!important;
      border-color:#744064!important;
      box-shadow:0 7px 18px rgba(76,31,66,.18)!important;
    }
    .ap-v128-clean-art>img,.ap-v128-card-art-clean img{
      transform:none!important;
      object-position:center center!important;
    }
    .ap121-feature .pic,.ap100-feature-card [style*="background-image"],.ap121-feature [style*="background-image"]{
      background-position:center center!important;
      background-repeat:no-repeat!important;
    }
  `;
  document.head.appendChild(s);
}

function norm(v){return String(v||'').replace(/\s+/g,' ').trim().toLowerCase()}

const questionLabels=[
  'ma question','my question','mi pregunta','سؤالي'
];
function removeQuestion(){
  document.getElementById('ap-v130-question-card')?.remove();
  const mod=document.getElementById('mod-question');
  if(mod){mod.style.setProperty('display','none','important');mod.setAttribute('aria-hidden','true')}
  const selectors='a,button,[role="button"],.ap121-feature,.ap100-feature-card,.service-card,.feature-card';
  document.querySelectorAll(selectors).forEach(el=>{
    const t=norm(el.textContent);
    const oc=norm(el.getAttribute&&el.getAttribute('onclick'));
    if(questionLabels.some(q=>t===q||t.startsWith(q+' ')||t.includes(' '+q+' '))||oc.includes("question")){
      if(el.closest('#section-modules')&&el.id!=='ap-v130-question-card'){
        el.style.setProperty('display','none','important');
      }else{
        el.remove();
      }
    }
  });
  document.body?.classList.remove('ap-v130-question-open');
}

const replacements=[
  [/La V121 ne renvoie pas assez de matière pour ce domaine sur \{?year\}?\.?/gi,'Aucune tendance suffisamment nette n’est disponible pour ce domaine sur cette période.'],
  [/La V121 ne renvoie pas assez de matière pour ce domaine sur \d{4}\.?/gi,'Aucune tendance suffisamment nette n’est disponible pour ce domaine sur cette période.'],
  [/La courbe utilise les activations V121 réelles de chaque mois, y compris les tendances faibles, sans les transformer en événements\.?/gi,'La courbe synthétise les tendances astrologiques de chaque mois, y compris les tendances plus discrètes.'],
  [/lectures V121/gi,'indicateurs'],
  [/transits V121/gi,'transits astrologiques'],
  [/V121 readings/gi,'indicators'],
  [/V121 does not return enough material for this area in \d{4}\.?/gi,'No sufficiently clear trend is available for this area over this period.'],
  [/The curve uses the real V121 activations for each month, including weaker trends, without turning them into events\.?/gi,'The curve summarizes the astrological trends for each month, including subtler trends.'],
  [/tránsitos V121/gi,'tránsitos astrológicos'],
  [/lecturas V121/gi,'indicadores'],
  [/V121 no devuelve suficiente información para esta área en \d{4}\.?/gi,'No hay una tendencia suficientemente clara disponible para esta área en este período.'],
  [/La curva utiliza las activaciones V121 reales de cada mes, incluidas las tendencias débiles, sin convertirlas en eventos\.?/gi,'La curva resume las tendencias astrológicas de cada mes, incluidas las más sutiles.'],
  [/قراءات V121/gi,'مؤشرات'],
  [/عبور V121/gi,'العبور الفلكي'],
  [/لا تعيد V121 مادة كافية لهذا المجال خلال \d{4}\.?/gi,'لا يتوفر اتجاه واضح بما يكفي لهذا المجال خلال هذه الفترة.'],
  [/يستخدم المنحنى تفعيلات V121 الحقيقية لكل شهر، بما في ذلك الاتجاهات الضعيفة، دون تحويلها إلى أحداث\.?/gi,'يلخص المنحنى الاتجاهات الفلكية لكل شهر، بما في ذلك الاتجاهات الأكثر دقة.'],
  [/Le résultat ne se limite plus à un score[^.]*\.?/gi,'Découvrez les points forts, les équilibres et les zones de vigilance de cette relation.'],
  [/Le résultat ne se limite pas à un score[^.]*\.?/gi,'Découvrez les points forts, les équilibres et les zones de vigilance de cette relation.']
];
function cleanInternalCopy(root=document.body){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];let n;
  while((n=walker.nextNode()))nodes.push(n);
  nodes.forEach(node=>{
    const p=node.parentElement;if(!p||p.closest('script,style,noscript,textarea,pre,code'))return;
    let v=node.nodeValue||'',nv=v;
    replacements.forEach(([re,to])=>{nv=nv.replace(re,to)});
    if(nv!==v)node.nodeValue=nv;
  });
}

const homeImages=[
  {re:/portrait natal|natal portrait|retrato natal|الخريطة الميلادية/i,url:'assets/img/natal.jpg'},
  {re:/mon avenir|my future|mi futuro|مستقبلي/i,url:'assets/img/future.jpg'},
  {re:/prévisions|previsions|forecast|previsiones|التوقعات/i,url:'assets/img/forecast.jpg'},
  {re:/relations|synastr|relaciones|العلاقات|التوافق/i,url:'assets/img/relations.jpg'},
  {re:/le bon moment|ideal timing|momento ideal|التوقيت الأنسب/i,url:'assets/img/jupiter.jpg'},
  {re:/24 mois|24 months|24 meses|24 شهر/i,url:'assets/img/story2.jpg'},
  {re:/portrait enfant|child portrait|retrato infantil|صورة الطفل/i,url:'assets/img/profile.jpg'}
];
function fixHomeImages(){
  document.querySelectorAll('#ap121-home .ap121-feature,.ap100-feature-card,.service-card,.feature-card').forEach(card=>{
    const t=norm(card.textContent);
    const hit=homeImages.find(x=>x.re.test(t));if(!hit)return;
    const pic=card.querySelector('.pic,[class*="art"],[style*="background-image"]');
    if(pic){
      pic.style.setProperty('background-image',`url('${hit.url}')`,'important');
      pic.style.setProperty('background-size','cover','important');
      pic.style.setProperty('background-position','center center','important');
    }
    const img=card.querySelector('img');
    if(img){img.src=hit.url;img.style.setProperty('object-fit','cover','important');img.style.setProperty('object-position','center center','important');img.style.setProperty('transform','none','important')}
  });
}

const periodRe=/^(aujourd'hui|jour|semaine|mois|trimestre|année|annee|1 mois|3 mois|6 mois|12 mois|24 mois|today|day|week|month|quarter|year|1 month|3 months|6 months|12 months|24 months|hoy|día|dia|semana|mes|trimestre|año|ano|1 mes|3 meses|6 meses|12 meses|24 meses|اليوم|أسبوع|شهر|3 أشهر|6 أشهر|12 شهر|24 شهر|سنة)$/i;
function markCurrentPeriod(btn){
  const label=norm(btn.textContent);if(!periodRe.test(label))return;
  const group=btn.closest('.mod-onglets,.mod-tabs,.ap100-tabs,.ap121-tabs,[class*="period"],[class*="periode"],[class*="range"],[class*="filter"],.form-card,.ap100-card,.ap121-card')||btn.parentElement;
  if(!group)return;
  group.querySelectorAll('button,[role="button"]').forEach(b=>{if(periodRe.test(norm(b.textContent)))b.classList.remove('ap-v136-selected')});
  btn.classList.add('ap-v136-selected');
}
function syncSelectedButtons(){
  document.querySelectorAll('button.active,button.actif,button.selected,[aria-selected="true"],[aria-pressed="true"]').forEach(el=>{if(periodRe.test(norm(el.textContent)))el.classList.add('ap-v136-selected')});
}

function run(){addStyle();removeQuestion();cleanInternalCopy();fixHomeImages();syncSelectedButtons()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
document.addEventListener('click',e=>{const b=e.target.closest('button,[role="button"]');if(b)markCurrentPeriod(b)},true);
let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(run,100)}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
setInterval(run,3500);
})();
