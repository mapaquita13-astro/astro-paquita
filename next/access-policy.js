(function(){
'use strict';
const E=window.AstroEngine;
if(!E||typeof E.ai!=='function')throw new Error('Politique d’accès : moteur indisponible');
let premiumValue=null,premiumCheckedAt=0;
async function premiumNow(force=false){const now=Date.now();if(!force&&premiumValue!==null&&now-premiumCheckedAt<30000)return premiumValue;try{premiumValue=!!await E.premium()}catch(e){premiumValue=false}premiumCheckedAt=now;return premiumValue}
function parisDay(value){const d=value instanceof Date?value:new Date(value);if(Number.isNaN(d.getTime()))return'';return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}
const baseAi=E.ai.bind(E);
E.ai=async function(payload){
  const p=payload&&typeof payload==='object'?{...payload}:{};
  p.featureContext={...(p.featureContext||{})};
  if(p.featureContext.child){
    if(!await premiumNow())throw new Error('Le Portrait enfant est réservé aux profils Premium. Ouvrez Mon compte pour activer Premium.');
    p.featureContext.surface='child';
  }
  return baseAi(p);
};
if(typeof E.dailySignals==='function'){
  const baseDaily=E.dailySignals.bind(E);
  E.dailySignals=async function(date,...args){const today=parisDay(new Date()),asked=parisDay(date);if(asked&&asked!==today&&!await premiumNow())return[];return baseDaily(date,...args)};
}
const premiumLabels={events24:'Mon année et les événements futurs',timing:'Le bon moment',relation:'Relations'};
for(const name of Object.keys(premiumLabels)){
  if(typeof E[name]!=='function')continue;
  const base=E[name].bind(E);
  E[name]=async function(...args){
    if(!await premiumNow())throw new Error(`${premiumLabels[name]} est réservé aux profils Premium. Ouvrez Mon compte pour activer Premium.`);
    return base(...args);
  };
}
if(typeof E.question==='function'){
  const baseQuestion=E.question.bind(E);
  const labels={amour:'Amour',travail:'Travail',argent:'Argent',famille:'Famille',sante:'Bien-être',voyage:'Voyage',general:'Général'};
  E.question=async function(q,domain='general'){
    const d=String(domain||'general');
    try{
      const w=document.getElementById('v121-engine')?.contentWindow;
      if(w&&typeof w.eval==='function')w.eval(`domLabel=${JSON.stringify(labels[d]||'Général')}`);
    }catch(e){}
    return baseQuestion(q,d);
  };
}
E.hasPremiumAccess=premiumNow;
E.refreshPremiumAccess=()=>premiumNow(true);
})();
