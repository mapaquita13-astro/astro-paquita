/* Astro Paquita — V128 : corrections d'interface autour de la V121.
   IMPORTANT : aucun calcul astrologique V121 n'est remplacé ici.
   Cette couche lit uniquement les signaux deja calcules par apV51Signals(). */
(function(){
'use strict';

const GRAPH_DOMAINS=[
  {key:'couple',label:'Amour',color:'#e95383'},
  {key:'work',label:'Travail',color:'#c8903a'},
  {key:'money',label:'Argent',color:'#52a17e'},
  {key:'daily',label:'Bien-être',color:'#9f78db'},
  {key:'family',label:'Famille',color:'#6b8ddd'},
  {key:'travel',label:'Voyage',color:'#4ab7ca'}
];
let selectedGraphDomain='couple';

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function monthLabel(d){return new Intl.DateTimeFormat('fr-FR',{month:'short'}).format(d).replace('.','');}
function fullMonth(d){return new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(d);}

function v121MonthlyUiData(){
  const now=new Date(),months=[];
  for(let i=0;i<12;i++){
    const d=new Date(now.getFullYear(),now.getMonth()+i,15);
    let sig=[];
    try{sig=typeof window.apV51Signals==='function'?(window.apV51Signals(d,'marque')||[]):[]}catch(e){sig=[]}
    const vals={};
    for(const dom of GRAPH_DOMAINS){
      const xs=sig.filter(x=>x&&x.domain===dom.key);
      if(!xs.length){vals[dom.key]=0;continue}
      let signed=0,count=0;
      for(const x of xs){
        const score=Math.max(40,Math.min(100,Number(x.score)||40));
        const intensity=(score-40)/60;
        const sign=x.polarite==='difficile'?-1:x.polarite==='positive'?1:0;
        signed+=sign*intensity;count++;
      }
      vals[dom.key]=Math.max(-1,Math.min(1,signed/Math.max(1,count)));
    }
    months.push({d,vals});
  }
  return months;
}

function graphSvg(months,domain){
  const W=860,H=350,left=112,right=22,top=28,bottom=50,plotW=W-left-right,plotH=H-top-bottom;
  const x=i=>left+(plotW*i/11);
  const y=v=>top+((1-v)/2)*plotH;
  const levels=[['Très favorable',1],['Favorable',.5],['Stable',0],['Plus délicat',-.5],['Délicat',-1]];
  let s=`<svg class="ap-v128-graph-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tendance ${esc(domain.label)} sur les 12 prochains mois">`;
  levels.forEach(([lab,val])=>{const yy=y(val);s+=`<line x1="${left}" y1="${yy}" x2="${W-right}" y2="${yy}" stroke="rgba(255,255,255,.12)"/><text x="${left-12}" y="${yy+4}" text-anchor="end" fill="#d9ced9" font-size="11">${lab}</text>`});
  months.forEach((m,i)=>{const xx=x(i);s+=`<line x1="${xx}" y1="${top}" x2="${xx}" y2="${H-bottom}" stroke="rgba(255,255,255,.055)"/><text x="${xx}" y="${H-18}" text-anchor="middle" fill="#ded3df" font-size="11">${monthLabel(m.d)}</text>`});
  const pts=months.map((m,i)=>[x(i),y(m.vals[domain.key])]);
  const path=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const area=path+` L ${pts[pts.length-1][0].toFixed(1)} ${y(-1).toFixed(1)} L ${pts[0][0].toFixed(1)} ${y(-1).toFixed(1)} Z`;
  s+=`<path d="${area}" fill="${domain.color}" opacity=".09"/><path d="${path}" fill="none" stroke="${domain.color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  pts.forEach((p,i)=>s+=`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#1b1226" stroke="${domain.color}" stroke-width="3"><title>${fullMonth(months[i].d)} : ${months[i].vals[domain.key]>0?'favorable':months[i].vals[domain.key]<0?'plus délicat':'stable'}</title></circle>`);
  return s+'</svg>';
}

function graphSummary(months,domain){
  const sorted=months.map((m,i)=>({i,v:m.vals[domain.key],d:m.d}));
  const best=sorted.reduce((a,b)=>b.v>a.v?b:a,sorted[0]);
  const low=sorted.reduce((a,b)=>b.v<a.v?b:a,sorted[0]);
  const allStable=sorted.every(x=>Math.abs(x.v)<.08);
  if(allStable)return `<div class="ap-v128-summary"><article><b>Période dominante</b><span>Stable</span><small>Aucun signal V121 suffisamment marqué ne domine actuellement sur ces 12 mois.</small></article></div>`;
  return `<div class="ap-v128-summary"><article><b>Meilleure période</b><span>${esc(fullMonth(best.d))}</span><small>${best.v>0?'Signal plus porteur pour ce domaine.':'Période la plus stable parmi les mois analysés.'}</small></article><article><b>Période plus délicate</b><span>${esc(fullMonth(low.d))}</span><small>${low.v<0?'Davantage de prudence et de recul conseillés.':'Aucun signal franchement délicat ne ressort.'}</small></article><article><b>Lecture</b><span>${esc(domain.label)}</span><small>Courbe construite uniquement à partir des signaux V121 déjà calculés.</small></article></div>`;
}

function renderValidatedGraph(){
  const card=document.querySelector('#ap121-future .ap121-graph-card');
  if(!card||typeof window.apV51Signals!=='function')return;
  const months=v121MonthlyUiData();
  const domain=GRAPH_DOMAINS.find(d=>d.key===selectedGraphDomain)||GRAPH_DOMAINS[0];
  card.dataset.v128Graph='1';
  card.innerHTML=`<div class="ap121-graph-head"><div><span class="ap121-kicker">Horizon des 12 mois</span><h2>Vos grandes tendances mois par mois</h2><p>Choisissez un domaine. La courbe reprend les signaux réellement calculés par la V121 ; les périodes calmes restent proches de Stable.</p></div><button class="ap121-pill" onclick="ap121Open('prev')">Détails</button></div><div class="ap-v128-domain-tabs">${GRAPH_DOMAINS.map(d=>`<button type="button" class="ap-v128-domain-btn ${d.key===domain.key?'active':''}" data-v128-domain="${d.key}">${d.label}</button>`).join('')}</div><div class="ap-v128-graph-wrap">${graphSvg(months,domain)}</div>${graphSummary(months,domain)}`;
  card.querySelectorAll('[data-v128-domain]').forEach(btn=>btn.addEventListener('click',()=>{selectedGraphDomain=btn.dataset.v128Domain;renderValidatedGraph();}));
}

function keepSelectedDomainsVisible(){
  document.querySelectorAll('.dom-btn.actif,.dom-btn.active').forEach(btn=>{
    btn.style.setProperty('background','linear-gradient(135deg,#5b2853,#744064)','important');
    btn.style.setProperty('color','#fff','important');
    btn.style.setProperty('border-color','#5b2853','important');
    btn.style.setProperty('box-shadow','0 7px 18px rgba(76,31,66,.18)','important');
    btn.querySelectorAll('.dom-label,*').forEach(x=>x.style.setProperty('color','#fff','important'));
  });
}

function removeStoryModule(){
  document.querySelectorAll('#ap121-future .ap121-feature[onclick*="story"],.ap121-feature[onclick*="v121Go(\'story\')"]').forEach(card=>card.style.setProperty('display','none','important'));
  const grid=document.querySelector('#ap121-future .ap121-card-grid');
  if(grid)grid.style.setProperty('grid-template-columns','repeat(2,minmax(0,1fr))','important');
  const story=document.getElementById('ap121-story');if(story)story.style.setProperty('display','none','important');
}

function clarifyTimingContent(){
  document.querySelectorAll('h1,h2,h3,.bloc-titre').forEach(el=>{
    const t=el.textContent.trim().toLowerCase();
    if(t==='comparer plusieurs périodes'){
      el.textContent='Comparer jusqu’à 4 dates';
      const box=el.parentElement;
      const p=box&&box.querySelector('p');
      if(p)p.textContent='Choisissez un domaine ou un objectif, saisissez de 2 à 4 dates, puis comparez ce que le moteur V121 fait ressortir pour chacune.';
    }
  });
  document.querySelectorAll('button').forEach(b=>{
    const t=b.textContent.trim();
    if(t==='Chercher les périodes les moins favorables')b.textContent='Repérer les périodes plus délicates';
  });
  document.querySelectorAll('label,.bloc-titre').forEach(el=>{if(el.textContent.trim().toUpperCase()==='INTENTION')el.textContent='DOMAINE / OBJECTIF'});
}

function cleanVisualOverlays(){
  const relHero=document.querySelector('#ap121-relations .ap121-hero');
  if(relHero){const bg=relHero.style.backgroundImage;if(bg&&bg.includes('url(')){relHero.style.backgroundImage=`linear-gradient(90deg,rgba(28,12,29,.96) 0%,rgba(37,15,35,.83) 34%,rgba(27,12,29,.30) 68%,rgba(18,8,20,.08) 100%),${bg}`;relHero.style.backgroundPosition='center right';}}
  const relBanner=document.querySelector('#ap121-relations .ap121-banner');
  if(relBanner){const copy=relBanner.querySelector('.ap121-banner-copy');if(copy)copy.style.display='none';relBanner.style.minHeight='190px';relBanner.style.backgroundPosition='center';}
  document.querySelectorAll('#ap121-module-banner').forEach(b=>b.classList.add('ap-v128-clean-banner'));
}

function applyUiFixes(){
  renderValidatedGraph();
  keepSelectedDomainsVisible();
  removeStoryModule();
  clarifyTimingContent();
  cleanVisualOverlays();
}

let queued=false;
function queueFix(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;applyUiFixes();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queueFix,{once:true});else queueFix();
const observer=new MutationObserver(queueFix);
observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
})();
