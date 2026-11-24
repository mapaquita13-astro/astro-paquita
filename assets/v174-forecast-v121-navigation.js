/* Astro Paquita — navigation temporelle des prévisions V121.
   Cette couche ne modifie aucun calcul astrologique : elle synchronise la période,
   le domaine et le profil actif avec le moteur V121 avant chaque génération. */
(function(){
'use strict';
if(window.__AP_V174_FORECAST_NAV__)return;
window.__AP_V174_FORECAST_NAV__=true;

const A=window.AstroTruth;
const META={fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'};
let running=false;
const q=(s,r)=> (r||document).querySelector(s);
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
function lang(){return String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2);}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function fromIso(raw){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(raw||'')))return null;const d=new Date(raw+'T12:00:00');return isNaN(d)?null:d;}
function today(){const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate(),12);}
function activePeriod(){return q('.ap-route-forecast .ap-period-choice.active')?.dataset.per||'mois';}
function activeDomain(){return q('.ap-route-forecast .ap-domain-choice.active')?.dataset.domain||'all';}
function span(period){if(period==='jour'||period==='date')return 1;if(period==='semaine')return 7;if(period==='mois')return 30;if(period==='trimestre')return 90;return 365;}
function nav(){return q('.ap-route-forecast .ap-forecast-period-nav');}
function currentAnchor(period){
  if(period==='date'){
    const d=fromIso(q('#ap-forecast-date')?.value||'');
    if(d)return d;
  }
  const d=fromIso(nav()?.dataset.v174Anchor||'');
  return d||today();
}
function fmtShort(d){return d.toLocaleDateString(META[lang()]||META.fr,{day:'numeric',month:'short',year:'numeric'});}
function fmtLong(d){return d.toLocaleDateString(META[lang()]||META.fr,{day:'numeric',month:'long',year:'numeric'});}
function rangeText(start,days){const end=new Date(start);end.setDate(end.getDate()+Math.max(0,days-1));return days===1?fmtShort(start):fmtShort(start)+' → '+fmtShort(end);}
function fullRangeText(start,days){const end=new Date(start);end.setDate(end.getDate()+Math.max(0,days-1));return days===1?fmtLong(start):fmtLong(start)+' → '+fmtLong(end);}
function syncNav(forceToday){
  const n=nav();if(!n)return;
  const period=activePeriod();
  let start=forceToday?today():currentAnchor(period);
  if(period==='date'){
    const d=fromIso(q('#ap-forecast-date')?.value||'');if(d)start=d;
  }
  n.dataset.v174Anchor=iso(start);
  n.dataset.v174Days=String(span(period));
  // Le MutationObserver surveille les enfants de cette zone : ne jamais réécrire
  // le même texte, sinon une nouvelle mutation relance syncNav en boucle.
  const label=q('.ap-forecast-range-label',n),nextText=rangeText(start,span(period));
  if(label&&label.textContent!==nextText)label.textContent=nextText;
}
function shift(dir){
  const period=activePeriod(),days=span(period),start=currentAnchor(period);
  start.setDate(start.getDate()+dir*days);
  const n=nav();if(n){n.dataset.v174Anchor=iso(start);n.dataset.v174Days=String(days);}
  if(period==='date'){
    const input=q('#ap-forecast-date');if(input)input.value=iso(start);
  }
  const label=q('.ap-forecast-range-label');if(label)label.textContent=rangeText(start,days);
  const out=q('#ap-forecast-result');if(out)out.innerHTML='';
}
function legacyUserReady(){
  try{return typeof USER!=='undefined'&&!!USER&&!!USER.prenom;}catch(e){return false;}
}
function ensureLegacyProfile(){
  const p=A&&typeof A.currentProfile==='function'?A.currentProfile():null;
  if(!p)throw new Error('Aucun profil actif. Sélectionne ou crée un profil puis réessaie.');
  if(A&&typeof A.validation==='function'){
    const v=A.validation(p);
    if(!v||!v.ok)throw new Error('Le profil actif est incomplet. Vérifie la date, l’heure et le lieu de naissance.');
  }

  let activated=false;
  try{if(A&&typeof A.activate==='function')activated=!!A.activate(p.profileId||p.legacyKey);}catch(e){}

  /* Sécurité de compatibilité : certaines navigations de la nouvelle interface
     conservent bien le profil AstroTruth mais l'ancien objet USER de V121 peut
     avoir été remis à null. On le reconstruit alors avec la fonction V121 prévue
     pour cela, sans toucher aux calculs ni aux données de naissance. */
  if(!legacyUserReady()&&typeof window.v37CalculerUserDepuisDonnees==='function'){
    try{
      const payload={...p,__profileKey:p.legacyKey,__timeStatus:p.timeStatus||'exact'};
      activated=!!window.v37CalculerUserDepuisDonnees(payload)||activated;
    }catch(e){}
  }

  if(!legacyUserReady()){
    throw new Error('Le profil actif n’a pas pu être initialisé pour les prévisions. Recharge la page puis réessaie.');
  }
  return {profile:p,activated};
}
// Keep the original V121 report as first choice. A failed/empty report is not a calm forecast.
function profileSignature(p){return JSON.stringify([p?.profileId||p?.legacyKey,p?.birthDataVersion,p?.date,p?.heure,p?.lat,p?.lon,p?.tz]);}
function isCurrent(out,signature){return out.isConnected&&q('#ap-forecast-result')===out&&document.body.classList.contains('ap-route-forecast')&&profileSignature(A.currentProfile())===signature;}
function usableReport(node){
  const txt=(node?.textContent||'').trim();
  if(!txt||/^(calcul en cours|analyse en cours|chargement|loading|calculating|analysis in progress)/i.test(txt))return '';
  if(/^(aucun élément suffisamment marqué|la prévision n.a pas pu|erreur|error|prévisions momentanément indisponibles)/i.test(txt))return '';
  return node.innerHTML.trim();
}
async function calculatedFallback(start,days,domain,out,signature){
  if(typeof A?.day!=='function')throw new Error('Le moteur de calcul des prévisions est indisponible.');
  const rows=[];let failures=0,completed=0;
  for(let i=0;i<days;i++){
    if(!isCurrent(out,signature))return null;
    const d=new Date(start);d.setDate(d.getDate()+i);
    try{
      const result=A.day(d,domain);
      if(!Array.isArray(result?.signals))throw new Error('Résultat de calcul invalide');
      if(result.profileId&&result.profileId!==A.currentProfile()?.profileId)throw new Error('Profil différent');
      completed++;
      for(const s of result.signals){
        if(!s||(domain!=='all'&&s.domain!==domain))continue;
        const scenarios=(Array.isArray(s.scenarios)?s.scenarios:[]).filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim());
        const label=String(s.label||'').trim()||[s.source,s.aspect==null?'':s.aspect+'°',s.target].filter(Boolean).join(' ');
        if(!scenarios.length&&!label)continue;
        rows.push({date:iso(d),domain:s.domain,label,scenarios,polarity:s.polarity,weight:Math.abs(Number(s.score)||Number(s.force)||0)});
      }
    }catch(e){failures++;console.warn('Astro Paquita — calcul journalier',e);}
    if(i%7===6){const progress=q('#ap-v174-recovery-progress',out);if(progress)progress.textContent='Calcul des tendances : '+(i+1)+' / '+days;await new Promise(r=>setTimeout(r,0));}
  }
  if(!rows.length)throw new Error('Le rapport détaillé est indisponible et aucun signal exploitable n’a pu être récupéré. Ce résultat ne permet pas de conclure que la période est calme.');
  const labels=A.labels?.()||{};
  const polarity={positive:'Favorable',difficile:'Vigilance',difficult:'Vigilance',mixte:'Contrastée',mixed:'Contrastée'};
  const size=days<=7?1:days<=31?7:days<=92?30:31;
  const groups=[];
  for(let offset=0;offset<days;offset+=size){
    const a=new Date(start),b=new Date(start);a.setDate(a.getDate()+offset);b.setDate(b.getDate()+Math.min(days-1,offset+size-1));
    const selected=rows.filter(x=>x.date>=iso(a)&&x.date<=iso(b)).sort((x,y)=>y.weight-x.weight);
    const seen=new Set(),chosen=[];
    for(const x of selected){
      const key=[x.domain,x.label,x.scenarios.join('|')].join('|');
      if(seen.has(key))continue;seen.add(key);chosen.push(x);
      if(chosen.length>=Math.min(8,domain==='all'?8:5))break;
    }
    if(!chosen.length)continue;
    chosen.sort((x,y)=>x.date.localeCompare(y.date));
    groups.push('<section style="margin:14px 0"><h3>'+esc(fullRangeText(a,Math.min(size,days-offset)))+'</h3>'+chosen.map(x=>'<p><strong>'+esc(fmtLong(fromIso(x.date)))+' · '+esc(labels[x.domain]||(x.domain==='general'?'Général':x.domain)||'Général')+'</strong>'+ (polarity[x.polarity]?' — '+esc(polarity[x.polarity]):'')+'<br>'+esc(x.scenarios.length?x.scenarios.slice(0,3).join(' ; '):x.label)+'</p>').join('')+'</section>');
  }
  return '<p>Le rapport complet n’a pas pu être généré. Voici les tendances personnalisées effectivement calculées pour cette période.</p>'+ (failures?'<p>Calcul partiel : '+completed+' jour(s) sur '+days+'.</p>':'')+groups.join('')+'<p class="ap-muted">Ces indications relèvent de l’interprétation astrologique et ne garantissent pas un événement.</p>';
}
// The legacy API explicitly recognizes "aujourdhui", not the modern UI "jour".
function legacyPeriodFor(period,start,days){
 const parisToday=new Intl.DateTimeFormat('fr-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const part=k=>parisToday.find(x=>x.type===k)?.value;
 const todayIso=[part('year'),part('month'),part('day')].join('-');
 if(period==='jour'&&days===1&&iso(start)===todayIso)return 'aujourdhui';
 if(period==='date')return 'jour';
 return period;
}
function reportErrorText(raw){
 const x=String(raw||'').trim();
 if(!x)return 'Le moteur n’a renvoyé aucun rapport.';
 if(/crédit|credit|insufficient|payment required|balance|\b402\b/i.test(x))return 'Le fournisseur IA signale un problème de crédits ou de paiement.';
 if(/OPENROUTER_API_KEY|api.key|clé API|unauthorized|invalid.*key/i.test(x))return 'La configuration du fournisseur IA doit être vérifiée.';
 if(/premium|accès gratuit|free access/i.test(x))return 'Le serveur a refusé l’accès à cette période (droits du compte).';
 if(/rate.limit|too many|trop de|\b429\b/i.test(x))return 'La limite temporaire de requêtes du service IA a été atteinte.';
 if(/connecte-toi|session|authentification|\b401\b/i.test(x))return 'La session du compte doit être vérifiée.';
 if(/timeout|timed out|délai|\b504\b/i.test(x))return 'Le service IA a dépassé son délai de réponse.';
 if(/failed to fetch|load failed|network|connexion au backend|connexion à l.api/i.test(x))return 'La connexion au service de génération a échoué.';
 if(/mod[eè]le|model|provider|fournisseur|openrouter|\b50[023]\b/i.test(x))return 'Le fournisseur IA n’a pas pu générer le texte demandé.';
 return 'Le moteur de rapport a signalé une erreur. Le détail technique est disponible dans la console.';
}
function setLegacySelection(domain,period){
  const map={all:'general',amour:'amour',travail:'travail',argent:'finances',bienetre:'sante',famille:'famille',voyage:'voyage'};
  const d=map[domain]||'general';
  try{domP=d;}catch(e){try{window.eval('domP='+JSON.stringify(d));}catch(_){} }
  try{perP=period;}catch(e){try{window.eval('perP='+JSON.stringify(period));}catch(_){} }
}
function setBusy(on){const l=q('#ap-forecast-loader');if(l)l.classList.toggle('show',!!on);const b=q('#ap-run-forecast');if(b)b.disabled=!!on;}
function setError(msg){const e=q('#ap-forecast-error');if(e){e.textContent=msg||'';e.classList.toggle('show',!!msg);}}
async function generate(){
  if(running)return;
  const out=q('#ap-forecast-result');if(!out)return;
  const period=activePeriod(),domain=activeDomain(),days=span(period),start=currentAnchor(period);
  const n=nav();if(n){n.dataset.v174Anchor=iso(start);n.dataset.v174Days=String(days);}
  running=true;setBusy(true);setError('');
  const title=fullRangeText(start,days);
  try{
    const {profile}=ensureLegacyProfile();
    const signature=profileSignature(profile);
    if(document.body.classList.contains('ap-free-user')&&period!=='jour')throw new Error('Cette période est réservée aux comptes Premium.');
    const legacyPeriod=legacyPeriodFor(period,start,days);
    setLegacySelection(domain,legacyPeriod);
    out.innerHTML='<div class="ap-card"><h3>Prévisions · '+esc(title)+'</h3><p class="ap-muted">Analyse complète de la période sélectionnée…</p></div>';
    let html='',reportFailure='';
    try{
      const previous=q('#p-rapport'),legacyError=q('#p-err');
      if(previous)previous.innerHTML='';
      if(legacyError){legacyError.textContent='';legacyError.style.display='none';}
      if(typeof window.lancerPrevDepuis!=='function')throw new Error('Moteur du rapport indisponible.');
      await window.lancerPrevDepuis(new Date(start),days,legacyPeriod);
      if(!isCurrent(out,signature))return;
      html=usableReport(q('#p-rapport'));
      if(!html)reportFailure=(q('#p-err')?.textContent||'').trim();
    }catch(e){reportFailure=String(e?.message||e);}
    if(!isCurrent(out,signature))return;
    if(!html){
      const reason=reportErrorText(reportFailure);
      console.warn('Astro Paquita — rapport détaillé indisponible',reportFailure||'empty report');
      // Preserve the true failure in the visible result rather than silently presenting a fallback.
      out.innerHTML='<div class="ap-card"><h3>'+esc(title)+'</h3><p id="ap-v174-recovery-progress" class="ap-muted">Récupération des tendances calculées…</p></div>';
      try{html=await calculatedFallback(start,days,domain,out,signature);}
      catch(e){throw new Error(reason+' '+String(e?.message||''));}
      if(html)html='<div class="ap-muted" role="status" style="padding:10px 12px;border:1px solid #ded2c4;border-radius:10px;margin-bottom:14px"><strong>Rapport détaillé indisponible</strong><p style="margin:5px 0 0">'+esc(reason)+'</p></div>'+html;
    }
    if(!html||!isCurrent(out,signature))return;
    out.innerHTML='<div class="ap-card ap-forecast-v174"><div class="ap-eyebrow">Prévision personnalisée</div><h2 style="margin:6px 0 14px">'+esc(title)+'</h2><div class="ap-report">'+html+'</div></div>';
  }catch(e){
    console.error('Astro Paquita — génération prévisions :',e);
    const raw=String(e&&e.message||'');
    const msg=/Cannot read properties of null|reading ['\"]prenom['\"]/i.test(raw)
      ?'Le profil actif n’a pas été correctement chargé. Recharge la page puis relance la prévision.'
      :(raw||'La prévision n’a pas pu être générée.');
    if(out.isConnected&&q('#ap-forecast-result')===out){setError(msg);out.innerHTML='';}
  }finally{running=false;setBusy(false);}
}

document.addEventListener('click',function(ev){
  const t=ev.target&&ev.target.closest?ev.target.closest('#ap-forecast-prev,#ap-forecast-next,#ap-run-forecast,[data-per]'):null;
  if(!t||!document.body.classList.contains('ap-route-forecast'))return;
  if(t.matches('[data-per]')){setTimeout(()=>syncNav(true),0);return;}
  if(t.id==='ap-forecast-prev'||t.id==='ap-forecast-next'){
    ev.preventDefault();ev.stopImmediatePropagation();shift(t.id==='ap-forecast-prev'?-1:1);return;
  }
  if(t.id==='ap-run-forecast'){
    ev.preventDefault();ev.stopImmediatePropagation();generate();return;
  }
},true);

document.addEventListener('change',function(ev){
  if(ev.target&&ev.target.id==='ap-forecast-date'){setTimeout(()=>syncNav(false),0);}
},true);

let pending=false;
const obs=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;if(document.body.classList.contains('ap-route-forecast'))syncNav(false);});});
obs.observe(document.getElementById('ap-final-root')||document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>syncNav(false),{once:true});else syncNav(false);
})();
