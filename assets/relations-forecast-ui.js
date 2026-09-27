/* Astro Paquita — prévisions relationnelles + nettoyage des libellés techniques visibles.
   Cette couche ne modifie aucun calcul astrologique. Elle réutilise les fonctions
   relationnelles déjà présentes et enlève seulement les numéros de version de l'UI. */
(function(){
'use strict';
if(window.__AP_RELATION_FORECAST_UI__)return;
window.__AP_RELATION_FORECAST_UI__=true;

const A=window.AstroTruth;
let observer=null,scheduled=false,busy=false;
const q=(s,r)=> (r||document).querySelector(s);
const qa=(s,r)=> Array.from((r||document).querySelectorAll(s));
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function relationMode(raw){
  const s=String(raw||'').toLowerCase();
  if(s.includes('rencontre'))return'rencontre';
  if(s==='ex'||s.includes('passée')||s.includes('passee'))return'ex';
  if(s.includes('compli'))return'compliquee';
  if(s.includes('fam'))return'famille';
  if(s.includes('trav')||s.includes('pro'))return'pro';
  if(s.includes('ami'))return'amitie';
  return'couple';
}
function setValue(id,value){const e=document.getElementById(id);if(!e)return false;e.value=value==null?'':String(value);return true;}
function currentPartner(){
  const id=q('#ap-rel-profile')?.value;
  return A&&A.getProfileById?A.getProfileById(id):null;
}
function prepareLegacyPartner(p,mode){
  if(!p)return false;
  setValue('y-prenom',p.prenom||'Profil');
  setValue('y-date',p.date||'');
  setValue('y-heure',p.heure||'');
  setValue('y-genre',p.genre||'N');
  setValue('y-lat',p.lat);setValue('y-lon',p.lon);setValue('y-tz',p.tz||'');setValue('y-ville',p.ville||'');
  const type=document.getElementById('y-type-relation');
  if(type){
    const values=Array.from(type.options||[]).map(o=>o.value);
    if(values.includes(mode))type.value=mode;
    try{if(typeof window.yActualiserTypeSynastrieV26==='function')window.yActualiserTypeSynastrieV26();else type.dispatchEvent(new Event('change',{bubbles:true}));}catch(e){}
  }
  return true;
}
function setForecastLoading(on){
  const l=q('#ap-rel-forecast-loader');if(l)l.classList.toggle('show',!!on);
  const b=q('#ap-rel-forecast-run');if(b)b.disabled=!!on||!currentPartner();
}
function showForecastError(msg){
  const e=q('#ap-rel-forecast-error');if(!e)return;
  e.textContent=msg||'';e.classList.toggle('show',!!msg);
}
function syncDateField(){
  const p=q('#ap-rel-forecast-period');const wrap=q('#ap-rel-forecast-date-wrap');
  if(wrap)wrap.style.display=p&&p.value==='date'?'block':'none';
}
function updateForecastHeading(){
  const mode=relationMode(q('#ap-rel-type')?.value);
  const h=q('#ap-rel-forecast-heading');
  const p=q('#ap-rel-forecast-copy');
  if(h)h.textContent=mode==='couple'?'Prévisions du couple':'Prévisions relationnelles';
  if(p)p.textContent=mode==='couple'
    ?'Après l’analyse de votre dynamique, regardez comment le lien évolue dans le temps : périodes porteuses, moments plus sensibles et conseils adaptés au couple.'
    :'Après l’analyse du lien, regardez comment la relation évolue dans le temps : périodes porteuses, moments plus sensibles et conseils adaptés au contexte choisi.';
}
function legacyDateFromIso(iso){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(String(iso||'')))return'';
  const [y,m,d]=iso.split('-');return d+'/'+m+'/'+y;
}
async function runForecast(ev){
  if(ev){ev.preventDefault();ev.stopPropagation();}
  if(busy)return false;
  showForecastError('');
  const partner=currentPartner();
  if(!partner){showForecastError('Sélectionnez un second profil.');return false;}
  if(typeof window.analyserPrevisionsSynastrie!=='function'){
    showForecastError('Les prévisions relationnelles sont momentanément indisponibles.');return false;
  }
  const mode=relationMode(q('#ap-rel-type')?.value);
  const period=q('#ap-rel-forecast-period')?.value||'365';
  if(!prepareLegacyPartner(partner,mode)){showForecastError('Le profil partenaire est incomplet.');return false;}
  const legacyPeriod=document.getElementById('y-periode');
  if(legacyPeriod){legacyPeriod.value=period;try{if(typeof window.majInfoPeriodeSynastrie==='function')window.majInfoPeriodeSynastrie();}catch(e){}}
  if(period==='date'){
    const iso=q('#ap-rel-forecast-date')?.value||'';
    if(!iso){showForecastError('Choisissez une date à analyser.');return false;}
    setValue('y-date-cible',legacyDateFromIso(iso));
    try{if(typeof window.majDateCibleSynastrie==='function')window.majDateCibleSynastrie();}catch(e){}
  }
  busy=true;setForecastLoading(true);
  const out=q('#ap-rel-forecast-result');
  if(out)out.innerHTML='<div class="ap-card"><p class="ap-muted">Prévisions relationnelles en cours…</p></div>';
  try{
    await window.analyserPrevisionsSynastrie();
    const report=document.getElementById('y-rapport')?.innerHTML?.trim()||'';
    const title=document.getElementById('y-rapport-titre')?.textContent?.trim()|| (mode==='couple'?'Prévisions du couple':'Prévisions relationnelles');
    const legacyErr=document.getElementById('y-err');
    if(!report){
      const em=(legacyErr&&legacyErr.style.display!=='none')?(legacyErr.textContent||'').trim():'';
      throw new Error(em||'Aucune prévision relationnelle n’a été produite.');
    }
    if(out)out.innerHTML='<div class="ap-card"><div class="ap-eyebrow">Prévisions relationnelles</div><h2 style="margin:6px 0 14px">'+esc(title)+'</h2><div class="ap-report">'+report+'</div></div>';
    cleanVisibleVersions(out);
  }catch(e){
    showForecastError(e&&e.message?e.message:'Les prévisions relationnelles n’ont pas pu être générées.');
    if(out)out.innerHTML='<div class="ap-card"><p>Impossible de générer les prévisions pour le moment.</p></div>';
  }finally{busy=false;setForecastLoading(false);}
  return false;
}
function installRelationForecast(){
  if(!document.body.classList.contains('ap-route-relations'))return;
  const page=q('#ap-page');if(!page)return;
  const grid=q('.ap-route-relations .ap-grid');if(!grid)return;
  let block=q('#ap-rel-forecast-block');
  if(!block){
    block=document.createElement('section');block.id='ap-rel-forecast-block';block.style.marginTop='18px';
    block.innerHTML='<div class="ap-card"><div class="ap-eyebrow">Dans le temps</div><h2 id="ap-rel-forecast-heading" style="margin:6px 0 8px">Prévisions du couple</h2><p id="ap-rel-forecast-copy" class="ap-muted">Après l’analyse de votre dynamique, regardez comment le lien évolue dans le temps.</p><div class="ap-grid" style="margin-top:16px"><div class="ap-span-5"><div class="ap-field"><label>Période à analyser</label><select id="ap-rel-forecast-period"><option value="30">30 prochains jours</option><option value="90">3 prochains mois</option><option value="180">6 prochains mois</option><option value="365" selected>12 prochains mois</option><option value="730">2 prochaines années</option><option value="1095">3 prochaines années</option><option value="1825">5 prochaines années</option><option value="date">Autour d’une date précise</option></select></div><div class="ap-field" id="ap-rel-forecast-date-wrap" style="display:none"><label>Date à analyser</label><input id="ap-rel-forecast-date" type="date"></div><div class="ap-actions"><button id="ap-rel-forecast-run" class="ap-btn ap-btn-primary">Analyser les prévisions</button></div><div id="ap-rel-forecast-loader" class="ap-loader"><i class="ap-spinner"></i><span>Analyse de la relation dans le temps…</span></div><div id="ap-rel-forecast-error" class="ap-error"></div></div><div class="ap-span-7" id="ap-rel-forecast-result"><div class="ap-card"><h3>Ce qui vous attend ensemble</h3><p>Sélectionnez la période puis lancez l’analyse. Les prévisions utilisent le même couple de profils que la synastrie ci-dessus.</p></div></div></div></div>';
    grid.insertAdjacentElement('afterend',block);
    q('#ap-rel-forecast-period')?.addEventListener('change',syncDateField);
    q('#ap-rel-forecast-run')?.addEventListener('click',runForecast);
    q('#ap-rel-type')?.addEventListener('change',updateForecastHeading);
    q('#ap-rel-profile')?.addEventListener('change',()=>setForecastLoading(false));
  }
  updateForecastHeading();syncDateField();setForecastLoading(false);
}
function stripVersionText(s){
  if(!s||!/[Vv]\d{2,4}/.test(s))return s;
  let x=String(s)
    .replace(/\bV\d{2,4}[a-z]?(?:\s*\/\s*V\d{2,4}[a-z]?)*\b/gi,'')
    .replace(/\s{2,}/g,' ')
    .replace(/\s+([,.;:!?])/g,'$1')
    .replace(/\(\s*\)/g,'')
    .replace(/\s*[—–-]\s*(?=$)/g,'')
    .trim();
  return x;
}
function cleanVisibleVersions(root){
  root=root||document.body;
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{
    const p=n.parentElement;if(!p||['SCRIPT','STYLE','NOSCRIPT','CODE','PRE'].includes(p.tagName))return;
    const x=stripVersionText(n.nodeValue);if(x!==n.nodeValue)n.nodeValue=x;
  });
  qa('[title],[aria-label]',root).forEach(el=>{
    for(const a of ['title','aria-label']){const v=el.getAttribute(a);if(v&&/[Vv]\d{2,4}/.test(v))el.setAttribute(a,stripVersionText(v));}
  });
  if(document.title!=='Astro Paquita')document.title='Astro Paquita';
}
function apply(){
  scheduled=false;if(observer)observer.disconnect();
  try{installRelationForecast();cleanVisibleVersions(q('#ap-final-root')||document.body);}finally{watch();}
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply);}
function watch(){
  if(!observer)observer=new MutationObserver(schedule);
  observer.observe(q('#ap-final-root')||document.body,{childList:true,subtree:true,characterData:true});
}
function start(){watch();schedule();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
