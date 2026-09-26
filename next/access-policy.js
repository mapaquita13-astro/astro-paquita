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
})();
