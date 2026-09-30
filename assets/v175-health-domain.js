/* Astro Paquita V175 — domaine Santé distinct de Bien-être.
   Aucun calcul astronomique n'est recréé ici. Cette couche utilise d'abord les
   fonctions V121 directes quand elles sont exposées. Sinon elle passe par
   AstroTruth.day(), la couche structurée officielle appuyée sur le moteur V121.
   Santé reste volontairement plus stricte que Bien-être, mais ne renvoie plus
   un écran vide : alertes confirmées, tendances secondaires, ou stabilité. */
(function(){
'use strict';
if(window.__AP_V175_HEALTH_DOMAIN__)return;
window.__AP_V175_HEALTH_DOMAIN__=true;

const A=window.AstroTruth;
const META={fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'};
const TX={
 fr:{health:'Santé',intro:'Lecture astrologique de la vitalité, des fragilités possibles et des périodes de vigilance',good:'Périodes plus soutenues',watch:'Périodes de vigilance',secondary:'Tendances Santé secondaires',lightWatch:'Vigilance légère',lightGood:'Soutien léger',stable:'Période plutôt stable',confirmed:'Convergence confirmée',very:'Très forte convergence',lighter:'Signal plus léger',goodText:'Vitalité, récupération ou capacité d’adaptation astrologiquement mieux soutenues.',watchText:'Des fragilités, symptômes ou une baisse de forme peuvent davantage se manifester sur cette période. Si quelque chose d’inhabituel apparaît ou persiste, il est prudent de ne pas le négliger.',veryWatchText:'La convergence astrologique est particulièrement forte sur cette période : un problème de santé pourrait se manifester, se révéler ou demander davantage d’attention ou de prise en charge. Le calcul n’identifie pas une maladie précise et ne remplace pas une évaluation médicale.',lightWatchText:'Un signal de fragilité ou de baisse de forme est présent, mais la convergence reste insuffisante pour parler d’un problème de santé possible avec le niveau de confirmation requis.',lightGoodText:'Un soutien de vitalité ou de récupération ressort, mais avec une convergence plus légère.',stableText:'Aucun pic de fragilité Santé suffisamment marqué ne ressort des signaux V121 sur cette période. La tendance astrologique générale est donc plutôt stable.',notice:'Cette lecture décrit des tendances astrologiques de santé et de vitalité. Elle ne permet ni d’identifier une maladie précise, ni de poser un diagnostic.'},
 en:{health:'Health',intro:'Astrological reading of vitality, possible vulnerabilities and periods requiring more care',good:'More supportive periods',watch:'Periods requiring more care',secondary:'Secondary Health trends',lightWatch:'Light caution',lightGood:'Light support',stable:'Rather stable period',confirmed:'Confirmed convergence',very:'Very strong convergence',lighter:'Lighter signal',goodText:'Vitality, recovery or adaptability are astrologically better supported.',watchText:'Vulnerability, symptoms or lower energy may be more likely to show up during this period. If something unusual appears or persists, it should not be ignored.',veryWatchText:'The astrological convergence is particularly strong during this period: a health problem could appear, become noticeable or require greater attention or care. The calculation does not identify a specific illness and does not replace medical assessment.',lightWatchText:'A vulnerability or lower-energy signal is present, but convergence is not strong enough to speak of a possible health problem with the required confidence.',lightGoodText:'Vitality or recovery support is present, but with lighter convergence.',stableText:'No sufficiently marked Health vulnerability peak stands out in the V121 signals for this period. The overall astrological trend is therefore rather stable.',notice:'This reading describes astrological health and vitality trends. It cannot identify a specific illness or provide a diagnosis.'},
 es:{health:'Salud',intro:'Lectura astrológica de la vitalidad, posibles fragilidades y períodos de mayor vigilancia',good:'Períodos más favorables',watch:'Períodos de vigilancia',secondary:'Tendencias secundarias de Salud',lightWatch:'Vigilancia ligera',lightGood:'Apoyo ligero',stable:'Período bastante estable',confirmed:'Convergencia confirmada',very:'Convergencia muy fuerte',lighter:'Señal más ligera',goodText:'La vitalidad, la recuperación o la capacidad de adaptación están astrológicamente mejor sostenidas.',watchText:'Durante este período pueden manifestarse con mayor facilidad fragilidad, síntomas o una bajada de forma. Si aparece o persiste algo inusual, conviene no ignorarlo.',veryWatchText:'La convergencia astrológica es especialmente fuerte durante este período: un problema de salud podría manifestarse, hacerse evidente o requerir más atención o cuidados. El cálculo no identifica una enfermedad concreta ni sustituye una valoración médica.',lightWatchText:'Hay una señal de fragilidad o bajada de forma, pero la convergencia no es suficiente para hablar de un posible problema de salud con el nivel de confirmación exigido.',lightGoodText:'Aparece un apoyo de vitalidad o recuperación, pero con una convergencia más ligera.',stableText:'No aparece ningún pico de fragilidad de Salud suficientemente marcado en las señales V121 de este período. La tendencia astrológica general es por tanto bastante estable.',notice:'Esta lectura describe tendencias astrológicas de salud y vitalidad. No permite identificar una enfermedad concreta ni establecer un diagnóstico.'},
 ar:{health:'الصحة',intro:'قراءة فلكية للحيوية ونقاط الضعف المحتملة وفترات الحاجة إلى مزيد من الانتباه',good:'فترات أكثر دعماً',watch:'فترات تستدعي الانتباه',secondary:'اتجاهات صحية ثانوية',lightWatch:'تنبيه خفيف',lightGood:'دعم خفيف',stable:'فترة مستقرة نسبياً',confirmed:'تقارب مؤكد',very:'تقارب قوي جداً',lighter:'إشارة أخف',goodText:'الحيوية والتعافي والقدرة على التكيف مدعومة فلكياً بصورة أفضل.',watchText:'قد تظهر خلال هذه الفترة قابلية أكبر للضعف أو الأعراض أو تراجع الطاقة. وإذا ظهر أمر غير معتاد أو استمر، فمن الأفضل عدم تجاهله.',veryWatchText:'التقارب الفلكي قوي بصورة خاصة خلال هذه الفترة: قد تظهر مشكلة صحية أو تتضح أو تحتاج إلى مزيد من الانتباه أو الرعاية. لا يحدد الحساب مرضاً بعينه ولا يحل محل التقييم الطبي.',lightWatchText:'توجد إشارة إلى ضعف أو تراجع في الطاقة، لكن التقارب غير كافٍ للحديث عن مشكلة صحية محتملة بدرجة التأكيد المطلوبة.',lightGoodText:'يظهر دعم للحيوية أو التعافي، ولكن بتقارب أخف.',stableText:'لا تظهر في إشارات V121 خلال هذه الفترة ذروة ضعف صحي قوية بما يكفي. لذلك تبدو الاتجاهات الفلكية العامة مستقرة نسبياً.',notice:'تصف هذه القراءة اتجاهات فلكية مرتبطة بالصحة والحيوية، ولا تحدد مرضاً بعينه ولا تقدم تشخيصاً.'}
};
let selected=false,observer=null,pending=false;
const q=(s,r)=>(r||document).querySelector(s);
const qa=(s,r)=>Array.from((r||document).querySelectorAll(s));
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function lang(){const l=String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2);return TX[l]?l:'fr';}
function tr(k){return TX[lang()][k]||TX.fr[k]||k;}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function fmt(d){return d.toLocaleDateString(META[lang()]||META.fr,{day:'numeric',month:'short',year:'numeric'});}
function forceOf(row){return Number(row?.force??row?.strength??0)||0;}
function strong(row){const level=String(row?.niveau||row?.level||'').toLowerCase();return level==='fort'||level==='exceptionnel'||forceOf(row)>=2.2;}
function lightEnough(row){const level=String(row?.niveau||row?.level||'').toLowerCase();return strong(row)||level==='marque'||forceOf(row)>=1;}
function polarity(row){const p=String(row?.polarite||row?.polarity||row?.pol||'').toLowerCase();if(p==='difficile'||p==='difficult'||p==='negative')return'difficult';if(p==='positive'||p==='favorable'||p==='favourable')return'positive';return'mixed';}
function directAvailable(){return typeof window.apV51Signals==='function'&&typeof window.apConvergenceFromRowV76==='function';}
function truthAvailable(){return !!A&&typeof A.day==='function';}
function rawHealthDomain(raw){const s=String(raw||'').toLowerCase();return ['sante','santé','health'].includes(s);}
function truthHealthDomain(raw){const s=String(raw||'').toLowerCase();return ['bienetre','bien-être','wellbeing','health','sante','santé'].includes(s);}
function uniq(arr){return [...new Set((Array.isArray(arr)?arr:[]).filter(Boolean).map(String))];}
function mergedFamilies(row){return uniq([...(row?.anchorFamilies||[]),...(row?.coreFamilies||[]),...(row?.families||[]),...(row?.familles||[])]);}
function rawConvergence(row,date){
 try{const sig=window.apConvergenceFromRowV76(row,'sante',date);const fam=uniq(sig&&sig.familles).length;const weight=Number(sig&&sig.poids)||0;return {families:fam,weight,confirmed:fam>=2||weight>=4,very:fam>=3||weight>=7,mode:'direct'};}
 catch(e){return {families:0,weight:0,confirmed:false,very:false,mode:'direct'};}
}
function truthConvergence(row,samePolarityCount){
 const fam=mergedFamilies(row).length;
 const support=Math.max(1,Number(samePolarityCount)||1);
 return {families:fam,weight:0,confirmed:fam>=2||support>=2,very:fam>=3||support>=3,mode:'truth',support};
}
function score(row,conv){return forceOf(row)*10+conv.families*4+(conv.weight||0)+(conv.support||0)*2;}
function ensureEngine(){if(!directAvailable()&&!truthAvailable())throw new Error('Le calcul Santé V121 est momentanément indisponible.');}
function rowsForDay(d){
 if(directAvailable()){let rows=[];try{rows=window.apV51Signals(d,'marque')||[];}catch(e){}return {mode:'direct',rows:rows.filter(r=>r&&rawHealthDomain(r.domain))};}
 let truth=null;try{truth=A.day(d,'all');}catch(e){truth=null;}const rows=truth&&Array.isArray(truth.signals)?truth.signals:[];return {mode:'truth',rows:rows.filter(r=>r&&truthHealthDomain(r.domain))};
}
function candidatesForDay(d){
 const src=rowsForDay(d),strict=[],light=[];
 for(const r of src.rows){
   const pol=polarity(r);if(pol==='mixed'||!lightEnough(r))continue;
   let conv;
   if(src.mode==='direct')conv=rawConvergence(r,d);
   else{const peers=src.rows.filter(x=>polarity(x)===pol&&lightEnough(x)).length;conv=truthConvergence(r,peers);}
   const item={date:new Date(d),row:r,conv,pol,score:score(r,conv)};
   if(strong(r)&&conv.confirmed)strict.push(item);else light.push(item);
 }
 strict.sort((a,b)=>b.score-a.score);light.sort((a,b)=>b.score-a.score);
 return {strict:strict[0]||null,light:light[0]||null};
}
async function scan(start,days,onProgress){
 ensureEngine();const strictHits=[],lightHits=[],CHUNK=20;
 for(let i=0;i<days;i+=CHUNK){
   for(let k=i;k<Math.min(i+CHUNK,days);k++){
     const d=new Date(start);d.setDate(d.getDate()+k);d.setHours(12,0,0,0);
     const c=candidatesForDay(d);if(c.strict)strictHits.push(c.strict);if(c.light)lightHits.push(c.light);
   }
   if(onProgress)onProgress(Math.min(95,Math.round(((i+CHUNK)/Math.max(1,days))*95)));
   await new Promise(r=>setTimeout(r,0));
 }
 return {strictHits,lightHits};
}
function clusters(hits){
 const sorted=[...hits].sort((a,b)=>a.date-b.date),out=[];
 for(const h of sorted){const prev=out[out.length-1];if(prev&&prev.pol===h.pol&&Math.round((h.date-prev.end)/86400000)<=2){prev.end=new Date(h.date);prev.items.push(h);if(h.score>prev.peak.score)prev.peak=h;}else out.push({start:new Date(h.date),end:new Date(h.date),pol:h.pol,items:[h],peak:h});}
 return out.sort((a,b)=>b.peak.score-a.peak.score);
}
function rangeLabel(c){return iso(c.start)===iso(c.end)?fmt(c.start):fmt(c.start)+' → '+fmt(c.end);}
function strictCard(c){const very=c.items.some(x=>x.conv.very);let text;if(c.pol==='difficult')text=very?tr('veryWatchText'):tr('watchText');else text=tr('goodText');return '<div class="ap-period '+(c.pol==='difficult'?'difficult':'positive')+'" style="margin-bottom:10px"><div><b>'+esc(c.pol==='difficult'?tr('watch'):tr('good'))+'</b><strong>'+esc(rangeLabel(c))+'</strong><small>'+esc(very?tr('very'):tr('confirmed'))+' · '+esc(text)+'</small></div></div>';}
function lightCard(c){const text=c.pol==='difficult'?tr('lightWatchText'):tr('lightGoodText');return '<div class="ap-period '+(c.pol==='difficult'?'difficult':'positive')+'" style="margin-bottom:10px;opacity:.92"><div><b>'+esc(c.pol==='difficult'?tr('lightWatch'):tr('lightGood'))+'</b><strong>'+esc(rangeLabel(c))+'</strong><small>'+esc(tr('lighter'))+' · '+esc(text)+'</small></div></div>';}
function titleRange(start,days){const end=new Date(start);end.setDate(end.getDate()+Math.max(0,days-1));return days===1?fmt(start):fmt(start)+' → '+fmt(end);}
async function runHealth(start,days,period,onProgress){
 const scanResult=await scan(new Date(start),Math.max(1,Number(days)||1),onProgress);
 const strictGroups=clusters(scanResult.strictHits),lightGroups=clusters(scanResult.lightHits);
 const difficult=strictGroups.filter(x=>x.pol==='difficult').slice(0,4),positive=strictGroups.filter(x=>x.pol==='positive').slice(0,4);
 let body='<div class="ap-card ap-health-v175"><div class="ap-eyebrow">'+esc(tr('health'))+'</div><h2 style="margin:6px 0 6px">'+esc(titleRange(new Date(start),days))+'</h2><p class="ap-muted">'+esc(tr('intro'))+'</p>';
 if(difficult.length)body+='<h3 style="margin-top:18px">'+esc(tr('watch'))+'</h3>'+difficult.map(strictCard).join('');
 if(positive.length)body+='<h3 style="margin-top:18px">'+esc(tr('good'))+'</h3>'+positive.map(strictCard).join('');
 if(!difficult.length&&!positive.length){
   const secondary=lightGroups.slice(0,4);
   if(secondary.length)body+='<h3 style="margin-top:18px">'+esc(tr('secondary'))+'</h3>'+secondary.map(lightCard).join('');
   else body+='<div class="ap-period calm" style="margin-top:18px"><div><b>'+esc(tr('stable'))+'</b><small>'+esc(tr('stableText'))+'</small></div></div>';
 }
 body+='<div class="ap-note" style="margin-top:16px">'+esc(tr('notice'))+'</div></div>';
 return body;
}
window.apRunStrictHealthForecastV175=runHealth;
window.AP_HEALTH_METHOD_V175={engine:'V121',directSource:'apV51Signals + apConvergenceFromRowV76',fallbackSource:'AstroTruth.day',strictMinForce:2.2,confirmedFamilies:2,veryFamilies:3,secondary:true,diagnosis:false};

function inject(){
 pending=false;if(!document.body.classList.contains('ap-route-forecast'))return;
 const grid=q('.ap-domain-choice-grid');if(!grid)return;
 let b=q('[data-domain="sante"]',grid);
 if(!b){b=document.createElement('button');b.className='ap-domain-choice';b.type='button';b.dataset.domain='sante';b.innerHTML='<i>⚕</i><span>'+esc(tr('health'))+'</span>';const wellbeing=q('[data-domain="bienetre"]',grid);if(wellbeing&&wellbeing.nextSibling)grid.insertBefore(b,wellbeing.nextSibling);else grid.appendChild(b);b.addEventListener('click',function(ev){ev.preventDefault();selected=true;qa('[data-domain]',grid).forEach(x=>x.classList.toggle('active',x===b));const out=q('#ap-forecast-result');if(out)out.innerHTML='';});}
 const span=q('span',b);if(span)span.textContent=tr('health');if(selected)qa('[data-domain]',grid).forEach(x=>x.classList.toggle('active',x===b));
}
document.addEventListener('click',function(ev){const b=ev.target&&ev.target.closest?ev.target.closest('.ap-route-forecast [data-domain]'):null;if(!b)return;if(b.dataset.domain!=='sante')selected=false;},true);
function schedule(){if(pending)return;pending=true;requestAnimationFrame(inject);}
function start(){inject();observer=new MutationObserver(schedule);observer.observe(document.getElementById('ap-final-root')||document.body,{childList:true,subtree:true});document.addEventListener('change',e=>{if(e.target&&e.target.id==='ap-lang')setTimeout(schedule,0);},true);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
