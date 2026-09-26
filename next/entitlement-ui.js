(function(){
'use strict';
const E=window.AstroEngine;
if(!E||typeof E.hasPremiumAccess!=='function')throw new Error('Affichage des droits : politique indisponible');
async function apply(){let premium=false;try{premium=!!await E.hasPremiumAccess()}catch(e){}document.body.classList.toggle('ap-premium',premium);document.body.classList.toggle('ap-free',!premium);document.documentElement.dataset.astroPlan=premium?'premium':'free';return premium}
E.applyEntitlementUI=apply;
apply();
})();
