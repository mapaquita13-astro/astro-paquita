/* Astro Paquita — V137 présentation client.
   Couche d'affichage uniquement : aucun calcul astrologique n'est remplacé. */
(function(){
'use strict';

const LANGS=['fr','en','es','ar'];
function lang(){const l=String(window.AP_LANG||localStorage.getItem('astro-lang')||'fr').toLowerCase().slice(0,2);return LANGS.includes(l)?l:'fr'}
function norm(v){return String(v||'').replace(/\s+/g,' ').trim()}

const HOME_TRANSLATIONS={
 en:{
  'Éclairez votre chemin':'Light your path','Plus qu\'une astrologie, un voyage vers vous-même':'More than astrology, a journey toward yourself',
  "Votre ciel, aujourd'hui":'Your sky, today','Des clés lumineuses pour mieux vous comprendre et avancer en confiance':'Clear insights to understand yourself better and move forward with confidence',
  'Découvrir mon ciel du jour →':'Discover my sky today →',"Aujourd'hui":'Today','Votre climat du moment':'Your current climate','Lecture personnalisée':'Personal reading',
  "Retrouvez la prévision réellement calculée pour votre profil, avec les domaines qui ressortent aujourd'hui et les périodes qui méritent votre attention.":'See the forecast calculated for your profile, with the areas highlighted today and the periods that deserve your attention.',
  'Lire la prévision complète →':'Read the full forecast →','Prochain temps fort':'Next key period','Voir les détails →':'View details →','Explorez votre univers':'Explore your universe','Une vie plus alignée':'A more aligned life',
  'Portrait natal':'Natal portrait','Découvrez vos forces, vos contradictions et ce qui vous rend profondément unique.':'Discover your strengths, contradictions and what makes you unique.',
  'Mon avenir':'My future','Visualisez vos tendances, les périodes qui comptent et le bon moment pour agir.':'See your trends, key periods and the best moments to act.',
  'Relations':'Relationships',"Comprenez vos liens, votre manière d'aimer et la dynamique entre deux thèmes.":'Understand your bonds, your way of loving and the dynamics between two charts.',
  'Des étoiles pour avancer, un espace pour être vous.':'Stars to move forward, space to be yourself.','Mieux se connaître, pour mieux rayonner.':'Know yourself better, shine more freely.',
  'Accueil':'Home','Profil':'Profile'
 },
 es:{
  'Éclairez votre chemin':'Ilumina tu camino','Plus qu\'une astrologie, un voyage vers vous-même':'Más que astrología, un viaje hacia ti',
  "Votre ciel, aujourd'hui":'Tu cielo, hoy','Des clés lumineuses pour mieux vous comprendre et avancer en confiance':'Claves claras para comprenderte mejor y avanzar con confianza',
  'Découvrir mon ciel du jour →':'Descubrir mi cielo de hoy →',"Aujourd'hui":'Hoy','Votre climat du moment':'Tu clima actual','Lecture personnalisée':'Lectura personalizada',
  "Retrouvez la prévision réellement calculée pour votre profil, avec les domaines qui ressortent aujourd'hui et les périodes qui méritent votre attention.":'Consulta la previsión calculada para tu perfil, las áreas que destacan hoy y los períodos que merecen tu atención.',
  'Lire la prévision complète →':'Leer la previsión completa →','Prochain temps fort':'Próximo período clave','Voir les détails →':'Ver detalles →','Explorez votre univers':'Explora tu universo','Une vie plus alignée':'Una vida más alineada',
  'Portrait natal':'Retrato natal','Découvrez vos forces, vos contradictions et ce qui vous rend profondément unique.':'Descubre tus fortalezas, contradicciones y lo que te hace único.',
  'Mon avenir':'Mi futuro','Visualisez vos tendances, les périodes qui comptent et le bon moment pour agir.':'Visualiza tus tendencias, los períodos importantes y el mejor momento para actuar.',
  'Relations':'Relaciones',"Comprenez vos liens, votre manière d'aimer et la dynamique entre deux thèmes.":'Comprende tus vínculos, tu forma de amar y la dinámica entre dos cartas.',
  'Des étoiles pour avancer, un espace pour être vous.':'Estrellas para avanzar, un espacio para ser tú.','Mieux se connaître, pour mieux rayonner.':'Conocerte mejor para brillar más.',
  'Accueil':'Inicio','Profil':'Perfil'
 },
 ar:{
  'Éclairez votre chemin':'أنر طريقك','Plus qu\'une astrologie, un voyage vers vous-même':'أكثر من علم التنجيم، رحلة نحو ذاتك',
  "Votre ciel, aujourd'hui":'سماؤك، اليوم','Des clés lumineuses pour mieux vous comprendre et avancer en confiance':'إشارات واضحة لفهم نفسك والتقدم بثقة',
  'Découvrir mon ciel du jour →':'اكتشف سمائي اليوم ←',"Aujourd'hui":'اليوم','Votre climat du moment':'مناخك الحالي','Lecture personnalisée':'قراءة شخصية',
  "Retrouvez la prévision réellement calculée pour votre profil, avec les domaines qui ressortent aujourd'hui et les périodes qui méritent votre attention.":'اطّلع على التوقع المحسوب لملفك والمجالات البارزة اليوم والفترات التي تستحق انتباهك.',
  'Lire la prévision complète →':'اقرأ التوقع الكامل ←','Prochain temps fort':'الفترة المهمة القادمة','Voir les détails →':'عرض التفاصيل ←','Explorez votre univers':'اكتشف عالمك','Une vie plus alignée':'حياة أكثر انسجامًا',
  'Portrait natal':'الخريطة الشخصية','Découvrez vos forces, vos contradictions et ce qui vous rend profondément unique.':'اكتشف نقاط قوتك وتناقضاتك وما يجعلك مميزًا.',
  'Mon avenir':'مستقبلي','Visualisez vos tendances, les périodes qui comptent et le bon moment pour agir.':'شاهد اتجاهاتك والفترات المهمة وأفضل الأوقات للتحرك.',
  'Relations':'العلاقات',"Comprenez vos liens, votre manière d'aimer et la dynamique entre deux thèmes.":'افهم روابطك وطريقتك في الحب وديناميكية خريطتين.',
  'Des étoiles pour avancer, un espace pour être vous.':'نجوم تساعدك على التقدم ومساحة لتكون نفسك.','Mieux se connaître, pour mieux rayonner.':'اعرف نفسك أكثر لتتألق أكثر.',
  'Accueil':'الرئيسية','Profil':'الملف'
 }
};

function addStyle(){
 if(document.getElementById('ap-v137-style'))return;
 const s=document.createElement('style');s.id='ap-v137-style';s.textContent=`
 #mod-question,#ap-v130-question-card,[data-feature="question"],[data-module="question"],[onclick*="question" i]{display:none!important}
 .ap-v137-split{display:grid!important;grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr)!important;gap:0!important;min-height:0!important;padding:0!important;background:#fffaf2!important;border-radius:26px!important;overflow:hidden!important;border:1px solid rgba(91,40,83,.12)!important;box-shadow:0 18px 48px rgba(69,30,59,.10)!important;position:relative!important}
 .ap-v137-split:before{content:'';display:block!important;grid-column:1!important;grid-row:1!important;min-height:330px!important;background-image:var(--ap-v137-image)!important;background-size:cover!important;background-position:center center!important;background-repeat:no-repeat!important}
 .ap-v137-split>.ap121-hero-copy,.ap-v137-split>.ap121-banner-copy{grid-column:2!important;grid-row:1!important;align-self:stretch!important;display:flex!important;flex-direction:column!important;justify-content:center!important;max-width:none!important;width:auto!important;margin:0!important;padding:34px 36px!important;background:#fffaf2!important;border:0!important;border-radius:0!important;box-shadow:none!important;color:#35102f!important;text-shadow:none!important;position:relative!important;z-index:2!important}
 .ap-v137-split>.ap121-hero-copy h1,.ap-v137-split>.ap121-hero-copy h2,.ap-v137-split>.ap121-hero-copy h3,.ap-v137-split>.ap121-banner-copy h1,.ap-v137-split>.ap121-banner-copy h2,.ap-v137-split>.ap121-banner-copy h3{color:#35102f!important;text-shadow:none!important}
 .ap-v137-split>.ap121-hero-copy p,.ap-v137-split>.ap121-banner-copy p{color:#6d5968!important;text-shadow:none!important}
 .ap-v137-split>.ap121-brand{position:absolute!important;z-index:4!important;left:0!important;right:0!important;top:0!important;padding:14px 18px!important;background:linear-gradient(180deg,rgba(255,250,242,.96),rgba(255,250,242,.78),transparent)!important;color:#35102f!important}
 .ap121-feature{overflow:hidden!important;background:#fffaf2!important;border-radius:20px!important}
 .ap121-feature .pic,.ap121-today-img{background-size:contain!important;background-position:center center!important;background-repeat:no-repeat!important;background-color:#2d1930!important;transform:none!important;min-height:210px!important}
 .ap121-feature .copy{background:#fffaf2!important;color:#35102f!important;padding:18px 20px!important;position:relative!important;z-index:2!important}
 .ap121-feature .copy h3,.ap121-feature .copy p{position:static!important;text-shadow:none!important}
 .ap-v128-clean-art:after,.ap-v128-card-art-clean:after{display:none!important}
 .ap-v128-clean-art>img,.ap-v128-card-art-clean img{transform:none!important;object-position:center center!important;object-fit:contain!important}
 .per-btn.actif,.f-btn.actif,.dom-btn.actif,.genre-btn.actif,.mod-onglet.actif,.mod-onglet.active,.ap-v137-selected,[aria-selected="true"]{background:#42183d!important;color:#fffaf2!important;border-color:#42183d!important;box-shadow:0 6px 16px rgba(66,24,61,.20)!important}
 .f-btn.actif .f-label{color:#fffaf2!important}
 @media(max-width:760px){.ap-v137-split{grid-template-columns:1fr!important}.ap-v137-split:before{grid-column:1!important;grid-row:1!important;min-height:235px!important}.ap-v137-split>.ap121-hero-copy,.ap-v137-split>.ap121-banner-copy{grid-column:1!important;grid-row:2!important;padding:22px 20px!important}.ap121-feature .pic,.ap121-today-img{min-height:185px!important}}
 `;document.head.appendChild(s)
}

function hideQuestion(){
 document.body?.classList.remove('ap-v130-question-open');
 document.querySelectorAll('#mod-question,#ap-v130-question-card,[data-feature="question"],[data-module="question"],[onclick*="question" i]').forEach(el=>{el.style.setProperty('display','none','important');el.setAttribute('aria-hidden','true')});
 document.querySelectorAll('a,button,.ap121-feature,.ap100-feature-card,.service-card,.feature-card').forEach(el=>{const t=norm(el.textContent).toLowerCase();if(['ma question','my question','mi pregunta','سؤالي'].includes(t)){el.style.setProperty('display','none','important');el.setAttribute('aria-hidden','true')}})
}

const COPY_REPLACEMENTS=[
 [/\bV\s*121\b/gi,''],[/\bV121\b/gi,''],[/lectures\s+V121/gi,'indicateurs'],[/transits\s+V121/gi,'transits astrologiques'],
 [/La courbe utilise les activations réelles de chaque mois, y compris les tendances faibles, sans les transformer en événements\.?/gi,'La courbe présente les tendances astrologiques de chaque mois, y compris les plus discrètes.'],
 [/La courbe utilise les activations V121 réelles de chaque mois, y compris les tendances faibles, sans les transformer en événements\.?/gi,'La courbe présente les tendances astrologiques de chaque mois, y compris les plus discrètes.'],
 [/Le résultat ne se limite plus à un score\s*:\s*/gi,''],[/Le résultat ne se limite pas à un score\s*:\s*/gi,''],
 [/communication, attachement, attraction, soutien, tensions et complémentarités sont reliés dans une lecture structurée\.?/gi,'Explorez la communication, l’attachement, l’attraction, le soutien, les tensions et les complémentarités de votre relation.'],
 [/Une synthèse qui croise vos dominantes, planètes, maisons et aspects au lieu d['’]aligner des définitions génériques\.?/gi,'Une synthèse de vos dominantes, planètes, maisons et aspects.'],
 [/Les mois calmes restent volontairement discrets\s*:\s*seuls les mouvements significatifs ressortent\.?/gi,'Visualisez les mouvements les plus marquants de votre année, mois par mois.'],
 [/Les périodes vraiment marquantes, sans transformer deux ans en [«"]grands tournants de toute une vie[»"]\.?/gi,'Repérez les périodes marquantes des 24 prochains mois.'],
 [/Le graphique vous donne la vue d['’]ensemble\s*;\s*les modules ci-dessous expliquent ce qui se joue réellement\.?/gi,'Explorez ensuite chaque période plus en détail.'],
 [/Ce repère vient directement du même moteur que vos prévisions et vos grands événements\.?/gi,'Un repère à explorer dans vos prévisions.'],
 [/Aucune date ne réunit assez de preuves astrologiques propres à cette intention\.?/gi,'Aucune période suffisamment nette ne ressort pour cette intention.'],
 [/Les bons scores d['’]autres domaines sont volontairement ignorés\.?/gi,''],[/Le moteur ne remplace pas ce manque de signal par un événement d['’]un autre domaine\.?/gi,''],
 [/No sufficiently clear trend is available for this area over this period\.?/gi,'No sufficiently clear trend is available for this area over this period.']
];
function cleanCopy(){
 const root=document.body;if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];let n;while((n=walker.nextNode()))nodes.push(n);
 nodes.forEach(node=>{const p=node.parentElement;if(!p||p.closest('script,style,noscript,textarea,pre,code'))return;let v=node.nodeValue||'',nv=v;COPY_REPLACEMENTS.forEach(([re,to])=>nv=nv.replace(re,to));nv=nv.replace(/\s{2,}/g,' ');if(nv!==v)node.nodeValue=nv})
}

const HOME_IMAGES=[
 {re:/portrait natal|natal portrait|retrato natal|الخريطة الشخصية/i,url:'assets/img/natal.jpg'},
 {re:/mon avenir|my future|mi futuro|مستقبلي/i,url:'assets/img/future.jpg'},
 {re:/relations|synastr|relationships|relaciones|العلاقات/i,url:'assets/img/relations.jpg'},
 {re:/portrait enfant|child portrait|retrato infantil|صورة الطفل/i,url:'assets/img/profile.jpg'},
 {re:/prévisions|previsions|forecast|previsiones|التوقعات/i,url:'assets/img/forecast.jpg'},
 {re:/bon moment|ideal timing|momento ideal|التوقيت الأنسب/i,url:'assets/img/jupiter.jpg'},
 {re:/24 mois|24 months|24 meses|24 شهر/i,url:'assets/img/story2.jpg'}
];
function fixCardImages(){
 document.querySelectorAll('#ap121-home .ap121-feature,.ap100-feature-card,.service-card,.feature-card').forEach(card=>{const t=norm(card.textContent),hit=HOME_IMAGES.find(x=>x.re.test(t));if(!hit)return;const pic=card.querySelector('.pic,[class*="art"],[style*="background-image"]');if(pic){pic.style.setProperty('background-image',`url('${hit.url}')`,'important');pic.style.setProperty('background-size','contain','important');pic.style.setProperty('background-position','center center','important');pic.style.setProperty('background-repeat','no-repeat','important')}const img=card.querySelector('img');if(img){img.src=hit.url;img.style.setProperty('object-fit','contain','important');img.style.setProperty('object-position','center center','important');img.style.setProperty('transform','none','important')}})
}

function splitVisualBlocks(){
 document.querySelectorAll('.ap121-hero,.ap121-banner,#ap121-module-banner').forEach(el=>{if(el.classList.contains('ap-v137-split'))return;let bg=el.style.backgroundImage||getComputedStyle(el).backgroundImage||'';if(!bg||bg==='none'||!bg.includes('url('))return;el.style.setProperty('--ap-v137-image',bg);el.style.setProperty('background-image','none','important');el.classList.add('ap-v137-split')})
}

function translateHome(){
 const l=lang();document.documentElement.dir=l==='ar'?'rtl':'ltr';if(l==='fr')return;const dict=HOME_TRANSLATIONS[l];if(!dict)return;
 const root=document.querySelector('#ap121-home');const nav=document.querySelector('#ap121-nav');[root,nav].filter(Boolean).forEach(host=>{const walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);const nodes=[];let n;while((n=walker.nextNode()))nodes.push(n);nodes.forEach(node=>{let text=norm(node.nodeValue);if(!text)return;for(const [fr,tr] of Object.entries(dict)){if(text===fr){node.nodeValue=node.nodeValue.replace(fr,tr);return}if(text.startsWith(fr+', ')){node.nodeValue=node.nodeValue.replace(fr,tr);return}if(text.startsWith(fr+' ')){node.nodeValue=node.nodeValue.replace(fr,tr);return}}})})
}

function keepSelected(){
 document.querySelectorAll('.per-btn.actif,.f-btn.actif,.dom-btn.actif,.genre-btn.actif,.mod-onglet.actif,.mod-onglet.active,[aria-selected="true"]').forEach(el=>el.classList.add('ap-v137-selected'));
}
function bindSelection(){
 if(window.__apV137SelectionBound)return;window.__apV137SelectionBound=true;
 document.addEventListener('click',e=>{const b=e.target.closest('.per-btn,.f-btn,.dom-btn,.genre-btn,.mod-onglet');if(!b)return;setTimeout(()=>{const group=b.closest('.per-btns,.f-intentions,.dom-btns,.genre-btns,.mod-onglets,.mod-tabs')||b.parentElement;if(group)group.querySelectorAll('.ap-v137-selected').forEach(x=>x.classList.remove('ap-v137-selected'));b.classList.add('ap-v137-selected');b.setAttribute('aria-selected','true')},0)},false)
}

function hookLanguage(){
 if(window.__apV137LangHook)return;window.__apV137LangHook=true;
 const wrap=name=>{const base=window[name];if(typeof base!=='function'||base.__apV137)return;const fn=function(){const r=base.apply(this,arguments);setTimeout(run,35);setTimeout(run,180);return r};fn.__apV137=true;window[name]=fn};wrap('v100SetLang');wrap('apSetLang')
}

function run(){addStyle();hideQuestion();cleanCopy();fixCardImages();splitVisualBlocks();translateHome();keepSelected();hookLanguage()}
bindSelection();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(run,90)}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(run,300);setTimeout(run,1200);
})();
