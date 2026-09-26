/* Astro Paquita — V151 garde-fou éditorial des prévisions annuelles.
   Restitution uniquement : aucun calcul astrologique, score, transit, maison ou aspect n'est modifié. */
(function(){
'use strict';

if(window.__AP_V151_ANNUAL_FORECAST_GUARD__) return;
window.__AP_V151_ANNUAL_FORECAST_GUARD__=true;

const nativeFetch=window.fetch;
if(typeof nativeFetch!=='function') return;

function normalizeText(value){
  return String(value||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase();
}

function bodyText(body){
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

function isAnnualForecast(body){
  if(!body||typeof body!=='object')return false;
  const feature=String(body.feature||'');
  if(feature&&feature!=='forecast_future')return false;

  const ctx=body.featureContext||{};
  const days=Number(ctx.days||ctx.duration_days||ctx.period_days||ctx.durationDays||0);
  if(Number.isFinite(days)&&days>=300&&days<=400)return true;

  const text=normalizeText(bodyText(body));
  const annualMarkers=[
    'prevision annuelle','previsions annuelles','analyse annuelle','bilan annuel',
    'annee astrologique','sur les 12 mois','12 mois','sur un an','365 jours',
    'annual forecast','yearly forecast','12 months','one year',
    'prevision anual','pronostico anual','12 meses',
    'توقعات سنوية','سنة كاملة','12 شهر'
  ];
  return annualMarkers.some(marker=>text.includes(normalizeText(marker)));
}

const ANNUAL_EDITORIAL_RULES=`
ASTRO PAQUITA — RÈGLES ÉDITORIALES IMPÉRATIVES POUR UNE PRÉVISION ANNUELLE
Ces règles concernent uniquement la formulation de la restitution. Elles ne modifient jamais les calculs astrologiques fournis.

1) HIÉRARCHIE DE PREUVE
- Distingue toujours mentalement trois niveaux : (a) signal astrologique calculé, (b) interprétation du domaine activé, (c) manifestations concrètes seulement possibles.
- Ne transforme jamais une activation de maison, un transit, une progression, une direction, une révolution ou un score de convergence en événement certain.
- Une manifestation concrète doit être formulée comme scénario compatible : « peut correspondre à », « peut mettre l'accent sur », « peut se manifester par », « parmi les scénarios possibles ».
- Ne déduis jamais qu'une évolution est voulue, subie, heureuse, malheureuse, définitive ou certaine si les données techniques ne permettent pas explicitement cette conclusion. Même avec une polarité nette, parle de tendance et non de certitude.

2) VOCABULAIRE INTERDIT OU À CORRIGER
- Ne jamais écrire : « les données indiquent clairement que cela va arriver », « a de fortes chances d'aboutir », « rien ne laisse penser que », « meilleure journée de l'année », « journée idéale pour signer », « vigilance maximale de l'année ».
- Employer à la place : « convergence particulièrement forte », « période particulièrement porteuse », « pic de convergence », « pic de vigilance », « scénario compatible avec les signaux disponibles ».
- Pas de vocabulaire artificiellement lyrique ou générique : éviter notamment « l'axe s'illumine », « ce qui se joue », « les domaines se nourrissent mutuellement ». Écrire de façon directe, précise et naturelle.

3) SCORES
- Un score est un SCORE TECHNIQUE DE CONVERGENCE. Il mesure l'intensité relative des signaux retenus dans le moteur ; il ne représente ni une probabilité, ni une garantie, ni la gravité d'un événement réel.
- Si des scores numériques sont affichés, expliquer cette règle une seule fois, brièvement, au premier score ou dans une note dédiée.
- Ne pas présenter un score comme une probabilité (« 9/10 de chances ») ni comme une certitude d'événement.

4) ANTI-RÉPÉTITION
- « Fil de l'année » : synthèse des 2 à 4 thèmes dominants, sans détailler tous les scénarios.
- « Cycles et phases » : apporter la chronologie, les changements d'intensité et les chevauchements ; ne pas répéter les mêmes paragraphes du fil de l'année.
- « Moments de concrétisation et de vigilance » : expliquer uniquement ce qui rend la date singulière ; ne pas répéter tout le domaine annuel.
- « Bilan pratique » : conclusion courte par domaine, sans réécrire les phases ni ajouter de nouvelles prédictions.
- Si deux domaines sont liés, l'expliquer une fois puis renvoyer sobrement à cette convergence au lieu de la reformuler plusieurs fois.

5) SCÉNARIOS CONCRETS
- Une activation du foyer / Maison IV / IC peut concerner le logement, le cadre de vie, la famille ou le patrimoine lié au foyer. Elle ne permet pas, à elle seule, de choisir entre achat, vente, déménagement, travaux, succession ou autre événement précis.
- Pour tout domaine, donner au maximum 2 ou 3 exemples concrets et les annoncer comme exemples possibles, jamais comme événements attendus.
- Le contexte personnel fourni (âge, statut relationnel, propriété, métier, etc.) peut aider à rendre le texte compréhensible, mais il ne constitue jamais une preuve astrologique et ne doit pas servir à inventer un événement.

6) DATES FORTES
- Remplacer « Meilleure journée de l'année » par « Pic de convergence de l'année » (ou équivalent naturel dans la langue de sortie).
- Remplacer « Vigilance maximale de l'année » par « Pic de vigilance » suivi du domaine concerné quand il est connu.
- Une date forte n'est pas automatiquement une bonne date pour signer, acheter, rompre, démissionner, investir ou prendre une décision médicale/juridique/financière. Décrire le signal et son domaine ; laisser la décision réelle au contexte de la personne.

7) DOMAINES SANS SIGNAL
- Conserver explicitement une section indiquant les domaines pour lesquels aucun signal indépendant n'est suffisamment net.
- Ne jamais remplir artificiellement un domaine pour donner l'impression que tout est activé.
- Pour la santé, ne produire aucune affirmation médicale ou pronostic de santé à partir de l'astrologie. Si aucun signal astrologique indépendant n'est retenu, le dire simplement sans interprétation supplémentaire.

8) STRUCTURE À CONSERVER
Conserver cette architecture lorsqu'elle est demandée :
1. FIL DE L'ANNÉE — Les axes vraiment dominants
2. CYCLES ET PHASES — Chronologie structurante
3. MOMENTS DE CONCRÉTISATION ET DE VIGILANCE
4. BILAN PRATIQUE — Ce qui peut évoluer, ce qui reste stable

Objectif final : une analyse personnalisée, datée et utile, mais rigoureuse sur son niveau de certitude. Ne supprime aucun signal technique fourni par le moteur et n'en invente aucun.
`;

function guardedBody(body){
  if(!isAnnualForecast(body))return body;
  const copy=Object.assign({},body);
  const existing=String(copy.system||'');
  if(existing.includes('ASTRO PAQUITA — RÈGLES ÉDITORIALES IMPÉRATIVES POUR UNE PRÉVISION ANNUELLE'))return copy;
  copy.system=(existing?existing+'\n\n':'')+ANNUAL_EDITORIAL_RULES;
  return copy;
}

window.fetch=function(input,init){
  try{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(/\/api\/(?:claude|ai)(?:\?|$)/i.test(url)&&init&&typeof init.body==='string'){
      const parsed=JSON.parse(init.body);
      if(isAnnualForecast(parsed)){
        const nextInit=Object.assign({},init,{body:JSON.stringify(guardedBody(parsed))});
        return nativeFetch.call(this,input,nextInit);
      }
    }
  }catch(e){
    // En cas de payload inattendu, laisser la requête originale intacte.
  }
  return nativeFetch.call(this,input,init);
};

})();
