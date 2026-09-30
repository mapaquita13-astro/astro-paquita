/* Astro Paquita V175 — domaine Santé distinct de Bien-être.
   RÈGLE : aucun nouveau calcul astronomique. Cette couche réutilise exclusivement
   les signaux sectoriels V121 (apV51Signals) et leur convergence validée
   (apConvergenceFromRowV76). Santé applique un seuil plus strict que Bien-être :
   signal fort/exceptionnel (ou force >= 2.2) ET convergence confirmée
   (>= 2 familles ou poids >= 4). Aucun diagnostic médical n'est produit. */
(function(){
'use strict';
if(window.__AP_V175_HEALTH_DOMAIN__)return;
window.__AP_V175_HEALTH_DOMAIN__=true;

const META={fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'};
const TX={
 fr:{health:'Santé',intro:'Lecture astrologique de la vitalité et des périodes de vigilance',loading:'Analyse Santé V121…',good:'Périodes plus soutenues',watch:'Périodes de vigilance',none:'Aucune période Santé suffisamment confirmée ne ressort sur cette plage. Le site ne complète pas artificiellement le résultat.',confirmed:'Convergence confirmée',very:'Très forte convergence',goodText:'Vitalité, récupération ou capacité d’adaptation astrologiquement mieux soutenues.',watchText:'Période astrologiquement plus exigeante : privilégier récupération, rythme régulier et attention aux signaux du corps.',notice:'Cette lecture décrit des tendances astrologiques de vitalité. Elle ne constitue ni un diagnostic, ni un avis médical.'},
 en:{health:'Health',intro:'Astrological reading of vitality and periods requiring more care',loading:'Analysing Health with V121…',good:'More supportive periods',watch:'Periods requiring more care',none:'No sufficiently confirmed Health period stands out in this range. The site does not artificially fill the result.',confirmed:'Confirmed convergence',very:'Very strong convergence',goodText:'Vitality, recovery or adaptability are astrologically better supported.',watchText:'A more demanding astrological period: favour recovery, a steady rhythm and attention to bodily signals.',notice:'This reading describes astrological vitality trends. It is not a diagnosis or medical advice.'},
 es:{health:'Salud',intro:'Lectura astrológica de la vitalidad y de los períodos de mayor vigilancia',loading:'Analizando Salud con V121…',good:'Períodos más favorables',watch:'Períodos de vigilancia',none:'No aparece ningún período de Salud suficientemente confirmado en este intervalo. El sitio no completa artificialmente el resultado.',confirmed:'Convergencia confirmada',very:'Convergencia muy fuerte',goodText:'La vitalidad, la recuperación o la capacidad de adaptación están astrológicamente mejor sostenidas.',watchText:'Período astrológicamente más exigente: favorecer la recuperación, un ritmo regular y la atención a las señales del cuerpo.',notice:'Esta lectura describe tendencias astrológicas de vitalidad. No es un diagnóstico ni un consejo médico.'},
 ar:{health:'الصحة',intro:'قراءة فلكية للحيوية وفترات الحاجة إلى مزيد من الانتباه',loading:'جارٍ تحليل الصحة بمحرك V121…',good:'فترات أكثر دعماً',watch:'فترات تستدعي الانتباه',none:'لا تظهر خلال هذه الفترة مؤشرات صحية مؤكدة بما يكفي. لا يضيف الموقع نتائج مصطنعة.',confirmed:'تقارب مؤكد',very:'تقارب قوي جداً',goodText:'الحيوية والتعافي والقدرة على التكيف مدعومة فلكياً بصورة أفضل.',watchText:'فترة فلكية أكثر تطلباً: يُفضّل الاهتمام بالتعافي والإيقاع المنتظم وإشارات الجسد.',notice:'هذه القراءة تصف اتجاهات فلكية للحيوية ولا تمثل تشخيصاً أو نصيحة طبية.'}
};
let selected=false,observer=null,pending=false;
const q=(s,r)=>(r||document).querySelector(s);
const qa=(s,r)=>Array.from((r||document).querySelectorAll(s));
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function lang(){const l=String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2);return TX[l]?l:'fr';}
function tr(k){return TX[lang()][k]||TX.fr[k]||k;}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function fmt(d){return d.toLocaleDateString(META[lang()]||META.fr,{day:'numeric',month:'short',year:'numeric'});}
function isHealthDomain(raw){const s=String(raw||'').toLowerCase();return s==='sante'||s==='santé'||s==='health';}
function strong(row){const level=String(row?.niveau||row?.level||'').toLowerCase();const force=Number(row?.force??row?.strength??0)||0;return level==='fort'||level==='exceptionnel'||force>=2.2;}
function convergence(row,date){
 try{
   const sig=window.apConvergenceFromRowV76(row,'sante',date);
   const fam=sig&&Array.isArray(sig.familles)?sig.familles.length:0;
   const weight=Number(sig&&sig.poids)||0;
   return {families:fam,weight,confirmed:fam>=2||weight>=4,very:fam>=3||weight>=7};
 }catch(e){return {families:0,weight:0,confirmed:false,very:false};}
}
function polarity(row){const p=String(row?.polarite||row?.polarity||row?.pol||'').toLowerCase();if(p==='difficile'||p==='difficult'||p==='negative')return'difficult';if(p==='positive'||p==='favorable'||p==='favourable')return'positive';return'mixed';}
function score(row,conv){return (Number(row?.force??row?.strength??0)||0)*10+conv.families*4+conv.weight;}
function ensureEngine(){
 const missing=[];
 if(typeof window.apV51Signals!=='function')missing.push('apV51Signals');
 if(typeof window.apConvergenceFromRowV76!=='function')missing.push('apConvergenceFromRowV76');
 if(missing.length)throw new Error('Le calcul Santé V121 est momentanément indisponible.');
}
async function scan(start,days,onProgress){
 ensureEngine();const hits=[],CHUNK=30;
 for(let i=0;i<days;i+=CHUNK){
   for(let k=i;k<Math.min(i+CHUNK,days);k++){
     const d=new Date(start);d.setDate(d.getDate()+k);d.setHours(12,0,0,0);
     let rows=[];try{rows=window.apV51Signals(d,'marque')||[];}catch(e){rows=[];}
     const candidates=rows.filter(r=>r&&isHealthDomain(r.domain)&&strong(r)).map(r=>{const c=convergence(r,d);return {date:new Date(d),row:r,conv:c,pol:polarity(r),score:score(r,c)};}).filter(x=>x.conv.confirmed&&x.pol!=='mixed');
     if(candidates.length){candidates.sort((a,b)=>b.score-a.score);hits.push(candidates[0]);}
   }
   if(onProgress)onProgress(Math.min(95,Math.round(((i+CHUNK)/Math.max(1,days))*95)));
   await new Promise(r=>setTimeout(r,0));
 }
 return hits;
}
function clusters(hits){
 const sorted=[...hits].sort((a,b)=>a.date-b.date);const out=[];
 for(const h of sorted){
   const prev=out[out.length-1];
   if(prev&&prev.pol===h.pol&&Math.round((h.date-prev.end)/86400000)<=2){prev.end=new Date(h.date);prev.items.push(h);if(h.score>prev.peak.score)prev.peak=h;}
   else out.push({start:new Date(h.date),end:new Date(h.date),pol:h.pol,items:[h],peak:h});
 }
 return out.sort((a,b)=>b.peak.score-a.peak.score);
}
function rangeLabel(c){return iso(c.start)===iso(c.end)?fmt(c.start):fmt(c.start)+' → '+fmt(c.end);}
function card(c){const very=c.items.some(x=>x.conv.very);const text=c.pol==='difficult'?tr('watchText'):tr('goodText');return '<div class="ap-period '+(c.pol==='difficult'?'difficult':'positive')+'" style="margin-bottom:10px"><div><b>'+esc(c.pol==='difficult'?tr('watch'):tr('good'))+'</b><strong>'+esc(rangeLabel(c))+'</strong><small>'+esc(very?tr('very'):tr('confirmed'))+' · '+esc(text)+'</small></div></div>';}
function titleRange(start,days){const end=new Date(start);end.setDate(end.getDate()+Math.max(0,days-1));return days===1?fmt(start):fmt(start)+' → '+fmt(end);}
async function runHealth(start,days,period,onProgress){
 const hits=await scan(new Date(start),Math.max(1,Number(days)||1),onProgress);const groups=clusters(hits);
 const difficult=groups.filter(x=>x.pol==='difficult').slice(0,4);const positive=groups.filter(x=>x.pol==='positive').slice(0,4);
 let body='<div class="ap-card ap-health-v175"><div class="ap-eyebrow">'+esc(tr('health'))+'</div><h2 style="margin:6px 0 6px">'+esc(titleRange(new Date(start),days))+'</h2><p class="ap-muted">'+esc(tr('intro'))+'</p>';
 if(!difficult.length&&!positive.length)body+='<p>'+esc(tr('none'))+'</p>';
 if(difficult.length)body+='<h3 style="margin-top:18px">'+esc(tr('watch'))+'</h3>'+difficult.map(card).join('');
 if(positive.length)body+='<h3 style="margin-top:18px">'+esc(tr('good'))+'</h3>'+positive.map(card).join('');
 body+='<div class="ap-note" style="margin-top:16px">'+esc(tr('notice'))+'</div></div>';
 return body;
}
window.apRunStrictHealthForecastV175=runHealth;
window.AP_HEALTH_METHOD_V175={engine:'V121',source:'apV51Signals',convergence:'apConvergenceFromRowV76',minForce:2.2,minFamilies:2,minWeight:4,veryFamilies:3,veryWeight:7,diagnosis:false};

function inject(){
 pending=false;if(!document.body.classList.contains('ap-route-forecast'))return;
 const grid=q('.ap-domain-choice-grid');if(!grid)return;
 let b=q('[data-domain="sante"]',grid);
 if(!b){
   b=document.createElement('button');b.className='ap-domain-choice';b.type='button';b.dataset.domain='sante';b.innerHTML='<i>⚕</i><span>'+esc(tr('health'))+'</span>';
   const wellbeing=q('[data-domain="bienetre"]',grid);if(wellbeing&&wellbeing.nextSibling)grid.insertBefore(b,wellbeing.nextSibling);else grid.appendChild(b);
   b.addEventListener('click',function(ev){ev.preventDefault();selected=true;qa('[data-domain]',grid).forEach(x=>x.classList.toggle('active',x===b));const out=q('#ap-forecast-result');if(out)out.innerHTML='';});
 }
 const span=q('span',b);if(span)span.textContent=tr('health');
 if(selected)qa('[data-domain]',grid).forEach(x=>x.classList.toggle('active',x===b));
}
document.addEventListener('click',function(ev){const b=ev.target&&ev.target.closest?ev.target.closest('.ap-route-forecast [data-domain]'):null;if(!b)return;if(b.dataset.domain!=='sante')selected=false;},true);
function schedule(){if(pending)return;pending=true;requestAnimationFrame(inject);}
function start(){inject();observer=new MutationObserver(schedule);observer.observe(document.getElementById('ap-final-root')||document.body,{childList:true,subtree:true});document.addEventListener('change',e=>{if(e.target&&e.target.id==='ap-lang')setTimeout(schedule,0);},true);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
