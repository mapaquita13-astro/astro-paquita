/* Astro Paquita — V152 garde-fou éditorial « temps forts des 24 prochains mois ».
   Restitution uniquement : aucun calcul astrologique, score, transit, maison, aspect ou période n'est modifié. */
(function(){
'use strict';

if(window.__AP_V152_EVENTS_24M_GUARD__) return;
window.__AP_V152_EVENTS_24M_GUARD__=true;

const previousFetch=window.fetch;
if(typeof previousFetch!=='function') return;

function normalizeText(value){
  return String(value||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase();
}

function payloadText(body){
  const parts=[body&&body.system||''];
  if(Array.isArray(body&&body.messages)){
    body.messages.forEach(m=>{
      if(!m)return;
      if(typeof m.content==='string')parts.push(m.content);
      else if(Array.isArray(m.content))m.content.forEach(p=>{if(p&&typeof p.text==='string')parts.push(p.text)});
    });
  }
  try{parts.push(JSON.stringify(body&&body.featureContext||{}))}catch(e){}
  return parts.join('\n');
}

function isEvents24m(body){
  if(!body||typeof body!=='object')return false;
  if(String(body.feature||'')==='events')return true;
  const text=normalizeText(payloadText(body));
  const markers=[
    'evenements astrologiques majeurs','grands evenements','24 prochains mois','24 mois',
    'cycles actuels','major astrological events','next 24 months','24 months',
    'eventos astrologicos importantes','proximos 24 meses','24 meses',
    'الأحداث الفلكية المهمة','24 شهر'
  ];
  return markers.some(marker=>text.includes(normalizeText(marker)));
}

const EVENTS_EDITORIAL_RULES=`
ASTRO PAQUITA — RÈGLES IMPÉRATIVES POUR « LES TEMPS FORTS DES 24 PROCHAINS MOIS »
Ces règles concernent uniquement la restitution éditoriale. Elles ne changent jamais les calculs astrologiques, les périodes, les dates de pic, les scores, les domaines ou les techniques fournis par le moteur.

1) TITRES ET POSITIONNEMENT
- Titre de la page : « Les temps forts des 24 prochains mois » (ou traduction naturelle équivalente dans la langue de sortie).
- Sous-titre recommandé : « Les périodes où les convergences astrologiques sont les plus fortes. »
- Remplacer « Ce qui peut réellement changer » par « Les domaines les plus fortement activés ».
- Ne jamais présenter le module comme un résumé complet de la vie : il ne montre que les fenêtres qui franchissent le seuil de significativité retenu.

2) AUCUN CLASSEMENT INVENTÉ DES ÉVÉNEMENTS
- Ne jamais écrire « Ce qui est le plus susceptible de se produire ».
- Ne jamais écrire « Scénario principal » si les données techniques ne classent pas explicitement les manifestations concrètes entre elles.
- Employer « Manifestations possibles » ou « Exemples de manifestations possibles ».
- Toutes les manifestations concrètes proposées doivent être placées au même niveau, sans laisser entendre qu'une option est plus probable qu'une autre.
- Ne jamais transformer une maison, un transit, une progression, une direction, une révolution ou une convergence en événement certain.

3) FUSION DES DOUBLONS
- Avant de rédiger, regrouper les résultats qui ont exactement la même fenêtre temporelle et le même point fort, ou qui appartiennent explicitement au même cluster de convergence fourni par les données.
- Quand plusieurs domaines partagent cette même fenêtre, produire UNE SEULE carte/période avec « Domaines activés : … » au lieu de répéter une carte entière par domaine.
- Dans cette carte fusionnée, expliquer brièvement ce que chaque domaine apporte sans dupliquer les mêmes phrases.
- Ne fusionner ni périodes différentes, ni pics différents, ni signaux techniquement distincts seulement parce qu'ils sont proches dans le calendrier.

4) MANIFESTATIONS CONCRÈTES : SIGNAL → INTERPRÉTATION → EXEMPLES
- D'abord décrire le signal et le ou les domaines réellement activés.
- Ensuite donner au maximum 2 ou 3 exemples concrets compatibles, introduits comme possibilités.
- Foyer / logement / patrimoine : une activation peut concerner logement, cadre de vie, famille ou patrimoine lié au foyer. Elle ne permet pas à elle seule de choisir entre déménagement, achat, vente, travaux, succession ou autre décision patrimoniale.
- Famille / proches : ne pas transformer automatiquement un signal favorable en « heureuse nouvelle », grossesse, réconciliation ou soutien certain. Ces éléments peuvent seulement être cités comme exemples si les données ne permettent pas davantage.
- Travail / statut : ne pas annoncer automatiquement contrat, promotion, reconnaissance ou nouvelle responsabilité. Les présenter comme manifestations possibles d'une évolution professionnelle si le signal le justifie.
- Études / orientation / apprentissages : ne pas supposer examen, admission ou cursus scolaire. Adapter les exemples au contexte de vie disponible : formation professionnelle, certification, spécialisation, apprentissage d'un outil, transmission, réorientation, reprise d'études, etc. Le contexte personnalise les exemples mais ne constitue jamais une preuve astrologique.

5) POLARITÉ ET CERTITUDE
- « Favorable » ou « délicat » décrit la tonalité astrologique du signal, pas le résultat garanti d'un événement réel.
- Éviter les formulations « déménagement choisi », « achat/vente favorable », « réussite », « admission », « aboutissement », « plus satisfaisant » sauf si une donnée distincte et explicite justifie précisément cette conclusion ; sinon employer une formulation neutre et conditionnelle.
- Conserver une phrase courte rappelant que les manifestations proposées sont des possibilités astrologiques et non des probabilités statistiques ni des certitudes, sans répéter cette phrase sous chaque sous-item si une seule note de section suffit.

6) FAMILLES DE TECHNIQUES
- Si un nombre de familles de techniques est fourni, écrire par exemple : « Convergence très forte — 12 familles de techniques ».
- Expliquer UNE FOIS dans une note : « Le nombre de familles indique combien de catégories de techniques astrologiques distinctes convergent sur cette période. Il mesure la convergence technique, pas la probabilité qu'un événement précis se produise. »
- N'énumérer les noms des techniques que s'ils sont réellement présents dans les données source. Ne jamais inventer une liste de techniques pour justifier le nombre.

7) COUVERTURE RÉELLE DES 24 MOIS
- Le lecteur doit comprendre ce qu'il advient du reste de la période couverte.
- Si les bornes complètes des 24 mois sont connues et qu'après la dernière fenêtre majeure aucune autre convergence indépendante de niveau comparable ne franchit le seuil retenu, ajouter une section courte : « Périodes sans convergence majeure supplémentaire ».
- Donner la ou les plages concernées à partir des données disponibles. Formulation : « Aucune autre fenêtre indépendante d'intensité comparable n'est détectée par les critères retenus. Cela ne signifie pas qu'il ne se passe rien, seulement qu'aucune convergence majeure supplémentaire ne ressort du moteur. »
- Ne jamais inventer des dates de calme si les bornes ou les données de couverture ne permettent pas de les établir.

8) RÉSUMÉ FINAL
- Le résumé doit synthétiser les fenêtres déjà présentées, sans ajouter de nouvelles prédictions.
- Éviter les mots « réelle opportunité », « les conditions sont réunies pour que X arrive » ou toute formulation qui transforme une convergence en résultat.
- Préférer : « fenêtre particulièrement active », « période porteuse pour ce domaine », « plusieurs signaux convergent autour de… ».
- Mentionner explicitement, lorsque c'est pertinent, qu'aucun événement précis n'est garanti.

9) STYLE
- Ton sobre, précis, personnalisé et lisible.
- Pas de remplissage, pas de répétition d'une même période sous plusieurs cartes lorsque la fusion est possible.
- Ne montrer que les passages réellement significatifs selon les données reçues, mais ne jamais prétendre que les autres mois « ne comptent pas ».

Objectif : restituer fidèlement les convergences calculées sur 24 mois, en donnant des exemples concrets utiles sans inventer une hiérarchie, une probabilité ou un événement certain.
`;

function guardedBody(body){
  if(!isEvents24m(body))return body;
  const copy=Object.assign({},body);
  const existing=String(copy.system||'');
  if(existing.includes('ASTRO PAQUITA — RÈGLES IMPÉRATIVES POUR « LES TEMPS FORTS DES 24 PROCHAINS MOIS »'))return copy;
  copy.system=(existing?existing+'\n\n':'')+EVENTS_EDITORIAL_RULES;
  return copy;
}

window.fetch=function(input,init){
  try{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(/\/api\/(?:claude|ai)(?:\?|$)/i.test(url)&&init&&typeof init.body==='string'){
      const parsed=JSON.parse(init.body);
      if(isEvents24m(parsed)){
        const nextInit=Object.assign({},init,{body:JSON.stringify(guardedBody(parsed))});
        return previousFetch.call(this,input,nextInit);
      }
    }
  }catch(e){
    // Payload inattendu : conserver la requête originale.
  }
  return previousFetch.call(this,input,init);
};

const COPY_RULES=[
  [/\bLes 24 mois qui comptent\b/g,'Les temps forts des 24 prochains mois'],
  [/Seulement les passages réellement significatifs\.?/gi,'Les périodes où les convergences astrologiques sont les plus fortes.'],
  [/\bCe qui peut réellement changer\b/gi,'Les domaines les plus fortement activés'],
  [/\bCe qui est le plus susceptible de se produire\b/gi,'Manifestations possibles'],
  [/\bScénario principal\b/gi,'Manifestation possible'],
  [/\bAutre possibilité\b/gi,'Manifestation possible']
];

function cleanExistingCopy(root){
  root=root||document.body;if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];let n;
  while((n=walker.nextNode()))nodes.push(n);
  nodes.forEach(node=>{
    const p=node.parentElement;if(!p||p.closest('script,style,noscript,textarea,pre,code'))return;
    const old=node.nodeValue||'';let v=old;
    for(const [re,to] of COPY_RULES)v=v.replace(re,to);
    v=v.replace(/[ \t]{2,}/g,' ').replace(/\s+([,.;:!?])/g,'$1');
    if(v!==old)node.nodeValue=v;
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>cleanExistingCopy(),{once:true});else cleanExistingCopy();
let copyTimer;new MutationObserver(()=>{clearTimeout(copyTimer);copyTimer=setTimeout(()=>cleanExistingCopy(),80)}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
setTimeout(()=>cleanExistingCopy(),250);setTimeout(()=>cleanExistingCopy(),1000);
})();
