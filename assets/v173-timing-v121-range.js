/* Astro Paquita V173 — Le bon moment sur la période choisie.
   Cette couche ne réécrit plus lancerFenetre(). Elle réutilise directement les
   briques V121 déjà présentes dans le moteur : apReconcileIntentScoreV75,
   apDomainTagsV80 et apConvergenceFromRowV76. La seule différence est la plage
   de dates parcourue, choisie par l'utilisateur. */
(function(){
'use strict';
if(window.__AP_V173_TIMING_RANGE__)return;
window.__AP_V173_TIMING_RANGE__=true;

let busy=false;
const q=s=>document.querySelector(s);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const INTENT_LABEL={amour:'Amour / relation',travail:'Travail / évolution',argent:'Argent / finances',sante:'Bien-être',demenager:'Famille / déménagement',voyage:'Voyage',creation:'Créer / lancer un projet',examen:'Études / examen',enfant:'Famille / enfant',investir:'Investir'};
const DOMAIN_BY_INTENT={argent:'finances',travail:'travail',amour:'amour',demenager:'famille',voyage:'voyage',sante:'sante',creation:'general',examen:'general',enfant:'famille',investir:'finances'};

function parseIso(s){const d=new Date(String(s||'')+'T12:00:00');return Number.isNaN(d.getTime())?null:d;}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function daysBetween(a,b){return Math.floor((b-a)/86400000)+1;}
function range(){return {start:parseIso(q('#ap-v166-from')?.value),end:parseIso(q('#ap-v166-to')?.value)};}
function fmt(d){return d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});}
function rangeLabel(a,b){return 'du '+fmt(a)+' au '+fmt(b);}
function setError(msg){const e=q('#ap-timing-error');if(!e)return;e.textContent=msg||'';e.classList.toggle('show',!!msg);}
function loader(on,label,percent){const e=q('#ap-timing-loader');if(e){e.classList.toggle('show',!!on);const s=e.querySelector('span');if(s&&label)s.textContent=label;}const bar=q('#ap-timing-loader i');if(bar&&Number.isFinite(percent))bar.setAttribute('aria-valuenow',String(percent));}
function cleanLegacyError(){const e=q('#ap-timing-error');if(e&&/(Impossible de paramétrer|ne peut pas être appliquée|version du calcul)/i.test(e.textContent||'')){e.textContent='';e.classList.remove('show');}}
function ensureEngine(){
  const missing=[];
  if(typeof window.julianDay!=='function')missing.push('julianDay');
  if(typeof window.jdVersDate!=='function')missing.push('jdVersDate');
  if(typeof window.apReconcileIntentScoreV75!=='function')missing.push('apReconcileIntentScoreV75');
  if(typeof window.apDomainTagsV80!=='function')missing.push('apDomainTagsV80');
  if(typeof window.apConvergenceFromRowV76!=='function')missing.push('apConvergenceFromRowV76');
  if(missing.length)throw new Error('Le calcul du Bon moment est momentanément indisponible.');
}
function reliability(row,intent){
  try{
    const dom=DOMAIN_BY_INTENT[intent]||'general';
    const sig=window.apConvergenceFromRowV76(row.v51,dom,row.date);
    const fam=sig&&sig.familles?sig.familles.length:0;
    return fam>=3||(sig&&sig.poids>=7)?'very_convergent':fam>=2||(sig&&sig.poids>=4)?'confirmed':'light';
  }catch(e){return'light';}
}
function selectTop(rows,intent){
  const top=[];
  const sorted=[...rows].sort((a,b)=>b.score-a.score);
  if(intent==='argent'){
    const money=[...rows].filter(r=>r.v51&&r.v51.domain==='money'&&Number(r.v51.anchorCount||0)>0).sort((a,b)=>{
      const fa=Number(a.v51.force||0),fb=Number(b.v51.force||0);
      if(Math.abs(fb-fa)>.05)return fb-fa;
      return (b.scoreArgent||b.score||0)-(a.scoreArgent||a.score||0);
    });
    const strong=money.filter(r=>['fort','exceptionnel'].includes(r.v51.niveau)||Number(r.v51.force||0)>=4.2);
    for(const r of strong){if(top.length>=5)break;if(!top.some(t=>Math.abs(t.jd-r.jd)<45))top.push(r);}
    if(top.length<5){
      const marked=money.filter(r=>Number(r.v51.force||0)>=2.2);
      for(const r of marked){if(top.length>=5)break;if(!top.some(t=>Math.abs(t.jd-r.jd)<45))top.push(r);}
    }
  }else{
    for(const r of sorted){if(top.length>=5)break;if(!top.some(t=>Math.abs(t.jd-r.jd)<45))top.push(r);}
  }
  return top;
}
async function scan(start,end,intent,onProgress){
  ensureEngine();
  const days=daysBetween(start,end);
  const jdStart=window.julianDay(start.getFullYear(),start.getMonth()+1,start.getDate(),12);
  const rows=[],CHUNK=30;
  for(let j=0;j<days;j+=CHUNK){
    for(let k=j;k<Math.min(j+CHUNK,days);k++){
      const jd=jdStart+k;
      try{
        // Exact moteur sectoriel V121 utilisé par la Fenêtre idéale V88.
        const coh=window.apReconcileIntentScoreV75(jd,intent,0);
        if(coh&&coh.eligible&&coh.signed>0){
          const date=window.jdVersDate(jd);
          const fam=[...new Set([...(coh.v51?.anchorFamilies||[]),...(coh.v51?.coreFamilies||[])])];
          rows.push({jd,date,score:coh.score,scoreArgent:coh.score,raw:coh.signed,moneyStrength:0,moneyFamilies:intent==='argent'?fam:[],tags:window.apDomainTagsV80(coh.v51),v51:coh.v51});
        }
      }catch(e){}
    }
    if(onProgress)onProgress(Math.min(95,Math.round(((j+CHUNK)/Math.max(1,days))*95)));
    await new Promise(r=>setTimeout(r,0));
  }
  return selectTop(rows,intent);
}
function windowDates(r,start,end){
  const peak=new Date(r.date);peak.setHours(12,0,0,0);
  const a=new Date(peak);a.setDate(a.getDate()-4);
  const b=new Date(peak);b.setDate(b.getDate()+8);
  return {a:a<start?start:a,b:b>end?end:b,peak};
}
function resultHtml(top,start,end,intent){
  const title=INTENT_LABEL[intent]||'Votre intention';
  let h='<div class="ap-card"><div class="ap-eyebrow">Période analysée</div><h3>'+esc(title)+'</h3><p>'+esc(rangeLabel(start,end))+'</p></div>';
  if(!top.length)return h+'<div class="ap-card" style="margin-top:12px"><h3>Aucune fenêtre suffisamment confirmée</h3><p>Aucune date ne réunit assez de confirmations astrologiques propres à cette intention sur la période choisie. Le site ne complète pas artificiellement le résultat.</p></div>';
  h+='<div style="margin-top:12px">';
  top.forEach((r,i)=>{
    const w=windowDates(r,start,end),rel=reliability(r,intent);
    const relText=rel==='very_convergent'?'Très convergente':rel==='confirmed'?'Confirmée':'Signal plus léger';
    h+='<div class="ap-period positive" style="margin-bottom:10px"><div><b>'+(i===0?'Fenêtre la plus soutenue':'Autre fenêtre intéressante')+'</b><strong>'+esc(fmt(w.a))+' → '+esc(fmt(w.b))+'</strong><small>Point culminant autour du '+esc(fmt(w.peak))+' · '+esc(relText)+'</small></div></div>';
  });
  return h+'</div>';
}
async function run(intent){
  if(busy)return;
  cleanLegacyError();setError('');
  const r=range();
  if(!r.start||!r.end||r.end<r.start){setError('Choisissez une période valide.');return;}
  const today=new Date();today.setHours(0,0,0,0);
  if(r.start<today){setError('La recherche commence aujourd’hui ou dans le futur.');return;}
  const days=daysBetween(r.start,r.end);
  if(days>3650){setError('La période maximale est de 10 ans.');return;}
  try{if(typeof window.intentionCompatibleAge==='function'&&!window.intentionCompatibleAge(intent,r.start)){setError("Cette intention n'est pas adaptée à l'âge de ce profil sur cette période.");return;}}catch(e){}
  busy=true;const out=q('#ap-timing-result');if(out)out.innerHTML='';
  loader(true,'Analyse '+rangeLabel(r.start,r.end)+'…',0);
  try{
    try{window.intentionF=intent;}catch(e){}
    const top=await scan(r.start,r.end,intent,p=>loader(true,'Analyse de la période… '+p+'%',p));
    window.AP_LAST_WINDOWS=top.map(row=>({date:iso(row.date instanceof Date?row.date:new Date(row.date)),intent,score:Math.round(intent==='argent'?(row.scoreArgent||row.score):row.score),reliability:reliability(row,intent)}));
    if(out)out.innerHTML=resultHtml(top,r.start,r.end,intent);
  }catch(e){setError(e?.message||'La recherche n’a pas pu être effectuée.');}
  finally{busy=false;loader(false);}
}

// Capture avant les anciens gestionnaires V166. Aucun eval, aucune réécriture du moteur.
document.addEventListener('click',function(ev){
  if(!document.body.classList.contains('ap-route-timing'))return;
  const b=ev.target&&ev.target.closest?ev.target.closest('[data-intent]'):null;
  if(!b)return;
  ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
  run(b.dataset.intent);
},true);

const obs=new MutationObserver(cleanLegacyError);
function start(){cleanLegacyError();obs.observe(q('#ap-final-root')||document.body,{childList:true,subtree:true,characterData:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
