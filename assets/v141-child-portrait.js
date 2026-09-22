/* Astro Paquita — V145 Portrait enfant réel et multilingue.
   Adaptation éditoriale uniquement : les positions, maisons, aspects et dominantes restent ceux du moteur V121. */
(function(){
'use strict';

const MODE_CLASS='ap-v141-child-mode';
const LANGS=['fr','en','es','ar'];
let childMode=false;
let childLaunchPending=false;

const UI={
  fr:{
    kicker:'PORTRAIT ENFANT',subtitle:'Une lecture de son thème adaptée à son âge',title:'Portrait enfant',generate:'Générer le portrait enfant',reading:'Lecture enfant',
    note:(name)=>`Une interprétation du thème adaptée à l’âge de ${name}, sans modifier ses données astrologiques de naissance.`,
    banner:(name,age)=>`Le thème natal de ${name}, interprété avec des repères adaptés à ${age==null?'son âge':age+' ans'}.`,
    result:(name)=>`Portrait enfant de ${name}`,regen:'↻ Régénérer le portrait enfant',download:'↓ Télécharger le portrait enfant en PDF',pdf:'Portrait enfant',promptLanguage:'français'
  },
  en:{
    kicker:'CHILD PORTRAIT',subtitle:'A reading of the birth chart adapted to their age',title:'Child portrait',generate:'Generate the child portrait',reading:'Child reading',
    note:(name)=>`An interpretation of the birth chart adapted to ${name}’s age, without changing the original astrological birth data.`,
    banner:(name,age)=>`${name}’s birth chart, interpreted with guidance adapted to ${age==null?'their age':age+' years old'}.`,
    result:(name)=>`Child portrait of ${name}`,regen:'↻ Regenerate the child portrait',download:'↓ Download the child portrait as PDF',pdf:'Child portrait',promptLanguage:'anglais'
  },
  es:{
    kicker:'RETRATO INFANTIL',subtitle:'Una lectura de la carta natal adaptada a su edad',title:'Retrato infantil',generate:'Generar el retrato infantil',reading:'Lectura infantil',
    note:(name)=>`Una interpretación de la carta natal adaptada a la edad de ${name}, sin modificar sus datos astrológicos de nacimiento.`,
    banner:(name,age)=>`La carta natal de ${name}, interpretada con referencias adaptadas a ${age==null?'su edad':age+' años'}.`,
    result:(name)=>`Retrato infantil de ${name}`,regen:'↻ Regenerar el retrato infantil',download:'↓ Descargar el retrato infantil en PDF',pdf:'Retrato infantil',promptLanguage:'espagnol'
  },
  ar:{
    kicker:'صورة الطفل',subtitle:'قراءة للخريطة الميلادية ملائمة لعمر الطفل',title:'صورة الطفل',generate:'إنشاء صورة الطفل',reading:'قراءة الطفل',
    note:(name)=>`تفسير للخريطة الميلادية ملائم لعمر ${name}، من دون تغيير بيانات الميلاد الفلكية الأصلية.`,
    banner:(name,age)=>`الخريطة الميلادية لـ ${name}، بتفسير ملائم ${age==null?'لعمره':'لعمر '+age+' سنة'}.`,
    result:(name)=>`صورة الطفل ${name}`,regen:'↻ إعادة إنشاء صورة الطفل',download:'↓ تنزيل صورة الطفل بصيغة PDF',pdf:'صورة الطفل',promptLanguage:'arabe'
  }
};

function uiLang(){
  const sel=document.getElementById('ap100-lang');
  const candidates=[sel&&sel.value,localStorage.getItem('astro-lang'),document.documentElement.getAttribute('lang'),window.AP_LANG];
  for(const raw of candidates){const l=String(raw||'').toLowerCase().slice(0,2);if(LANGS.includes(l))return l}
  return 'fr';
}
function tr(){return UI[uiLang()]||UI.fr}
function ageLabel(a){if(a==null)return '';const l=uiLang();if(l==='en')return `${a} years old`;if(l==='es')return `${a} años`;if(l==='ar')return `${a} سنة`;return `${a} ans`}

function parseBirthDate(){
  try{
    const u=window.USER||{};
    const raw=String(u.dateISO||u.dateRaw||u.date||'').trim();
    let iso=raw;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(iso)){
      const fr=raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if(fr)iso=`${fr[3]}-${fr[2].padStart(2,'0')}-${fr[1].padStart(2,'0')}`;
      else if(/^\d{4}-\d{2}-\d{2}/.test(raw))iso=raw.slice(0,10);
      else return null;
    }
    const d=new Date(iso+'T12:00:00');
    return Number.isNaN(d.getTime())?null:d;
  }catch(e){return null}
}
function ageNow(){
  const d=parseBirthDate();if(!d)return null;
  const n=new Date();let a=n.getFullYear()-d.getFullYear();
  const md=n.getMonth()-d.getMonth();if(md<0||(md===0&&n.getDate()<d.getDate()))a--;
  return a>=0?a:null;
}
function isMinorProfile(){const a=ageNow();return a!==null&&a<18}
function firstName(){const u=window.USER||{};return String(u.prenom||'').trim()||({fr:'cet enfant',en:'this child',es:'este niño',ar:'هذا الطفل'}[uiLang()]||'cet enfant')}
function ageBand(a){if(a==null)return 'mineur';if(a<=5)return 'petite-enfance';if(a<=9)return 'enfance';if(a<=12)return 'preadolescence';if(a<=15)return 'adolescence-1';return 'adolescence-2'}

function enterChildMode(){
  childMode=true;childLaunchPending=true;
  document.body&&document.body.classList.add(MODE_CLASS);
  setTimeout(refreshUi,80);setTimeout(refreshUi,260);setTimeout(refreshUi,700);
}
function exitChildMode(){
  childMode=false;childLaunchPending=false;
  document.body&&document.body.classList.remove(MODE_CLASS);
  document.getElementById('ap-v141-child-note')?.remove();
}
function activeChild(){return childMode&&isMinorProfile()}

function childInstructions(){
  const a=ageNow(),name=firstName(),t=tr();
  return `\n\n=== MODE PORTRAIT ENFANT — CONSIGNES PRIORITAIRES ===\nLe profil interprété est celui de ${name}, âgé actuellement de ${a==null?'moins de 18 ans':a+' ans'}. Ces consignes priment sur toute formulation adulte située plus haut, sans modifier aucune donnée astrologique calculée.\n\nLANGUE DE SORTIE OBLIGATOIRE : rédige intégralement ce portrait en ${t.promptLanguage}. Traduis naturellement tous les intitulés de sections dans cette langue et ne laisse aucun titre français si la langue choisie n’est pas le français.\n\nOBJECTIF : produire un véritable PORTRAIT ENFANT destiné à l'adulte qui accompagne l'enfant. Parle de ${name} à la troisième personne et explique comment ses tendances peuvent se manifester à son âge. Le texte doit aider à comprendre son tempérament, sa sécurité émotionnelle, sa manière d'apprendre, de communiquer, de créer du lien, d'affirmer ses limites, de développer son autonomie et ses ressources.\n\nINTERDICTIONS : ne projette pas ${name} dans une vie amoureuse, sexuelle, conjugale, professionnelle, financière ou parentale d'adulte ; ne prédis pas son futur métier, son couple, ses revenus ni un destin adulte. N'utilise aucun diagnostic médical ou psychologique, aucune étiquette figée et aucun déterminisme.\n\nADAPTATION DES SYMBOLES :\n- Vénus = façon de donner/recevoir de l'affection, goûts, sociabilité, besoin d'harmonie et premiers liens ; jamais sexualité ou vie de couple.\n- Mars = énergie, affirmation, frustration, courage, limites et manière de défendre sa place.\n- Jupiter = confiance, curiosité, ouverture, apprentissages et enthousiasme.\n- Saturne = cadre, patience, apprentissage de l'effort, rapport aux règles et sentiment de sécurité dans la structure.\n- Maisons 5/7/8/10 et tout symbole habituellement lu de façon adulte doivent être contextualisés à l'enfance : créativité, liens, partage/confiance, rapport aux figures d'autorité et construction progressive de sa place.\n- Uranus, Neptune et Pluton restent d'abord générationnels ; ne les personnalise fortement que si leurs maisons/aspects le justifient.\n\nSTRUCTURE ENFANT À UTILISER :\n## Sa signature astrologique\n## Sa façon d'aborder le monde\n## Ce qui construit son identité et sa confiance\n## Sa sensibilité et ses besoins de sécurité émotionnelle\n## Sa façon d'apprendre, de penser et de communiquer\n## Sa manière de créer du lien et de montrer son affection\n## Son énergie, son affirmation et ses limites\n## Ce qui nourrit sa curiosité et sa confiance\n## Son rapport au cadre, à l'effort et à la frustration\n## Son besoin d'autonomie et d'originalité\n## Son imaginaire, ses idéaux et sa sensibilité\n## Ses ressources face aux changements et aux émotions intenses\n## Les influences générationnelles\n## Les aspects les plus structurants de son thème\n## Repères pour l'accompagner\nTermine par une synthèse pratique et nuancée : forces à encourager, besoins à respecter, points de vigilance sans dramatisation, et pistes d'accompagnement adaptées à son âge. Chaque affirmation importante doit être reliée aux placements/aspects réellement fournis. À la toute fin, écris exactement [PORTRAIT_COMPLET].\n=== FIN MODE PORTRAIT ENFANT ===`;
}

function installStyle(){
  if(document.getElementById('ap-v141-child-style'))return;
  const s=document.createElement('style');s.id='ap-v141-child-style';s.textContent=`
  #ap-v141-child-note{max-width:760px;margin:0 auto 18px;padding:13px 16px;border:1px solid rgba(183,144,85,.35);border-radius:16px;background:#fff8ec;color:#5a3a52;font-size:12px;line-height:1.55;text-align:center}
  #ap-v141-child-note strong{color:#4b2149}
  html[dir="rtl"] #ap-v141-child-note{text-align:center}
  `;(document.head||document.documentElement).appendChild(s);
}
function refreshStyleCopy(){
  const t=tr();let s=document.getElementById('ap-v145-child-copy-style');
  if(!s){s=document.createElement('style');s.id='ap-v145-child-copy-style';(document.head||document.documentElement).appendChild(s)}
  s.textContent=`body.${MODE_CLASS} #mod-natal:before{content:${JSON.stringify(t.kicker)}!important}body.${MODE_CLASS} #mod-natal:after{content:${JSON.stringify(t.subtitle)}!important}`;
}

function refreshUi(){
  installStyle();refreshStyleCopy();
  if(!activeChild())return;
  const a=ageNow(),name=firstName(),t=tr();
  const banner=document.getElementById('ap121-module-banner');
  if(banner){
    const h=banner.querySelector('h1'),p=banner.querySelector('p');
    if(h)h.textContent=t.title;
    if(p)p.textContent=t.banner(name,a);
  }
  const btn=document.getElementById('n-btn');
  if(btn){
    btn.textContent=t.generate;
    let note=document.getElementById('ap-v141-child-note');
    if(!note){note=document.createElement('div');note.id='ap-v141-child-note';btn.parentNode&&btn.parentNode.insertBefore(note,btn)}
    if(note)note.innerHTML=`<strong>${escapeHtml(t.reading)}${a!=null?' · '+escapeHtml(ageLabel(a)):''}</strong><br>${escapeHtml(t.note(name))}`;
  }
  const title=document.getElementById('n-res-titre');if(title&&title.textContent)title.textContent=t.result(name);
  const actions=document.getElementById('ap100-natal-actions');
  if(actions){
    const bs=actions.querySelectorAll('button');
    if(bs[0])bs[0].textContent=t.regen;
    if(bs[1]){bs[1].textContent=t.download;bs[1].removeAttribute('onclick');bs[1].onclick=()=>{if(typeof window.exporterPDF==='function')window.exporterPDF('n-res',t.pdf)}}
  }
}
function escapeHtml(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function patchNatalFunctions(){
  if(window.__apV141NatalPatched)return;
  const basePrompt=window.natalPrompt;
  const baseFingerprint=window.natalFingerprint;
  const baseDisplay=window.displayNatal;
  if(typeof basePrompt!=='function'||typeof baseFingerprint!=='function'||typeof baseDisplay!=='function')return;

  window.natalPrompt=function(meta){
    const p=basePrompt.apply(this,arguments);
    return activeChild()?String(p||'')+childInstructions():p;
  };
  window.natalFingerprint=function(){
    const fp=String(baseFingerprint.apply(this,arguments)||'');
    if(!activeChild())return fp;
    const a=ageNow();return `${fp}|portrait-enfant-v145|${ageBand(a)}|age-${a==null?'x':a}|lang-${uiLang()}`;
  };
  window.displayNatal=function(text,meta){
    const r=baseDisplay.apply(this,arguments);setTimeout(refreshUi,0);setTimeout(refreshUi,120);return r;
  };
  window.__apV141NatalPatched=true;
}

function patchOneNavigation(name){
  const base=window[name];
  if(typeof base!=='function'||base.__apChildNavPatched)return;
  const wrapped=function(id){
    const natal=String(id||'').toLowerCase()==='natal';
    if(natal&&childMode)childLaunchPending=false;
    else if(!natal)exitChildMode();
    const r=base.apply(this,arguments);setTimeout(refreshUi,100);return r;
  };
  wrapped.__apChildNavPatched=true;
  wrapped.__apChildNavBase=base;
  window[name]=wrapped;
}
function patchNavigation(){patchOneNavigation('ap121Open');patchOneNavigation('v121Go')}

function bindChildLaunch(){
  if(window.__apV141ChildBound)return;window.__apV141ChildBound=true;
  document.addEventListener('click',e=>{
    const card=e.target.closest&&e.target.closest('#ap-v130-child-card');
    const choice=e.target.closest&&e.target.closest('#ap-v130-child-pop button');
    if(card||choice){enterChildMode();return}
    if(childMode){
      const nav=e.target.closest&&e.target.closest('#ap121-nav button,#mobile-bottom-nav button,.ap121-module-back');
      if(nav&&!nav.closest('#mod-natal'))setTimeout(exitChildMode,0);
      const langControl=e.target.closest&&e.target.closest('#ap100-lang,.ap-v130-lang-pop button,[data-lang],[data-language]');
      if(langControl){setTimeout(refreshUi,30);setTimeout(refreshUi,180)}
    }
  },true);
  document.addEventListener('change',e=>{if(childMode&&e.target&&e.target.matches('#ap100-lang,select[name*="lang" i]')){setTimeout(refreshUi,30);setTimeout(refreshUi,180)}},true);
}

function run(){installStyle();patchNatalFunctions();patchNavigation();bindChildLaunch();refreshUi()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let tries=0;const t=setInterval(()=>{run();if(++tries>28)clearInterval(t)},250);
let mt;new MutationObserver(()=>{clearTimeout(mt);mt=setTimeout(()=>{patchNatalFunctions();patchNavigation();refreshUi()},80)}).observe(document.documentElement,{childList:true,subtree:true});
setInterval(()=>{patchNavigation();if(childMode)refreshUi()},900);
})();
