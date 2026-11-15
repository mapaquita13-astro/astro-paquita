/* Astro Paquita — V211 : Récit de vie sans filtres de domaine ni de durée. */
(function(){
'use strict';
if(window.__AP_LIFE_211__)return;
window.__AP_LIFE_211__=true;
const V='211-20261115';
const q=(s,r)=>(r||document).querySelector(s);
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=s=>new Date(s+'T12:00:00Z').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
const profile=()=>window.AstroTruth&&window.AstroTruth.currentProfile&&window.AstroTruth.currentProfile();
const uid=()=>String(window.USER_CONNECTE?.email||'').trim().toLowerCase();
const signature=p=>[p?.profileId||p?.legacyKey,p?.birthDataVersion,p?.date,p?.heure,p?.lat,p?.lon,p?.tz].join('|');
const memo=new Map();
let active=false,serial=0,account='',born='',working=false,pending=false,observer=null;
function css(){
 if(q('#ap-life-style'))return;
 const st=document.createElement('style');st.id='ap-life-style';
 st.textContent=[
 '.ap-life-overlay{position:fixed;inset:0;z-index:2147483645;background:rgba(31,14,30,.62);display:flex;justify-content:center;align-items:center;padding:12px;box-sizing:border-box}',
 '.ap-life-panel{width:min(930px,100%);max-height:calc(100dvh - 24px);overflow:auto;box-sizing:border-box;border:1px solid #dbc9d5;border-radius:23px;background:#fbf5ed;color:#492543;padding:24px;font-family:system-ui,sans-serif}',
 '.ap-life-panel *{box-sizing:border-box}.ap-life-panel h1{font:600 clamp(30px,5vw,44px) Georgia,serif;margin:8px 0 14px}.ap-life-panel h2{font:600 27px Georgia,serif;margin:8px 0 12px}.ap-life-panel h3{font-size:18px;margin:7px 0}',
 '.ap-life-panel p{line-height:1.65;margin:8px 0}.ap-life-muted{color:#756771;font-size:13px}.ap-life-top{display:flex;align-items:center;justify-content:space-between;gap:10px}',
 '.ap-life-card{border:1px solid #decbd5;border-radius:15px;background:#fffdfa;padding:17px;margin:14px 0}.ap-life-btn{border:1px solid #c8b1c2;background:white;color:#562c4d;padding:11px 15px;border-radius:10px;cursor:pointer;font-size:14px}.ap-life-btn.primary{background:#633054;color:white}.ap-life-btn:disabled{opacity:.5}',
 '.ap-life-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:14px 0}.ap-life-progress{height:8px;border-radius:7px;overflow:hidden;background:#ece1e8;margin:9px 0}.ap-life-progress>span{display:block;height:100%;width:0;background:#764d6e;transition:width .15s}',
 '.ap-life-entry{border-left:2px solid #d5bdcc;padding:9px 13px 15px;margin-left:4px;position:relative}.ap-life-entry:before{content:"";position:absolute;top:15px;left:-5px;width:8px;height:8px;border-radius:50%;background:#906783}',
 '.ap-life-window{font-weight:700;font-size:14px;color:#69425e}.ap-life-age{color:#887480;font-size:13px}.ap-life-blank{padding:12px;border:1px solid #e2d0db;border-radius:10px;background:#fffaf6}',
 '@media(max-width:740px){.ap-life-overlay{padding:0}.ap-life-panel{height:100dvh;max-height:100dvh;width:100%;padding:18px 14px 90px;border-radius:0}}'
 ].join('');
 document.head.appendChild(st);
}
function cleanupLegacy(){
 q('#ap-events-nav')?.remove();q('#ap-events-tile')?.remove();
}
function decorate(){
 if(!window.USER_CONNECTE||document.body.classList.contains('ap-auth-open'))return;
 const nav=q('.ap-side .ap-nav');
 if(nav&&!q('#ap-life-nav')){
  const b=document.createElement('button');b.id='ap-life-nav';b.type='button';b.className='ap-navbtn';b.textContent='✦  Histoire de vie';b.onclick=open;nav.appendChild(b);
 }
 const hub=q('#ap-v168-future .v168-grid');
 if(hub&&!q('#ap-life-tile')){
  const b=document.createElement('button');b.id='ap-life-tile';b.type='button';b.className='v168-card';
  b.innerHTML='<div class="v168-icon">✦</div><h2>Histoire de vie</h2><p>Les grands tournants de votre vie, du passé aux années à venir.</p><span class="v168-arrow">→</span>';
  b.onclick=open;hub.appendChild(b);
 }
}
function close(){
 serial++;active=false;working=false;
 q('#ap-life-overlay')?.remove();
 document.removeEventListener('keydown',onKey);
}
function onKey(ev){if(ev.key==='Escape')close()}
function text(s){const t=q('#ap-life-status');if(t)t.textContent=s||''}
function bar(n){const t=q('#ap-life-bar');if(t)t.style.width=(Math.max(0,Math.min(1,n))*100).toFixed(0)+'%'}
function isCurrent(id){return active&&serial===id&&account===uid()&&born===signature(profile())}
function source(path,global){
 return new Promise((resolve,reject)=>{
  if(window[global]){resolve();return}
  const el=document.createElement('script');el.src='/'+path+'?v='+V;
  el.onload=()=>window[global]?resolve():reject(new Error('Fonction de calcul indisponible'));
  el.onerror=()=>reject(new Error('Chargement du calcul impossible'));
  document.head.appendChild(el);
 });
}
function row(x){
 const tone=x.tone==='difficile'?'Période exigeante':x.tone==='favorable'?'Période favorable':'Étape de changement';
 return '<article class="ap-life-entry"><div class="ap-life-window">'+esc(date(x.from))+' au '+esc(date(x.to))+'</div><div class="ap-life-age">Vers '+Number(x.age)+' ans · '+tone+'</div><h3>'+esc(x.title)+'</h3><p>'+esc(x.detail)+'</p></article>';
}
function display(data){
 const outlet=q('#ap-life-out');if(!outlet)return;
 const past=data.events.filter(x=>x.period==='passe'),future=data.events.filter(x=>x.period==='avenir');
 const empty='<p class="ap-life-blank">Aucun grand tournant suffisamment marqué ne ressort pour cette partie de la vie.</p>';
 outlet.innerHTML='<section class="ap-life-card"><h2>Votre vie jusqu’à aujourd’hui</h2><p class="ap-life-muted">Périodes possibles à confronter aux événements réellement vécus.</p>'+(past.length?past.map(row).join(''):empty)+'</section>'
 +'<section class="ap-life-card"><h2>Les grands chapitres à venir</h2><p class="ap-life-muted">Périodes qui ressortent de la chronologie.</p>'+(future.length?future.map(row).join(''):empty)+'</section>';
 const copy=q('#ap-life-copy');if(copy)copy.hidden=false;
}
async function run(){
 if(!active||working)return;
 const p=profile(),id=++serial;working=true;
 const btn=q('#ap-life-run');if(btn)btn.disabled=true;
 const key=[account,signature(p),'V211'].join('||');
 try{
  text('Analyse de toute la vie en cours…');bar(.02);
  if(memo.has(key)){display(memo.get(key));bar(1);text('Chronologie terminée.');return}
  await source('assets/v211-life-story-engine.js','APLifeStory');
  if(!isCurrent(id))return;
  try{await source('assets/v202-primary-directions.js','APPrimaryDirections')}catch(e){console.warn('Module complémentaire indisponible',e)}
  if(!isCurrent(id))return;
  const result=await window.APLifeStory.compute({A:window.AstroTruth,profile:p,alive:()=>isCurrent(id),progress:(s,v)=>{if(isCurrent(id)){text(s+'…');bar(v)}}});
  if(!isCurrent(id))return;
  memo.set(key,result);display(result);bar(1);text('Chronologie terminée.');
 }catch(e){
  if(isCurrent(id)){
   console.error('Astro Paquita histoire de vie',e);
   const out=q('#ap-life-out');if(out)out.innerHTML='<div class="ap-life-blank">Impossible de terminer cette analyse. Vérifiez les données de naissance puis relancez le calcul. '+esc(e.message||'')+'</div>';
   text('Le calcul n’a pas abouti.');
  }
 }finally{if(isCurrent(id)){working=false;if(btn)btn.disabled=false}}
}
async function copy(){
 const content=q('#ap-life-out')?.innerText||'';
 try{
  if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(content);
  else{const t=document.createElement('textarea');t.value=content;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}
  text('Récit copié.');
 }catch(e){text('Copie impossible sur cet appareil.')}
}
function open(){
 if(!window.USER_CONNECTE)return;
 close();active=true;account=uid();
 const p=profile();born=signature(p);
 const layer=document.createElement('div');layer.id='ap-life-overlay';layer.className='ap-life-overlay';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','Histoire de vie');
 const panel=document.createElement('div');panel.id='ap-life-panel';panel.className='ap-life-panel';layer.appendChild(panel);document.body.appendChild(layer);
 layer.onclick=e=>{if(e.target===layer)close()};
 document.addEventListener('keydown',onKey);
 panel.innerHTML='<div class="ap-life-top"><small class="ap-life-muted">ASTRO PAQUITA · HISTOIRE DE VIE</small><button id="ap-life-close" class="ap-life-btn">Fermer</button></div><h1>Les grandes étapes de votre vie</h1><p>De votre naissance aux années à venir : les changements importants, les périodes heureuses et les périodes difficiles.</p><div id="ap-life-main"></div>';
 q('#ap-life-close').onclick=close;
 if(!p||!window.AstroTruth?.validation?.(p)?.ok||p.timeStatus==='unknown'){
  q('#ap-life-main').innerHTML='<div class="ap-life-blank">Sélectionnez un profil dont la date, l’heure et le lieu de naissance sont complets.</div>';return;
 }
 const premium=window.USER_CONNECTE?.role==='admin'||window.USER_CONNECTE?.premium===true||document.body.classList.contains('ap-premium-user');
 if(!premium){q('#ap-life-main').innerHTML='<div class="ap-life-blank">Cette analyse est réservée aux comptes Premium.</div>';return}
 q('#ap-life-main').innerHTML='<div class="ap-life-card"><strong>'+esc(p.prenom||'Profil actif')+'</strong><p class="ap-life-muted">Une seule chronologie de la naissance à 100 ans, tous les domaines de vie.</p><div class="ap-life-actions"><button id="ap-life-run" class="ap-life-btn primary">Recalculer l’histoire de vie</button><button id="ap-life-copy" class="ap-life-btn" hidden>Copier le récit</button></div><div id="ap-life-status" class="ap-life-muted" aria-live="polite"></div><div class="ap-life-progress"><span id="ap-life-bar"></span></div></div><div id="ap-life-out"></div>';
 q('#ap-life-run').onclick=run;q('#ap-life-copy').onclick=copy;
 run();
}
function apply(){
 pending=false;css();cleanupLegacy();
 if(active&&(account!==uid()||born!==signature(profile())||!window.USER_CONNECTE||document.body.classList.contains('ap-auth-open')))close();
 decorate();
}
function schedule(){if(pending)return;pending=true;requestAnimationFrame(apply)}
function start(){
 observer=new MutationObserver(schedule);observer.observe(q('#ap-final-root')||document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.APEventsV201={version:V,open,close};
})();