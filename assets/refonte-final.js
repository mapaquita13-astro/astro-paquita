/* Astro Paquita — V128.8
   Couche d'interface uniquement. Le moteur astrologique V121 n'est pas modifié. */
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

function lang(){return String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2)}
function locale(){return ({fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'})[lang()]||'fr-FR'}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function mlabel(d){return new Intl.DateTimeFormat(locale(),{month:'short'}).format(d).replace('.','')}
function flabel(d){return new Intl.DateTimeFormat(locale(),{month:'long',year:'numeric'}).format(d)}

function installStyle(){
 if(document.getElementById('ap-v1288-style'))return;
 const s=document.createElement('style');s.id='ap-v1288-style';s.textContent=`
 .ap-v128-year-tabs,.ap-v128-domain-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
 .ap-v128-year-btn,.ap-v128-domain-btn{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#f3ebf3;border-radius:999px;padding:9px 15px;font-weight:700;cursor:pointer}
 .ap-v128-year-btn.active,.ap-v128-domain-btn.active{background:#6f2f63;color:#fff;border-color:#d8bc81;box-shadow:0 6px 18px rgba(0,0,0,.18)}
 .ap-v128-graph-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
 .ap-v128-graph-svg{display:block;width:100%;min-width:720px;height:auto}
 .ap-v128-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}
 .ap-v128-summary article{border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.07);border-radius:14px;padding:12px;color:#f4eaf3}
 .ap-v128-summary b{display:block;color:#d8bc81;font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}.ap-v128-summary strong{font:600 21px/1.1 'Cormorant Garamond',Georgia,serif}
 .ap121-feature .pic{background-size:contain!important;background-repeat:no-repeat!important;background-position:center!important;background-color:#211329!important}
 .ap121-hero{position:relative!important;isolation:isolate}.ap121-hero:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(31,12,30,.88),rgba(36,14,34,.60) 44%,rgba(25,10,25,.08) 78%);z-index:-1;pointer-events:none}
 .ap121-banner{background-size:contain!important;background-repeat:no-repeat!important;background-position:center!important;background-color:#211329!important}
 @media(max-width:760px){.ap-v128-year-tabs,.ap-v128-domain-tabs{flex-wrap:nowrap;overflow-x:auto}.ap-v128-year-btn,.ap-v128-domain-btn{flex:0 0 auto}.ap-v128-summary{grid-template-columns:1fr}.ap-v128-graph-svg{min-width:760px}}
 `;document.head.appendChild(s);
}

function signalsFor(d){
 try{
   if(typeof apV51Signals==='function')return apV51Signals(d,'faible')||[];
   if(typeof window.apV51Signals==='function')return window.apV51Signals(d,'faible')||[];
 }catch(e){}
 return [];
}
function monthScore(year,month,key){
 const days=[5,12,19,26];let net=0,weight=0,seen=0;
 for(const day of days){
   const arr=signalsFor(new Date(year,month,day));
   for(const x of arr){
     if(!x||x.domain!==key)continue;
     const f=Math.max(.4,Number(x.force||x.strength||0));
     const sign=x.polarite==='difficile'?-1:x.polarite==='positive'?1:0;
     if(!sign)continue;
     net+=sign*f;weight+=f;seen++;
   }
 }
 if(!seen||!weight)return 0;
 const balance=net/weight;
 const presence=Math.min(1,.35+seen/6);
 return Math.max(-1,Math.min(1,balance*presence));
}
function yearData(year,key){return Array.from({length:12},(_,m)=>({d:new Date(year,m,15),v:monthScore(year,m,key)}))}
function svg(rows,dom){
 const W=900,H=370,L=118,R=22,T=28,B=52,PW=W-L-R,PH=H-T-B;
 const x=i=>L+PW*i/11,y=v=>T+((1-v)/2)*PH;
 const levels=[['Très favorable',1],['Favorable',.5],['Stable',0],['Plus délicat',-.5],['Délicat',-1]];
 let out=`<svg class="ap-v128-graph-svg" viewBox="0 0 ${W} ${H}">`;
 for(const [lab,v] of levels){const yy=y(v);out+=`<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" stroke="rgba(255,255,255,.12)"/><text x="${L-12}" y="${yy+4}" text-anchor="end" fill="#daceda" font-size="11">${esc(lab)}</text>`}
 rows.forEach((r,i)=>{const xx=x(i);out+=`<line x1="${xx}" y1="${T}" x2="${xx}" y2="${H-B}" stroke="rgba(255,255,255,.05)"/><text x="${xx}" y="${H-18}" text-anchor="middle" fill="#dfd5df" font-size="11">${esc(mlabel(r.d))}</text>`});
 const pts=rows.map((r,i)=>[x(i),y(r.v)]),path=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
 out+=`<path d="${path}" fill="none" stroke="${dom.color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
 pts.forEach((p,i)=>{out+=`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#1b1226" stroke="${dom.color}" stroke-width="3"><title>${esc(flabel(rows[i].d))}</title></circle>`});
 return out+'</svg>';
}
function summary(rows,dom){
 const best=rows.reduce((a,b)=>b.v>a.v?b:a,rows[0]),low=rows.reduce((a,b)=>b.v<a.v?b:a,rows[0]);
 return `<div class="ap-v128-summary"><article><b>Meilleure période</b><strong>${esc(flabel(best.d))}</strong></article><article><b>Période plus délicate</b><strong>${esc(flabel(low.d))}</strong></article><article><b>Domaine</b><strong>${esc(dom.label)}</strong></article></div>`;
}
function renderGraph(){
 const card=document.querySelector('#ap121-future .ap121-graph-card');if(!card)return;
 installStyle();
 const dom=DOMAINS.find(x=>x.key===graphDomain)||DOMAINS[0],rows=yearData(graphYear,dom.key),y0=new Date().getFullYear();
 const key=graphYear+'-'+dom.key+'-'+rows.map(x=>x.v.toFixed(2)).join(',');if(card.dataset.v1288===key)return;card.dataset.v1288=key;
 card.innerHTML=`<div class="ap121-graph-head"><div><span class="ap121-kicker">Grandes tendances annuelles</span><h2>Vos grandes tendances mois par mois</h2><p>Choisissez une année et un domaine. Les courbes utilisent plusieurs lectures V121 dans chaque mois afin de ne pas aplatir une période sur une seule date.</p></div><button class="ap121-pill" onclick="ap121Open('prev')">Détails</button></div><div class="ap-v128-year-tabs">${[y0,y0+1,y0+2].map(y=>`<button class="ap-v128-year-btn ${y===graphYear?'active':''}" data-y="${y}">${y}</button>`).join('')}</div><div class="ap-v128-domain-tabs">${DOMAINS.map(d=>`<button class="ap-v128-domain-btn ${d.key===dom.key?'active':''}" data-d="${d.key}">${d.label}</button>`).join('')}</div><div class="ap-v128-graph-wrap">${svg(rows,dom)}</div>${summary(rows,dom)}`;
 card.querySelectorAll('[data-y]').forEach(b=>b.onclick=()=>{graphYear=Number(b.dataset.y)||y0;card.dataset.v1288='';renderGraph()});
 card.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{graphDomain=b.dataset.d;card.dataset.v1288='';renderGraph()});
}

function fixStory(){
 document.querySelectorAll('#ap121-future .ap121-feature').forEach(c=>{if(/avenir racont/i.test(c.textContent||'')||String(c.getAttribute('onclick')||'').includes("story"))c.style.setProperty('display','none','important')});
 const s=document.getElementById('ap121-story');if(s)s.style.setProperty('display','none','important');
}
function fixLanguage(){
 document.querySelectorAll('select').forEach(sel=>{
   const vals=[...sel.options].map(o=>String(o.value||'').toLowerCase());
   const isLang=sel.classList.contains('ap-lang-select')||(vals.includes('fr')&&vals.includes('en')&&(vals.includes('es')||vals.includes('ar')));
   if(!isLang||sel.dataset.v128lang)return;sel.dataset.v128lang='1';
   const cur=lang();if(vals.includes(cur))sel.value=cur;
   sel.addEventListener('change',function(){const code=String(this.value||'').toLowerCase().slice(0,2);if(!['fr','en','es','ar'].includes(code))return;localStorage.setItem('astro-lang',code);try{if(typeof window.apSetLang==='function')window.apSetLang(code,true)}catch(e){};document.documentElement.lang=code;document.documentElement.dir=code==='ar'?'rtl':'ltr';setTimeout(()=>{try{if(typeof window.apStaticTranslate==='function')window.apStaticTranslate(document)}catch(e){}},30)});
 });
}
function fixImages(){installStyle();document.querySelectorAll('.ap121-feature .pic').forEach(x=>{x.style.backgroundSize='contain';x.style.backgroundRepeat='no-repeat';x.style.backgroundPosition='center'});}
function fixTimingText(){document.querySelectorAll('h1,h2,h3').forEach(el=>{if(el.textContent.trim()==='Comparer plusieurs périodes')el.textContent='Comparer jusqu’à 4 dates'});}
function run(){renderGraph();fixStory();fixLanguage();fixImages();fixTimingText();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(run,20)}).observe(document.documentElement,{childList:true,subtree:true});
setInterval(run,1200);
})();
