/* Astro Paquita — V137 nettoyage client global.
   Affichage uniquement : aucun calcul natal, maison, transit, prévision ou synastrie n'est remplacé ici. */
(function(){
'use strict';

const LANGS=['fr','en','es','ar'];
const HOME={
 fr:{tagline:'Éclairez votre chemin',home:'Accueil',natal:'Portrait natal',future:'Mon avenir',relations:'Relations',profile:'Profil',
  heroKicker:"Plus qu'une astrologie, un voyage vers vous-même",heroTitle:"Votre ciel,<br><em>aujourd'hui</em>",heroText:'Des clés pour mieux vous comprendre et avancer avec confiance.',heroCta:'Découvrir mon ciel du jour →',
  today:'Aujourd’hui',climate:'Votre climat du moment',personal:'Lecture personnalisée',todayText:'Retrouvez votre prévision calculée pour votre profil et les périodes qui méritent votre attention.',todayCta:'Lire la prévision complète →',
  next:'Prochain temps fort',details:'Voir les détails →',explore:'Explorez votre univers',align:'Une vie plus alignée',
  natalDesc:'Découvrez vos forces, vos contradictions et ce qui vous rend unique.',futureDesc:'Visualisez vos tendances, les périodes qui comptent et le bon moment pour agir.',relationsDesc:"Comprenez vos liens, votre manière d'aimer et la dynamique entre deux thèmes.",
  banner:'Des étoiles pour avancer, un espace pour être vous.',bannerSub:'Mieux se connaître, pour mieux rayonner.'},
 en:{tagline:'Light your path',home:'Home',natal:'Natal portrait',future:'My future',relations:'Relationships',profile:'Profile',
  heroKicker:'More than astrology, a journey toward yourself',heroTitle:'Your sky,<br><em>today</em>',heroText:'Clear insights to understand yourself better and move forward with confidence.',heroCta:'Discover my sky today →',
  today:'Today',climate:'Your current climate',personal:'Personal reading',todayText:'See the forecast calculated for your profile and the periods that deserve your attention.',todayCta:'Read the full forecast →',
  next:'Next key period',details:'View details →',explore:'Explore your universe',align:'A more aligned life',natalDesc:'Discover your strengths, contradictions and what makes you unique.',futureDesc:'See your trends, key periods and the best moments to act.',relationsDesc:'Understand your bonds, your way of loving and the dynamics between two charts.',banner:'Stars to move forward, space to be yourself.',bannerSub:'Know yourself better, shine more freely.'},
 es:{tagline:'Ilumina tu camino',home:'Inicio',natal:'Retrato natal',future:'Mi futuro',relations:'Relaciones',profile:'Perfil',
  heroKicker:'Más que astrología, un viaje hacia ti',heroTitle:'Tu cielo,<br><em>hoy</em>',heroText:'Claves claras para comprenderte mejor y avanzar con confianza.',heroCta:'Descubrir mi cielo de hoy →',
  today:'Hoy',climate:'Tu clima actual',personal:'Lectura personalizada',todayText:'Consulta la previsión calculada para tu perfil y los períodos que merecen tu atención.',todayCta:'Leer la previsión completa →',
  next:'Próximo período clave',details:'Ver detalles →',explore:'Explora tu universo',align:'Una vida más alineada',natalDesc:'Descubre tus fortalezas, contradicciones y lo que te hace único.',futureDesc:'Visualiza tus tendencias, los períodos importantes y el mejor momento para actuar.',relationsDesc:'Comprende tus vínculos, tu forma de amar y la dinámica entre dos cartas.',banner:'Estrellas para avanzar, un espacio para ser tú.',bannerSub:'Conocerte mejor para brillar más.'},
 ar:{tagline:'أنر طريقك',home:'الرئيسية',natal:'الخريطة الشخصية',future:'مستقبلي',relations:'العلاقات',profile:'الملف',
  heroKicker:'أكثر من علم التنجيم، رحلة نحو ذاتك',heroTitle:'سماؤك،<br><em>اليوم</em>',heroText:'إشارات واضحة لفهم نفسك والتقدم بثقة.',heroCta:'اكتشف سمائي اليوم ←',today:'اليوم',climate:'مناخك الحالي',personal:'قراءة شخصية',todayText:'اطّلع على التوقع المحسوب لملفك والفترات التي تستحق انتباهك.',todayCta:'اقرأ التوقع الكامل ←',next:'الفترة المهمة القادمة',details:'عرض التفاصيل ←',explore:'اكتشف عالمك',align:'حياة أكثر انسجامًا',natalDesc:'اكتشف نقاط قوتك وتناقضاتك وما يجعلك مميزًا.',futureDesc:'شاهد اتجاهاتك والفترات المهمة وأفضل الأوقات للتحرك.',relationsDesc:'افهم روابطك وطريقتك في الحب وديناميكية خريطتين.',banner:'نجوم تساعدك على التقدم ومساحة لتكون نفسك.',bannerSub:'اعرف نفسك أكثر لتتألق أكثر.'}
};

function lang(){const l=String(window.AP_LANG||localStorage.getItem('astro-lang')||'fr').toLowerCase().slice(0,2);return LANGS.includes(l)?l:'fr'}
function tx(k){return (HOME[lang()]||HOME.fr)[k]||HOME.fr[k]||k}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function activeName(){try{return (window.USER&&window.USER.prenom)||window.USER_CONNECTE?.prenom||''}catch(e){return ''}}
function formatDate(d){try{return new Intl.DateTimeFormat(({fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'})[lang()]||'fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(d)}catch(e){return ''}}
function nextSignal(){if(!window.USER||typeof window.apV51Signals!=='function')return null;try{const start=new Date(),cand=[];for(let d=0;d<=180;d+=10){const dt=new Date(start);dt.setDate(dt.getDate()+d);for(const x of window.apV51Signals(dt,'marque')||[])cand.push({dt,x})}cand.sort((a,b)=>(b.x?.strength||b.x?.force||0)-(a.x?.strength||a.x?.force||0));return cand[0]||null}catch(e){return null}}
function signalTitle(s){if(!s)return tx('next');const d=s.x?.domain||'general',pol=s.x?.polarite||'';const labels={fr:{amour:'Amour',travail:'Travail',finances:'Argent',argent:'Argent',sante:'Bien-être',famille:'Famille',voyage:'Voyage',general:'Évolution'},en:{amour:'Love',travail:'Work',finances:'Money',argent:'Money',sante:'Well-being',famille:'Family',voyage:'Travel',general:'Evolution'},es:{amour:'Amor',travail:'Trabajo',finances:'Dinero',argent:'Dinero',sante:'Bienestar',famille:'Familia',voyage:'Viaje',general:'Evolución'},ar:{amour:'الحب',travail:'العمل',finances:'المال',argent:'المال',sante:'الرفاه',famille:'العائلة',voyage:'السفر',general:'التطور'}};const states={fr:{positive:'période favorable',difficile:'période exigeante',other:'période à observer'},en:{positive:'favorable period',difficile:'demanding period',other:'period to watch'},es:{positive:'período favorable',difficile:'período exigente',other:'período a observar'},ar:{positive:'فترة داعمة',difficile:'فترة أكثر تحديًا',other:'فترة تستحق المتابعة'}};const l=lang(),lab=(labels[l]||labels.fr)[d]||(labels[l]||labels.fr).general,st=(states[l]||states.fr)[pol]||(states[l]||states.fr).other;return `${lab} — ${st}`}

function ensureStyle(){
 if(document.getElementById('ap-v137-client-style'))return;
 const s=document.createElement('style');s.id='ap-v137-client-style';s.textContent=`
 #mod-question,#ap-v130-question-card,[onclick*="question" i],[data-feature="question"],[data-module="question"]{display:none!important}
 .ap-v137-media-clean,.ap121-feature .pic,.ap121-today-img{background-size:contain!important;background-repeat:no-repeat!important;background-position:center!important;background-color:#2b182d!important}
 .ap121-feature .pic{min-height:210px!important}
 .ap121-banner,.ap121-hero{background-size:cover!important;background-position:center!important}
 .ap121-banner-copy,.ap121-hero-copy{position:relative!important;z-index:3!important;background:rgba(255,250,242,.94)!important;color:#35102f!important;border:1px solid rgba(96,55,79,.14)!important;border-radius:18px!important;padding:20px 22px!important;max-width:560px!important;box-shadow:0 12px 35px rgba(40,18,36,.10)!important;text-shadow:none!important}
 .ap121-hero-copy h1,.ap121-hero-copy h2,.ap121-hero-copy h3,.ap121-banner-copy h1,.ap121-banner-copy h2,.ap121-banner-copy h3{color:#35102f!important;text-shadow:none!important}
 .ap121-hero-copy p,.ap121-banner-copy p{color:#654f60!important;text-shadow:none!important}
 .per-btn.actif,.f-btn.actif,.dom-btn.actif,.genre-btn.actif,.mod-onglet.actif,.mod-onglet.active,[aria-selected="true"]{background:#42183d!important;color:#fffaf2!important;border-color:#42183d!important;box-shadow:0 5px 14px rgba(66,24,61,.18)!important}
 .f-btn.actif .f-label{color:#fffaf2!important}
 @media(max-width:760px){.ap121-feature .pic{min-height:180px!important}.ap121-banner-copy,.ap121-hero-copy{max-width:calc(100% - 24px)!important;margin:12px!important;padding:16px!important}}
 `;document.head.appendChild(s)
}

function removeQuestion(){
 document.body?.classList.remove('ap-v130-question-open');
 document.querySelectorAll('#mod-question,#ap-v130-question-card,[onclick*="question" i],[data-feature="question"],[data-module="question"]').forEach(el=>el.remove());
 document.querySelectorAll('button,a,article,div').forEach(el=>{const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(['ma question','my question','mi pregunta','سؤالي'].includes(t))el.remove()});
 const qpack=document.getElementById('q-pack-btn');if(qpack)qpack.remove();
}

function cleanInternalCopy(){
 const replacements=[
  [/\bV\s*121\b/gi,''],[/\bV121\b/gi,''],[/\bmoteur\s+V121\b/gi,'calcul astrologique'],[/\bmême moteur astrologique\b/gi,'même méthode de calcul'],[/\bmême moteur\b/gi,'même méthode de calcul'],
  [/Le résultat ne se limite plus à un score\s*:\s*/gi,''],[/Les mois calmes restent volontairement discrets\s*:\s*/gi,''],[/sans transformer deux ans en [«"]grands tournants de toute une vie[»"]/gi,''],
  [/Le graphique vous donne la vue d['’]ensemble\s*;\s*/gi,''],[/Aucune date ne réunit assez de preuves astrologiques propres à cette intention\./gi,'Aucune période suffisamment nette ne ressort pour cette intention.'],
  [/Les bons scores d['’]autres domaines sont volontairement ignorés\./gi,''],[/Le moteur ne remplace pas ce manque de signal par un événement d['’]un autre domaine\./gi,''],
  [/Ce repère vient directement du même moteur que vos prévisions et vos grands événements\./gi,'Ce repère est calculé à partir de votre thème et de vos cycles actuels.'],
  [/Une synthèse qui croise vos dominantes, planètes, maisons et aspects au lieu d['’]aligner des définitions génériques\./gi,'Une synthèse de vos dominantes, planètes, maisons et aspects.']
 ];
 document.querySelectorAll('h1,h2,h3,h4,p,span,small,button,label,div').forEach(el=>{
   if(el.children.length>0&& !el.matches('button,label'))return;
   let v=el.textContent||'',n=v;for(const [r,to] of replacements)n=n.replace(r,to);n=n.replace(/\s{2,}/g,' ').replace(/\s+([,.;:!?])/g,'$1').trim();if(n!==v&&n)el.textContent=n;
 });
}

function selectedButtons(){
 document.addEventListener('click',e=>{
  const b=e.target.closest('.per-btn,.f-btn,.dom-btn,.genre-btn,.mod-onglet');if(!b)return;
  const group=b.closest('.per-btns,.f-intentions,.dom-btns,.genre-btns,.mod-onglets,.mod-tabs')||b.parentElement;if(!group)return;
  const selector=b.classList.contains('per-btn')?'.per-btn':b.classList.contains('f-btn')?'.f-btn':b.classList.contains('dom-btn')?'.dom-btn':b.classList.contains('genre-btn')?'.genre-btn':'.mod-onglet';
  group.querySelectorAll(selector).forEach(x=>{x.classList.remove('actif','active');x.setAttribute('aria-selected','false')});b.classList.add('actif');b.setAttribute('aria-selected','true');
 },true)
}

function patchIdealTiming(){
 const form=document.getElementById('f-form');if(form){
  const p=form.querySelector('.bloc p');if(p&&/10\s+prochaines?\s+ann[ée]es|10\s+ans/i.test(p.textContent||''))p.textContent='Choisissez votre intention. Astro Paquita recherche les meilleures périodes dans les 24 prochains mois.';
 }
 const fn=window.lancerFenetre;if(typeof fn==='function'&&!fn.__apV137){
  try{
   let src=fn.toString();
   src=src.replace('const nbJours = 365 * 10;','const nbJours = 365 * 2;')
          .replace("horizon:'10 ans'","horizon:'24 mois'")
          .replace(/Scan 10 ans/g,'Scan 24 mois')
          .replace(/scan 10 ans/g,'scan 24 mois');
   const patched=(0,eval)('('+src+')');patched.__apV137=true;window.lancerFenetre=patched;
  }catch(e){console.warn('Correctif horizon Bon moment non appliqué',e)}
 }
}

function renderHomeTranslated(){
 const h=document.getElementById('ap121-home');if(!h||!h.classList.contains('active'))return;
 const IMG={home:'assets/img/home.jpg',today:'assets/img/today.jpg',jupiter:'assets/img/jupiter.jpg',natal:'assets/img/natal.jpg',future:'assets/img/future.jpg',relations:'assets/img/relations.jpg',futureBanner:'assets/img/futureBanner.jpg'};
 const s=nextSignal(),name=activeName();
 h.innerHTML=`<div class="ap121-hero" style="background-image:url(${IMG.home})"><div class="ap121-brand"><div class="ap121-brandword">☾ Astro Paquita<small>${esc(tx('tagline'))}</small></div><div class="ap121-brand-actions"><button class="ap121-pill" type="button">${lang().toUpperCase()}⌄</button><button class="ap121-avatar" onclick="v121Go('profile')">♙</button></div></div><div class="ap121-hero-copy"><div class="ap121-kicker">${esc(tx('heroKicker'))}</div><h1>${tx('heroTitle')}</h1><p>${esc(tx('heroText'))}${name?` ${esc(name)}.`:''}</p><button class="ap121-cta" onclick="ap121Open('prev')">${esc(tx('heroCta'))}</button></div></div><div class="ap121-wrap"><article class="ap121-card ap121-today"><div class="ap121-today-img ap-v137-media-clean" style="background-image:url(${IMG.today})"></div><div><div class="ap121-title-row"><div><span class="ap121-label">☉ ${esc(tx('today'))}</span><h2 style="margin:9px 0 4px">${esc(tx('climate'))}</h2></div><span class="ap121-label">☾ ${esc(tx('personal'))}</span></div><p>${esc(tx('todayText'))}</p><button class="ap121-link" onclick="ap121Open('prev')">${esc(tx('todayCta'))}</button></div></article><article class="ap121-card ap121-today"><div class="ap121-today-img ap-v137-media-clean" style="background-image:url(${IMG.jupiter})"></div><div><span class="ap121-kicker" style="color:#b0772b">${esc(tx('next'))}</span><h2 style="margin:6px 0">${esc(signalTitle(s))}</h2><div class="ap121-date">${s?esc(formatDate(s.dt)):'—'}</div><button class="ap121-link" onclick="v121Go('future')">${esc(tx('details'))}</button></div></article><div class="ap121-title-row" style="margin:28px 6px 14px"><h2 style="font:600 36px/1 'Cormorant Garamond',Georgia,serif;color:#341840">${esc(tx('explore'))}</h2><span class="ap121-kicker" style="color:#9b6a32">${esc(tx('align'))}</span></div><div class="ap121-card-grid"><article class="ap121-feature" onclick="v121Go('natal')"><div class="pic ap-v137-media-clean" style="background-image:url(${IMG.natal})"></div><div class="copy"><h3>${esc(tx('natal'))}</h3><p>${esc(tx('natalDesc'))}</p></div><span class="ap121-arrow">→</span></article><article class="ap121-feature" onclick="v121Go('future')"><div class="pic ap-v137-media-clean" style="background-image:url(${IMG.future})"></div><div class="copy"><h3>${esc(tx('future'))}</h3><p>${esc(tx('futureDesc'))}</p></div><span class="ap121-arrow">→</span></article><article class="ap121-feature" onclick="v121Go('relations')"><div class="pic ap-v137-media-clean" style="background-image:url(${IMG.relations})"></div><div class="copy"><h3>${esc(tx('relations'))}</h3><p>${esc(tx('relationsDesc'))}</p></div><span class="ap121-arrow">→</span></article></div><div class="ap121-banner" style="background-image:url(${IMG.futureBanner});margin-top:18px"><div class="ap121-banner-copy"><h3>${esc(tx('banner'))}</h3><p>${esc(tx('bannerSub'))}</p></div></div></div>`;
 const nav=document.getElementById('ap121-nav');if(nav){const labels={home:tx('home'),natal:tx('natal'),future:tx('future'),relations:tx('relations'),profile:tx('profile')};nav.querySelectorAll('button[data-k]').forEach(b=>{const span=b.querySelector('span'),ico=span?span.outerHTML:'';b.innerHTML=ico+esc(labels[b.dataset.k]||b.dataset.k)})}
}

function removeOverlayCopy(){
 document.querySelectorAll('.ap121-feature .pic,.ap121-today-img').forEach(el=>{el.classList.add('ap-v137-media-clean');el.querySelectorAll('h1,h2,h3,h4,p,span,.copy,.text').forEach(x=>x.remove())});
}

function run(){ensureStyle();removeQuestion();patchIdealTiming();cleanInternalCopy();removeOverlayCopy();renderHomeTranslated()}
selectedButtons();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let t;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(run,120)}).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('storage',()=>setTimeout(run,20));
})();
