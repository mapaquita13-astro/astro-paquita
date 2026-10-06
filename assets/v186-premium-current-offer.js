/* Astro Paquita V186 — contenu Premium aligné sur les modules réellement disponibles.
   Nettoie uniquement le discours commercial obsolète ; aucun droit d'accès ni paiement n'est modifié. */
(function(){
'use strict';
if(window.__AP_V186_PREMIUM_COPY__)return;window.__AP_V186_PREMIUM_COPY__=true;
const I18N={
 fr:{title:'Ce que comprend Premium aujourd’hui',note:'Les fonctions ci-dessous correspondent aux modules actuellement disponibles dans Astro Paquita.',items:['Mon avenir','Prévisions détaillées : semaine, mois, 3 mois, 12 mois et date précise','Le bon moment','Relations & Synastrie','Portrait enfant','Calendrier personnel']},
 en:{title:'What Premium includes today',note:'The features below match the modules currently available in Astro Paquita.',items:['My future','Detailed forecasts: week, month, 3 months, 12 months and a specific date','Best timing','Relationships & Synastry','Child portrait','Personal calendar']},
 es:{title:'Lo que incluye Premium actualmente',note:'Las funciones siguientes corresponden a los módulos disponibles actualmente en Astro Paquita.',items:['Mi futuro','Previsiones detalladas: semana, mes, 3 meses, 12 meses y fecha concreta','El mejor momento','Relaciones y sinastría','Retrato infantil','Calendario personal']},
 ar:{title:'ما الذي يتضمنه Premium حالياً',note:'تتوافق الميزات التالية مع الوحدات المتاحة حالياً في Astro Paquita.',items:['مستقبلي','توقعات مفصلة: أسبوع، شهر، 3 أشهر، 12 شهراً وتاريخ محدد','الوقت الأنسب','العلاقات والتوافق','خريطة الطفل','التقويم الشخصي']}
};
const STALE=/(timeline|comparateur|compare(?:r)?\s+(?:des\s+)?dates?|comparador|grands?\s+év[ée]nements?|major\s+events?|grandes?\s+eventos?|avenir\s+racont[ée]|story\s+of\s+your\s+future|futuro\s+relatado|fen[êe]tres?\s+[àa]\s+[ée]viter|windows?\s+to\s+avoid|ventanas?\s+a\s+evitar|ma\s+question|my\s+question|mi\s+pregunta|notifications?|cr[ée]dits?\s+question)/i;
function lang(){return String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2)}
function tx(){return I18N[lang()]||I18N.fr}
function visible(el){if(!el)return false;const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'}
function closestRow(el){return el.closest('li,[class*="feature"],[class*="benefit"],[class*="item"],p')||el}
function removeStale(){document.querySelectorAll('li,p,[class*="feature"],[class*="benefit"],[class*="item"]').forEach(el=>{if(el.dataset.apPremiumClean==='1')return;const text=String(el.textContent||'').trim();if(text&&STALE.test(text)){const row=closestRow(el);row.style.display='none';row.dataset.apPremiumClean='1'}})}
function premiumHeading(){const hs=[...document.querySelectorAll('h1,h2,h3,h4,strong')].filter(visible);return hs.find(h=>/^\s*(premium|بريميوم)\b/i.test(String(h.textContent||'').trim()))||null}
function currentBlock(){const t=tx(),box=document.createElement('div');box.className='ap-premium-current-v186';box.innerHTML='<h3>'+t.title+'</h3><p>'+t.note+'</p><ul>'+t.items.map(x=>'<li>✓ '+x+'</li>').join('')+'</ul>';return box}
function installBlock(){const h=premiumHeading();if(!h)return;let host=h.closest('[role="dialog"],.modal,.popup,.dialog,.card,.ap-card,section,article');if(!host)host=h.parentElement;if(!host||host.querySelector('.ap-premium-current-v186'))return;host.appendChild(currentBlock())}
function clean(){removeStale();installBlock()}
function patchOpen(){const old=window.ouvrirCompte;if(typeof old!=='function'||old.__apV186Wrapped)return;function wrapped(){const r=old.apply(this,arguments);setTimeout(clean,0);setTimeout(clean,80);return r}wrapped.__apV186Wrapped=true;wrapped.__apV186Original=old;window.ouvrirCompte=wrapped}
const style=document.createElement('style');style.id='ap-v186-premium-style';style.textContent=`.ap-premium-current-v186{margin-top:18px;padding:18px;border:1px solid rgba(93,45,82,.15);border-radius:18px;background:#fffaf4}.ap-premium-current-v186 h3{margin:0 0 7px;font-size:19px;color:#4b2149}.ap-premium-current-v186 p{margin:0 0 11px;color:#71626b;line-height:1.45}.ap-premium-current-v186 ul{list-style:none;padding:0;margin:0;display:grid;gap:7px}.ap-premium-current-v186 li{display:block!important;color:#4f4249;line-height:1.45}`;document.head.appendChild(style);
let queued=false;const obs=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;patchOpen();clean()})});
function start(){patchOpen();clean();obs.observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
