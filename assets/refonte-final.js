/* Astro Paquita — V130 AUDIT
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

function lang(){return String(window.AP_LANG||localStorage.getItem('astro-lang')||'fr').toLowerCase().slice(0,2)}
function locale(){return ({fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'})[lang()]||'fr-FR'}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function mlabel(d){return new Intl.DateTimeFormat(locale(),{month:'short'}).format(d).replace('.','')}
function flabel(d){return new Intl.DateTimeFormat(locale(),{month:'long',year:'numeric'}).format(d)}

function style(){
 if(document.getElementById('ap-v130-style'))return;
 const s=document.createElement('style');s.id='ap-v130-style';s.textContent=`
 .ap-v130-year-tabs,.ap-v130-domain-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
 .ap-v130-year-btn,.ap-v130-domain-btn{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#f3ebf3;border-radius:999px;padding:9px 15px;font-weight:700;cursor:pointer}
 .ap-v130-year-btn.active,.ap-v130-domain-btn.active{background:#6f2f63;color:#fff;border-color:#d8bc81;box-shadow:0 6px 18px rgba(0,0,0,.18)}
 .ap-v130-graph-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}.ap-v130-svg{display:block;width:100%;min-width:720px;height:auto}
 .ap-v130-empty{margin:22px 0 8px;padding:26px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.055);border-radius:18px;text-align:center;color:#f3eaf3}.ap-v130-empty strong{display:block;font:600 27px/1.1 'Cormorant Garamond',Georgia,serif;margin-bottom:8px}.ap-v130-empty span{color:#d4c8d5;font-size:13px;line-height:1.5}
 .ap-v130-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}.ap-v130-summary article{border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.07);border-radius:14px;padding:12px;color:#f4eaf3}.ap-v130-summary b{display:block;color:#d8bc81;font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}.ap-v130-summary strong{font:600 21px/1.1 'Cormorant Garamond',Georgia,serif}
 .ap121-feature .pic,.ap121-banner{background-size:cover!important;background-repeat:no-repeat!important;background-position:center!important;background-color:#211329!important}
 #ap100-lang{max-width:none!important;width:auto!important;min-width:62px!important}
 .ap-v130-lang-pop{position:fixed;z-index:999999;display:none;min-width:170px;padding:7px;background:#fffaf2;border:1px solid rgba(78,38,67,.18);border-radius:15px;box-shadow:0 18px 46px rgba(50,20,45,.24)}
 .ap-v130-lang-pop.open{display:grid;gap:3px}.ap-v130-lang-pop button{border:0;background:transparent;color:#42183d;border-radius:10px;padding:10px 12px;text-align:left;font:700 13px/1.2 Lato,sans-serif;cursor:pointer}.ap-v130-lang-pop button:hover,.ap-v130-lang-pop button.active{background:#efe2ed}
 #mod-question{display:block}
 #ap100-compare-date-btn{display:none!important}
 @media(max-width:760px){.ap-v130-year-tabs,.ap-v130-domain-tabs{flex-wrap:nowrap;overflow-x:auto}.ap-v130-year-btn,.ap-v130-domain-btn{flex:0 0 auto}.ap-v130-summary{grid-template-columns:1fr}.ap-v130-svg{min-width:760px}}
 `;document.head.appendChild(s);
}

function rawRowsFor(d){
 try{
   if(typeof analyserExceptionnelsTousDomainesV51==='function'&&typeof USER!=='undefined'&&USER&&USER.pos){
     const jd=typeof apJDFromDate==='function'?apJDFromDate(d):(typeof julianDay==='function'?julianDay(d.getFullYear(),d.getMonth()+1,d.getDate(),12):null);
     if(jd!=null)return analyserExceptionnelsTousDomainesV51(jd,USER.pos,USER.AS,USER.MC,USER.jd,'general')||[];
   }
 }catch(e){}
 try{return typeof window.apV51Signals==='function'?(window.apV51Signals(d,'marque')||[]):[]}catch(e){return []}
}
function monthStat(year,month,key){
 const days=[2,5,8,11,14,17,20,23,26,28];let pos=0,neg=0,mix=0,count=0,totalForce=0;
 const levelWeight={faible:.55,marque:.72,fort:.88,exceptionnel:1};
 for(const day of days){
   const arr=rawRowsFor(new Date(year,month,day));
   for(const x of arr){
     if(!x||x.domain!==key)continue;
     const force=Math.max(.05,Number(x.force||x.strength||0));
     const w=levelWeight[x.niveau]||.55;const value=force*w;
     count++;totalForce+=value;
     if(x.polarite==='positive')pos+=value;else if(x.polarite==='difficile')neg+=value;else mix+=value;
   }
 }
 if(!count)return {v:null,count:0,activity:0};
 const signed=pos+neg;
 if(!signed)return {v:0,count,activity:totalForce};
 const balance=(pos-neg)/Math.max(.01,signed+mix*.35);
 const avg=totalForce/count;
 const magnitude=Math.max(.18,Math.min(1,avg/5.5));
 return {v:Math.max(-1,Math.min(1,balance*magnitude)),count,activity:totalForce};
}
function yearData(year,key){return Array.from({length:12},(_,m)=>({d:new Date(year,m,15),...monthStat(year,m,key)}))}
function graph(rows,dom){
 const W=900,H=370,L=118,R=22,T=28,B=52,PW=W-L-R,PH=H-T-B,x=i=>L+PW*i/11,y=v=>T+((1-v)/2)*PH;
 const levels=[['Très favorable',1],['Favorable',.5],['Stable',0],['Plus délicat',-.5],['Délicat',-1]];
 let out=`<svg class="ap-v130-svg" viewBox="0 0 ${W} ${H}">`;
 for(const [lab,v] of levels){const yy=y(v);out+=`<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" stroke="rgba(255,255,255,.12)"/><text x="${L-12}" y="${yy+4}" text-anchor="end" fill="#daceda" font-size="11">${esc(lab)}</text>`}
 rows.forEach((r,i)=>{const xx=x(i);out+=`<line x1="${xx}" y1="${T}" x2="${xx}" y2="${H-B}" stroke="rgba(255,255,255,.05)"/><text x="${xx}" y="${H-18}" text-anchor="middle" fill="#dfd5df" font-size="11">${esc(mlabel(r.d))}</text>`});
 const points=rows.map((r,i)=>({...r,i})).filter(r=>r.v!==null);
 if(points.length>1){const p=points.map((r,j)=>(j?'L':'M')+x(r.i).toFixed(1)+' '+y(r.v).toFixed(1)).join(' ');out+=`<path d="${p}" fill="none" stroke="${dom.color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`}
 points.forEach(r=>{const xx=x(r.i),yy=y(r.v),rad=Math.min(8,4+Math.min(4,r.count/5));out+=`<circle cx="${xx}" cy="${yy}" r="${rad}" fill="#1b1226" stroke="${dom.color}" stroke-width="3"><title>${esc(flabel(r.d))} · ${r.count} lectures V121</title></circle>`});
 return out+'</svg>';
}
function summary(rows,dom){
 const marked=rows.filter(r=>r.v!==null);
 if(!marked.length)return `<div class="ap-v130-summary"><article><b>Domaine</b><strong>${esc(dom.label)}</strong></article><article><b>Périodes calculées</b><strong>0</strong></article><article><b>Lecture</b><strong>Aucune donnée exploitable</strong></article></div>`;
 const best=marked.reduce((a,b)=>b.v>a.v?b:a,marked[0]),low=marked.reduce((a,b)=>b.v<a.v?b:a,marked[0]);
 const varied=Math.abs(best.v-low.v)>.035;
 return `<div class="ap-v130-summary"><article><b>Domaine</b><strong>${esc(dom.label)}</strong></article><article><b>${varied?'Meilleure période':'Tendance dominante'}</b><strong>${varied?esc(flabel(best.d)):'Stable / mixte'}</strong></article><article><b>${varied?'Période plus délicate':'Lecture'}</b><strong>${varied?esc(flabel(low.d)):'Peu de contraste'}</strong></article></div>`;
}
function renderGraph(){
 const card=document.querySelector('#ap121-future .ap121-graph-card');if(!card)return;style();
 const dom=DOMAINS.find(x=>x.key===graphDomain)||DOMAINS[0],rows=yearData(graphYear,dom.key),y0=new Date().getFullYear(),marked=rows.filter(r=>r.v!==null);
 const key=graphYear+'-'+dom.key+'-'+rows.map(r=>r.v===null?'x':r.v.toFixed(3)+':'+r.count).join(',');if(card.dataset.v130===key)return;card.dataset.v130=key;
 const visual=marked.length?`<div class="ap-v130-graph-wrap">${graph(rows,dom)}</div>`:`<div class="ap-v130-empty"><strong>Aucune tendance exploitable détectée</strong><span>La V121 ne renvoie pas assez de matière pour ce domaine sur ${graphYear}. Aucun tracé artificiel n'est fabriqué.</span></div>`;
 card.innerHTML=`<div class="ap121-graph-head"><div><span class="ap121-kicker">Grandes tendances annuelles</span><h2>Vos grandes tendances mois par mois</h2><p>La courbe utilise les activations V121 réelles de chaque mois, y compris les tendances faibles, sans les transformer en événements.</p></div><button class="ap121-pill" onclick="ap121Open('prev')">Détails</button></div><div class="ap-v130-year-tabs">${[y0,y0+1,y0+2].map(y=>`<button class="ap-v130-year-btn ${y===graphYear?'active':''}" data-y="${y}">${y}</button>`).join('')}</div><div class="ap-v130-domain-tabs">${DOMAINS.map(d=>`<button class="ap-v130-domain-btn ${d.key===dom.key?'active':''}" data-d="${d.key}">${d.label}</button>`).join('')}</div>${visual}${summary(rows,dom)}`;
 card.querySelectorAll('[data-y]').forEach(b=>b.onclick=()=>{graphYear=Number(b.dataset.y)||y0;card.dataset.v130='';renderGraph()});
 card.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{graphDomain=b.dataset.d;card.dataset.v130='';renderGraph()});
}

function setLanguage(code){
 if(!['fr','en','es','ar'].includes(code))return;
 try{if(typeof window.v100SetLang==='function')window.v100SetLang(code);else if(typeof window.apSetLang==='function')window.apSetLang(code,true);else localStorage.setItem('astro-lang',code)}catch(e){}
 setTimeout(()=>{updateLanguageButtons();renderGraph()},40);
}
function languagePop(){let p=document.getElementById('ap-v130-lang-pop');if(p)return p;p=document.createElement('div');p.id='ap-v130-lang-pop';p.className='ap-v130-lang-pop';const names={fr:'Français',en:'English',es:'Español',ar:'العربية'};['fr','en','es','ar'].forEach(code=>{const b=document.createElement('button');b.type='button';b.dataset.lang=code;b.textContent=code.toUpperCase()+' — '+names[code];b.onclick=e=>{e.stopPropagation();setLanguage(code);p.classList.remove('open')};p.appendChild(b)});document.body.appendChild(p);return p}
function updateLanguageButtons(){
 const code=lang();document.querySelectorAll('#ap-v130-lang-pop button').forEach(b=>b.classList.toggle('active',b.dataset.lang===code));
 document.querySelectorAll('.ap121-brand-actions .ap121-pill').forEach(btn=>{if(!/lang-v130/.test(btn.dataset.role||'')){btn.dataset.role='lang-v130';btn.removeAttribute('onclick');btn.onclick=e=>{e.stopPropagation();const p=languagePop();const r=btn.getBoundingClientRect();p.style.top=(r.bottom+7)+'px';p.style.left=Math.max(8,Math.min(window.innerWidth-178,r.right-170))+'px';p.classList.toggle('open')};}btn.textContent=code.toUpperCase()+'⌄'});
 const sel=document.getElementById('ap100-lang');if(sel&&sel.value!==code)sel.value=code;
}

function restoreQuestion(){
 const q=document.getElementById('mod-question');if(q)q.style.removeProperty('display');
 document.querySelectorAll("button[onclick*='question']").forEach(b=>{if(String(b.getAttribute('onclick')||'').includes("irVersModule('question')"))b.style.removeProperty('display')});
}
function removeObsoletePublic(){
 document.getElementById('ap100-compare-date-btn')?.remove();
 document.querySelectorAll('button').forEach(b=>{const t=(b.textContent||'').trim().toLowerCase(),oc=String(b.getAttribute('onclick')||'').toLowerCase();if((t.includes('comparer plusieurs dates')||t.includes('comparer les dates'))&&oc.includes('compare'))b.remove();});
 ['ap-notification-badge','ap-dashboard'].forEach(id=>document.getElementById(id)?.remove());
}
function fixStory(){document.querySelectorAll('#ap121-future .ap121-feature').forEach(c=>{if(/avenir racont/i.test(c.textContent||'')||String(c.getAttribute('onclick')||'').includes('story'))c.style.setProperty('display','none','important')});const s=document.getElementById('ap121-story');if(s)s.style.setProperty('display','none','important')}
function fixImages(){style();document.querySelectorAll('.ap121-feature .pic,.ap121-banner').forEach(x=>{x.style.backgroundSize='cover';x.style.backgroundRepeat='no-repeat';x.style.backgroundPosition='center'})}
function run(){renderGraph();fixStory();fixImages();removeObsoletePublic();restoreQuestion();updateLanguageButtons()}
if(!window.__apV130Outside){window.__apV130Outside=true;document.addEventListener('click',()=>document.getElementById('ap-v130-lang-pop')?.classList.remove('open'))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(run,50)}).observe(document.documentElement,{childList:true,subtree:true});setInterval(run,1400);
})();
