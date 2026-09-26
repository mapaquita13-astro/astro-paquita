(function(){
'use strict';
const E=window.AstroEngine;
if(!E||typeof E.ai!=='function')throw new Error('Politique d’accès : moteur indisponible');
const baseAi=E.ai.bind(E);
E.ai=async function(payload){
  const p=payload&&typeof payload==='object'?{...payload}:{};
  p.featureContext={...(p.featureContext||{})};
  if(p.featureContext.child){
    if(!await E.premium())throw new Error('Le Portrait enfant est réservé aux profils Premium.');
    p.featureContext.surface='child';
  }
  return baseAi(p);
};
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
})();
