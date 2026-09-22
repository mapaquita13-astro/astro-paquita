/* Astro Paquita — V143 synchronisation interface publique.
   Affichage uniquement : aucune donnée ni aucun calcul astrologique n'est modifié. */
(function(){
'use strict';

const LANGS=['fr','en','es','ar'];
const COPY={
  'Éclairez votre chemin':{fr:'Éclairez votre chemin',en:'Light your path',es:'Ilumina tu camino',ar:'أنر طريقك'},
  "Plus qu'une astrologie, un voyage vers vous-même":{fr:"Plus qu'une astrologie, un voyage vers vous-même",en:'More than astrology, a journey toward yourself',es:'Más que astrología, un viaje hacia ti',ar:'أكثر من علم التنجيم، رحلة نحو ذاتك'},
  "Votre ciel, aujourd'hui":{fr:"Votre ciel, aujourd'hui",en:'Your sky, today',es:'Tu cielo, hoy',ar:'سماؤك، اليوم'},
  'Des clés lumineuses pour mieux vous comprendre et avancer en confiance':{fr:'Des clés lumineuses pour mieux vous comprendre et avancer en confiance',en:'Clear insights to understand yourself better and move forward with confidence',es:'Claves claras para comprenderte mejor y avanzar con confianza',ar:'إشارات واضحة لفهم نفسك والتقدم بثقة'},
  'Découvrir mon ciel du jour →':{fr:'Découvrir mon ciel du jour →',en:'Discover my sky today →',es:'Descubrir mi cielo de hoy →',ar:'اكتشف سمائي اليوم ←'},
  "Aujourd'hui":{fr:"Aujourd'hui",en:'Today',es:'Hoy',ar:'اليوم'},
  'Votre climat du moment':{fr:'Votre climat du moment',en:'Your current climate',es:'Tu clima actual',ar:'مناخك الحالي'},
  'Lecture personnalisée':{fr:'Lecture personnalisée',en:'Personal reading',es:'Lectura personalizada',ar:'قراءة شخصية'},
  "Retrouvez la prévision réellement calculée pour votre profil, avec les domaines qui ressortent aujourd'hui et les périodes qui méritent votre attention.":{fr:"Retrouvez la prévision réellement calculée pour votre profil, avec les domaines qui ressortent aujourd'hui et les périodes qui méritent votre attention.",en:'See the forecast calculated for your profile, with the areas highlighted today and the periods that deserve your attention.',es:'Consulta la previsión calculada para tu perfil, las áreas que destacan hoy y los períodos que merecen tu atención.',ar:'اطّلع على التوقع المحسوب لملفك والمجالات البارزة اليوم والفترات التي تستحق انتباهك.'},
  'Lire la prévision complète →':{fr:'Lire la prévision complète →',en:'Read the full forecast →',es:'Leer la previsión completa →',ar:'اقرأ التوقع الكامل ←'},
  'Prochain temps fort':{fr:'Prochain temps fort',en:'Next key period',es:'Próximo período clave',ar:'الفترة المهمة القادمة'},
  'Voir les détails →':{fr:'Voir les détails →',en:'View details →',es:'Ver detalles →',ar:'عرض التفاصيل ←'},
  'Explorez votre univers':{fr:'Explorez votre univers',en:'Explore your universe',es:'Explora tu universo',ar:'اكتشف عالمك'},
  'Une vie plus alignée':{fr:'Une vie plus alignée',en:'A more aligned life',es:'Una vida más alineada',ar:'حياة أكثر انسجامًا'},
  'Portrait natal':{fr:'Portrait natal',en:'Natal portrait',es:'Retrato natal',ar:'الخريطة الشخصية'},
  'Découvrez vos forces, vos contradictions et ce qui vous rend profondément unique.':{fr:'Découvrez vos forces, vos contradictions et ce qui vous rend profondément unique.',en:'Discover your strengths, contradictions and what makes you unique.',es:'Descubre tus fortalezas, contradicciones y lo que te hace único.',ar:'اكتشف نقاط قوتك وتناقضاتك وما يجعلك مميزًا.'},
  'Mon avenir':{fr:'Mon avenir',en:'My future',es:'Mi futuro',ar:'مستقبلي'},
  'Visualisez vos tendances, les périodes qui comptent et le bon moment pour agir.':{fr:'Visualisez vos tendances, les périodes qui comptent et le bon moment pour agir.',en:'See your trends, key periods and the best moments to act.',es:'Visualiza tus tendencias, los períodos importantes y el mejor momento para actuar.',ar:'شاهد اتجاهاتك والفترات المهمة وأفضل الأوقات للتحرك.'},
  'Relations':{fr:'Relations',en:'Relationships',es:'Relaciones',ar:'العلاقات'},
  "Comprenez vos liens, votre manière d'aimer et la dynamique entre deux thèmes.":{fr:"Comprenez vos liens, votre manière d'aimer et la dynamique entre deux thèmes.",en:'Understand your bonds, your way of loving and the dynamics between two charts.',es:'Comprende tus vínculos, tu forma de amar y la dinámica entre dos cartas.',ar:'افهم روابطك وطريقتك في الحب وديناميكية خريطتين.'},
  'Prévisions':{fr:'Prévisions',en:'Forecasts',es:'Previsiones',ar:'التوقعات'},
  'Le bon moment':{fr:'Le bon moment',en:'Ideal timing',es:'Momento ideal',ar:'التوقيت الأنسب'},
  'Les 24 mois qui comptent':{fr:'Les 24 mois qui comptent',en:'The 24 key months',es:'Los 24 meses clave',ar:'أهم 24 شهرًا'},
  'Portrait enfant':{fr:'Portrait enfant',en:'Child portrait',es:'Retrato infantil',ar:'صورة الطفل'},
  'Des étoiles pour avancer, un espace pour être vous.':{fr:'Des étoiles pour avancer, un espace pour être vous.',en:'Stars to move forward, space to be yourself.',es:'Estrellas para avanzar, un espacio para ser tú.',ar:'نجوم تساعدك على التقدم ومساحة لتكون نفسك.'},
  'Mieux se connaître, pour mieux rayonner.':{fr:'Mieux se connaître, pour mieux rayonner.',en:'Know yourself better, shine more freely.',es:'Conocerte mejor para brillar más.',ar:'اعرف نفسك أكثر لتتألق أكثر.'},
  'Accueil':{fr:'Accueil',en:'Home',es:'Inicio',ar:'الرئيسية'},
  'Profil':{fr:'Profil',en:'Profile',es:'Perfil',ar:'الملف'}
};

function norm(v){return String(v||'').replace(/\s+/g,' ').trim()}
function lang(){
  const select=document.querySelector('#ap100-lang');
  const candidates=[select&&select.value,localStorage.getItem('astro-lang'),document.documentElement.getAttribute('lang'),window.AP_LANG];
  for(const raw of candidates){const l=String(raw||'').toLowerCase().slice(0,2);if(LANGS.includes(l))return l}
  return 'fr';
}

const reverse=new Map();
Object.entries(COPY).forEach(([key,row])=>Object.values(row).forEach(v=>reverse.set(norm(v),key)));

function translateHost(host,l){
  if(!host)return;
  const walker=document.createTreeWalker(host,NodeFilter.SHOW_TEXT);const nodes=[];let n;
  while((n=walker.nextNode()))nodes.push(n);
  nodes.forEach(node=>{
    const parent=node.parentElement;if(!parent||parent.closest('script,style,noscript,textarea,pre,code'))return;
    const raw=node.nodeValue||'',clean=norm(raw);if(!clean)return;
    let key=reverse.get(clean),prefix='';
    if(!key){
      for(const [candidate,row] of Object.entries(COPY)){
        for(const value of Object.values(row)){
          const v=norm(value);
          if(clean.startsWith(v+', ')||clean.startsWith(v+' ')){key=candidate;prefix=v;break}
        }
        if(key)break;
      }
    }
    if(!key)return;
    const target=COPY[key]&&COPY[key][l];if(!target)return;
    if(prefix){node.nodeValue=raw.replace(prefix,target)}else if(clean!==target){node.nodeValue=raw.replace(clean,target)}
  });
}

function syncLanguage(){
  const l=lang();
  document.documentElement.setAttribute('lang',l);
  document.documentElement.dir=l==='ar'?'rtl':'ltr';
  window.AP_LANG=l;
  translateHost(document.querySelector('#ap121-home'),l);
  translateHost(document.querySelector('#ap121-nav'),l);
}

function installStyle(){
  if(document.getElementById('ap-v143-ui-style'))return;
  const s=document.createElement('style');s.id='ap-v143-ui-style';s.textContent=`
    .ap-v143-selected,
    button.ap-v143-selected,
    [role="button"].ap-v143-selected{
      background:#42183d!important;color:#fffaf2!important;border-color:#42183d!important;
      box-shadow:0 6px 16px rgba(66,24,61,.20)!important;
    }
    .ap-v143-selected .f-label{color:#fffaf2!important}
  `;(document.head||document.documentElement).appendChild(s);
}

const PERIOD_SELECTOR='.per-btn,.f-btn,.dom-btn,.genre-btn,.mod-onglet,.ap-v130-year-btn,.ap-v130-domain-btn';
function selectedByState(el){return el.classList.contains('actif')||el.classList.contains('active')||el.classList.contains('selected')||el.getAttribute('aria-selected')==='true'||el.getAttribute('aria-pressed')==='true'}
function syncSelection(){
  document.querySelectorAll(PERIOD_SELECTOR).forEach(el=>{
    if(selectedByState(el))el.classList.add('ap-v143-selected');
    else if(!el.matches(':focus'))el.classList.remove('ap-v143-selected');
  });
}
function selectClicked(btn){
  const group=btn.closest('.per-btns,.f-intentions,.dom-btns,.genre-btns,.mod-onglets,.mod-tabs,.ap-v130-year-tabs,.ap-v130-domain-tabs')||btn.parentElement;
  if(group)group.querySelectorAll(PERIOD_SELECTOR).forEach(x=>{x.classList.remove('ap-v143-selected');if(x!==btn&&x.getAttribute('aria-selected')==='true')x.setAttribute('aria-selected','false')});
  btn.classList.add('ap-v143-selected');btn.setAttribute('aria-selected','true');
}

function cleanTechnicalCopy(){
  const root=document.body;if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];let n;while((n=walker.nextNode()))nodes.push(n);
  nodes.forEach(node=>{
    const p=node.parentElement;if(!p||p.closest('script,style,noscript,textarea,pre,code'))return;
    const old=node.nodeValue||'';let v=old
      .replace(/\b(?:moteur|thème|theme|lecture|lectures|transits?)\s+V\s*121\b/gi,'')
      .replace(/\bV\s*121\b/gi,'')
      .replace(/[ \t]{2,}/g,' ')
      .replace(/\s+([,.;:!?])/g,'$1');
    if(v!==old)node.nodeValue=v;
  });
}

function run(){installStyle();syncLanguage();syncSelection();cleanTechnicalCopy()}

document.addEventListener('click',e=>{
  const btn=e.target.closest&&e.target.closest(PERIOD_SELECTOR);if(btn)selectClicked(btn);
  const langControl=e.target.closest&&e.target.closest('#ap100-lang,.ap-v130-lang-pop button,[data-lang],[data-language]');
  if(langControl){setTimeout(syncLanguage,0);setTimeout(syncLanguage,80);setTimeout(syncLanguage,250)}
},true);
document.addEventListener('change',e=>{if(e.target&&e.target.matches('#ap100-lang,select[name*="lang" i]')){setTimeout(syncLanguage,0);setTimeout(syncLanguage,120)}},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(run,80)}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
let last='';setInterval(()=>{const l=lang();if(l!==last){last=l;run()}else syncSelection()},700);
})();
