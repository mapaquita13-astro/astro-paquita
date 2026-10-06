/* Astro Paquita V194 — contrôleur fiable + moteur de prévisions V121 exact.
   Le bouton et la navigation restent isolés des anciens handlers.
   La source de vérité des prévisions redevient lancerPrevDepuis()/scannerJours V121,
   afin de retrouver les mêmes tournants, périodes marquées, micro-chronologie et dates qu'avant. */
(function(){
'use strict';
if(window.__AP_V194_FORECAST_EXACT__)return;
window.__AP_V194_FORECAST_EXACT__=true;
window.__AP_V192_FORECAST_CONTROLLER__=true;
const A=window.AstroTruth;
const q=(s,r)=>(r||document).querySelector(s);
let running=false,queued=false,lastTrigger=0,runId=0;
function lang(){return String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2)}
const T={
 fr:{calc:'Analyse astrologique complète…',ready:'Prévision personnalisée',generate:'Générer mes prévisions →',prev:'Précédent',next:'Suivant',premium:'Cette période est réservée aux comptes Premium.',missing:'Le moteur de prévisions V121 n’est pas disponible.',empty:'La prévision n’a pas produit de rapport exploitable.',cache:'Prévision déjà calculée — affichage immédiat.'},
 en:{calc:'Full astrological analysis…',ready:'Personal forecast',generate:'Generate my forecasts →',prev:'Previous',next:'Next',premium:'This period is reserved for Premium accounts.',missing:'The V121 forecast engine is unavailable.',empty:'The forecast did not produce a usable report.',cache:'Previously calculated forecast — displaying instantly.'},
 es:{calc:'Análisis astrológico completo…',ready:'Previsión personalizada',generate:'Generar mis previsiones →',prev:'Anterior',next:'Siguiente',premium:'Este período está reservado a las cuentas Premium.',missing:'El motor de previsiones V121 no está disponible.',empty:'La previsión no produjo un informe utilizable.',cache:'Previsión ya calculada — visualización inmediata.'},
 ar:{calc:'تحليل فلكي كامل…',ready:'توقع شخصي',generate:'إنشاء توقعاتي ←',prev:'السابق',next:'التالي',premium:'هذه الفترة مخصصة لحسابات Premium.',missing:'محرك توقعات V121 غير متاح.',empty:'لم ينتج التوقع تقريراً قابلاً للاستخدام.',cache:'تم حساب هذا التوقع سابقاً — عرض فوري.'}
};
function tx(k){const t=T[lang()]||T.fr;return t[k]||T.fr[k]||k}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function fromIso(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(s||'')))return null;const d=new Date(s+'T12:00:00');return isNaN(d)?null:d}
function today(){const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate(),12)}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function fmt(d,opt){return d.toLocaleDateString({fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'}[lang()]||'fr-FR',opt||{day:'numeric',month:'long',year:'numeric'})}
function period(){return q('.ap-route-forecast .ap-period-choice.active')?.dataset.per||'mois'}
function domain(){return q('.ap-route-forecast .ap-domain-choice.active')?.dataset.domain||'all'}
function span(p){if(p==='jour'||p==='date')return 1;if(p==='semaine')return 7;if(p==='mois')return 30;if(p==='trimestre')return 90;return 365}
function nav(){return q('.ap-route-forecast .ap-forecast-period-nav')}
function start(p){if(p==='date'){const d=fromIso(q('#ap-forecast-date')?.value||'');if(d)return d}const n=nav(),d=fromIso(n?.dataset.v194Anchor||n?.dataset.v192Anchor||n?.dataset.v174Anchor||'');return d||today()}
function rangeTitle(s,n){const e=addDays(s,n-1);return n===1?fmt(s):fmt(s)+' → '+fmt(e)}
function rangeShort(s,n){const e=addDays(s,n-1),o={day:'numeric',month:'short',year:'numeric'};return n===1?fmt(s,o):fmt(s,o)+' → '+fmt(e,o)}
function premium(){try{return document.body.classList.contains('ap-premium-user')||window.USER_CONNECTE?.role==='admin'||window.USER_CONNECTE?.premium===true}catch(e){return false}}
function free(){return document.body.classList.contains('ap-free-user')}
function premiumToast(){let x=q('.ap-premium-lock-toast');if(x){x.classList.add('show');clearTimeout(x._t);x._t=setTimeout(()=>x.classList.remove('show'),3200);return}const e=q('#ap-forecast-error');if(e){e.textContent=tx('premium');e.classList.add('show')}}
function ensureProfile(){const p=A&&A.currentProfile&&A.currentProfile();if(!p)throw new Error('Aucun profil actif.');try{A.activate&&A.activate(p.profileId||p.legacyKey)}catch(e){}try{if((typeof USER==='undefined'||!USER)&&typeof window.v37CalculerUserDepuisDonnees==='function')window.v37CalculerUserDepuisDonnees({...p,__profileKey:p.legacyKey,__timeStatus:p.timeStatus||'exact'})}catch(e){}try{if(typeof USER==='undefined'||!USER)throw new Error('Le profil actif n’a pas pu être initialisé.')}catch(e){throw e}return p}
function oldDomain(d){return ({all:'general',amour:'amour',travail:'travail',argent:'finances',bienetre:'sante',famille:'famille',voyage:'voyage'})[d]||'general'}
function setLegacySelection(d,p){const od=oldDomain(d);try{domP=od}catch(e){try{window.eval('domP='+JSON.stringify(od))}catch(_){}}try{perP=p}catch(e){try{window.eval('perP='+JSON.stringify(p))}catch(_){}}}
function profileKey(p){return [p?.profileId||p?.legacyKey||p?.prenom||'',p?.date||p?.dateISO||'',p?.heure||'',p?.lieu||p?.ville||''].join('|')}
function cacheKey(p,s,days,per,dom){return 'ap:v194:v121exact:'+encodeURIComponent([profileKey(p),iso(s),days,per,oldDomain(dom),lang()].join('|'))}
function getCache(k){try{const x=JSON.parse(localStorage.getItem(k)||'null');return x&&x.html?x:null}catch(e){return null}}
function setCache(k,html,title){try{localStorage.setItem(k,JSON.stringify({html,title,at:Date.now()}))}catch(e){}}
function renderReport(out,title,html,note){out.innerHTML='<div class="ap-card ap-forecast-v174 ap-forecast-v192 ap-forecast-v194"><div class="ap-eyebrow">'+esc(tx('ready'))+'</div><h2 style="margin:6px 0 14px">'+esc(title)+'</h2>'+(note?'<p class="ap-muted" style="margin-bottom:12px">'+esc(note)+'</p>':'')+'<div class="ap-report ap-v194-exact-report">'+html+'</div></div>'}
function syncNav(forceToday){const n=nav();if(!n)return;const p=period(),days=span(p);let s=forceToday?today():start(p);if(p==='date'){const d=fromIso(q('#ap-forecast-date')?.value||'');if(d)s=d}n.dataset.v194Anchor=iso(s);n.dataset.v192Anchor=iso(s);n.dataset.v174Anchor=iso(s);n.dataset.v174Days=String(days);const l=q('.ap-forecast-range-label',n);if(l)l.textContent=rangeShort(s,days)}
function cancelVisual(){runId++;running=false;const b=q('#ap-run-forecast-v192');if(b){b.disabled=false;b.textContent=tx('generate')}}
function shift(dir){if(running)return;const p=period(),days=span(p),s=start(p);s.setDate(s.getDate()+dir*days);const n=nav();if(n){n.dataset.v194Anchor=iso(s);n.dataset.v192Anchor=iso(s);n.dataset.v174Anchor=iso(s);n.dataset.v174Days=String(days)}if(p==='date'){const i=q('#ap-forecast-date');if(i)i.value=iso(s)}const l=q('.ap-forecast-range-label');if(l)l.textContent=rangeShort(s,days);const out=q('#ap-forecast-result');if(out)out.innerHTML=''}
function mirrorProgress(my){const pr=q('#ap-v194-progress');if(!pr||my!==runId)return;const a=q('#p-nav-pl'),b=q('#p-pl'),lab=(a&&a.textContent&&a.closest('#p-nav-pw')?.style.display!=='none'?a:b);const bar=(a&&a.textContent&&a.closest('#p-nav-pw')?.style.display!=='none'?q('#p-nav-pb'):q('#p-pb'));const text=lab?.textContent?.trim();const width=bar?.style?.width||'';if(text)pr.textContent=text+(width?' · '+width:'')}
async function run(){
 if(running)return;
 const out=q('#ap-forecast-result');if(!out)return;
 const p=period(),dom=domain(),days=span(p),s=start(p);
 if(p!=='jour'&&free()&&!premium()){premiumToast();return}
 const my=++runId;running=true;
 const btn=q('#ap-run-forecast-v192');if(btn){btn.disabled=true;btn.textContent=tx('calc')}
 const err=q('#ap-forecast-error');if(err){err.textContent='';err.classList.remove('show')}
 const title=rangeTitle(s,days);
 try{
   const prof=ensureProfile();
   if(typeof window.lancerPrevDepuis!=='function')throw new Error(tx('missing'));
   setLegacySelection(dom,p);
   const key=cacheKey(prof,s,days,p,dom),cached=getCache(key);
   if(cached){renderReport(out,cached.title||title,cached.html,tx('cache'));return}
   out.innerHTML='<div class="ap-card"><h3>'+esc(title)+'</h3><p id="ap-v194-progress" class="ap-muted">'+esc(tx('calc'))+'</p></div>';
   const timer=setInterval(()=>mirrorProgress(my),220);
   try{
     await window.lancerPrevDepuis(new Date(s),days,p);
   } finally { clearInterval(timer); }
   if(my!==runId)return;
   const legacy=q('#p-rapport');
   const html=legacy&&legacy.innerHTML?legacy.innerHTML.trim():'';
   if(!html||/Calcul en cours/i.test(legacy?.textContent||''))throw new Error(tx('empty'));
   setCache(key,html,title);
   renderReport(out,title,html,'');
 }catch(e){
   console.error('Astro Paquita V194 exact V121 :',e);
   if(err){err.textContent=e?.message||'La prévision n’a pas pu être générée.';err.classList.add('show')}
   if(out)out.innerHTML='';
 }finally{
   if(my===runId){running=false;const b=q('#ap-run-forecast-v192');if(b){b.disabled=false;b.textContent=tx('generate')}}
 }
}
function cleanClone(el,newId){if(!el)return null;const c=el.cloneNode(true);c.id=newId;c.disabled=false;c.removeAttribute('disabled');c.removeAttribute('onclick');c.removeAttribute('ontouchend');c.removeAttribute('onpointerup');c.dataset.v194='1';el.replaceWith(c);return c}
function trigger(ev){const now=Date.now();if(now-lastTrigger<500){ev.preventDefault();ev.stopImmediatePropagation();return}lastTrigger=now;ev.preventDefault();ev.stopImmediatePropagation();run()}
function ownGenerate(){let b=q('#ap-run-forecast-v192');if(b&&b.dataset.v194==='1')return;b=cleanClone(q('#ap-run-forecast-v192,#ap-run-forecast,#ap-run-forecast-v189,#ap-run-forecast-v190'),'ap-run-forecast-v192');if(!b)return;b.textContent=tx('generate');b.addEventListener('click',trigger,true);b.addEventListener('touchend',trigger,{capture:true,passive:false})}
function ownNav(id,dir){let b=q(id+'-v194');if(b&&b.dataset.v194==='1')return;const old=q(id);if(!old)return;b=cleanClone(old,id.slice(1)+'-v194');if(!b)return;b.dataset.v194='1';b.addEventListener('click',ev=>{ev.preventDefault();ev.stopImmediatePropagation();shift(dir)},true)}
function normalizeNavIds(){const a=q('#ap-forecast-prev-v194');if(a)a.id='ap-forecast-prev-v194';const b=q('#ap-forecast-next-v194');if(b)b.id='ap-forecast-next-v194'}
function ownControls(){if(!document.body.classList.contains('ap-route-forecast'))return;ownGenerate();ownNav('#ap-forecast-prev',-1);ownNav('#ap-forecast-next',1);normalizeNavIds();syncNav(false)}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;ownControls()})}
const obs=new MutationObserver(schedule);obs.observe(document.getElementById('ap-final-root')||document.body,{childList:true,subtree:true});
document.addEventListener('change',ev=>{if(ev.target?.id==='ap-forecast-date')setTimeout(()=>syncNav(false),0)},true);
document.addEventListener('click',ev=>{const p=ev.target?.closest?.('.ap-period-choice');if(p)setTimeout(()=>syncNav(true),0)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
})();
