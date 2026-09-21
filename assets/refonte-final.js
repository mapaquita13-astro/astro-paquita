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

function ensureStyles(){
  if(document.getElementById('ap-v128-runtime-style'))return;
  const s=document.createElement('style');s.id='ap-v128-runtime-style';s.textContent=`
  .ap-v128-domain-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 12px}
  .ap-v128-domain-btn{border:1px solid rgba(228,211,228,.22);background:rgba(255,255,255,.07);color:#efe5ef;border-radius:999px;padding:9px 15px;font-weight:700;cursor:pointer}
  .ap-v128-domain-btn.active{background:linear-gradient(135deg,#6f2c63,#8e4b7d);border-color:#d5b77e;color:#fff;box-shadow:0 7px 18px rgba(0,0,0,.18)}
  .ap-v128-graph-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin-top:8px}
  .ap-v128-graph-svg{display:block;width:100%;min-width:690px;height:auto}
  .ap-v128-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px}
  .ap-v128-summary article{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;color:#f4ebf3}
  .ap-v128-summary b{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#d9c198;margin-bottom:5px}
  .ap-v128-summary span{display:block;font:600 22px/1.05 'Cormorant Garamond',Georgia,serif;margin-bottom:5px}
  .ap-v128-summary small{display:block;line-height:1.45;color:#d9cfd9}
  .ap-v128-clean-banner{position:relative!important;overflow:hidden!important;isolation:isolate}
  .ap-v128-clean-banner:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(34,13,32,.95),rgba(46,18,42,.72) 42%,rgba(32,13,31,.18) 78%);z-index:-1;pointer-events:none}
  .ap-v128-suspended{position:fixed;inset:0;z-index:999999;background:radial-gradient(circle at 70% 15%,rgba(188,150,88,.12),transparent 28%),#f5eee4;display:flex;align-items:center;justify-content:center;padding:24px}
  .ap-v128-suspended-card{width:min(560px,94vw);background:#fffaf2;border:1px solid rgba(93,54,77,.15);border-radius:28px;box-shadow:0 24px 70px rgba(69,30,59,.16);padding:34px;text-align:center;color:#332535}
  .ap-v128-suspended-card .mark{font-size:34px;color:#bc9658;margin-bottom:10px}.ap-v128-suspended-card h1{font:600 38px/1 'Cormorant Garamond',Georgia,serif;color:#42183d;margin:0 0 13px}.ap-v128-suspended-card p{line-height:1.65;color:#6f606b;margin:0}
  @media(max-width:760px){.ap-v128-domain-tabs{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px}.ap-v128-domain-btn{flex:0 0 auto}.ap-v128-summary{grid-template-columns:1fr}.ap-v128-graph-svg{min-width:760px}.ap-v128-suspended-card{padding:28px 22px}.ap-v128-suspended-card h1{font-size:32px}}
  `;document.head.appendChild(s);
}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function monthLabel(d){return new Intl.DateTimeFormat('fr-FR',{month:'short'}).format(d).replace('.','');}
function fullMonth(d){return new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(d);}

async function checkSuspendedAccount(){
  const token=localStorage.getItem('astro-token')||'';if(!token)return;
  try{
    const r=await fetch('https://astro-paquita-backend.onrender.com/api/me?ts='+Date.now(),{headers:{Authorization:'Bearer '+token},cache:'no-store'});
    if(r.status!==403)return;
    const d=await r.json().catch(()=>({}));
    if(!d||d.code!=='ACCOUNT_SUSPENDED')return;
    ensureStyles();
    let layer=document.getElementById('ap-v128-suspended');
    if(!layer){layer=document.createElement('div');layer.id='ap-v128-suspended';layer.className='ap-v128-suspended';document.body.appendChild(layer)}
    layer.innerHTML=`<div class="ap-v128-suspended-card"><div class="mark">✦</div><h1>Astro Paquita</h1><p>${esc(d.erreur||'Ce compte est temporairement indisponible.')}</p></div>`;
  }catch(e){}
}

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
  const x=i=>left+(plotW*i/11),y=v=>top+((1-v)/2)*plotH;
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
  const rows=months.map(m=>({v:m.vals[domain.key],d:m.d}));
  const best=rows.reduce((a,b)=>b.v>a.v?b:a,rows[0]),low=rows.reduce((a,b)=>b.v<a.v?b:a,rows[0]);
  if(rows.every(x=>Math.abs(x.v)<.08))return `<div class="ap-v128-summary"><article><b>Période dominante</b><span>Stable</span><small>Aucun signal V121 suffisamment marqué ne domine actuellement sur ces 12 mois.</small></article></div>`;
  return `<div class="ap-v128-summary"><article><b>Meilleure période</b><span>${esc(fullMonth(best.d))}</span><small>${best.v>0?'Signal plus porteur pour ce domaine.':'Période la plus stable parmi les mois analysés.'}</small></article><article><b>Période plus délicate</b><span>${esc(fullMonth(low.d))}</span><small>${low.v<0?'Davantage de prudence et de recul conseillés.':'Aucun signal franchement délicat ne ressort.'}</small></article><article><b>Lecture</b><span>${esc(domain.label)}</span><small>Courbe construite uniquement à partir des signaux V121 déjà calculés.</small></article></div>`;
}

function renderValidatedGraph(){
  const card=document.querySelector('#ap121-future .ap121-graph-card');
  if(!card||typeof window.apV51Signals!=='function')return;
  ensureStyles();
  const months=v121MonthlyUiData(),domain=GRAPH_DOMAINS.find(d=>d.key===selectedGraphDomain)||GRAPH_DOMAINS[0];
  if(card.dataset.v128Graph===domain.key)return;
  card.dataset.v128Graph=domain.key;
  card.innerHTML=`<div class="ap121-graph-head"><div><span class="ap121-kicker">Horizon des 12 mois</span><h2>Vos grandes tendances mois par mois</h2><p>Choisissez un domaine. La courbe reprend les signaux réellement calculés par la V121 ; les périodes calmes restent proches de Stable.</p></div><button class="ap121-pill" onclick="ap121Open('prev')">Détails</button></div><div class="ap-v128-domain-tabs">${GRAPH_DOMAINS.map(d=>`<button type="button" class="ap-v128-domain-btn ${d.key===domain.key?'active':''}" data-v128-domain="${d.key}">${d.label}</button>`).join('')}</div><div class="ap-v128-graph-wrap">${graphSvg(months,domain)}</div>${graphSummary(months,domain)}`;
  card.querySelectorAll('[data-v128-domain]').forEach(btn=>btn.addEventListener('click',()=>{selectedGraphDomain=btn.dataset.v128Domain;card.dataset.v128Graph='';renderValidatedGraph();}));
}

function keepSelectedDomainsVisible(){document.querySelectorAll('.dom-btn.actif,.dom-btn.active').forEach(btn=>{btn.style.setProperty('background','linear-gradient(135deg,#5b2853,#744064)','important');btn.style.setProperty('color','#fff','important');btn.style.setProperty('border-color','#5b2853','important');btn.style.setProperty('box-shadow','0 7px 18px rgba(76,31,66,.18)','important');btn.querySelectorAll('.dom-label,*').forEach(x=>x.style.setProperty('color','#fff','important'));});}
function removeStoryModule(){document.querySelectorAll('#ap121-future .ap121-feature[onclick*="story"],.ap121-feature[onclick*="v121Go(\'story\')"]').forEach(card=>card.style.setProperty('display','none','important'));const grid=document.querySelector('#ap121-future .ap121-card-grid');if(grid)grid.style.setProperty('grid-template-columns','repeat(2,minmax(0,1fr))','important');const story=document.getElementById('ap121-story');if(story)story.style.setProperty('display','none','important');}
function clarifyTimingContent(){document.querySelectorAll('h1,h2,h3,.bloc-titre').forEach(el=>{const t=el.textContent.trim().toLowerCase();if(t==='comparer plusieurs périodes'){el.textContent='Comparer jusqu’à 4 dates';const box=el.parentElement,p=box&&box.querySelector('p');if(p)p.textContent='Choisissez un domaine ou un objectif, saisissez de 2 à 4 dates, puis comparez ce que le moteur V121 fait ressortir pour chacune.';}});document.querySelectorAll('button').forEach(b=>{if(b.textContent.trim()==='Chercher les périodes les moins favorables')b.textContent='Repérer les périodes plus délicates';});document.querySelectorAll('label,.bloc-titre').forEach(el=>{if(el.textContent.trim().toUpperCase()==='INTENTION')el.textContent='DOMAINE / OBJECTIF'});}
function cleanVisualOverlays(){const relHero=document.querySelector('#ap121-relations .ap121-hero');if(relHero&&!relHero.dataset.v128Clean){const bg=relHero.style.backgroundImage;if(bg&&bg.includes('url(')){relHero.style.backgroundImage=`linear-gradient(90deg,rgba(28,12,29,.98) 0%,rgba(37,15,35,.86) 36%,rgba(27,12,29,.34) 70%,rgba(18,8,20,.08) 100%),${bg}`;relHero.style.backgroundPosition='center right';}relHero.dataset.v128Clean='1';}const relBanner=document.querySelector('#ap121-relations .ap121-banner');if(relBanner){const copy=relBanner.querySelector('.ap121-banner-copy');if(copy)copy.style.display='none';relBanner.style.minHeight='190px';relBanner.style.backgroundPosition='center';}document.querySelectorAll('#ap121-module-banner').forEach(b=>b.classList.add('ap-v128-clean-banner'));}
function removeObsoletePublicModules(){
  const obsolete=[
    /^votre avenir racont[ée]$/i,
    /^avenir racont[ée]$/i,
    /^comparer les dates$/i,
    /^comparateur de dates$/i,
    /^timeline 10 ans$/i,
    /^timeline de vie$/i,
    /^grands événements$/i,
    /^notifications?$/i,
    /^historique utilisateur$/i,
    /^mon historique$/i
  ];
  document.querySelectorAll('button,a,.service-card,.ap100-feature-card,.ap121-feature,.mod-onglet,[role="button"]').forEach(el=>{
    const txt=String(el.textContent||'').replace(/\s+/g,' ').trim();
    if(!txt||!obsolete.some(rx=>rx.test(txt)))return;
    const card=el.closest('.service-card,.ap100-feature-card,.ap121-feature,.mod-onglet')||el;
    card.style.setProperty('display','none','important');
  });
}
function alignPublicWording(){
  document.querySelectorAll('h1,h2,h3,.module-titre,.bloc-titre').forEach(el=>{
    const txt=String(el.textContent||'').replace(/\s+/g,' ').trim();
    if(/^grands événements$/i.test(txt))el.textContent='Les 24 mois qui comptent';
    if(/^fenêtre idéale$/i.test(txt))el.textContent='Le bon moment';
  });
}
function applyUiFixes(){ensureStyles();renderValidatedGraph();keepSelectedDomainsVisible();removeStoryModule();removeObsoletePublicModules();alignPublicWording();clarifyTimingContent();cleanVisualOverlays();}
let queued=false;function queueFix(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;applyUiFixes();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{queueFix();checkSuspendedAccount()},{once:true});else{queueFix();checkSuspendedAccount()}
const observer=new MutationObserver(queueFix);observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
})();
