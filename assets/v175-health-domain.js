/* Astro Paquita V175 — domaine Santé distinct de Bien-être.
   Aucun calcul astronomique n'est recréé ici. Cette couche utilise d'abord les
   fonctions V121 directes quand elles sont exposées. Sinon elle passe par
   AstroTruth.day(), la couche structurée officielle appuyée sur le moteur V121.
   Santé reste volontairement plus stricte que Bien-être. */
(function(){
'use strict';
if(window.__AP_V175_HEALTH_DOMAIN__)return;
window.__AP_V175_HEALTH_DOMAIN__=true;

const A=window.AstroTruth;
const META={fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'};
const TX={
 fr:{health:'Santé',intro:'Lecture astrologique de la vitalité, des fragilités possibles et des périodes de vigilance',good:'Périodes plus soutenues',watch:'Périodes de vigilance',none:'Aucune période Santé suffisamment confirmée ne ressort sur cette plage. Le site ne complète pas artificiellement le résultat.',confirmed:'Convergence confirmée',very:'Très forte convergence',goodText:'Vitalité, récupération ou capacité d’adaptation astrologiquement mieux soutenues.',watchText:'Des fragilités, symptômes ou une baisse de forme peuvent davantage se manifester sur cette période. Si quelque chose d’inhabituel apparaît ou persiste, il est prudent de ne pas le négliger.',veryWatchText:'La convergence astrologique est particulièrement forte sur cette période : un problème de santé pourrait se manifester, se révéler ou demander davantage d’attention ou de prise en charge. Le calcul n’identifie pas une maladie précise et ne remplace pas une évaluation médicale.',notice:'Cette lecture décrit des tendances astrologiques de santé et de vitalité. Elle peut signaler une période où un problème de santé est plus susceptible de se manifester, mais elle ne permet ni d’identifier une maladie précise, ni de poser un diagnostic.'},
 en:{health:'Health',intro:'Astrological reading of vitality, possible vulnerabilities and periods requiring more care',good:'More supportive periods',watch:'Periods requiring more care',none:'No sufficiently confirmed Health period stands out in this range. The site does not artificially fill the result.',confirmed:'Confirmed convergence',very:'Very strong convergence',goodText:'Vitality, recovery or adaptability are astrologically better supported.',watchText:'Vulnerability, symptoms or lower energy may be more likely to show up during this period. If something unusual appears or persists, it should not be ignored.',veryWatchText:'The astrological convergence is particularly strong during this period: a health problem could appear, become noticeable or require greater attention or care. The calculation does not identify a specific illness and does not replace medical assessment.',notice:'This reading describes astrological health and vitality trends. It may flag a period when a health problem is more likely to appear, but it cannot identify a specific illness or provide a diagnosis.'},
 es:{health:'Salud',intro:'Lectura astrológica de la vitalidad, posibles fragilidades y períodos de mayor vigilancia',good:'Períodos más favorables',watch:'Períodos de vigilancia',none:'No aparece ningún período de Salud suficientemente confirmado en este intervalo. El sitio no completa artificialmente el resultado.',confirmed:'Convergencia confirmada',very:'Convergencia muy fuerte',goodText:'La vitalidad, la recuperación o la capacidad de adaptación están astrológicamente mejor sostenidas.',watchText:'Durante este período pueden manifestarse con mayor facilidad fragilidad, síntomas o una bajada de forma. Si aparece o persiste algo inusual, conviene no ignorarlo.',veryWatchText:'La convergencia astrológica es especialmente fuerte durante este período: un problema de salud podría manifestarse, hacerse evidente o requerir más atención o cuidados. El cálculo no identifica una enfermedad concreta ni sustituye una valoración médica.',notice:'Esta lectura describe tendencias astrológicas de salud y vitalidad. Puede señalar un período en el que un problema de salud tenga más posibilidades de manifestarse, pero no permite identificar una enfermedad concreta ni establecer un diagnóstico.'},
 ar:{health:'الصحة',intro:'قراءة فلكية للحيوية ونقاط الضعف المحتملة وفترات الحاجة إلى مزيد من الانتباه',good:'فترات أكثر دعماً',watch:'فترات تستدعي الانتباه',none:'لا تظهر خلال هذه الفترة مؤشرات صحية مؤكدة بما يكفي. لا يضيف الموقع نتائج مصطنعة.',confirmed:'تقارب مؤكد',very:'تقارب قوي جداً',goodText:'الحيوية والتعافي والقدرة على التكيف مدعومة فلكياً بصورة أفضل.',watchText:'قد تظهر خلال هذه الفترة قابلية أكبر للضعف أو الأعراض أو تراجع الطاقة. وإذا ظهر أمر غير معتاد أو استمر، فمن الأفضل عدم تجاهله.',veryWatchText:'التقارب الفلكي قوي بصورة خاصة خلال هذه الفترة: قد تظهر مشكلة صحية أو تتضح أو تحتاج إلى مزيد من الانتباه أو الرعاية. لا يحدد الحساب مرضاً بعينه ولا يحل محل التقييم الطبي.',notice:'تصف هذه القراءة اتجاهات فلكية مرتبطة بالصحة والحيوية. وقد تشير إلى فترة يمكن أن تكون فيها مشكلة صحية أكثر قابلية للظهور، لكنها لا تحدد مرضاً بعينه ولا تقدم تشخيصاً.'}
};
let selected=false,observer=null,pending=false;
const q=(s,r)=>(r||document).querySelector(s);
const qa=(s,r)=>Array.from((r||document).querySelectorAll(s));
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function lang(){const l=String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2);return TX[l]?l:'fr';}
function tr(k){return TX[lang()][k]||TX.fr[k]||k;}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function fmt(d){return d.toLocaleDateString(META[lang()]||META.fr,{day:'numeric',month:'short',year:'numeric'});}
function strong(row){const level=String(row?.niveau||row?.level||'').toLowerCase();const force=Number(row?.force??row?.strength??0)||0;return level==='fort'||level==='exceptionnel'||force>=2.2;}
function polarity(row){const p=String(row?.polarite||row?.polarity||row?.pol||'').toLowerCase();if(p==='difficile'||p==='difficult'||p==='negative')return'difficult';if(p==='positive'||p==='favorable'||p==='favourable')return'positive';return'mixed';}
function directAvailable(){return typeof window.apV51Signals==='function'&&typeof window.apConvergenceFromRowV76==='function';}
function truthAvailable(){return !!A&&typeof A.day==='function';}
function rawHealthDomain(raw){const s=String(raw||'').toLowerCase();return s==='sante'||s==='santé'||s==='health';}
function truthHealthDomain(raw){return String(raw||'').toLowerCase()==='bienetre';}
function uniqueCount(arr){return new Set((Array.isArray(arr)?arr:[]).filter(Boolean).map(String)).size;}
function rawConvergence(row,date){
 try{
   const sig=window.apConvergenceFromRowV76(row,'sante',date);
   const fam=uniqueCount(sig&&sig.familles);
   const weight=Number(sig&&sig.poids)||0;
   return {families:fam,weight,confirmed:fam>=2||weight>=4,very:fam>=3||weight>=7,mode:'direct'};
 }catch(e){return {families:0,weight:0,confirmed:false,very:false,mode:'direct'};}
}
function truthConvergence(row){
 const fam=uniqueCount(row?.families);
 return {families:fam,weight:0,confirmed:fam>=2,very:fam>=3,mode:'truth'};
}
function score(row,conv){return (Number(row?.force??row?.strength??0)||0)*10+conv.families*4+conv.weight;}
function ensureEngine(){if(!directAvailable()&&!truthAvailable())throw new Error('Le calcul Santé V121 est momentanément indisponible.');}
function candidatesForDay(d){
 if(directAvailable()){
   let rows=[];try{rows=window.apV51Signals(d,'marque')||[];}catch(e){rows=[];}
   return rows.filter(r=>r&&rawHealthDomain(r.domain)&&strong(r)).map(r=>{const c=rawConvergence(r,d);return {date:new Date(d),row:r,conv:c,pol:polarity(r),score:score(r,c)};}).filter(x=>x.conv.confirmed&&x.pol!=='mixed');
 }
 let truth=null;try{truth=A.day(d,'all');}catch(e){truth=null;}
 const rows=truth&&Array.isArray(truth.signals)?truth.signals:[];
 return rows.filter(r=>r&&truthHealthDomain(r.domain)&&strong(r)).map(r=>{const c=truthConvergence(r);return {date:new Date(d),row:r,conv:c,pol:polarity(r),score:score(r,c)};}).filter(x=>x.conv.confirmed&&x.pol!=='mixed');
}
async function scan(start,days,onProgress){
 ensureEngine();const hits=[],CHUNK=20;
 for(let i=0;i<days;i+=CHUNK){
   for(let k=i;k<Math.min(i+CHUNK,days);k++){
     const d=new Date(start);d.setDate(d.getDate()+k);d.setHours(12,0,0,0);
     const candidates=candidatesForDay(d);
     if(candidates.length){candidates.sort((a,b)=>b.score-a.score);hits.push(candidates[0]);}
   }
   if(onProgress)onProgress(Math.min(95,Math.round(((i+CHUNK)/Math.max(1,days))*95)));
   await new Promise(r=>setTimeout(r,0));
 }
 return hits;
}
function clusters(hits){
 const sorted=[...hits].sort((a,b)=>a.date-b.date),out=[];
 for(const h of sorted){const prev=out[out.length-1];if(prev&&prev.pol===h.pol&&Math.round((h.date-prev.end)/86400000)<=2){prev.end=new Date(h.date);prev.items.push(h);if(h.score>prev.peak.score)prev.peak=h;}else out.push({start:new Date(h.date),end:new Date(h.date),pol:h.pol,items:[h],peak:h});}
 return out.sort((a,b)=>b.peak.score-a.peak.score);
}
function rangeLabel(c){return iso(c.start)===iso(c.end)?fmt(c.start):fmt(c.start)+' → '+fmt(c.end);}
function card(c){const very=c.items.some(x=>x.conv.very);let text;if(c.pol==='difficult')text=very?tr('veryWatchText'):tr('watchText');else text=tr('goodText');return '<div class="ap-period '+(c.pol==='difficult'?'difficult':'positive')+'" style="margin-bottom:10px"><div><b>'+esc(c.pol==='difficult'?tr('watch'):tr('good'))+'</b><strong>'+esc(rangeLabel(c))+'</strong><small>'+esc(very?tr('very'):tr('confirmed'))+' · '+esc(text)+'</small></div></div>';}
function titleRange(start,days){const end=new Date(start);end.setDate(end.getDate()+Math.max(0,days-1));return days===1?fmt(start):fmt(start)+' → '+fmt(end);}
async function runHealth(start,days,period,onProgress){
 const hits=await scan(new Date(start),Math.max(1,Number(days)||1),onProgress),groups=clusters(hits);
 const difficult=groups.filter(x=>x.pol==='difficult').slice(0,4),positive=groups.filter(x=>x.pol==='positive').slice(0,4);
 let body='<div class="ap-card ap-health-v175"><div class="ap-eyebrow">'+esc(tr('health'))+'</div><h2 style="margin:6px 0 6px">'+esc(titleRange(new Date(start),days))+'</h2><p class="ap-muted">'+esc(tr('intro'))+'</p>';
 if(!difficult.length&&!positive.length)body+='<p>'+esc(tr('none'))+'</p>';
 if(difficult.length)body+='<h3 style="margin-top:18px">'+esc(tr('watch'))+'</h3>'+difficult.map(card).join('');
 if(positive.length)body+='<h3 style="margin-top:18px">'+esc(tr('good'))+'</h3>'+positive.map(card).join('');
 body+='<div class="ap-note" style="margin-top:16px">'+esc(tr('notice'))+'</div></div>';
 return body;
}
window.apRunStrictHealthForecastV175=runHealth;
window.AP_HEALTH_METHOD_V175={engine:'V121',directSource:'apV51Signals + apConvergenceFromRowV76',fallbackSource:'AstroTruth.day',minForce:2.2,minFamilies:2,veryFamilies:3,diagnosis:false};

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
