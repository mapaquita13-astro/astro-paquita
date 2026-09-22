/* Astro Paquita — V141 Portrait enfant réel.
   Adaptation éditoriale uniquement : les positions, maisons, aspects et dominantes restent ceux du moteur V121. */
(function(){
'use strict';

const MODE_CLASS='ap-v141-child-mode';
let childMode=false;
let childLaunchPending=false;

function parseBirthDate(){
  try{
    const raw=String((window.USER&&(USER.dateISO||USER.dateRaw||USER.date))||'').trim();
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
function firstName(){return String((window.USER&&USER.prenom)||'cet enfant').trim()||'cet enfant'}
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
  const a=ageNow(),name=firstName();
  return `\n\n=== MODE PORTRAIT ENFANT — CONSIGNES PRIORITAIRES ===\nLe profil interprété est celui de ${name}, âgé actuellement de ${a==null?'moins de 18 ans':a+' ans'}. Ces consignes priment sur toute formulation adulte située plus haut, sans modifier aucune donnée astrologique calculée.\n\nOBJECTIF : produire un véritable PORTRAIT ENFANT destiné à l'adulte qui accompagne l'enfant. Parle de ${name} à la troisième personne et explique comment ses tendances peuvent se manifester à son âge. Le texte doit aider à comprendre son tempérament, sa sécurité émotionnelle, sa manière d'apprendre, de communiquer, de créer du lien, d'affirmer ses limites, de développer son autonomie et ses ressources.\n\nINTERDICTIONS : ne projette pas ${name} dans une vie amoureuse, sexuelle, conjugale, professionnelle, financière ou parentale d'adulte ; ne prédis pas son futur métier, son couple, ses revenus ni un destin adulte. N'utilise aucun diagnostic médical ou psychologique, aucune étiquette figée et aucun déterminisme.\n\nADAPTATION DES SYMBOLES :\n- Vénus = façon de donner/recevoir de l'affection, goûts, sociabilité, besoin d'harmonie et premiers liens ; jamais sexualité ou vie de couple.\n- Mars = énergie, affirmation, frustration, courage, limites et manière de défendre sa place.\n- Jupiter = confiance, curiosité, ouverture, apprentissages et enthousiasme.\n- Saturne = cadre, patience, apprentissage de l'effort, rapport aux règles et sentiment de sécurité dans la structure.\n- Maisons 5/7/8/10 et tout symbole habituellement lu de façon adulte doivent être contextualisés à l'enfance : créativité, liens, partage/confiance, rapport aux figures d'autorité et construction progressive de sa place.\n- Uranus, Neptune et Pluton restent d'abord générationnels ; ne les personnalise fortement que si leurs maisons/aspects le justifient.\n\nSTRUCTURE ENFANT À UTILISER :\n## Sa signature astrologique\n## Sa façon d'aborder le monde\n## Ce qui construit son identité et sa confiance\n## Sa sensibilité et ses besoins de sécurité émotionnelle\n## Sa façon d'apprendre, de penser et de communiquer\n## Sa manière de créer du lien et de montrer son affection\n## Son énergie, son affirmation et ses limites\n## Ce qui nourrit sa curiosité et sa confiance\n## Son rapport au cadre, à l'effort et à la frustration\n## Son besoin d'autonomie et d'originalité\n## Son imaginaire, ses idéaux et sa sensibilité\n## Ses ressources face aux changements et aux émotions intenses\n## Les influences générationnelles\n## Les aspects les plus structurants de son thème\n## Repères pour l'accompagner\nTermine par une synthèse pratique et nuancée : forces à encourager, besoins à respecter, points de vigilance sans dramatisation, et pistes d'accompagnement adaptées à son âge. Chaque affirmation importante doit être reliée aux placements/aspects réellement fournis. À la toute fin, écris exactement [PORTRAIT_COMPLET].\n=== FIN MODE PORTRAIT ENFANT ===`;
}

function installStyle(){
  if(document.getElementById('ap-v141-child-style'))return;
  const s=document.createElement('style');s.id='ap-v141-child-style';s.textContent=`
  body.${MODE_CLASS} #mod-natal:before{content:'PORTRAIT ENFANT'!important}
  body.${MODE_CLASS} #mod-natal:after{content:'Une lecture de son thème adaptée à son âge'!important}
  #ap-v141-child-note{max-width:760px;margin:0 auto 18px;padding:13px 16px;border:1px solid rgba(183,144,85,.35);border-radius:16px;background:#fff8ec;color:#5a3a52;font-size:12px;line-height:1.55;text-align:center}
  #ap-v141-child-note strong{color:#4b2149}
  `;(document.head||document.documentElement).appendChild(s);
}

function refreshUi(){
  installStyle();
  if(!activeChild())return;
  const a=ageNow(),name=firstName();
  const banner=document.getElementById('ap121-module-banner');
  if(banner){
    const h=banner.querySelector('h1'),p=banner.querySelector('p');
    if(h)h.textContent='Portrait enfant';
    if(p)p.textContent=`Le thème natal de ${name}, interprété avec des repères adaptés à ${a==null?'son âge':a+' ans'}.`;
  }
  const btn=document.getElementById('n-btn');
  if(btn){
    btn.textContent='Générer le portrait enfant';
    let note=document.getElementById('ap-v141-child-note');
    if(!note){note=document.createElement('div');note.id='ap-v141-child-note';btn.parentNode&&btn.parentNode.insertBefore(note,btn)}
    if(note)note.innerHTML=`<strong>Lecture enfant${a!=null?' · '+a+' ans':''}</strong><br>Une interprétation du thème adaptée à l’âge de ${escapeHtml(name)}, sans modifier ses données astrologiques de naissance.`;
  }
  const title=document.getElementById('n-res-titre');if(title&&title.textContent)title.textContent=`Portrait enfant de ${name}`;
  const actions=document.getElementById('ap100-natal-actions');
  if(actions){
    const bs=actions.querySelectorAll('button');
    if(bs[0])bs[0].textContent='↻ Régénérer le portrait enfant';
    if(bs[1]){bs[1].textContent='↓ Télécharger le portrait enfant en PDF';bs[1].removeAttribute('onclick');bs[1].onclick=()=>{if(typeof window.exporterPDF==='function')window.exporterPDF('n-res','Portrait enfant')}}
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
    const a=ageNow();return `${fp}|portrait-enfant-v141|${ageBand(a)}|age-${a==null?'x':a}`;
  };
  window.displayNatal=function(text,meta){
    const r=baseDisplay.apply(this,arguments);setTimeout(refreshUi,0);setTimeout(refreshUi,120);return r;
  };
  window.__apV141NatalPatched=true;
}

function patchNavigation(){
  if(window.__apV141NavPatched)return;
  const open=window.ap121Open;
  if(typeof open==='function'){
    window.ap121Open=function(id){
      const natal=String(id||'').toLowerCase()==='natal';
      if(natal&&childLaunchPending){childLaunchPending=false;}
      else if(!natal||!childLaunchPending)exitChildMode();
      const r=open.apply(this,arguments);setTimeout(refreshUi,100);return r;
    };
  }
  const go=window.v121Go;
  if(typeof go==='function'){
    window.v121Go=function(id){
      const k=String(id||'').toLowerCase();
      if(k!=='natal'||!childLaunchPending)exitChildMode();
      return go.apply(this,arguments);
    };
  }
  window.__apV141NavPatched=true;
}

function bindChildLaunch(){
  if(window.__apV141ChildBound)return;window.__apV141ChildBound=true;
  document.addEventListener('click',e=>{
    const card=e.target.closest&&e.target.closest('#ap-v130-child-card');
    const choice=e.target.closest&&e.target.closest('#ap-v130-child-pop button');
    if(card||choice){enterChildMode();return}
    if(childMode){
      const nav=e.target.closest&&e.target.closest('#ap121-nav button,#mobile-bottom-nav button,.ap121-module-back');
      if(nav&&!nav.closest('#mod-natal'))setTimeout(exitChildMode,0);
    }
  },true);
}

function run(){installStyle();patchNatalFunctions();patchNavigation();bindChildLaunch();refreshUi()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let tries=0;const t=setInterval(()=>{run();if(++tries>20)clearInterval(t)},250);
let mt;new MutationObserver(()=>{clearTimeout(mt);mt=setTimeout(()=>{patchNatalFunctions();patchNavigation();refreshUi()},80)}).observe(document.documentElement,{childList:true,subtree:true});
})();
