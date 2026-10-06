/* Astro Paquita V188 — interprétation rapide + restitution autonome des prévisions.
   Aucun calcul astrologique n'est modifié : les données viennent du cache V187 / AstroTruth.day V121.
   L'IA devient un enrichissement rédactionnel, jamais un point bloquant. */
(function(){
'use strict';
if(window.__AP_V188_FAST_FORECAST__)return;
window.__AP_V188_FAST_FORECAST__=true;

const A=window.AstroTruth;
const q=(s,r)=>(r||document).querySelector(s);
const I18N={
 fr:{ready:'Repères calculés',fav:'Période plutôt favorable',del:'Période de vigilance',mix:'Période contrastée',stable:'Période relativement stable',generic:'Les tendances de cette période sont déjà calculées. Les repères les plus significatifs sont présentés ci-dessous.'},
 en:{ready:'Calculated markers',fav:'Rather favourable period',del:'Period requiring caution',mix:'Mixed period',stable:'Relatively stable period',generic:'The trends for this period have already been calculated. The most significant markers are shown below.'},
 es:{ready:'Referencias calculadas',fav:'Período bastante favorable',del:'Período de vigilancia',mix:'Período contrastado',stable:'Período relativamente estable',generic:'Las tendencias de este período ya están calculadas. A continuación aparecen las referencias más significativas.'},
 ar:{ready:'المؤشرات المحسوبة',fav:'فترة مواتية نسبياً',del:'فترة تتطلب الحذر',mix:'فترة متباينة',stable:'فترة مستقرة نسبياً',generic:'تم حساب اتجاهات هذه الفترة. تظهر أدناه أهم المؤشرات.'}
};
function lang(){return String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2)}
function tx(k){const t=I18N[lang()]||I18N.fr;return t[k]||I18N.fr[k]||k}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function fromIso(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(s||'')))return null;const d=new Date(s+'T12:00:00');return isNaN(d)?null:d}
function todayIso(){return iso(new Date())}
function period(){return q('.ap-route-forecast .ap-period-choice.active,[data-per].active')?.dataset.per||'mois'}
function domain(){return q('.ap-route-forecast .ap-domain-choice.active,[data-domain].active')?.dataset.domain||'all'}
function span(per){if(per==='jour'||per==='date')return 1;if(per==='semaine')return 7;if(per==='mois')return 30;if(per==='trimestre')return 90;return 365}
function start(per){if(per==='date'){const d=fromIso(q('#ap-forecast-date')?.value||'');if(d)return d}const d=fromIso(q('.ap-forecast-period-nav')?.dataset.v174Anchor||'');return d||new Date()}
function profileCacheId(){const p=A&&A.currentProfile&&A.currentProfile();return p?String(p.profileId||p.legacyKey||'profile')+'|'+String(p.birthDataVersion||p.updatedAt||''):'profile'}
function truthKey(){if(!A)return'';const per=period(),days=span(per),s=start(per),dom=domain();return ['ap','forecast','v187',profileCacheId(),per,iso(s),String(days),dom,lang(),String(A.TRUTH_VERSION||'truth'),'truth'].join(':')}
function truth(){try{return JSON.parse(localStorage.getItem(truthKey())||'null')}catch(e){return null}}
function stateOf(p,dom){const vals=dom==='all'?Object.values(p.scores||{}).map(Number):[Number(p.scores?.[dom]||0)];const sc=vals.length?vals.reduce((a,b)=>a+(Number.isFinite(b)?b:0),0)/vals.length:0;return sc>=1.25?'fav':sc<=-1.25?'del':Math.abs(sc)<.6?'stable':'mix'}
function isTechnical(s){return /\b(soleil|lune|mercure|v[ée]nus|mars|jupiter|saturne|uranus|neptune|pluton|maison\s*\d*|trigone|carr[ée]|sextile|opposition|conjonction|transit|orbe|degr[ée]|ascendant|descendant|milieu du ciel|mc\b|aspect)\b/i.test(String(s||''))}
function cleanText(v){let s=String(v||'').replace(/\s+/g,' ').trim();if(s.length<6||s.length>220||isTechnical(s))return'';s=s.replace(/^[•·\-–—]\s*/,'');return s}
function signalLines(p){if(lang()!=='fr')return[];const out=[],seen=new Set();for(const s of (p.signals||[])){const candidates=[...(Array.isArray(s.scenarios)?s.scenarios:[]),s.hint];for(const c of candidates){const text=cleanText(c);if(!text)continue;const k=text.toLowerCase();if(seen.has(k))continue;seen.add(k);let prefix='';if(/^\d{4}-\d{2}-\d{2}$/.test(String(s.date||''))){const d=fromIso(s.date);if(d)prefix=d.toLocaleDateString('fr-FR',{day:'numeric',month:'long'})+' : '}out.push(prefix+text);if(out.length>=3)return out}}}return out}
function genericHint(dom,st){const F={
 all:{fav:'Le climat général offre davantage de fluidité et d’ouvertures.',del:'Cette période demande davantage de prudence et d’anticipation.',mix:'Plusieurs tendances se croisent : il faut choisir les bons moments.',stable:'Le climat général reste assez régulier.'},
 amour:{fav:'Les échanges affectifs sont plus fluides et les rapprochements sont facilités.',del:'Les relations demandent davantage de tact et de recul.',mix:'La vie affective peut alterner rapprochements, hésitations ou tensions.',stable:'Le climat affectif reste relativement régulier.'},
 travail:{fav:'Le contexte professionnel soutient davantage les démarches, échanges et décisions.',del:'Le travail demande plus d’organisation et de prudence avant une décision importante.',mix:'Des possibilités existent, mais avec des ajustements à prévoir.',stable:'Le rythme professionnel reste relativement régulier.'},
 argent:{fav:'Les questions financières offrent davantage de marge de manœuvre.',del:'Budget, dépenses ou engagements financiers demandent plus de vigilance.',mix:'Les finances demandent des arbitrages entre ouvertures et contraintes.',stable:'La situation financière paraît relativement régulière.'},
 bienetre:{fav:'Le rythme personnel est plus porteur pour retrouver de l’élan.',del:'Mieux vaut ménager son rythme et éviter de trop tirer sur ses réserves.',mix:'L’énergie peut être irrégulière et demande des ajustements.',stable:'Le rythme personnel paraît relativement régulier.'},
 famille:{fav:'Les questions familiales ou de foyer peuvent avancer plus facilement.',del:'Les sujets familiaux ou de foyer demandent davantage de patience.',mix:'Le domaine familial mêle avancées et ajustements.',stable:'Le climat familial paraît relativement stable.'},
 voyage:{fav:'Les déplacements ou projets liés à l’extérieur sont plus fluides.',del:'Les déplacements demandent davantage d’anticipation et de vérifications.',mix:'Les projets de déplacement peuvent avancer avec quelques ajustements.',stable:'Aucun mouvement dominant ne ressort sur les déplacements.'}
};return lang()==='fr'?((F[dom]||F.all)[st]||F.all[st]):tx(st)}
function detailedFallback(t){const dom=t.domain||domain();const cards=(t.points||[]).map(p=>{const st=stateOf(p,dom),lines=signalLines(p);const body=lines.length?lines:[genericHint(dom,st)];return '<section class="ap-v188-period"><div class="ap-v188-period-head"><strong>'+esc(p.label)+'</strong><span class="ap-v188-state '+esc(st)+'">'+esc(tx(st))+'</span></div>'+body.map(x=>'<p>'+esc(x)+'</p>').join('')+'</section>'}).join('');return '<div class="ap-v188-deterministic"><div class="ap-v188-ready">'+esc(tx('ready'))+'</div><p class="ap-v188-intro">'+esc(tx('generic'))+'</p>'+cards+'</div>'}
function enhanceFallback(){const rep=q('#ap-v187-report');if(!rep||rep.querySelector('.ap-v188-deterministic'))return;const looksFallback=!!rep.querySelector('.ap-aspect-list')||/prend trop de temps|taking too long|tardando demasiado|يستغرق/i.test(rep.textContent||'');if(!looksFallback)return;const t=truth();if(!t||!Array.isArray(t.points))return;rep.innerHTML=detailedFallback(t)}
function compactPayload(args){const next={...args};const ctx=next.featureContext||{},per=ctx.period||period();if(per==='jour'&&String(ctx.start||'')===todayIso()){next.feature='forecast_today';next.featureContext={...ctx,date:ctx.start,days:1}}
 next.model='claude-haiku-4-5';
 next.max_tokens=per==='annee'?1100:per==='trimestre'?850:per==='mois'?700:per==='semaine'?550:450;
 next.system=`Rédige une prévision Astro Paquita claire à partir uniquement des données fournies. Aucun jargon astrologique, aucun score, aucun nom de planète, maison ou aspect. Transforme les repères en situations concrètes et possibilités, sans inventer d’événement certain. Respecte les dates. Structure courte : tendance générale, périodes clés, meilleures fenêtres, vigilances, synthèse. Réponds uniquement dans la langue demandée.`;
 if(Array.isArray(next.messages))next.messages=next.messages.map(m=>{if(!m||m.role!=='user'||typeof m.content!=='string')return m;try{const x=JSON.parse(m.content),d=x?.data;if(d&&Array.isArray(d.points)){d.points=d.points.map(p=>({...p,signals:(p.signals||[]).slice(0,2).map(s=>({date:s.date,polarity:s.polarity,importance:s.importance,scenarios:(s.scenarios||[]).slice(0,1)}))}));d.keyDates=(d.keyDates||[]).slice(0,8).map(s=>({date:s.date,polarity:s.polarity,importance:s.importance,scenarios:(s.scenarios||[]).slice(0,1)}));x.data=d;return {...m,content:JSON.stringify(x)}}catch(e){return m}});
 return next
}
let wrapped=null;
function installAI(){const old=window.appelerClaude;if(typeof old!=='function'||old===wrapped||old.__apV188Fast)return;const fn=async function(args){if(args&&args.featureContext&&args.featureContext.mode==='unified_v187')return old(compactPayload(args));return old(args)};fn.__apV188Fast=true;fn.__apV188Original=old;wrapped=fn;window.appelerClaude=fn}
const style=document.createElement('style');style.id='ap-v188-forecast-style';style.textContent=`
.ap-v188-deterministic{display:grid;gap:12px}.ap-v188-ready{font-weight:800;color:#4b2149;font-size:15px}.ap-v188-intro{margin:0 0 4px!important;color:#74656d!important;line-height:1.55}.ap-v188-period{padding:15px 16px;border:1px solid rgba(79,34,69,.12);border-radius:17px;background:rgba(255,250,244,.78)}.ap-v188-period-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:8px}.ap-v188-period-head strong{color:#4b2149;font-size:16px;text-transform:none}.ap-v188-state{font-size:12px;font-weight:700;line-height:1.3;text-align:right;max-width:48%;color:#715e69}.ap-v188-period p{margin:6px 0 0!important;line-height:1.55!important;color:#584b52!important}.ap-v188-period p+p{padding-top:5px;border-top:1px solid rgba(79,34,69,.08)}
@media(max-width:560px){.ap-v188-period{padding:14px}.ap-v188-period-head{display:block}.ap-v188-state{display:block;max-width:none;text-align:left;margin-top:4px}.ap-forecast-v187 .ap-report{font-size:15px}}
`;document.head.appendChild(style);
let queued=false;const obs=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;installAI();enhanceFallback()})});
function start(){installAI();obs.observe(document.getElementById('ap-final-root')||document.body,{childList:true,subtree:true});enhanceFallback()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
