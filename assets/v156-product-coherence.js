/* Astro Paquita — V156 cohérence produit.
   Présentation et restitution uniquement : aucun calcul astrologique, score, date, transit, maison ou aspect n'est modifié. */
(function(){
'use strict';
if(window.__AP_V156_PRODUCT_COHERENCE__)return;
window.__AP_V156_PRODUCT_COHERENCE__=true;

const COPY={
 fr:{
  futureTitle:'Votre avenir en un coup d’œil',futureSub:'Les informations déjà calculées pour votre profil, réunies au même endroit.',
  current:'Ce qui ressort',best:'Période la plus porteuse',watch:'Période plus délicate',next:'Prochain temps fort',explore:'Explorer mes analyses',
  noNext:'Ouvrez les temps forts des 24 prochains mois pour afficher ici votre prochaine grande fenêtre.',
  method:'Comprendre la méthode',methodIntro:'Analyse construite à partir de plusieurs méthodes astrologiques et des données réellement disponibles pour votre profil.',
  methodBody:'Astro Paquita distingue le calcul astrologique, son interprétation et les manifestations possibles. Une convergence renforce un signal astrologique, mais ne constitue ni une probabilité statistique ni la certitude qu’un événement précis se produira. Les exemples sont adaptés uniquement aux éléments de contexte explicitement disponibles.',
  print:'Imprimer / enregistrer en PDF',printTitle:'Rapport Astro Paquita',
  role:'Comment lire ce rapport',roleBody:'Commencez par la synthèse, puis approfondissez les périodes ou thèmes qui vous concernent. Les explications techniques restent secondaires et servent seulement à comprendre pourquoi un signal ressort.',
  details:'Voir l’analyse',unknown:'À découvrir dans le rapport',
 },
 en:{
  futureTitle:'Your future at a glance',futureSub:'The information already calculated for your profile, brought together in one place.',
  current:'What stands out',best:'Most supportive period',watch:'More delicate period',next:'Next key period',explore:'Explore my analyses',
  noNext:'Open the next 24 months report to display your next major window here.',
  method:'Understand the method',methodIntro:'Analysis built from several astrological methods and the data actually available for your profile.',
  methodBody:'Astro Paquita separates astrological calculation, interpretation and possible manifestations. Convergence strengthens an astrological signal, but is neither a statistical probability nor a guarantee that a specific event will occur. Examples are adapted only to explicitly available context.',
  print:'Print / save as PDF',printTitle:'Astro Paquita report',role:'How to read this report',roleBody:'Start with the summary, then explore the periods or themes that matter to you. Technical explanations remain secondary and only explain why a signal stands out.',details:'View analysis',unknown:'Discover in the report'
 },
 es:{
  futureTitle:'Tu futuro de un vistazo',futureSub:'La información ya calculada para tu perfil, reunida en un solo lugar.',
  current:'Lo que destaca',best:'Período más favorable',watch:'Período más delicado',next:'Próximo período clave',explore:'Explorar mis análisis',
  noNext:'Abre el informe de los próximos 24 meses para mostrar aquí tu próxima gran ventana.',
  method:'Comprender el método',methodIntro:'Análisis construido a partir de varios métodos astrológicos y de los datos realmente disponibles para tu perfil.',
  methodBody:'Astro Paquita separa el cálculo astrológico, su interpretación y las posibles manifestaciones. Una convergencia refuerza una señal astrológica, pero no es una probabilidad estadística ni garantiza que ocurra un acontecimiento concreto. Los ejemplos se adaptan únicamente al contexto explícitamente disponible.',
  print:'Imprimir / guardar en PDF',printTitle:'Informe Astro Paquita',role:'Cómo leer este informe',roleBody:'Empieza por la síntesis y después profundiza en los períodos o temas que te interesen. Las explicaciones técnicas son secundarias y solo sirven para comprender por qué destaca una señal.',details:'Ver análisis',unknown:'Descubrir en el informe'
 },
 ar:{
  futureTitle:'مستقبلك بنظرة واحدة',futureSub:'المعلومات المحسوبة بالفعل لملفك، مجمعة في مكان واحد.',
  current:'ما يبرز الآن',best:'الفترة الأكثر دعمًا',watch:'الفترة الأكثر حساسية',next:'الفترة المهمة التالية',explore:'استكشف تحليلاتي',
  noNext:'افتح تقرير الأشهر الـ24 المقبلة لعرض نافذتك المهمة التالية هنا.',
  method:'فهم المنهج',methodIntro:'تحليل مبني على عدة طرق فلكية وعلى البيانات المتاحة فعليًا لملفك.',
  methodBody:'يفصل Astro Paquita بين الحساب الفلكي والتفسير والمظاهر الممكنة. تقارب الإشارات يعزز الدلالة الفلكية، لكنه ليس احتمالًا إحصائيًا ولا ضمانًا لوقوع حدث محدد. ولا تُكيَّف الأمثلة إلا مع السياق المتاح صراحة.',
  print:'طباعة / حفظ PDF',printTitle:'تقرير Astro Paquita',role:'كيف تقرأ هذا التقرير',roleBody:'ابدأ بالخلاصة ثم تعمق في الفترات أو الموضوعات التي تهمك. تبقى التفسيرات التقنية ثانوية وهدفها فقط توضيح سبب بروز الإشارة.',details:'عرض التحليل',unknown:'يظهر داخل التقرير'
 }
};
function lang(){const l=String(window.AP_LANG||localStorage.getItem('astro-lang')||document.documentElement.lang||'fr').toLowerCase().slice(0,2);return COPY[l]?l:'fr'}
function tx(k){return COPY[lang()][k]||COPY.fr[k]||k}
function clean(v){return String(v||'').replace(/\s+/g,' ').trim()}
function norm(v){return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function installStyle(){
 if(document.getElementById('ap-v156-style'))return;
 const s=document.createElement('style');s.id='ap-v156-style';s.textContent=`
 :root{--ap156-plum:#3f2340;--ap156-plum2:#24162c;--ap156-gold:#d7b46e;--ap156-cream:#fff9f1;--ap156-ink:#473448;--ap156-muted:#786778}
 .ap-v156-dashboard{margin:18px 0 26px;padding:22px;border-radius:26px;background:linear-gradient(145deg,#25162e,#4b2749);color:#fff8f0;box-shadow:0 20px 45px rgba(38,20,42,.18);overflow:hidden}
 .ap-v156-dashboard-head{display:flex;justify-content:space-between;align-items:flex-start;gap:18px}.ap-v156-dashboard-kicker{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ap156-gold);font-weight:800}.ap-v156-dashboard h2{margin:5px 0 7px;font:600 34px/1.03 'Cormorant Garamond',Georgia,serif;color:#fff9f1}.ap-v156-dashboard-head p{margin:0;color:#dccfdd;font-size:13px;line-height:1.5;max-width:650px}
 .ap-v156-dash-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin-top:18px}.ap-v156-dash-card{min-height:112px;padding:15px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.075);border-radius:18px}.ap-v156-dash-card b{display:block;color:#d9ba78;font-size:10px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px}.ap-v156-dash-card strong{display:block;color:#fff8ef;font:600 20px/1.15 'Cormorant Garamond',Georgia,serif}.ap-v156-dash-card small{display:block;color:#cdbfce;font-size:11px;line-height:1.35;margin-top:6px}
 .ap-v156-shortcuts{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.ap-v156-shortcut{border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);color:#fff8f0;border-radius:999px;padding:9px 13px;font-weight:800;font-size:11px;cursor:pointer}.ap-v156-shortcut:hover{background:rgba(255,255,255,.13)}
 .ap-v156-report-shell{position:relative;max-width:980px;margin-left:auto!important;margin-right:auto!important;line-height:1.62}.ap-v156-report-shell h1,.ap-v156-report-shell h2,.ap-v156-report-shell h3{letter-spacing:-.01em}.ap-v156-report-shell h2{margin-top:30px}.ap-v156-report-shell p{max-width:78ch}.ap-v156-report-shell>p+ p{margin-top:12px}.ap-v156-report-shell ul,.ap-v156-report-shell ol{padding-left:22px}.ap-v156-report-shell li{margin:7px 0}
 .ap-v156-report-tools{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 20px}.ap-v156-tool{border:1px solid rgba(75,45,72,.16);background:#f7ede6;color:#4c3048;border-radius:999px;padding:9px 13px;font-size:11px;font-weight:800;cursor:pointer}.ap-v156-tool:hover{background:#efe0d6}
 .ap-v156-method{margin:16px 0;padding:0;border:1px solid rgba(79,49,76,.14);background:linear-gradient(145deg,#fbf3ec,#f4e9f2);border-radius:18px;overflow:hidden}.ap-v156-method summary{cursor:pointer;list-style:none;padding:14px 16px;font-weight:800;color:#50334e}.ap-v156-method summary::-webkit-details-marker{display:none}.ap-v156-method summary:after{content:'+';float:right;color:#936f50;font-size:18px}.ap-v156-method[open] summary:after{content:'−'}.ap-v156-method-body{padding:0 16px 15px;color:#6c596b;font-size:12px;line-height:1.55}.ap-v156-method-body b{display:block;color:#8a6549;margin-bottom:5px}
 .ap-v156-reading-note{margin:14px 0;padding:14px 16px;border-left:3px solid var(--ap156-gold);background:#fbf3eb;border-radius:0 14px 14px 0;color:#665366;font-size:12px;line-height:1.5}.ap-v156-reading-note b{display:block;color:#493047;margin-bottom:4px}
 .ap-v156-print-cover{display:none}.ap-v156-tech-hidden{opacity:.92}
 body{overflow-x:hidden}.ap-v154-report,.ap-v154-sheet,.ap-v156-report-shell{overflow-wrap:anywhere}.ap-v154-domain,.ap-v153-legend-item{min-width:0}
 @media(max-width:760px){
   .ap-v156-dashboard{padding:18px;border-radius:20px;margin:14px 0 20px}.ap-v156-dashboard h2{font-size:29px}.ap-v156-dashboard-head{display:block}.ap-v156-dash-grid{grid-template-columns:1fr}.ap-v156-dash-card{min-height:0}.ap-v156-shortcuts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.ap-v156-shortcut{white-space:normal;text-align:center;min-height:42px}
   .ap-v156-report-shell{width:100%!important;max-width:100%!important;padding-left:0!important;padding-right:0!important}.ap-v156-report-shell p{max-width:none}.ap-v156-report-tools{display:grid;grid-template-columns:1fr 1fr}.ap-v156-tool{white-space:normal;min-height:42px}
   .ap-v154-stat-grid{grid-template-columns:1fr 1fr!important}.ap-v154-tech{grid-template-columns:1fr!important}.ap-v154-sheet{width:100%!important;max-width:100%!important}.ap-v130-domain-tabs{max-width:100%;overflow-x:auto}
 }
 @media(max-width:390px){.ap-v156-shortcuts,.ap-v156-report-tools{grid-template-columns:1fr}.ap-v154-stat-grid{grid-template-columns:1fr!important}}
 @media print{
   @page{size:A4;margin:15mm 14mm 16mm}
   body.ap-v156-printing{background:#fff!important;color:#241a25!important}
   body.ap-v156-printing>*{visibility:hidden!important}
   body.ap-v156-printing .ap-v156-print-target,body.ap-v156-printing .ap-v156-print-target *{visibility:visible!important}
   body.ap-v156-printing .ap-v156-print-target{position:absolute!important;left:0!important;top:0!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important;background:#fff!important;color:#241a25!important;box-shadow:none!important}
   .ap-v156-print-target .ap-v156-report-tools,.ap-v156-print-target button,.ap-v156-print-target .ap121-module-back{display:none!important}
   .ap-v156-print-target .ap-v156-print-cover{display:block!important;border-bottom:2px solid #d7b46e;padding:0 0 18px;margin:0 0 22px}.ap-v156-print-cover small{display:block;text-transform:uppercase;letter-spacing:.12em;color:#936f50;font-weight:700}.ap-v156-print-cover h1{font:600 28pt/1.05 Georgia,serif;color:#3f2340;margin:8px 0 5px}.ap-v156-print-cover p{color:#6e5b6c;margin:0}
   .ap-v156-print-target .ap-v156-method{border:1px solid #ddd;background:#fff}.ap-v156-print-target .ap-v156-method-body{display:block!important}.ap-v156-print-target details{display:block!important}.ap-v156-print-target details>*{display:block!important}.ap-v156-print-target summary{font-weight:700}
   .ap-v156-print-target h2,.ap-v156-print-target h3,.ap-v154-item,.ap-v154-stat,.ap-v156-reading-note{break-inside:avoid}.ap-v154-sheet-head,.ap-v154-quick{background:#fff!important;color:#241a25!important;border:1px solid #ded4ca!important}.ap-v154-quick *,.ap-v154-sheet-head *{color:#241a25!important}.ap-v154-item{box-shadow:none!important}
   .ap-v156-print-target a{text-decoration:none;color:inherit}.ap-v156-print-target{font-size:10.5pt;line-height:1.45}
 }
 `;(document.head||document.documentElement).appendChild(s)
}

function profileLabel(){
 const candidates=['#ap100-mobile-profile-name','#ap100-profile-name','.ap121-profile-name','[data-active-profile-name]'];
 for(const sel of candidates){const el=document.querySelector(sel);const t=clean(el&&el.textContent);if(t&&!/créer|create|ajouter|add|profil/i.test(t))return t}
 try{if(window.USER&&clean(USER.prenom))return clean(USER.prenom)}catch(e){}
 return '';
}
function graphSnapshot(){
 const card=document.querySelector('#ap121-future .ap121-graph-card');if(!card)return null;
 const domain=clean(card.querySelector('.ap-v130-domain-btn.active')?.textContent||card.querySelector('.ap-v153-domain-head h3')?.textContent||'');
 const arts=[...card.querySelectorAll('.ap-v130-summary article,.ap-v153-summary article')];
 let best='',low='';
 arts.forEach(a=>{const label=norm(a.querySelector('b')?.textContent);const val=clean(a.querySelector('strong')?.textContent);if(!val)return;if(label.includes('meilleure')||label.includes('best')||label.includes('mejor')||label.includes('porteuse'))best=val;if(label.includes('delicat')||label.includes('delicate')||label.includes('delicado')||label.includes('vigil'))low=val});
 return {domain,best,low};
}
function nextEventSnapshot(){
 const item=document.querySelector('.ap-v154-report .ap-v154-item');if(!item)return null;
 const date=clean(item.querySelector('.ap-v154-date')?.textContent);const domains=[...item.querySelectorAll('.ap-v154-domain')].map(x=>clean(x.textContent)).filter(Boolean);const badge=clean(item.querySelector('.ap-v154-badge')?.textContent);
 return date?{date,domains,badge}:null;
}
function originalFutureCards(){
 const root=document.getElementById('ap121-future');if(!root)return[];
 return [...root.querySelectorAll('.ap121-feature')].filter(el=>{if(el.closest('.ap-v156-dashboard'))return false;const t=norm(el.textContent);return !t.includes('avenir raconte')&&!t.includes('future story')&&getComputedStyle(el).display!=='none'}).slice(0,6)
}
function cardLabel(card){return clean(card.querySelector('h3,h2,strong')?.textContent||card.textContent).slice(0,70)}
function renderDashboard(){
 const root=document.getElementById('ap121-future');if(!root)return;
 let box=document.getElementById('ap-v156-dashboard');if(!box){box=document.createElement('section');box.id='ap-v156-dashboard';box.className='ap-v156-dashboard';const anchor=root.querySelector('.ap121-graph-card,.ap121-card-grid,.ap121-feature');if(anchor)anchor.before(box);else root.prepend(box)}
 const g=graphSnapshot(),ev=nextEventSnapshot(),name=profileLabel();
 const cards=originalFutureCards();
 const current=g&&g.domain?g.domain:tx('unknown');
 const best=g&&g.best?g.best:tx('unknown');const low=g&&g.low?g.low:tx('unknown');
 box.innerHTML=`<div class="ap-v156-dashboard-head"><div><div class="ap-v156-dashboard-kicker">Astro Paquita</div><h2>${esc(name?name+' · '+tx('futureTitle'):tx('futureTitle'))}</h2><p>${esc(tx('futureSub'))}</p></div></div><div class="ap-v156-dash-grid"><div class="ap-v156-dash-card"><b>${esc(tx('current'))}</b><strong>${esc(current)}</strong><small>${g&&g.domain?esc(tx('roleBody')):''}</small></div><div class="ap-v156-dash-card"><b>${esc(tx('best'))}</b><strong>${esc(best)}</strong><small>${g&&g.domain?esc(g.domain):''}</small></div><div class="ap-v156-dash-card"><b>${esc(ev?tx('next'):tx('watch'))}</b><strong>${esc(ev?ev.date:low)}</strong><small>${esc(ev?(ev.domains.join(' · ')||ev.badge):(g&&g.domain?g.domain:tx('noNext')))}</small></div></div><div class="ap-v156-shortcuts" aria-label="${esc(tx('explore'))}"></div>`;
 const shortcuts=box.querySelector('.ap-v156-shortcuts');cards.forEach(card=>{const label=cardLabel(card);if(!label)return;const b=document.createElement('button');b.type='button';b.className='ap-v156-shortcut';b.textContent=label;b.onclick=()=>card.click();shortcuts.appendChild(b)});
}

function reportCandidates(){
 const scope=document.querySelector('#section-modules')||document.body;
 const selectors=['.ap-v154-report','.ap-v154-sheet-body','[id*="result"]','[class*="result"]','[id*="rapport"]','[class*="rapport"]','[class*="response"]','[class*="reponse"]','[class*="output"]'];
 const els=[...new Set(selectors.flatMap(s=>[...scope.querySelectorAll(s)]))];
 return els.filter(el=>{if(el.closest('script,style,form,.ap-v156-dashboard'))return false;const t=clean(el.innerText);return t.length>650&&el.querySelector('h1,h2,h3,h4,strong,b')});
}
function ensurePrintCover(shell){
 if(shell.querySelector(':scope > .ap-v156-print-cover'))return;
 const c=document.createElement('div');c.className='ap-v156-print-cover';const title=clean(shell.querySelector('h1,h2')?.textContent)||tx('printTitle');const name=profileLabel();const date=new Intl.DateTimeFormat(lang()==='fr'?'fr-FR':lang()==='es'?'es-ES':lang()==='ar'?'ar':'en-GB',{dateStyle:'long'}).format(new Date());c.innerHTML=`<small>Astro Paquita</small><h1>${esc(title)}</h1><p>${esc([name,date].filter(Boolean).join(' · '))}</p>`;shell.prepend(c)
}
function printShell(shell){
 document.querySelectorAll('.ap-v156-print-target').forEach(x=>x.classList.remove('ap-v156-print-target'));shell.classList.add('ap-v156-print-target');document.body.classList.add('ap-v156-printing');const done=()=>{document.body.classList.remove('ap-v156-printing');shell.classList.remove('ap-v156-print-target');window.removeEventListener('afterprint',done)};window.addEventListener('afterprint',done);setTimeout(()=>window.print(),30);setTimeout(done,3000)
}
function ensureReportTools(shell){
 if(shell.dataset.apV156Ready==='1')return;shell.dataset.apV156Ready='1';shell.classList.add('ap-v156-report-shell');ensurePrintCover(shell);
 const tools=document.createElement('div');tools.className='ap-v156-report-tools';
 const methodBtn=document.createElement('button');methodBtn.type='button';methodBtn.className='ap-v156-tool';methodBtn.textContent='ⓘ '+tx('method');
 const printBtn=document.createElement('button');printBtn.type='button';printBtn.className='ap-v156-tool';printBtn.textContent='⇩ '+tx('print');
 tools.append(methodBtn,printBtn);const first=shell.querySelector('h1,h2,h3')||shell.firstElementChild;if(first)first.after(tools);else shell.prepend(tools);
 let details=document.createElement('details');details.className='ap-v156-method';details.innerHTML=`<summary>${esc(tx('method'))}</summary><div class="ap-v156-method-body"><b>${esc(tx('methodIntro'))}</b>${esc(tx('methodBody'))}</div>`;tools.after(details);methodBtn.onclick=()=>{details.open=!details.open;if(details.open)details.scrollIntoView({behavior:'smooth',block:'nearest'})};printBtn.onclick=()=>printShell(shell);
 const note=document.createElement('div');note.className='ap-v156-reading-note';note.innerHTML=`<b>${esc(tx('role'))}</b>${esc(tx('roleBody'))}`;details.after(note)
}
function editorializeReports(){reportCandidates().forEach(ensureReportTools)}

const TERMS=[
 [/Meilleure journée de l[’']année/gi,'Pic de convergence de l’année'],
 [/Vigilance maximale de l[’']année/gi,'Pic de vigilance de l’année'],
 [/Ce qui est le plus susceptible de se produire/gi,'Manifestations possibles'],
 [/Scénario principal/gi,'Manifestations possibles'],
 [/Autre possibilité/gi,'Autre manifestation possible']
];
function normalizeTerms(root=document.body){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];let n;while((n=w.nextNode()))nodes.push(n);nodes.forEach(node=>{const p=node.parentElement;if(!p||p.closest('script,style,noscript,textarea,pre,code,input,select'))return;let v=node.nodeValue||'',old=v;TERMS.forEach(([re,to])=>v=v.replace(re,to));if(v!==old)node.nodeValue=v})}

function run(){installStyle();renderDashboard();editorializeReports();normalizeTerms()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(run,180)}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
setTimeout(run,600);setTimeout(run,1600);setInterval(run,5000);
})();