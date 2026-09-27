/* Astro Paquita V166 — cohérence Mon avenir + période choisie pour Le bon moment.
   - La courbe indique toujours clairement le domaine affiché.
   - Le domaine choisi pilote aussi les cartes et les périodes à retenir.
   - Le Bon moment conserve intégralement l'algorithme V121 ; seule la borne temporelle
     10 ans est rendue paramétrable (date de début + date de fin, maximum 10 ans).
   Aucun calcul natal, maison, transit ou aspect V121 n'est remplacé. */
(function(){
'use strict';
if(window.__AP_V166_DOMAIN_TIMING__)return;
window.__AP_V166_DOMAIN_TIMING__=true;

const A=window.AstroTruth;
if(!A)return;
const DOMAINS=['amour','travail','argent','bienetre','famille','voyage'];
const LABEL={amour:'Amour',travail:'Travail',argent:'Argent',bienetre:'Bien-être',famille:'Famille',voyage:'Voyage'};
const ICON={amour:'♡',travail:'♜',argent:'◇',bienetre:'☘',famille:'⌂',voyage:'✈'};
let selectedDomain='amour',observer=null,scheduled=false,applying=false,timingBusy=false,rangeRunner=null;

function q(s,r){return (r||document).querySelector(s);}
function qa(s,r){return Array.from((r||document).querySelectorAll(s));}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function clamp(v,min,max){v=Number(v);return Number.isFinite(v)?Math.max(min,Math.min(max,v)):0;}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function parseIso(s){const d=new Date(String(s||'')+'T12:00:00');return isNaN(d)?null:d;}
function addMonths(d,n){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12);x.setMonth(x.getMonth()+n);return x;}
function monthsCount(){const a=q('.ap-route-future [data-months].active');return Number(a?.dataset?.months||12)===24?24:12;}
function monthLabel(ym,short){const m=/^(\d{4})-(\d{2})/.exec(String(ym||''));if(!m)return String(ym||'');const d=new Date(Number(m[1]),Number(m[2])-1,1,12);return d.toLocaleDateString('fr-FR',short?{month:'short'}:{month:'long',year:'numeric'});}
function score(p,d){return clamp(p?.scores?.[d],-5,5);}

function chartSvg(points,domain){
  const width=900,height=310,padL=102,padT=20,padB=45,plotH=height-padT-padB,plotW=width-padL-18;
  const levels=[['Très favorable',5],['Favorable',2.5],['Stable',0],['Plus délicat',-2.5],['Délicat',-5]];
  const n=Math.max(1,points.length),step=n>1?plotW/(n-1):plotW;
  const rows=points.map((p,i)=>{const s=score(p,domain);return{x:padL+i*step,y:padT+(5-s)/10*plotH,s,p};});
  let out='<svg class="ap-v166-domain-chart '+(points.length>12?'ap-v166-24':'ap-v166-12')+'" viewBox="0 0 '+width+' '+height+'" role="img" aria-label="Tendances '+esc(LABEL[domain])+'">';
  levels.forEach(([lab,v])=>{const y=padT+(5-v)/10*plotH;out+='<line x1="'+padL+'" y1="'+y+'" x2="'+(width-18)+'" y2="'+y+'" stroke="'+(v===0?'#c7b5a7':'#e8ddd1')+'" stroke-width="'+(v===0?1.2:.7)+'"/><text x="8" y="'+(y+4)+'" font-size="11" fill="'+(v<0?'#a05660':'#6d6168')+'">'+lab+'</text>';});
  if(rows.length){
    const area=rows[0].x+','+(padT+plotH)+' '+rows.map(a=>a.x+','+a.y).join(' ')+' '+rows[rows.length-1].x+','+(padT+plotH);
    out+='<polygon points="'+area+'" fill="rgba(116,165,143,.16)"/><polyline points="'+rows.map(a=>a.x+','+a.y).join(' ')+'" fill="none" stroke="#2f8581" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    rows.forEach((a,i)=>{const c=a.s>1?'#4f8064':a.s<-1?'#a65e66':'#c79a36';out+='<circle cx="'+a.x+'" cy="'+a.y+'" r="5" fill="'+c+'" stroke="#fffaf2" stroke-width="2"><title>'+esc(monthLabel(a.p.month,false))+' · '+esc(LABEL[domain])+'</title></circle>';if(points.length<=12||i%2===0)out+='<text x="'+a.x+'" y="'+(height-16)+'" text-anchor="middle" font-size="10" fill="#76686e">'+esc(monthLabel(a.p.month,true))+'</text>';});
  }
  return out+'</svg>';
}
function domainSummary(points,domain){
  const vals=points.map(p=>({month:p.month,score:score(p,domain)}));if(!vals.length)return'';
  const best=[...vals].sort((a,b)=>b.score-a.score)[0],worst=[...vals].sort((a,b)=>a.score-b.score)[0],range=best.score-worst.score;
  if(range<.35&&Math.max(Math.abs(best.score),Math.abs(worst.score))<.75){
    return '<div class="ap-period mixed"><span class="ap-period-icon">◒</span><div><b>'+esc(LABEL[domain])+' · tendance stable</b><strong>'+esc(monthLabel(vals[0].month,false))+' → '+esc(monthLabel(vals[vals.length-1].month,false))+'</strong><small>Aucun pic mensuel net sur ce repère visuel. Ouvrez les prévisions détaillées pour analyser la période complète.</small></div></div>';
  }
  let h='';
  if(best.score>.5)h+='<div class="ap-period positive"><span class="ap-period-icon">★</span><div><b>'+esc(LABEL[domain])+' · période plus porteuse</b><strong>'+esc(monthLabel(best.month,false))+'</strong><small>Repère mensuel, à approfondir dans les prévisions détaillées.</small></div></div>';
  if(worst.score<-.5)h+='<div class="ap-period difficult"><span class="ap-period-icon">ϟ</span><div><b>'+esc(LABEL[domain])+' · période plus sensible</b><strong>'+esc(monthLabel(worst.month,false))+'</strong><small>Repère mensuel : gardez davantage de marge autour de cette période.</small></div></div>';
  if(!h)h='<div class="ap-period mixed"><span class="ap-period-icon">◒</span><div><b>'+esc(LABEL[domain])+' · variations modérées</b><strong>'+esc(monthLabel(best.month,false))+'</strong><small>Les écarts restent faibles sur les repères mensuels.</small></div></div>';
  return h;
}
function renderMilestones(t,domain){
  const box=q('.ap-route-future .ap-future-milestones');if(!box)return;
  const title=q('h3',box);if(title)title.textContent='Périodes à retenir · '+LABEL[domain];
  const list=q('.ap-aspect-list',box);
  if(!list)return;
  const arr=(t.milestones||[]).filter(s=>s.domain===domain).slice(0,10);
  list.innerHTML=arr.length?arr.map(s=>'<div class="ap-aspect" style="grid-template-columns:1fr auto"><span><strong>'+esc(s.date||'')+'</strong> · '+esc(s.label||s.level||'Période marquée')+'</span><span class="ap-badge '+(s.polarity==='positive'?'good':s.polarity==='difficile'?'bad':'warn')+'">'+esc(s.polarity||'mixte')+'</span></div>').join(''):'<p>Aucune période suffisamment marquée ne ressort pour '+esc(LABEL[domain])+' sur ces repères mensuels.</p>';
}
function bindFutureAI(t,domain){
  const b=q('#ap-future-ai');if(!b)return;
  b.textContent='Interpréter '+LABEL[domain].toLowerCase();
  b.onclick=async function(ev){
    ev?.preventDefault();ev?.stopImmediatePropagation();
    const loader=q('#ap-future-ai-loader'),err=q('#ap-future-error'),report=q('#ap-future-report');
    if(loader)loader.classList.add('show');if(err){err.textContent='';err.classList.remove('show');}if(report)report.innerHTML='';
    try{
      if(typeof window.appelerClaude!=='function')throw new Error('Service IA indisponible');
      const slim={domain,domainLabel:LABEL[domain],months:t.months,points:(t.points||[]).map(p=>({month:p.month,score:score(p,domain),signals:(p.signals||[]).filter(s=>s.domain===domain).slice(0,5)}))};
      const data=await window.appelerClaude({feature:'forecast_future',featureContext:{module:'future',domain,label:LABEL[domain],months:t.months,engine:'V121-monthly-midpoint'},model:'claude-sonnet-4-6',max_tokens:1800,system:'Tu interprètes uniquement les repères mensuels fournis pour le domaine '+LABEL[domain]+'. Ils servent à décrire une tendance, pas à inventer un événement. Ne donne aucun score technique. Distingue les périodes plus porteuses, plus sensibles et stables. Si la courbe est plate, dis simplement qu’aucun mouvement mensuel net ne ressort et renvoie vers les prévisions détaillées pour une analyse de période plus fine.',messages:[{role:'user',content:JSON.stringify(slim)}]});
      const text=typeof window.texteClaude==='function'?window.texteClaude(data):(data?.content?.[0]?.text||data?.text||'');
      if(report)report.innerHTML=typeof window.formatRapport==='function'?window.formatRapport(text):'<p>'+esc(text)+'</p>';
    }catch(e){if(err){err.textContent=e?.message||'Interprétation indisponible.';err.classList.add('show');}}
    finally{if(loader)loader.classList.remove('show');}
  };
}
function renderFuture(){
  const card=q('.ap-route-future .ap-future-chart-card');if(!card||!A.period)return;
  let t;try{t=A.period(new Date(),monthsCount());}catch(e){return;}if(!t?.points?.length)return;
  const title=q('h3',card);if(title)title.textContent='Vos grandes tendances mois par mois';
  let intro=q('.ap-v166-domain-intro',card);if(!intro){intro=document.createElement('p');intro.className='ap-v166-domain-intro';title?.insertAdjacentElement('afterend',intro);}intro.innerHTML='Domaine affiché : <strong>'+esc(LABEL[selectedDomain])+'</strong>. Choisissez un autre domaine ci-dessous.';
  let tabs=q('.ap-v166-domain-tabs',card);if(!tabs){tabs=document.createElement('div');tabs.className='v161-domain-tabs ap-v166-domain-tabs';intro.insertAdjacentElement('afterend',tabs);}
  tabs.innerHTML=DOMAINS.map(d=>'<button type="button" data-v166-domain="'+d+'" class="'+(d===selectedDomain?'active':'')+'"><i>'+ICON[d]+'</i><span>'+LABEL[d]+'</span></button>').join('');
  qa('[data-v166-domain]',tabs).forEach(b=>b.onclick=function(ev){ev?.preventDefault();ev?.stopPropagation();selectedDomain=b.dataset.v166Domain;renderFuture();});
  const old=q('.v161-domain-tabs:not(.ap-v166-domain-tabs)',card);if(old)old.remove();
  const chart=q('.ap-chart',card);if(chart){chart.innerHTML=chartSvg(t.points,selectedDomain);chart.dataset.v166=selectedDomain+'-'+t.months;}
  const summaryGrid=q('.v161-summary-grid',card);if(summaryGrid)summaryGrid.remove();
  const period=q('.ap-route-future .ap-future-period-card .ap-period-cards');if(period)period.innerHTML=domainSummary(t.points,selectedDomain);
  const sub=q('.ap-route-future .ap-subtitle');if(sub)sub.textContent='La courbe est un repère mensuel pour le domaine choisi. Les prévisions détaillées analysent ensuite la période complète, jour par jour en interne, puis en font une synthèse.';
  renderMilestones(t,selectedDomain);bindFutureAI(t,selectedDomain);
  card.dataset.v166='1';
}

function timingRange(){
  const today=new Date();today.setHours(12,0,0,0);let start=today,end=addMonths(today,12);
  try{const v=JSON.parse(sessionStorage.getItem('ap-v166-timing-range')||'null');const a=parseIso(v?.start),b=parseIso(v?.end);if(a&&b&&b>=a){start=a;end=b;}}catch(e){}
  return {start,end};
}
function saveTimingRange(start,end){try{sessionStorage.setItem('ap-v166-timing-range',JSON.stringify({start:iso(start),end:iso(end)}));}catch(e){}}
function daysBetween(a,b){return Math.floor((b-a)/86400000)+1;}
function rangeLabel(a,b){return 'du '+a.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})+' au '+b.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});}
function buildRangeRunner(){
  if(rangeRunner)return rangeRunner;
  if(typeof window.lancerFenetre!=='function')throw new Error('Moteur V121 du Bon moment indisponible.');
  let src=String(window.lancerFenetre);
  const dayRe=/const\s+nbJours\s*=\s*365\s*\*\s*10\s*;/;
  const todayRe=/const\s+today\s*=\s*new\s+Date\(\)\s*;/;
  if(!dayRe.test(src)||!todayRe.test(src))throw new Error('Impossible de paramétrer la période sans modifier le moteur V121.');
  src=src.replace(todayRe,"const today = window.__AP_V166_TIMING_START ? new Date(window.__AP_V166_TIMING_START+'T12:00:00') : new Date();");
  src=src.replace(dayRe,'const nbJours = Math.max(1,Math.min(3650,Number(window.__AP_V166_TIMING_DAYS)||3650));');
  src=src.replace(/intentionCompatibleAge\(intentionF,new Date\(\)\)/,"intentionCompatibleAge(intentionF,window.__AP_V166_TIMING_START?new Date(window.__AP_V166_TIMING_START+'T12:00:00'):new Date())");
  rangeRunner=(0,eval)('('+src+')');
  return rangeRunner;
}
function timingError(msg){const e=q('#ap-timing-error');if(e){e.textContent=msg||'';e.classList.toggle('show',!!msg);}}
function timingLoader(on,label){const e=q('#ap-timing-loader');if(e){e.classList.toggle('show',!!on);const s=q('span',e);if(s&&label)s.textContent=label;}}
function timingInputs(){const a=parseIso(q('#ap-v166-from')?.value),b=parseIso(q('#ap-v166-to')?.value);return {start:a,end:b};}
function setTimingPreset(months){const today=new Date();today.setHours(12,0,0,0);const end=addMonths(today,months);q('#ap-v166-from').value=iso(today);q('#ap-v166-to').value=iso(end);saveTimingRange(today,end);}
async function runTiming(intent){
  if(timingBusy)return;timingError('');const r=timingInputs();
  if(!r.start||!r.end||r.end<r.start){timingError('Choisissez une période valide.');return;}
  const now=new Date();now.setHours(0,0,0,0);if(r.start<now){timingError('La recherche du Bon moment commence aujourd’hui ou dans le futur.');return;}
  const days=daysBetween(r.start,r.end);if(days>3650){timingError('La période maximale reste de 10 ans.');return;}
  saveTimingRange(r.start,r.end);timingBusy=true;timingLoader(true,'Analyse '+rangeLabel(r.start,r.end)+'…');
  const out=q('#ap-timing-result');if(out)out.innerHTML='';
  try{
    try{intentionF=intent;}catch(e){window.intentionF=intent;}
    window.__AP_V166_TIMING_START=iso(r.start);window.__AP_V166_TIMING_DAYS=days;
    const runner=buildRangeRunner();
    const oldAI=window.appelerClaude;
    const label=rangeLabel(r.start,r.end);
    if(typeof oldAI==='function')window.appelerClaude=async function(args){
      if(args&&args.feature==='window'){
        try{let txt=JSON.stringify(args);txt=txt.replace(/10 prochaines années/g,label).replace(/sur 10 ans/g,label).replace(/10 ans/g,label);args=JSON.parse(txt);}catch(e){}
      }
      return oldAI(args);
    };
    try{await runner();}finally{if(oldAI)window.appelerClaude=oldAI;}
    const wins=(window.AP_LAST_WINDOWS||[]).filter(w=>{const d=parseIso(w.date);return d&&d>=r.start&&d<=r.end;});
    const report=q('#f-rapport')?.innerHTML?.trim()||'';
    if(out)out.innerHTML='<div class="ap-card"><div class="ap-eyebrow">Période analysée</div><h3>'+esc(rangeLabel(r.start,r.end))+'</h3><p class="ap-muted">Le moteur de fenêtre V121 est inchangé ; seule la période de recherche est limitée à celle que vous avez choisie.</p></div>'+(wins.length?'<div style="margin-top:12px">'+wins.map((w,i)=>'<div class="ap-period positive" style="margin-bottom:9px"><div><b>'+(i===0?'Fenêtre la plus soutenue':'Autre fenêtre intéressante')+'</b><strong>'+esc(new Date(w.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}))+'</strong><small>'+esc(({very_convergent:'Très convergent',confirmed:'Confirmé',light:'Signal léger'})[w.reliability]||'Repère astrologique')+'</small></div></div>').join('')+'</div>':'<div class="ap-card" style="margin-top:12px"><p>Aucune fenêtre suffisamment confirmée ne ressort dans la période choisie.</p></div>')+(report?'<div class="ap-card" style="margin-top:12px"><div class="ap-report">'+report+'</div></div>':'');
  }catch(e){timingError(e?.message||'La recherche n’a pas pu être effectuée.');}
  finally{timingBusy=false;timingLoader(false);}
}
function renderTiming(){
  const page=q('.ap-route-timing #ap-page');if(!page)return;
  const sec=q('section',page);if(!sec)return;
  let box=q('#ap-v166-timing-range');
  if(!box){
    const r=timingRange(),grid=q('.ap-grid',sec);
    box=document.createElement('div');box.id='ap-v166-timing-range';box.className='ap-card ap-v166-range';
    box.innerHTML='<div class="ap-eyebrow">Période à analyser</div><h3>Sur quelle période voulez-vous chercher le bon moment ?</h3><div class="ap-v166-presets"><button type="button" data-v166-months="3">3 mois</button><button type="button" data-v166-months="6">6 mois</button><button type="button" data-v166-months="12" class="active">12 mois</button><button type="button" data-v166-months="24">24 mois</button><button type="button" data-v166-months="60">5 ans</button></div><div class="ap-v166-dategrid"><label>Du<input type="date" id="ap-v166-from" value="'+iso(r.start)+'" min="'+iso(new Date())+'"></label><label>Au<input type="date" id="ap-v166-to" value="'+iso(r.end)+'" min="'+iso(new Date())+'"></label></div><p class="ap-muted">Maximum 10 ans, mais vous pouvez cibler quelques mois seulement. Par défaut : 12 mois.</p>';
    if(grid)grid.insertAdjacentElement('beforebegin',box);else sec.appendChild(box);
    qa('[data-v166-months]',box).forEach(b=>b.onclick=function(){qa('[data-v166-months]',box).forEach(x=>x.classList.toggle('active',x===b));setTimingPreset(Number(b.dataset.v166Months));});
    ['ap-v166-from','ap-v166-to'].forEach(id=>q('#'+id)?.addEventListener('change',()=>{const rr=timingInputs();if(rr.start&&rr.end)saveTimingRange(rr.start,rr.end);}));
  }
  const sub=q('.ap-route-timing .ap-subtitle');if(sub)sub.textContent='Choisissez votre intention puis la période à analyser. Le calcul reste celui de la Fenêtre idéale V121, sans balayage inutile de 10 ans si vous ne le demandez pas.';
  const load=q('#ap-timing-loader span');if(load)load.textContent='Analyse de la période choisie…';
  qa('.ap-route-timing [data-intent]').forEach(b=>{if(b.dataset.v166==='1')return;b.dataset.v166='1';b.onclick=function(ev){ev?.preventDefault();ev?.stopImmediatePropagation();runTiming(b.dataset.intent);return false;};const small=q('small',b);if(small)small.textContent='Analyse personnalisée';});
}

function improveCopy(){
  const retired=['avenir raconté','comparer les dates','notifications','historique'];
  qa('#ap-final-root button,#ap-final-root a').forEach(el=>{const txt=(el.textContent||'').trim().toLowerCase();if(retired.some(x=>txt===x||txt.startsWith(x+' ')))el.remove();});
  const karmic=q('.ap-route-natal [data-natal-tab="karmic"]');if(karmic)karmic.title='Lecture symbolique à partir du même thème natal ; ce n’est pas un calcul séparé dans l’état actuel.';
}
function css(){if(q('#ap-v166-style'))return;const s=document.createElement('style');s.id='ap-v166-style';s.textContent='.ap-v166-domain-intro{margin:4px 0 12px;color:#766b73;font-size:12px;line-height:1.5}.ap-v166-domain-intro strong{color:#4a1a43}.ap-v166-range{margin:16px 0 18px!important;padding:18px!important}.ap-v166-presets{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.ap-v166-presets button{border:1px solid #dac8b2;background:#fffaf3;color:#5d4d58;border-radius:999px;padding:9px 13px;font-weight:700}.ap-v166-presets button.active{background:#4a1a43;color:#fff;border-color:#4a1a43}.ap-v166-dategrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ap-v166-dategrid label{font-size:11px;font-weight:700;color:#665965;display:grid;gap:5px}.ap-v166-dategrid input{width:100%;border:1px solid #ddcdb9;border-radius:10px;background:#fffdf8;padding:10px;color:#4c3947}@media(max-width:760px){.ap-v166-domain-tabs{display:grid!important;grid-template-columns:repeat(3,1fr)!important}.ap-route-future .ap-chart .ap-v166-12{min-width:0!important;width:100%!important;height:auto!important}.ap-route-future .ap-chart .ap-v166-24{min-width:760px!important}.ap-v166-dategrid{grid-template-columns:1fr}.ap-v166-range{padding:14px!important}.ap-v166-presets button{padding:8px 11px;font-size:11px}}';document.head.appendChild(s);}
function apply(){if(applying)return;scheduled=false;applying=true;if(observer)observer.disconnect();try{css();const r=(document.body.className.match(/\bap-route-([^\s]+)/)||[])[1]||'';if(r==='future')renderFuture();if(r==='timing')renderTiming();improveCopy();document.documentElement.dataset.astroV166='domain-timing';}finally{applying=false;watch();}}
function schedule(){if(scheduled||applying)return;scheduled=true;requestAnimationFrame(apply);}
function watch(){if(!observer)observer=new MutationObserver(schedule);observer.observe(q('#ap-final-root')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}
function start(){watch();schedule();window.addEventListener('hashchange',schedule);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
