/* Astro Paquita V176 — Santé détaillée + correctif mobile.
   Cette couche n'ajoute aucun calcul astronomique. Elle lit uniquement les
   signaux V121 déjà structurés par AstroTruth.day(), puis les présente avec
   leur niveau, leur axe, leur convergence et, lorsqu'il existe, le libellé V121.
   Elle remplace uniquement le rendu du domaine Santé. */
(function(){
'use strict';
if(window.__AP_V176_HEALTH_DETAIL__)return;
window.__AP_V176_HEALTH_DETAIL__=true;

const A=window.AstroTruth;
if(!A||typeof A.day!=='function')return;
const q=(s,r)=>(r||document).querySelector(s);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const META={fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'};
const TX={
 fr:{health:'Santé',intro:'Lecture astrologique de la vitalité, des fragilités possibles et des périodes de vigilance',level:'Niveau',axis:'Axe astrologique',why:'Pourquoi ce signal ressort',source:'Signal V121',confirmed:'Vigilance confirmée',very:'Vigilance forte',support:'Soutien confirmé',lightWatch:'Vigilance légère',lightGood:'Soutien léger',stable:'Période plutôt stable',stableText:'Aucun pic de fragilité suffisamment marqué ne ressort des signaux Santé V121 sur cette période. La tendance astrologique générale est plutôt stable.',notice:'Cette lecture décrit des tendances astrologiques de santé et de vitalité. Elle ne permet ni d’identifier une maladie précise, ni de poser un diagnostic.'},
 en:{health:'Health',intro:'Astrological reading of vitality, possible vulnerabilities and periods requiring more care',level:'Level',axis:'Astrological focus',why:'Why this signal stands out',source:'V121 signal',confirmed:'Confirmed caution',very:'Strong caution',support:'Confirmed support',lightWatch:'Light caution',lightGood:'Light support',stable:'Rather stable period',stableText:'No sufficiently marked health vulnerability peak stands out in the V121 Health signals for this period. The overall astrological trend is rather stable.',notice:'This reading describes astrological health and vitality trends. It cannot identify a specific illness or provide a diagnosis.'},
 es:{health:'Salud',intro:'Lectura astrológica de la vitalidad, posibles fragilidades y períodos de mayor vigilancia',level:'Nivel',axis:'Eje astrológico',why:'Por qué destaca esta señal',source:'Señal V121',confirmed:'Vigilancia confirmada',very:'Vigilancia fuerte',support:'Apoyo confirmado',lightWatch:'Vigilancia ligera',lightGood:'Apoyo ligero',stable:'Período bastante estable',stableText:'No aparece ningún pico de fragilidad suficientemente marcado en las señales V121 de Salud durante este período. La tendencia astrológica general es bastante estable.',notice:'Esta lectura describe tendencias astrológicas de salud y vitalidad. No permite identificar una enfermedad concreta ni establecer un diagnóstico.'},
 ar:{health:'الصحة',intro:'قراءة فلكية للحيوية ونقاط الضعف المحتملة وفترات الحاجة إلى مزيد من الانتباه',level:'المستوى',axis:'المحور الفلكي',why:'لماذا تبرز هذه الإشارة',source:'إشارة V121',confirmed:'تنبيه مؤكد',very:'تنبيه قوي',support:'دعم مؤكد',lightWatch:'تنبيه خفيف',lightGood:'دعم خفيف',stable:'فترة مستقرة نسبياً',stableText:'لا تظهر ذروة ضعف صحي قوية بما يكفي في إشارات V121 خلال هذه الفترة. لذلك يبدو الاتجاه الفلكي العام مستقراً نسبياً.',notice:'تصف هذه القراءة اتجاهات فلكية مرتبطة بالصحة والحيوية، ولا تحدد مرضاً بعينه ولا تقدم تشخيصاً.'}
};
function lang(){const l=String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2);return TX[l]?l:'fr';}
function tr(k){return TX[lang()][k]||TX.fr[k]||k;}
function fmt(d){return d.toLocaleDateString(META[lang()]||META.fr,{day:'numeric',month:'short',year:'numeric'});}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function healthDomain(v){const s=String(v||'').toLowerCase();return ['bienetre','bien-être','wellbeing','health','sante','santé'].includes(s);}
function pol(row){const p=String(row?.polarity||row?.polarite||'').toLowerCase();if(['difficult','difficile','negative'].includes(p))return'difficult';if(['positive','favorable','favourable'].includes(p))return'positive';return'mixed';}
function force(row){return Number(row?.force??row?.strength??0)||0;}
function level(row){return String(row?.level||row?.niveau||'').toLowerCase();}
function families(row){return [...new Set([...(row?.families||[]),...(row?.coreFamilies||[]),...(row?.anchorFamilies||[]),...(row?.familles||[])].filter(Boolean).map(String))];}
function strong(row){return ['fort','exceptionnel','strong','exceptional'].includes(level(row))||force(row)>=2.2;}
function usable(row){return strong(row)||['marque','marked'].includes(level(row))||force(row)>=1;}
function signalText(row){
 const vals=[row?.label,...(Array.isArray(row?.scenarios)?row.scenarios:[]),...(Array.isArray(row?.signatures)?row.signatures:[])];
 for(const v of vals){const s=String(v||'').replace(/\s+/g,' ').trim();if(s.length>=4&&s.length<=180)return s;}
 return '';
}
function focus(row,p){
 const s=([signalText(row),row?.label,...(row?.scenarios||[])].join(' ')).toLowerCase();
 if(/sommeil|repos|récup|recup|rythme/.test(s))return 'Récupération / rythme';
 if(/fatigue|épuis|epuis|énergie|energie|vital/.test(s))return 'Vitalité / fatigue';
 if(/stress|tension|pression|nerveu|nervos/.test(s))return 'Tension / stress';
 if(/émotion|emotion|moral|anxi|humeur/.test(s))return 'Équilibre émotionnel / nerveux';
 if(/douleur|inflamm|physique|corps|sensibil/.test(s))return 'Sensibilité physique';
 return p==='difficult'?'Fragilité générale / vitalité':'Vitalité / récupération';
}
function why(conv,strict){
 if(conv.very)return 'Plusieurs familles de signaux V121 se recoupent fortement sur cette période.';
 if(strict)return 'Le signal est confirmé par plusieurs indicateurs V121 qui vont dans le même sens.';
 if(conv.families>0)return 'Le signal existe dans V121, mais il repose sur moins de confirmations indépendantes.';
 return 'Le signal ressort dans V121, mais sa convergence reste légère : il est présenté comme tendance secondaire.';
}
function levelLabel(item,strict){
 if(item.p==='difficult')return strict?(item.conv.very?tr('very'):tr('confirmed')):tr('lightWatch');
 return strict?tr('support'):tr('lightGood');
}
function score(row,conv){return force(row)*10+conv.families*5+conv.support*2;}
function dayCandidates(d){
 let truth=null;try{truth=A.day(d,'all');}catch(e){truth=null;}
 const rows=(truth&&Array.isArray(truth.signals)?truth.signals:[]).filter(r=>r&&healthDomain(r.domain)&&usable(r));
 const out=[];
 for(const r of rows){
   const p=pol(r);if(p==='mixed')continue;
   const peers=rows.filter(x=>pol(x)===p&&usable(x)).length;
   const fam=families(r).length;
   const conv={families:fam,support:peers,confirmed:fam>=2||peers>=2,very:fam>=3||peers>=3};
   out.push({date:new Date(d),row:r,p,conv,strict:strong(r)&&conv.confirmed,score:score(r,conv)});
 }
 out.sort((a,b)=>b.score-a.score);
 return out[0]||null;
}
async function scan(start,days){
 const hits=[],CHUNK=20;
 for(let i=0;i<days;i+=CHUNK){
   for(let k=i;k<Math.min(i+CHUNK,days);k++){
     const d=new Date(start);d.setDate(d.getDate()+k);d.setHours(12,0,0,0);
     const c=dayCandidates(d);if(c)hits.push(c);
   }
   await new Promise(r=>setTimeout(r,0));
 }
 return hits;
}
function clusters(hits){
 const sorted=[...hits].sort((a,b)=>a.date-b.date),out=[];
 for(const h of sorted){
   const prev=out[out.length-1];
   if(prev&&prev.p===h.p&&prev.strict===h.strict&&Math.round((h.date-prev.end)/86400000)<=2){prev.end=new Date(h.date);prev.items.push(h);if(h.score>prev.peak.score)prev.peak=h;}
   else out.push({start:new Date(h.date),end:new Date(h.date),p:h.p,strict:h.strict,items:[h],peak:h});
 }
 return out.sort((a,b)=>b.peak.score-a.peak.score);
}
function range(c){return iso(c.start)===iso(c.end)?fmt(c.start):fmt(c.start)+' → '+fmt(c.end);}
function card(c){
 const x=c.peak,src=signalText(x.row),lvl=levelLabel(x,c.strict),axis=focus(x.row,x.p);
 return '<div class="ap-health-detail '+(x.p==='difficult'?'is-watch':'is-good')+'">'+
   '<div class="ap-health-detail-top"><b>'+esc(lvl)+'</b><strong>'+esc(range(c))+'</strong></div>'+
   '<div class="ap-health-detail-grid">'+
     '<p><span>'+esc(tr('axis'))+'</span>'+esc(axis)+'</p>'+
     '<p><span>'+esc(tr('why'))+'</span>'+esc(why(x.conv,c.strict))+'</p>'+
     (src?'<p class="ap-health-source"><span>'+esc(tr('source'))+'</span>'+esc(src)+'</p>':'')+
   '</div></div>';
}
function titleRange(start,days){const end=new Date(start);end.setDate(end.getDate()+Math.max(0,days-1));return days===1?fmt(start):fmt(start)+' → '+fmt(end);}
async function run(start,days){
 const n=Math.max(1,Number(days)||1),hits=await scan(new Date(start),n),groups=clusters(hits);
 const strict=groups.filter(g=>g.strict).slice(0,4),light=groups.filter(g=>!g.strict).slice(0,3);
 let html='<div class="ap-card ap-health-v176"><div class="ap-eyebrow">'+esc(tr('health'))+'</div><h2>'+esc(titleRange(new Date(start),n))+'</h2><p class="ap-muted">'+esc(tr('intro'))+'</p>';
 if(strict.length){html+='<h3>Signaux les plus confirmés</h3>'+strict.map(card).join('');}
 if(light.length){html+='<h3>Tendances secondaires</h3>'+light.map(card).join('');}
 if(!strict.length&&!light.length){html+='<div class="ap-health-stable"><b>'+esc(tr('stable'))+'</b><p>'+esc(tr('stableText'))+'</p></div>';}
 html+='<div class="ap-note ap-health-note">'+esc(tr('notice'))+'</div></div>';
 return html;
}
window.apRunStrictHealthForecastV175=run;
window.AP_HEALTH_METHOD_V176={engine:'V121',source:'AstroTruth.day',display:'detailed',diagnosis:false};

function css(){
 if(document.getElementById('ap-v176-health-style'))return;
 const s=document.createElement('style');s.id='ap-v176-health-style';s.textContent=`
 .ap-health-v176{width:100%;max-width:100%;min-width:0;overflow:hidden}
 .ap-health-v176 h2{margin:7px 0 9px;font-size:clamp(28px,5vw,38px);line-height:1.08;white-space:normal;overflow-wrap:anywhere}
 .ap-health-v176 h3{margin:22px 0 10px}
 .ap-health-detail{width:100%;max-width:100%;min-width:0;border-radius:18px;padding:16px;margin:0 0 12px;overflow:hidden}
 .ap-health-detail.is-watch{background:var(--ap-red-bg,#f6e7e7);color:#74464e}
 .ap-health-detail.is-good{background:var(--ap-green-bg,#e9f2ea);color:#365d47}
 .ap-health-detail-top{display:flex;gap:10px;justify-content:space-between;align-items:flex-start;flex-wrap:wrap}
 .ap-health-detail-top b{font:600 20px/1.1 Cormorant Garamond,serif}
 .ap-health-detail-top strong{font-size:13px;line-height:1.4;text-align:right;overflow-wrap:anywhere}
 .ap-health-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px}
 .ap-health-detail-grid p{margin:0;padding:10px 11px;border-radius:12px;background:rgba(255,255,255,.38);font-size:13px;line-height:1.5;min-width:0;overflow-wrap:anywhere}
 .ap-health-detail-grid p span{display:block;font-size:9px;letter-spacing:.12em;text-transform:uppercase;opacity:.7;font-weight:800;margin-bottom:4px}
 .ap-health-detail-grid .ap-health-source{grid-column:1/-1}
 .ap-health-stable{padding:15px;border-radius:16px;background:var(--ap-amber-bg,#f6eddc);color:#755a30;margin-top:14px}
 .ap-health-stable p{margin:6px 0 0}
 .ap-health-note{margin-top:16px}
 @media(max-width:760px){
   body.ap-route-forecast .ap-content,body.ap-route-forecast #ap-page,body.ap-route-forecast #ap-forecast-result{width:100%!important;max-width:100%!important;min-width:0!important;margin-left:0!important;margin-right:0!important;transform:none!important;overflow-x:hidden!important}
   .ap-health-v176{width:100%!important;max-width:100%!important;min-width:0!important;margin-left:0!important;margin-right:0!important;padding:18px 15px!important;transform:none!important}
   .ap-health-v176 h2,.ap-health-v176 h3,.ap-health-v176 p,.ap-health-v176 b,.ap-health-v176 strong,.ap-health-v176 small{max-width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}
   .ap-health-detail{padding:14px!important;margin-left:0!important;margin-right:0!important;transform:none!important}
   .ap-health-detail-top{display:block!important}
   .ap-health-detail-top strong{display:block!important;text-align:left!important;margin-top:6px!important}
   .ap-health-detail-grid{grid-template-columns:1fr!important}
   .ap-health-detail-grid .ap-health-source{grid-column:auto!important}
 }
 `;document.head.appendChild(s);
}
css();
})();
