/* Astro Paquita — V129.1
   Couche d'interface uniquement. Le moteur astrologique V121 n'est pas modifié.
   La langue est volontairement laissée entièrement à la V121 native. */
(function(){
'use strict';

const DOMAINS=[
 {key:'couple',label:'Amour',color:'#ef4f86'},
 {key:'work',label:'Travail',color:'#3b8eea'},
 {key:'money',label:'Argent',color:'#e9a72f'},
 {key:'daily',label:'Bien-être',color:'#27a679'},
 {key:'family',label:'Famille',color:'#7b6ed6'},
 {key:'travel',label:'Voyage',color:'#43b8c8'}
];
let graphDomain='couple';
let graphYear=new Date().getFullYear();

function lang(){return String(window.AP_LANG||localStorage.getItem('astro-lang')||'fr').toLowerCase().slice(0,2)}
function locale(){return ({fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'})[lang()]||'fr-FR'}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function mlabel(d){return new Intl.DateTimeFormat(locale(),{month:'short'}).format(d).replace('.','')}
function flabel(d){return new Intl.DateTimeFormat(locale(),{month:'long',year:'numeric'}).format(d)}

function style(){
 if(document.getElementById('ap-v1291-style'))return;
 const s=document.createElement('style');s.id='ap-v1291-style';s.textContent=`
 .ap-v129-year-tabs,.ap-v129-domain-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
 .ap-v129-year-btn,.ap-v129-domain-btn{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#f3ebf3;border-radius:999px;padding:9px 15px;font-weight:700;cursor:pointer}
 .ap-v129-year-btn.active,.ap-v129-domain-btn.active{background:#6f2f63;color:#fff;border-color:#d8bc81;box-shadow:0 6px 18px rgba(0,0,0,.18)}
 .ap-v129-graph-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}.ap-v129-svg{display:block;width:100%;min-width:720px;height:auto}
 .ap-v129-empty{margin:22px 0 8px;padding:26px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.055);border-radius:18px;text-align:center;color:#f3eaf3}.ap-v129-empty strong{display:block;font:600 27px/1.1 'Cormorant Garamond',Georgia,serif;margin-bottom:8px}.ap-v129-empty span{color:#d4c8d5;font-size:13px;line-height:1.5}
 .ap-v129-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}.ap-v129-summary article{border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.07);border-radius:14px;padding:12px;color:#f4eaf3}.ap-v129-summary b{display:block;color:#d8bc81;font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}.ap-v129-summary strong{font:600 21px/1.1 'Cormorant Garamond',Georgia,serif}
 .ap121-feature .pic{background-size:contain!important;background-repeat:no-repeat!important;background-position:center!important;background-color:#211329!important}
 .ap121-banner{background-size:contain!important;background-repeat:no-repeat!important;background-position:center!important;background-color:#211329!important}
 @media(max-width:760px){.ap-v129-year-tabs,.ap-v129-domain-tabs{flex-wrap:nowrap;overflow-x:auto}.ap-v129-year-btn,.ap-v129-domain-btn{flex:0 0 auto}.ap-v129-summary{grid-template-columns:1fr}.ap-v129-svg{min-width:760px}}
 `;document.head.appendChild(s);
}

function signalsFor(d){try{return typeof window.apV51Signals==='function'?(window.apV51Signals(d,'marque')||[]):[]}catch(e){return []}}
function monthStat(year,month,key){
 const days=[2,6,10,14,18,22,26,28];let net=0,total=0,count=0;
 for(const day of days){
   const arr=signalsFor(new Date(year,month,day));
   for(const x of arr){
     if(!x||x.domain!==key)continue;
     const force=Math.max(.1,Number(x.force||x.strength||0));
     const sign=x.polarite==='difficile'?-1:x.polarite==='positive'?1:0;
     count++;total+=force;net+=sign*force;
   }
 }
 if(!count)return {v:null,count:0,activity:0};
 return {v:total?Math.max(-1,Math.min(1,net/total)):0,count,activity:total};
}
function yearData(year,key){return Array.from({length:12},(_,m)=>({d:new Date(year,m,15),...monthStat(year,m,key)}))}
function graph(rows,dom){
 const W=900,H=370,L=118,R=22,T=28,B=52,PW=W-L-R,PH=H-T-B,x=i=>L+PW*i/11,y=v=>T+((1-v)/2)*PH;
 const levels=[['Très favorable',1],['Favorable',.5],['Stable',0],['Plus délicat',-.5],['Délicat',-1]];
 let out=`<svg class="ap-v129-svg" viewBox="0 0 ${W} ${H}">`;
 for(const [lab,v] of levels){const yy=y(v);out+=`<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" stroke="rgba(255,255,255,.12)"/><text x="${L-12}" y="${yy+4}" text-anchor="end" fill="#daceda" font-size="11">${esc(lab)}</text>`}
 rows.forEach((r,i)=>{const xx=x(i);out+=`<line x1="${xx}" y1="${T}" x2="${xx}" y2="${H-B}" stroke="rgba(255,255,255,.05)"/><text x="${xx}" y="${H-18}" text-anchor="middle" fill="#dfd5df" font-size="11">${esc(mlabel(r.d))}</text>`});
 const marked=rows.map((r,i)=>({...r,i})).filter(r=>r.v!==null);
 if(marked.length>1){const p=marked.map((r,j)=>(j?'L':'M')+x(r.i).toFixed(1)+' '+y(r.v).toFixed(1)).join(' ');out+=`<path d="${p}" fill="none" stroke="${dom.color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`}
 marked.forEach(r=>{const xx=x(r.i),yy=y(r.v),rad=Math.min(8,4+Math.min(4,r.count/2));out+=`<circle cx="${xx}" cy="${yy}" r="${rad}" fill="#1b1226" stroke="${dom.color}" stroke-width="3"><title>${esc(flabel(r.d))} · ${r.count} signal${r.count>1?'s':''}</title></circle>`});
 return out+'</svg>';
}
function summary(rows,dom){
 const marked=rows.filter(r=>r.v!==null);
 if(!marked.length)return `<div class="ap-v129-summary"><article><b>Domaine</b><strong>${esc(dom.label)}</strong></article><article><b>Périodes marquées</b><strong>0</strong></article><article><b>Lecture</b><strong>Aucun signal dominant</strong></article></div>`;
 const best=marked.reduce((a,b)=>b.v>a.v?b:a,marked[0]),low=marked.reduce((a,b)=>b.v<a.v?b:a,marked[0]);
 const varied=Math.abs(best.v-low.v)>.04;
 return `<div class="ap-v129-summary"><article><b>Périodes marquées</b><strong>${marked.length} mois</strong></article><article><b>${varied?'Meilleure période':'Repère principal'}</b><strong>${esc(flabel(best.d))}</strong></article><article><b>${varied?'Période plus délicate':'Domaine'}</b><strong>${varied?esc(flabel(low.d)):esc(dom.label)}</strong></article></div>`;
}
function renderGraph(){
 const card=document.querySelector('#ap121-future .ap121-graph-card');if(!card)return;style();
 const dom=DOMAINS.find(x=>x.key===graphDomain)||DOMAINS[0],rows=yearData(graphYear,dom.key),y0=new Date().getFullYear(),marked=rows.filter(r=>r.v!==null);
 const key=graphYear+'-'+dom.key+'-'+rows.map(r=>r.v===null?'x':r.v.toFixed(2)+':'+r.count).join(',');if(card.dataset.v1291===key)return;card.dataset.v1291=key;
 const visual=marked.length?`<div class="ap-v129-graph-wrap">${graph(rows,dom)}</div>`:`<div class="ap-v129-empty"><strong>Aucune période dominante détectée</strong><span>Le moteur V121 ne fait ressortir aucun signal suffisamment marqué pour ${esc(dom.label)} sur ${graphYear}. Aucun faux tracé stable n’est affiché.</span></div>`;
 card.innerHTML=`<div class="ap121-graph-head"><div><span class="ap121-kicker">Grandes tendances annuelles</span><h2>Vos grandes tendances mois par mois</h2><p>Seuls les mois où la V121 détecte un signal réellement marqué sont tracés. Les mois calmes restent vides.</p></div><button class="ap121-pill" onclick="ap121Open('prev')">Détails</button></div><div class="ap-v129-year-tabs">${[y0,y0+1,y0+2].map(y=>`<button class="ap-v129-year-btn ${y===graphYear?'active':''}" data-y="${y}">${y}</button>`).join('')}</div><div class="ap-v129-domain-tabs">${DOMAINS.map(d=>`<button class="ap-v129-domain-btn ${d.key===dom.key?'active':''}" data-d="${d.key}">${d.label}</button>`).join('')}</div>${visual}${summary(rows,dom)}`;
 card.querySelectorAll('[data-y]').forEach(b=>b.onclick=()=>{graphYear=Number(b.dataset.y)||y0;card.dataset.v1291='';renderGraph()});
 card.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{graphDomain=b.dataset.d;card.dataset.v1291='';renderGraph()});
}

function fixStory(){document.querySelectorAll('#ap121-future .ap121-feature').forEach(c=>{if(/avenir racont/i.test(c.textContent||'')||String(c.getAttribute('onclick')||'').includes('story'))c.style.setProperty('display','none','important')});const s=document.getElementById('ap121-story');if(s)s.style.setProperty('display','none','important')}
function fixImages(){style();document.querySelectorAll('.ap121-feature .pic').forEach(x=>{x.style.backgroundSize='contain';x.style.backgroundRepeat='no-repeat';x.style.backgroundPosition='center'})}
function run(){renderGraph();fixStory();fixImages()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(run,40)}).observe(document.documentElement,{childList:true,subtree:true});setInterval(run,1200);
})();
