/* Astro Paquita — V132 AUDIT
   Couche d'interface uniquement. Le moteur astrologique V121 n'est pas modifié. */
(function(){
'use strict';

const DOMAINS=[
 {key:'couple',color:'#ef4f86'},
 {key:'work',color:'#3b8eea'},
 {key:'money',color:'#e9a72f'},
 {key:'daily',color:'#27a679'},
 {key:'family',color:'#7b6ed6'},
 {key:'travel',color:'#43b8c8'}
];
const I18N={
 fr:{
  couple:'Amour',work:'Travail',money:'Argent',daily:'Bien-être',family:'Famille',travel:'Voyage',
  very_good:'Très favorable',good:'Favorable',stable:'Stable',less_good:'Plus délicat',difficult:'Délicat',
  domain:'Domaine',periods:'Périodes calculées',reading:'Lecture',no_data:'Aucune donnée exploitable',
  best:'Meilleure période',dominant:'Tendance dominante',low:'Période plus délicate',mixed:'Stable / mixte',low_contrast:'Peu de contraste',
  no_trend:'Aucune tendance exploitable détectée',no_trend_desc:'La V121 ne renvoie pas assez de matière pour ce domaine sur {year}. Aucun tracé artificiel n’est fabriqué.',
  annual:'Grandes tendances annuelles',monthly:'Vos grandes tendances mois par mois',graph_desc:'La courbe utilise les activations V121 réelles de chaque mois, y compris les tendances faibles, sans les transformer en événements.',details:'Détails',readings:'lectures V121',back:'Retour',
  question:'Ma question',question_sub:'Une réponse personnalisée à votre préoccupation.',question_kicker:'Une préoccupation précise',question_card:'Posez une question et obtenez une réponse personnalisée à partir de votre thème et des transits V121.',
  child:'Portrait enfant',child_sub:'Comprendre son potentiel, ses sensibilités et ses forces avec une lecture adaptée à son âge.',child_kicker:'Accompagner avec bienveillance',child_card:'Une lecture du thème natal adaptée à l’âge, centrée sur les forces, sensibilités et besoins d’accompagnement.',child_select:'Ajouter ou sélectionner un profil enfant',years:'ans'
 },
 en:{
  couple:'Love',work:'Work',money:'Money',daily:'Well-being',family:'Family',travel:'Travel',
  very_good:'Very favorable',good:'Favorable',stable:'Stable',less_good:'More delicate',difficult:'Delicate',
  domain:'Area',periods:'Calculated periods',reading:'Reading',no_data:'No usable data',
  best:'Best period',dominant:'Dominant trend',low:'More delicate period',mixed:'Stable / mixed',low_contrast:'Low contrast',
  no_trend:'No usable trend detected',no_trend_desc:'V121 does not return enough material for this area in {year}. No artificial curve is generated.',
  annual:'Annual trends',monthly:'Your month-by-month trends',graph_desc:'The curve uses the real V121 activations for each month, including weaker trends, without turning them into events.',details:'Details',readings:'V121 readings',back:'Back',
  question:'My question',question_sub:'A personalized answer to your concern.',question_kicker:'A specific concern',question_card:'Ask a question and get a personalized answer based on your chart and V121 transits.',
  child:'Child portrait',child_sub:'Understand their potential, sensitivities and strengths through an age-appropriate reading.',child_kicker:'Support with care',child_card:'An age-appropriate natal reading focused on strengths, sensitivities and support needs.',child_select:'Add or select a child profile',years:'years'
 },
 es:{
  couple:'Amor',work:'Trabajo',money:'Dinero',daily:'Bienestar',family:'Familia',travel:'Viajes',
  very_good:'Muy favorable',good:'Favorable',stable:'Estable',less_good:'Más delicado',difficult:'Delicado',
  domain:'Área',periods:'Períodos calculados',reading:'Lectura',no_data:'Sin datos utilizables',
  best:'Mejor período',dominant:'Tendencia dominante',low:'Período más delicado',mixed:'Estable / mixto',low_contrast:'Poco contraste',
  no_trend:'No se detectó una tendencia utilizable',no_trend_desc:'V121 no devuelve suficiente información para esta área en {year}. No se fabrica ninguna curva artificial.',
  annual:'Grandes tendencias anuales',monthly:'Tus tendencias mes a mes',graph_desc:'La curva utiliza las activaciones V121 reales de cada mes, incluidas las tendencias débiles, sin convertirlas en eventos.',details:'Detalles',readings:'lecturas V121',back:'Volver',
  question:'Mi pregunta',question_sub:'Una respuesta personalizada a tu preocupación.',question_kicker:'Una preocupación concreta',question_card:'Haz una pregunta y obtén una respuesta personalizada a partir de tu carta y de los tránsitos V121.',
  child:'Retrato infantil',child_sub:'Comprender su potencial, sensibilidades y fortalezas con una lectura adaptada a su edad.',child_kicker:'Acompañar con atención',child_card:'Una lectura natal adaptada a la edad, centrada en fortalezas, sensibilidades y necesidades de acompañamiento.',child_select:'Añadir o seleccionar un perfil infantil',years:'años'
 },
 ar:{
  couple:'الحب',work:'العمل',money:'المال',daily:'الرفاه',family:'العائلة',travel:'السفر',
  very_good:'ملائم جدًا',good:'ملائم',stable:'مستقر',less_good:'أكثر حساسية',difficult:'حساس',
  domain:'المجال',periods:'الفترات المحسوبة',reading:'القراءة',no_data:'لا توجد بيانات قابلة للاستخدام',
  best:'أفضل فترة',dominant:'الاتجاه الغالب',low:'فترة أكثر حساسية',mixed:'مستقر / مختلط',low_contrast:'تباين ضعيف',
  no_trend:'لم يتم اكتشاف اتجاه قابل للاستخدام',no_trend_desc:'لا تعيد V121 مادة كافية لهذا المجال خلال {year}. لا يتم إنشاء منحنى اصطناعي.',
  annual:'الاتجاهات السنوية',monthly:'اتجاهاتك شهرًا بشهر',graph_desc:'يستخدم المنحنى تفعيلات V121 الحقيقية لكل شهر، بما في ذلك الاتجاهات الضعيفة، دون تحويلها إلى أحداث.',details:'التفاصيل',readings:'قراءات V121',back:'رجوع',
  question:'سؤالي',question_sub:'إجابة شخصية عن انشغالك.',question_kicker:'انشغال محدد',question_card:'اطرح سؤالًا واحصل على إجابة شخصية بالاعتماد على خريطتك وعبور V121.',
  child:'صورة الطفل',child_sub:'فهم إمكاناته وحساسياته ونقاط قوته بقراءة مناسبة لعمره.',child_kicker:'مرافقة باهتمام',child_card:'قراءة للخريطة الميلادية مناسبة للعمر وتركز على نقاط القوة والحساسيات واحتياجات المرافقة.',child_select:'إضافة أو اختيار ملف طفل',years:'سنة'
 }
};
let graphDomain='couple';
let graphYear=new Date().getFullYear();
const MONTH_CACHE=new Map();

function lang(){return String(window.AP_LANG||localStorage.getItem('astro-lang')||'fr').toLowerCase().slice(0,2)}
function locale(){return ({fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'})[lang()]||'fr-FR'}
function tx(k){const l=I18N[lang()]||I18N.fr;return l[k]!=null?l[k]:(I18N.fr[k]!=null?I18N.fr[k]:k)}
function fmt(k,vars){let s=tx(k);Object.entries(vars||{}).forEach(([a,b])=>{s=s.replace(new RegExp('\\{'+a+'\\}','g'),String(b))});return s}
function domainLabel(key){return tx(key)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function mlabel(d){return new Intl.DateTimeFormat(locale(),{month:'short'}).format(d).replace('.','')}
function flabel(d){return new Intl.DateTimeFormat(locale(),{month:'long',year:'numeric'}).format(d)}
function profileSig(){try{return [USER&&USER.jd,USER&&USER.AS,USER&&USER.MC].map(v=>Number.isFinite(Number(v))?Number(v).toFixed(6):String(v||'')).join('|')}catch(e){return 'no-user'}}

function style(){
 if(document.getElementById('ap-v131-style'))return;
 const s=document.createElement('style');s.id='ap-v131-style';s.textContent=`
 .ap-v130-year-tabs,.ap-v130-domain-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
 .ap-v130-year-btn,.ap-v130-domain-btn{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#f3ebf3;border-radius:999px;padding:9px 15px;font-weight:700;cursor:pointer}
 .ap-v130-year-btn.active,.ap-v130-domain-btn.active{background:#6f2f63;color:#fff;border-color:#d8bc81;box-shadow:0 6px 18px rgba(0,0,0,.18)}
 .ap-v130-graph-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}.ap-v130-svg{display:block;width:100%;min-width:720px;height:auto}
 .ap-v130-empty{margin:22px 0 8px;padding:26px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.055);border-radius:18px;text-align:center;color:#f3eaf3}.ap-v130-empty strong{display:block;font:600 27px/1.1 'Cormorant Garamond',Georgia,serif;margin-bottom:8px}.ap-v130-empty span{color:#d4c8d5;font-size:13px;line-height:1.5}
 .ap-v130-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}.ap-v130-summary article{border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.07);border-radius:14px;padding:12px;color:#f4eaf3}.ap-v130-summary b{display:block;color:#d8bc81;font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}.ap-v130-summary strong{font:600 21px/1.1 'Cormorant Garamond',Georgia,serif}
 .ap121-feature .pic,.ap121-banner{background-size:cover!important;background-repeat:no-repeat!important;background-position:center!important;background-color:#211329!important}
 #ap100-lang{max-width:none!important;width:auto!important;min-width:62px!important}
 .ap-v130-lang-pop,.ap-v130-child-pop{position:fixed;z-index:999999;display:none;min-width:170px;padding:7px;background:#fffaf2;border:1px solid rgba(78,38,67,.18);border-radius:15px;box-shadow:0 18px 46px rgba(50,20,45,.24)}
 .ap-v130-lang-pop.open,.ap-v130-child-pop.open{display:grid;gap:3px}.ap-v130-lang-pop button,.ap-v130-child-pop button{border:0;background:transparent;color:#42183d;border-radius:10px;padding:10px 12px;text-align:left;font:700 13px/1.2 Lato,sans-serif;cursor:pointer}.ap-v130-lang-pop button:hover,.ap-v130-lang-pop button.active,.ap-v130-child-pop button:hover{background:#efe2ed}
 body.ap-v130-question-open #mod-question{display:block!important}
 #ap100-compare-date-btn{display:none!important}
 .ap-v130-extra-card .pic{background-position:center!important}.ap-v130-extra-card small{display:block;color:#9b6a32;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:5px}
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
 const cacheKey=profileSig()+'|'+year+'|'+month+'|'+key;
 if(MONTH_CACHE.has(cacheKey))return MONTH_CACHE.get(cacheKey);
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
 let result;
 if(!count)result={v:null,count:0,activity:0};
 else{const signed=pos+neg;if(!signed)result={v:0,count,activity:totalForce};else{const balance=(pos-neg)/Math.max(.01,signed+mix*.35);const avg=totalForce/count;const magnitude=Math.max(.18,Math.min(1,avg/5.5));result={v:Math.max(-1,Math.min(1,balance*magnitude)),count,activity:totalForce}}}
 MONTH_CACHE.set(cacheKey,result);return result;
}
function yearData(year,key){return Array.from({length:12},(_,m)=>({d:new Date(year,m,15),...monthStat(year,m,key)}))}
function graph(rows,dom){
 const W=900,H=370,L=118,R=22,T=28,B=52,PW=W-L-R,PH=H-T-B,x=i=>L+PW*i/11,y=v=>T+((1-v)/2)*PH;
 const levels=[[tx('very_good'),1],[tx('good'),.5],[tx('stable'),0],[tx('less_good'),-.5],[tx('difficult'),-1]];
 let out=`<svg class="ap-v130-svg" viewBox="0 0 ${W} ${H}">`;
 for(const [lab,v] of levels){const yy=y(v);out+=`<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" stroke="rgba(255,255,255,.12)"/><text x="${L-12}" y="${yy+4}" text-anchor="end" fill="#daceda" font-size="11">${esc(lab)}</text>`}
 rows.forEach((r,i)=>{const xx=x(i);out+=`<line x1="${xx}" y1="${T}" x2="${xx}" y2="${H-B}" stroke="rgba(255,255,255,.05)"/><text x="${xx}" y="${H-18}" text-anchor="middle" fill="#dfd5df" font-size="11">${esc(mlabel(r.d))}</text>`});
 const points=rows.map((r,i)=>({...r,i})).filter(r=>r.v!==null);
 if(points.length>1){const p=points.map((r,j)=>(j?'L':'M')+x(r.i).toFixed(1)+' '+y(r.v).toFixed(1)).join(' ');out+=`<path d="${p}" fill="none" stroke="${dom.color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`}
 points.forEach(r=>{const xx=x(r.i),yy=y(r.v),rad=Math.min(8,4+Math.min(4,r.count/5));out+=`<circle cx="${xx}" cy="${yy}" r="${rad}" fill="#1b1226" stroke="${dom.color}" stroke-width="3"><title>${esc(flabel(r.d))} · ${r.count} ${esc(tx('readings'))}</title></circle>`});
 return out+'</svg>';
}
function summary(rows,dom){
 const marked=rows.filter(r=>r.v!==null),label=domainLabel(dom.key);
 if(!marked.length)return `<div class="ap-v130-summary"><article><b>${esc(tx('domain'))}</b><strong>${esc(label)}</strong></article><article><b>${esc(tx('periods'))}</b><strong>0</strong></article><article><b>${esc(tx('reading'))}</b><strong>${esc(tx('no_data'))}</strong></article></div>`;
 const best=marked.reduce((a,b)=>b.v>a.v?b:a,marked[0]),low=marked.reduce((a,b)=>b.v<a.v?b:a,marked[0]);
 const varied=Math.abs(best.v-low.v)>.035;
 return `<div class="ap-v130-summary"><article><b>${esc(tx('domain'))}</b><strong>${esc(label)}</strong></article><article><b>${esc(varied?tx('best'):tx('dominant'))}</b><strong>${varied?esc(flabel(best.d)):esc(tx('mixed'))}</strong></article><article><b>${esc(varied?tx('low'):tx('reading'))}</b><strong>${varied?esc(flabel(low.d)):esc(tx('low_contrast'))}</strong></article></div>`;
}
function renderGraph(){
 const card=document.querySelector('#ap121-future .ap121-graph-card');if(!card)return;style();
 const dom=DOMAINS.find(x=>x.key===graphDomain)||DOMAINS[0],rows=yearData(graphYear,dom.key),y0=new Date().getFullYear(),marked=rows.filter(r=>r.v!==null);
 const key=lang()+'|'+profileSig()+'|'+graphYear+'|'+dom.key+'|'+rows.map(r=>r.v===null?'x':r.v.toFixed(3)+':'+r.count).join(',');if(card.dataset.v131===key)return;card.dataset.v131=key;
 const visual=marked.length?`<div class="ap-v130-graph-wrap">${graph(rows,dom)}</div>`:`<div class="ap-v130-empty"><strong>${esc(tx('no_trend'))}</strong><span>${esc(fmt('no_trend_desc',{year:graphYear}))}</span></div>`;
 card.innerHTML=`<div class="ap121-graph-head"><div><span class="ap121-kicker">${esc(tx('annual'))}</span><h2>${esc(tx('monthly'))}</h2><p>${esc(tx('graph_desc'))}</p></div><button class="ap121-pill" onclick="ap121Open('prev')">${esc(tx('details'))}</button></div><div class="ap-v130-year-tabs">${[y0,y0+1,y0+2].map(y=>`<button class="ap-v130-year-btn ${y===graphYear?'active':''}" data-y="${y}">${y}</button>`).join('')}</div><div class="ap-v130-domain-tabs">${DOMAINS.map(d=>`<button class="ap-v130-domain-btn ${d.key===dom.key?'active':''}" data-d="${d.key}">${esc(domainLabel(d.key))}</button>`).join('')}</div>${visual}${summary(rows,dom)}`;
 card.querySelectorAll('[data-y]').forEach(b=>b.onclick=()=>{graphYear=Number(b.dataset.y)||y0;card.dataset.v131='';renderGraph()});
 card.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{graphDomain=b.dataset.d;card.dataset.v131='';renderGraph()});
}

function setLanguage(code){
 if(!['fr','en','es','ar'].includes(code))return;
 try{if(typeof window.v100SetLang==='function')window.v100SetLang(code);else if(typeof window.apSetLang==='function')window.apSetLang(code,true);else localStorage.setItem('astro-lang',code)}catch(e){}
 setTimeout(()=>{updateLanguageButtons();const card=document.querySelector('#ap121-future .ap121-graph-card');if(card)card.dataset.v131='';ensurePublicAccess();renderGraph()},40);
}
function languagePop(){let p=document.getElementById('ap-v130-lang-pop');if(p)return p;p=document.createElement('div');p.id='ap-v130-lang-pop';p.className='ap-v130-lang-pop';const names={fr:'Français',en:'English',es:'Español',ar:'العربية'};['fr','en','es','ar'].forEach(code=>{const b=document.createElement('button');b.type='button';b.dataset.lang=code;b.textContent=code.toUpperCase()+' — '+names[code];b.onclick=e=>{e.stopPropagation();setLanguage(code);p.classList.remove('open')};p.appendChild(b)});document.body.appendChild(p);return p}
function updateLanguageButtons(){
 const code=lang();document.querySelectorAll('#ap-v130-lang-pop button').forEach(b=>b.classList.toggle('active',b.dataset.lang===code));
 document.querySelectorAll('.ap121-brand-actions .ap121-pill').forEach(btn=>{if(!/lang-v130/.test(btn.dataset.role||'')){btn.dataset.role='lang-v130';btn.removeAttribute('onclick');btn.onclick=e=>{e.stopPropagation();const p=languagePop();const r=btn.getBoundingClientRect();p.style.top=(r.bottom+7)+'px';p.style.left=Math.max(8,Math.min(window.innerWidth-178,r.right-170))+'px';p.classList.toggle('open')};}btn.textContent=code.toUpperCase()+'⌄'});
 const sel=document.getElementById('ap100-lang');if(sel&&sel.value!==code)sel.value=code;
}

function moduleBanner(title,sub,back){
 const sec=document.getElementById('section-modules');if(!sec)return null;
 sec.classList.add('visible');let ban=document.getElementById('ap121-module-banner');if(!ban){ban=document.createElement('div');ban.id='ap121-module-banner';ban.className='ap121-module-banner';sec.insertBefore(ban,sec.firstChild)}
 ban.style.backgroundImage="url('assets/img/forecast.jpg')";ban.innerHTML=`<button class="ap121-module-back" onclick="${back||"v121Go('home')"}">← ${esc(tx('back'))}</button><div class="ap121-kicker" style="margin-top:26px">Astro Paquita</div><h1>${esc(title)}</h1><p>${esc(sub)}</p>`;return sec
}
function openQuestion(){
 style();document.body.classList.add('ap-v130-question-open');document.getElementById('ap121-root')?.classList.remove('active');document.body.classList.remove('ap121-custom-open');document.body.classList.add('ap121-module-open');
 const sec=moduleBanner(tx('question'),tx('question_sub'),"document.body.classList.remove('ap-v130-question-open');v121Go('home')");
 try{if(typeof window.v100OpenModule==='function')window.v100OpenModule('question');else if(typeof window.__ap100_oldIrVersModule==='function')window.__ap100_oldIrVersModule('question');else if(typeof window.irVersModule==='function')window.irVersModule('question')}catch(e){console.error(e)}
 setTimeout(()=>{const q=document.getElementById('mod-question');if(q)q.style.setProperty('display','block','important');if(sec)sec.classList.add('visible');window.scrollTo({top:0,behavior:'auto'})},70)
}
window.apV130OpenQuestion=openQuestion;

function ageFromProfile(p){
 if(!p||!p.date)return null;const raw=String(p.date).trim();let iso='';
 try{if(typeof window.parseDate==='function')iso=String(window.parseDate(raw)||'')}catch(e){}
 if(!/^\d{4}-\d{2}-\d{2}$/.test(iso)){const fr=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(fr)iso=fr[3]+'-'+fr[2].padStart(2,'0')+'-'+fr[1].padStart(2,'0');else if(/^\d{4}-\d{2}-\d{2}/.test(raw))iso=raw.slice(0,10);else return null}
 const d=new Date(iso+'T12:00:00');if(Number.isNaN(d.getTime()))return null;const n=new Date();let a=n.getFullYear()-d.getFullYear();const md=n.getMonth()-d.getMonth();if(md<0||(md===0&&n.getDate()<d.getDate()))a--;return a
}
function childProfiles(){try{const all=typeof getProfils==='function'?getProfils():{};return Object.entries(all||{}).filter(([,p])=>{const a=ageFromProfile(p);return a!==null&&a<18})}catch(e){return []}}
function activateProfile(key){const sel=document.getElementById('ap100-profile-select');if(sel){sel.value=key;sel.dispatchEvent(new Event('change',{bubbles:true}));return true}try{if(typeof window.v37ChangerProfil==='function')return !!window.v37ChangerProfil(key)}catch(e){}return false}
function openChildNatal(key){
 if(key)activateProfile(key);setTimeout(()=>{document.body.classList.remove('ap-v130-question-open');if(typeof window.ap121Open==='function')window.ap121Open('natal');setTimeout(()=>{const ban=document.getElementById('ap121-module-banner');if(ban){const h=ban.querySelector('h1'),p=ban.querySelector('p');if(h)h.textContent=tx('child');if(p)p.textContent=tx('child_sub')}},80)},120)
}
function childPop(anchor){let p=document.getElementById('ap-v130-child-pop');if(p)p.remove();p=document.createElement('div');p.id='ap-v130-child-pop';p.className='ap-v130-child-pop';const rows=childProfiles();if(!rows.length){const b=document.createElement('button');b.type='button';b.textContent=tx('child_select');b.onclick=()=>{p.classList.remove('open');if(typeof window.v121Go==='function')window.v121Go('profile')};p.appendChild(b)}else rows.forEach(([key,prof])=>{const b=document.createElement('button');b.type='button';const age=ageFromProfile(prof);b.textContent=(prof.prenom||key)+(age!==null?` · ${age} ${tx('years')}`:'');b.onclick=()=>{p.classList.remove('open');openChildNatal(key)};p.appendChild(b)});document.body.appendChild(p);const r=anchor.getBoundingClientRect();p.style.top=Math.min(window.innerHeight-80,r.bottom+7)+'px';p.style.left=Math.max(8,Math.min(window.innerWidth-210,r.left))+'px';p.classList.add('open')}
function openChild(anchor){const rows=childProfiles();if(rows.length===1)openChildNatal(rows[0][0]);else childPop(anchor)}
window.apV130OpenChild=function(el){openChild(el||document.activeElement)};

function ensurePublicAccess(){
 const grid=document.querySelector('#ap121-home .ap121-card-grid');if(!grid)return;
 let q=document.getElementById('ap-v130-question-card');if(!q){q=document.createElement('article');q.id='ap-v130-question-card';q.className='ap121-feature ap-v130-extra-card';q.onclick=openQuestion;grid.appendChild(q)}
 q.innerHTML=`<div class="pic" style="background-image:url('assets/img/story1.jpg')"></div><div class="copy"><small>${esc(tx('question_kicker'))}</small><h3>${esc(tx('question'))}</h3><p>${esc(tx('question_card'))}</p></div><span class="ap121-arrow">→</span>`;
 let c=document.getElementById('ap-v130-child-card');if(!c){c=document.createElement('article');c.id='ap-v130-child-card';c.className='ap121-feature ap-v130-extra-card';c.onclick=()=>openChild(c);grid.appendChild(c)}
 c.innerHTML=`<div class="pic" style="background-image:url('assets/img/natal.jpg')"></div><div class="copy"><small>${esc(tx('child_kicker'))}</small><h3>${esc(tx('child'))}</h3><p>${esc(tx('child_card'))}</p></div><span class="ap121-arrow">→</span>`;
}

function restoreQuestion(){document.querySelectorAll("button[onclick*='question']").forEach(b=>b.style.removeProperty('display'))}
function removeObsoletePublic(){
 document.getElementById('ap100-compare-date-btn')?.remove();
 const comparePhrases=['comparer plusieurs dates','comparer les dates','compare several dates','compare dates','comparar varias fechas','comparar fechas','مقارنة عدة تواريخ','مقارنة التواريخ'];
 document.querySelectorAll('button').forEach(b=>{const t=(b.textContent||'').trim().toLowerCase(),oc=String(b.getAttribute('onclick')||'').toLowerCase();if(comparePhrases.some(x=>t.includes(x))&&oc.includes('compare'))b.remove()});
 ['ap-notification-badge','ap-dashboard'].forEach(id=>document.getElementById(id)?.remove())
}
function fixStory(){document.querySelectorAll('#ap121-future .ap121-feature').forEach(c=>{if(/avenir racont|future story|futuro narrado|المستقبل المروي/i.test(c.textContent||'')||String(c.getAttribute('onclick')||'').includes('story'))c.style.setProperty('display','none','important')});const s=document.getElementById('ap121-story');if(s)s.style.setProperty('display','none','important')}
function fixImages(){style();document.querySelectorAll('.ap121-feature .pic,.ap121-banner').forEach(x=>{x.style.backgroundSize='cover';x.style.backgroundRepeat='no-repeat';x.style.backgroundPosition='center'})}
function run(){renderGraph();fixStory();fixImages();removeObsoletePublic();restoreQuestion();updateLanguageButtons();ensurePublicAccess()}
if(!window.__apV130Outside){window.__apV130Outside=true;document.addEventListener('click',e=>{document.getElementById('ap-v130-lang-pop')?.classList.remove('open');if(!e.target.closest('#ap-v130-child-pop')&&!e.target.closest('#ap-v130-child-card'))document.getElementById('ap-v130-child-pop')?.classList.remove('open');const oc=String(e.target.closest('[onclick]')?.getAttribute('onclick')||'');if((oc.includes('v121Go(')||oc.includes('ap121Open('))&&!oc.includes('apV130'))document.body.classList.remove('ap-v130-question-open')},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(run,120)}).observe(document.documentElement,{childList:true,subtree:true});setInterval(run,4000);
})();
