/* Astro Paquita V172 — correction ciblée de la période du Bon moment.
   Ne change aucun calcul astrologique V121 : la fonction historique est réutilisée,
   seule sa durée de balayage et sa date de départ sont bornées à la période choisie. */
(function(){
'use strict';
if(window.__AP_V172_TIMING_PERIOD_FIX__)return;
window.__AP_V172_TIMING_PERIOD_FIX__=true;

let busy=false,runner=null;
const q=s=>document.querySelector(s);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function parseIso(s){const d=new Date(String(s||'')+'T12:00:00');return Number.isNaN(d.getTime())?null:d;}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function daysBetween(a,b){return Math.floor((b-a)/86400000)+1;}
function rangeLabel(a,b){return 'du '+a.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})+' au '+b.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});}
function error(msg){const e=q('#ap-timing-error');if(!e)return;e.textContent=msg||'';e.classList.toggle('show',!!msg);}
function loader(on,label){const e=q('#ap-timing-loader');if(!e)return;e.classList.toggle('show',!!on);const s=e.querySelector('span');if(s&&label)s.textContent=label;}
function range(){return {start:parseIso(q('#ap-v166-from')?.value),end:parseIso(q('#ap-v166-to')?.value)};}
function cleanTechnicalError(){const e=q('#ap-timing-error');if(e&&/Impossible de paramétrer la période sans modifier le moteur V121/i.test(e.textContent||'')){e.textContent='';e.classList.remove('show');}}

function buildRunner(){
  if(runner)return runner;
  if(typeof window.lancerFenetre!=='function')throw new Error('Le calcul du Bon moment est momentanément indisponible.');
  let src=Function.prototype.toString.call(window.lancerFenetre);

  // La V166 avait des expressions régulières sur-échappées. Ici on cible réellement
  // les déclarations V121, sans toucher au contenu du calcul astrologique.
  let dayRe=/\b(const|let|var)\s+nbJours\s*=\s*(?:365\s*\*\s*10|3650)\s*;?/;
  if(dayRe.test(src)){
    src=src.replace(dayRe,'$1 nbJours = Math.max(1,Math.min(3650,Number(window.__AP_V172_TIMING_DAYS)||3650));');
  }else{
    const generic=/\b(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:365\s*\*\s*10|3650)\s*;?/;
    const m=src.match(generic);
    if(!m)throw new Error('La période choisie ne peut pas être appliquée à cette version du calcul.');
    src=src.replace(generic,m[1]+' '+m[2]+' = Math.max(1,Math.min(3650,Number(window.__AP_V172_TIMING_DAYS)||3650));');
  }

  const todayRe=/\b(const|let|var)\s+today\s*=\s*new\s+Date\s*\(\s*\)\s*;?/;
  if(todayRe.test(src)){
    src=src.replace(todayRe,"$1 today = window.__AP_V172_TIMING_START ? new Date(window.__AP_V172_TIMING_START+'T12:00:00') : new Date();");
  }else{
    const genericDate=/\b(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*new\s+Date\s*\(\s*\)\s*;?/;
    const m=src.match(genericDate);
    if(m)src=src.replace(genericDate,m[1]+' '+m[2]+" = window.__AP_V172_TIMING_START ? new Date(window.__AP_V172_TIMING_START+'T12:00:00') : new Date();");
  }

  src=src.replace(/intentionCompatibleAge\s*\(\s*intentionF\s*,\s*new\s+Date\s*\(\s*\)\s*\)/,
    "intentionCompatibleAge(intentionF,window.__AP_V172_TIMING_START?new Date(window.__AP_V172_TIMING_START+'T12:00:00'):new Date())");

  runner=(0,eval)('('+src+')');
  return runner;
}

async function run(intent){
  if(busy)return;
  cleanTechnicalError();error('');
  const r=range();
  if(!r.start||!r.end||r.end<r.start){error('Choisissez une période valide.');return;}
  const now=new Date();now.setHours(0,0,0,0);
  if(r.start<now){error('La recherche commence aujourd’hui ou dans le futur.');return;}
  const days=daysBetween(r.start,r.end);
  if(days>3650){error('La période maximale est de 10 ans.');return;}

  busy=true;loader(true,'Analyse '+rangeLabel(r.start,r.end)+'…');
  const out=q('#ap-timing-result');if(out)out.innerHTML='';
  const oldAI=window.appelerClaude;
  try{
    try{intentionF=intent;}catch(e){window.intentionF=intent;}
    window.__AP_V172_TIMING_START=iso(r.start);
    window.__AP_V172_TIMING_DAYS=days;
    const fn=buildRunner();
    const label=rangeLabel(r.start,r.end);

    if(typeof oldAI==='function')window.appelerClaude=async function(args){
      if(args&&args.feature==='window'){
        try{
          let txt=JSON.stringify(args);
          txt=txt.replace(/10 prochaines années/g,label).replace(/sur 10 ans/g,label).replace(/10 ans/g,label);
          args=JSON.parse(txt);
        }catch(e){}
      }
      return oldAI(args);
    };

    await fn();
    const wins=(window.AP_LAST_WINDOWS||[]).filter(w=>{const d=parseIso(w.date);return d&&d>=r.start&&d<=r.end;});
    const report=q('#f-rapport')?.innerHTML?.trim()||'';
    if(out){
      out.innerHTML='<div class="ap-card"><div class="ap-eyebrow">Période analysée</div><h3>'+esc(rangeLabel(r.start,r.end))+'</h3><p class="ap-muted">Recherche effectuée uniquement sur la période choisie.</p></div>'+
        (wins.length?'<div style="margin-top:12px">'+wins.map((w,i)=>'<div class="ap-period positive" style="margin-bottom:9px"><div><b>'+(i===0?'Fenêtre la plus soutenue':'Autre fenêtre intéressante')+'</b><strong>'+esc(new Date(w.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}))+'</strong><small>'+esc(({very_convergent:'Très convergent',confirmed:'Confirmé',light:'Signal léger'})[w.reliability]||'Repère astrologique')+'</small></div></div>').join('')+'</div>':'<div class="ap-card" style="margin-top:12px"><p>Aucune fenêtre suffisamment marquée ne ressort dans cette période.</p></div>')+
        (report?'<div class="ap-card" style="margin-top:12px"><div class="ap-report">'+report+'</div></div>':'');
    }
  }catch(e){
    error(e&&e.message&& !/Impossible de paramétrer la période/i.test(e.message)?e.message:'La période choisie n’a pas pu être analysée. Réessayez.');
  }finally{
    if(oldAI)window.appelerClaude=oldAI;
    delete window.__AP_V172_TIMING_START;delete window.__AP_V172_TIMING_DAYS;
    busy=false;loader(false);
  }
}

// Capture le clic avant l'ancien gestionnaire V166, afin d'éviter son regex défectueux.
document.addEventListener('click',function(ev){
  if(!document.body.classList.contains('ap-route-timing'))return;
  const b=ev.target&&ev.target.closest?ev.target.closest('[data-intent]'):null;
  if(!b)return;
  ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
  run(b.dataset.intent);
},true);

const obs=new MutationObserver(cleanTechnicalError);
function start(){cleanTechnicalError();const root=q('#ap-final-root')||document.body;obs.observe(root,{childList:true,subtree:true,characterData:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
