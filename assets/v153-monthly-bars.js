/* Astro Paquita — V153 tendances mensuelles en colonnes indépendantes.
   Affichage uniquement : aucun calcul astrologique, score, transit, maison ou aspect n'est modifié. */
(function(){
'use strict';

if(window.__AP_V153_MONTHLY_BARS__) return;
window.__AP_V153_MONTHLY_BARS__=true;

const NS='http://www.w3.org/2000/svg';
const COLORS={
  very_good:'#4fa276',
  good:'#7acb91',
  stable:'#6caee0',
  less_good:'#efbf68',
  difficult:'#e8787c'
};
const COPY={
  fr:{
    intro:'Chaque mois est présenté séparément : la hauteur indique la tonalité du mois, sans supposer une évolution continue entre deux mois.',
    general:'Tendance générale de janvier à décembre',
    how:'Comment lire ce graphique ?',
    howText:'Chaque colonne représente un mois indépendant. Deux colonnes voisines ne signifient pas qu’une hausse ou une baisse s’est produite progressivement entre les deux mois.',
    very_good:'Très favorable',good:'Favorable',stable:'Stable',less_good:'Plus délicat',difficult:'Délicat',
    very_good_d:'Signaux nombreux et harmonieux',good_d:'Signaux globalement positifs',stable_d:'Équilibre ou peu de contraste',less_good_d:'Tensions plus présentes',difficult_d:'Tensions dominantes',
    takeaway:'À retenir pour',
    generic:'Les mois sont comparés indépendamment. Le graphique ne fabrique aucune transition entre deux valeurs mensuelles.',
    specific:(domain,best,low)=>`${best} ressort comme la période la plus porteuse pour ${domain.toLowerCase()}, tandis que ${low} est la période la plus délicate. Les mois intermédiaires restent des lectures indépendantes.`
  },
  en:{
    intro:'Each month is shown independently: bar height reflects that month’s tone without implying a continuous change between two months.',
    general:'Overall trend from January to December',how:'How to read this chart?',
    howText:'Each bar represents one independent month. Two neighboring bars do not mean that the change happened progressively between those months.',
    very_good:'Very favorable',good:'Favorable',stable:'Stable',less_good:'More delicate',difficult:'Delicate',
    very_good_d:'Many harmonious signals',good_d:'Mostly positive signals',stable_d:'Balanced or low contrast',less_good_d:'More tension present',difficult_d:'Tension is more prominent',
    takeaway:'Key point for',generic:'Months are compared independently. The chart does not invent a transition between monthly values.',
    specific:(domain,best,low)=>`${best} stands out as the most supportive period for ${domain.toLowerCase()}, while ${low} is the more delicate period. Intermediate months remain independent readings.`
  },
  es:{
    intro:'Cada mes se muestra de forma independiente: la altura indica la tonalidad del mes sin suponer una evolución continua entre dos meses.',
    general:'Tendencia general de enero a diciembre',how:'¿Cómo leer este gráfico?',
    howText:'Cada columna representa un mes independiente. Dos columnas vecinas no significan que el cambio se haya producido progresivamente entre ambos meses.',
    very_good:'Muy favorable',good:'Favorable',stable:'Estable',less_good:'Más delicado',difficult:'Delicado',
    very_good_d:'Señales numerosas y armoniosas',good_d:'Señales globalmente positivas',stable_d:'Equilibrio o poco contraste',less_good_d:'Más tensiones presentes',difficult_d:'Tensiones dominantes',
    takeaway:'A recordar para',generic:'Los meses se comparan de forma independiente. El gráfico no inventa una transición entre valores mensuales.',
    specific:(domain,best,low)=>`${best} destaca como el período más favorable para ${domain.toLowerCase()}, mientras que ${low} es el período más delicado. Los meses intermedios siguen siendo lecturas independientes.`
  },
  ar:{
    intro:'يُعرض كل شهر بشكل مستقل: يعبّر ارتفاع العمود عن نبرة الشهر من دون افتراض تغيّر متواصل بين شهرين.',
    general:'الاتجاه العام من يناير إلى ديسمبر',how:'كيف يُقرأ هذا الرسم؟',
    howText:'يمثل كل عمود شهرًا مستقلًا. لا يعني اختلاف عمودين متجاورين أن التغير حدث تدريجيًا بين الشهرين.',
    very_good:'ملائم جدًا',good:'ملائم',stable:'مستقر',less_good:'أكثر حساسية',difficult:'حساس',
    very_good_d:'إشارات منسجمة عديدة',good_d:'إشارات إيجابية إجمالًا',stable_d:'توازن أو تباين ضعيف',less_good_d:'توترات أكثر حضورًا',difficult_d:'توترات أكثر هيمنة',
    takeaway:'الخلاصة لعام',generic:'تُقارن الأشهر بشكل مستقل ولا يفترض الرسم انتقالًا مصطنعًا بين القيم الشهرية.',
    specific:(domain,best,low)=>`${best} يبرز كفترة أكثر دعمًا في مجال ${domain}، بينما ${low} هو الفترة الأكثر حساسية. وتبقى الأشهر بينهما قراءات مستقلة.`
  }
};

function lang(){
  const l=String(window.AP_LANG||localStorage.getItem('astro-lang')||document.documentElement.lang||'fr').toLowerCase().slice(0,2);
  return COPY[l]?l:'fr';
}
function tx(k){return COPY[lang()][k]||COPY.fr[k]||k}
function num(el,name){return Number(el&&el.getAttribute(name))}
function eq(a,b){return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<0.25}
function category(score){
  if(score>=.75)return 'very_good';
  if(score>=.25)return 'good';
  if(score>-.25)return 'stable';
  if(score>-.75)return 'less_good';
  return 'difficult';
}
function svgEl(name,attrs){
  const el=document.createElementNS(NS,name);
  Object.entries(attrs||{}).forEach(([k,v])=>el.setAttribute(k,String(v)));
  return el;
}

function installStyle(){
  if(document.getElementById('ap-v153-style'))return;
  const s=document.createElement('style');s.id='ap-v153-style';s.textContent=`
    .ap-v153-domain-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin:18px 0 8px;padding:0 2px;color:#f7eef5}
    .ap-v153-domain-head h3{margin:0;font:600 31px/1 'Cormorant Garamond',Georgia,serif;color:#fffaf5}
    .ap-v153-domain-head p{margin:6px 0 0;color:#bfb1c2;font-size:13px;line-height:1.35}
    .ap-v153-help{flex:0 0 auto;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.055);color:#ddd0df;border-radius:14px;padding:9px 11px;font-size:11px;line-height:1.2;cursor:pointer}
    .ap-v153-help-note{display:none;margin:0 0 12px;padding:11px 13px;border:1px solid rgba(216,188,129,.22);background:rgba(216,188,129,.07);border-radius:13px;color:#d8ccda;font-size:12px;line-height:1.45}
    .ap-v153-help-note.open{display:block}
    .ap-v153-legend{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:12px 0 6px}
    .ap-v153-legend-item{display:grid;grid-template-columns:12px 1fr;column-gap:7px;align-items:start;color:#f0e6ef;min-width:0}
    .ap-v153-dot{width:12px;height:12px;border-radius:50%;margin-top:2px}
    .ap-v153-legend-item b{font-size:11px;line-height:1.2}.ap-v153-legend-item small{grid-column:2;color:#b7a9ba;font-size:9px;line-height:1.3;margin-top:3px}
    .ap-v130-summary.ap-v153-summary{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:16px}
    .ap-v130-summary.ap-v153-summary article{padding:16px 17px;border-radius:18px;min-height:88px}
    .ap-v130-summary.ap-v153-summary article.ap-v153-best{background:linear-gradient(135deg,rgba(45,112,77,.30),rgba(255,255,255,.055));border-color:rgba(102,197,137,.38)}
    .ap-v130-summary.ap-v153-summary article.ap-v153-low{background:linear-gradient(135deg,rgba(151,55,74,.30),rgba(255,255,255,.055));border-color:rgba(230,112,124,.38)}
    .ap-v153-takeaway{margin-top:12px;padding:16px 18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);border-radius:18px;color:#e9dfe9}
    .ap-v153-takeaway b{display:block;color:#d8bc81;font:600 20px/1.1 'Cormorant Garamond',Georgia,serif;margin-bottom:7px}
    .ap-v153-takeaway p{margin:0;color:#cbbdce;font-size:12px;line-height:1.5}
    .ap-v153-bars rect{transition:opacity .16s ease,filter .16s ease}.ap-v153-bars rect:hover{opacity:.92;filter:brightness(1.08)}
    .ap-v130-domain-tabs{scrollbar-width:none}.ap-v130-domain-tabs::-webkit-scrollbar{display:none}
    @media(max-width:760px){
      .ap-v130-domain-tabs{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));overflow:visible!important;gap:8px!important}
      .ap-v130-domain-btn{min-width:0!important;padding:10px 5px!important;font-size:12px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ap-v130-year-tabs{justify-content:center;overflow:visible!important}
      .ap-v153-domain-head{align-items:center}.ap-v153-domain-head h3{font-size:28px}.ap-v153-help{max-width:118px}
      .ap-v153-legend{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px}
      .ap-v130-summary.ap-v153-summary{grid-template-columns:1fr}
      .ap-v130-svg{min-width:680px!important}
    }
  `;(document.head||document.documentElement).appendChild(s);
}

function transformSvg(svg){
  if(!svg||svg.dataset.v153Bars==='1')return;
  const circles=[...svg.querySelectorAll('circle')].filter(c=>Number.isFinite(num(c,'cx'))&&Number.isFinite(num(c,'cy')));
  if(!circles.length)return;
  const lines=[...svg.querySelectorAll('line')];
  const horizontal=lines.filter(l=>eq(num(l,'y1'),num(l,'y2')));
  if(horizontal.length<2)return;
  const ys=horizontal.map(l=>num(l,'y1')).filter(Number.isFinite);
  const top=Math.min(...ys),bottom=Math.max(...ys),span=Math.max(1,bottom-top);
  const xs=circles.map(c=>num(c,'cx')).sort((a,b)=>a-b);
  const diffs=xs.slice(1).map((x,i)=>x-xs[i]).filter(v=>v>1);
  const spacing=diffs.length?Math.min(...diffs):62;
  const width=Math.max(25,Math.min(46,spacing*.58));

  svg.querySelectorAll('path').forEach(p=>p.remove());
  lines.filter(l=>eq(num(l,'x1'),num(l,'x2'))).forEach(l=>l.remove());

  const group=svgEl('g',{class:'ap-v153-bars'});
  const data=[];
  circles.forEach(c=>{
    const cx=num(c,'cx'),cy=num(c,'cy');
    const score=Math.max(-1,Math.min(1,1-2*((cy-top)/span)));
    const cat=category(score);
    const y=Math.max(top,Math.min(bottom-12,cy));
    const rect=svgEl('rect',{x:(cx-width/2).toFixed(1),y:y.toFixed(1),width:width.toFixed(1),height:Math.max(12,bottom-y).toFixed(1),rx:Math.min(10,width/4),fill:COLORS[cat],opacity:'0.96'});
    const oldTitle=c.querySelector('title');
    const month=oldTitle?String(oldTitle.textContent||'').split('·')[0].trim():'';
    const title=svgEl('title');title.textContent=(month?month+' · ':'')+tx(cat);rect.appendChild(title);
    group.appendChild(rect);
    data.push({month,score,cat});
    c.remove();
  });
  svg.appendChild(group);
  svg.dataset.v153Bars='1';
  try{svg.dataset.v153Rows=JSON.stringify(data)}catch(e){}
}

function legendHtml(){
  return ['very_good','good','stable','less_good','difficult'].map(k=>`<div class="ap-v153-legend-item"><span class="ap-v153-dot" style="background:${COLORS[k]}"></span><b>${tx(k)}</b><small>${tx(k+'_d')}</small></div>`).join('');
}
function parseRows(svg){try{return JSON.parse(svg.dataset.v153Rows||'[]')}catch(e){return []}}
function yearValue(card){return (card.querySelector('.ap-v130-year-btn.active')||{}).textContent?.trim()||String(new Date().getFullYear())}
function domainValue(card){return (card.querySelector('.ap-v130-domain-btn.active')||{}).textContent?.trim()||''}
function isDatedValue(text,year){return !!text&&new RegExp('\\b'+String(year)+'\\b').test(text)}

function enhanceCard(card){
  if(!card)return;
  installStyle();
  const svg=card.querySelector('svg.ap-v130-svg');
  if(!svg)return;
  transformSvg(svg);
  if(svg.dataset.v153Bars!=='1')return;

  const year=yearValue(card),domain=domainValue(card);
  const head=card.querySelector('.ap121-graph-head p');
  if(head)head.textContent=tx('intro');

  const wrap=card.querySelector('.ap-v130-graph-wrap');
  if(!wrap)return;
  let domainHead=card.querySelector('.ap-v153-domain-head');
  if(!domainHead){
    domainHead=document.createElement('div');domainHead.className='ap-v153-domain-head';wrap.before(domainHead);
  }
  domainHead.innerHTML=`<div><h3>${domain}</h3><p>${tx('general')} ${year}</p></div><button type="button" class="ap-v153-help">ⓘ ${tx('how')}</button>`;

  let help=card.querySelector('.ap-v153-help-note');
  if(!help){help=document.createElement('div');help.className='ap-v153-help-note';domainHead.after(help)}
  help.textContent=tx('howText');
  domainHead.querySelector('.ap-v153-help').onclick=()=>help.classList.toggle('open');

  let legend=card.querySelector('.ap-v153-legend');
  if(!legend){legend=document.createElement('div');legend.className='ap-v153-legend';wrap.after(legend)}
  legend.innerHTML=legendHtml();

  const summary=card.querySelector('.ap-v130-summary');
  if(summary){
    const arts=[...summary.querySelectorAll(':scope > article')];
    if(arts.length>=3&&/domaine|area|área|المجال/i.test(arts[0].textContent||''))arts[0].remove();
    const left=[...summary.querySelectorAll(':scope > article')];
    summary.classList.add('ap-v153-summary');
    left.forEach(a=>a.classList.remove('ap-v153-best','ap-v153-low'));
    if(left[0])left[0].classList.add('ap-v153-best');
    if(left[1])left[1].classList.add('ap-v153-low');

    let note=card.querySelector('.ap-v153-takeaway');
    if(!note){note=document.createElement('div');note.className='ap-v153-takeaway';summary.after(note)}
    const best=left[0]?.querySelector('strong')?.textContent?.trim()||'';
    const low=left[1]?.querySelector('strong')?.textContent?.trim()||'';
    const rows=parseRows(svg);
    const enough=rows.length>1&&isDatedValue(best,year)&&isDatedValue(low,year)&&best!==low;
    const body=enough?COPY[lang()].specific(domain,best,low):tx('generic');
    note.innerHTML=`<b>${tx('takeaway')} ${year}</b><p>${body}</p>`;
  }
}

function run(){
  const card=document.querySelector('#ap121-future .ap121-graph-card');
  if(card)enhanceCard(card);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(run,90)}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(run,250);setTimeout(run,900);setInterval(run,3500);
})();