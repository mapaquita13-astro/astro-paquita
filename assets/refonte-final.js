/* Astro Paquita — V128 : correctifs d'interface autour de la V121.
   IMPORTANT : aucun calcul astrologique n'est remplacé ici.
   Cette couche lit uniquement les signaux déjà calculés par apV51Signals(). */
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

function v121MonthlyUiData(){
  const now=new Date(),months=[];
  for(let i=0;i<12;i++){
    const d=new Date(now.getFullYear(),now.getMonth()+i,15);
    let sig=[];
    try{sig=typeof window.apV51Signals==='function'?(window.apV51Signals(d,'marque')||[]):[]}catch(e){sig=[]}
    const vals={};
    for(const dom of GRAPH_DOMAINS){
      const xs=sig.filter(x=>x&&x.domain===dom.key);
      let v=0,w=0;
      for(const x of xs){
        const f=Number(x.force||x.strength||0);
        const sg=x.polarite==='difficile'?-1:x.polarite==='positive'?1:0;
        v+=sg*f;
        w+=Math.max(.5,f);
      }
      vals[dom.key]=w?Math.max(-1,Math.min(1,v/w)):0;
    }
    months.push({d,vals});
  }
  return months;
}

function patchV121Graph(){
  const svg=document.querySelector('#ap121-future .ap121-graph-svg');
  if(!svg||svg.dataset.v128Mapped==='1'||typeof window.apV51Signals!=='function')return;

  const months=v121MonthlyUiData();
  const W=820,left=105,right=18,top=40,rowGap=46,plotW=W-left-right;
  const x=i=>left+(plotW*i/11);
  const y=(row,v)=>top+row*rowGap+(1-v)*17;
  const paths=Array.from(svg.querySelectorAll('path')).filter(p=>p.getAttribute('fill')==='none').slice(0,6);
  if(paths.length<6)return;

  GRAPH_DOMAINS.forEach((dom,row)=>{
    const pts=months.map((m,i)=>[x(i),y(row,m.vals[dom.key])]);
    const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    paths[row].setAttribute('d',d);
    paths[row].setAttribute('stroke',dom.color);

    pts.forEach((p,i)=>{
      if(Math.abs(months[i].vals[dom.key])<=.36)return;
      const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('cx',p[0]);c.setAttribute('cy',p[1]);c.setAttribute('r','4.2');
      c.setAttribute('fill','#181226');c.setAttribute('stroke',dom.color);c.setAttribute('stroke-width','2');
      c.setAttribute('data-v128-point','1');svg.appendChild(c);
    });
  });
  svg.dataset.v128Mapped='1';
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
  if(grid&&grid.querySelectorAll('.ap121-feature:not([style*="display: none"])').length<=2){
    grid.style.setProperty('grid-template-columns','repeat(2,minmax(0,1fr))','important');
  }
}

function applyUiFixes(){
  patchV121Graph();
  keepSelectedDomainsVisible();
  removeStoryModule();
}

let queued=false;
function queueFix(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;applyUiFixes();});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queueFix,{once:true});
else queueFix();

const observer=new MutationObserver(queueFix);
observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
})();
