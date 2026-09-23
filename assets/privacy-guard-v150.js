/* Astro Paquita — V150 garde de confidentialité des profils.
   Interface uniquement : ne modifie ni les profils stockés ni les calculs astrologiques. */
(function(){
'use strict';

function accountReady(){
  try{if(typeof window.apComptePriveActif==='function')return !!window.apComptePriveActif()}catch(e){}
  try{return !!(window.USER_CONNECTE&&window.USER_CONNECTE.email&&localStorage.getItem('astro-token'))}catch(e){return false}
}
function resetSelect(id,label){
  const el=document.getElementById(id);if(!el)return;
  el.innerHTML='<option value="">'+(label||'—')+'</option>';
  el.value='';
}
function clearPrivateProfileUi(){
  if(accountReady())return false;
  try{if(typeof window.apEffacerDonneesPriveesAffichees==='function')window.apEffacerDonneesPriveesAffichees()}catch(e){}
  try{window.USER=null}catch(e){}
  resetSelect('v37-profile-select','—');
  resetSelect('profils-select','— Sélectionner un profil —');
  resetSelect('y-profils-select','— Sélectionner un profil —');
  resetSelect('ap100-profile-select','—');
  const pb=document.getElementById('profils-bloc');if(pb)pb.style.display='none';
  const yb=document.getElementById('y-profils-bloc');if(yb)yb.style.display='none';
  document.getElementById('ap-v130-child-pop')?.remove();
  const profileDetails=document.getElementById('v98-v30-details');
  if(profileDetails)profileDetails.textContent='Connectez-vous pour retrouver vos profils enregistrés.';
  return true;
}
function wrap(name,opts){
  const base=window[name];
  if(typeof base!=='function'||base.__apV150PrivacyGuard)return;
  const guarded=function(){
    if(!accountReady()){
      clearPrivateProfileUi();
      if(opts&&opts.openAccount&&typeof window.ouvrirCompte==='function')window.ouvrirCompte();
      return opts&&Object.prototype.hasOwnProperty.call(opts,'returnValue')?opts.returnValue:undefined;
    }
    return base.apply(this,arguments);
  };
  guarded.__apV150PrivacyGuard=true;
  guarded.__apV150Base=base;
  window[name]=guarded;
}
function install(){
  // Anciennes listes et changements de profils.
  wrap('v37RafraichirSelectProfil');
  wrap('v37ChangerProfil',{returnValue:false});
  wrap('rafraichirSelectProfils');
  wrap('rafraichirSelectProfilsSynastrie');

  // V110 pouvait reconstruire USER depuis le premier profil local avant auth.
  // Le calcul lui-même reste intact après connexion : seule son invocation
  // hors session privée est refusée.
  wrap('v37CalculerUserDepuisDonnees',{returnValue:false});
  wrap('ap110SyncUser',{returnValue:false});

  // Anciennes cartes profil/situation : aucune lecture/édition locale hors auth.
  wrap('v98OpenProfile',{openAccount:true,returnValue:false});
  wrap('v98EditBirthProfile',{openAccount:true,returnValue:false});
  wrap('v98RefreshProfileCard',{returnValue:false});
  wrap('v100OpenProfile',{openAccount:true,returnValue:false});

  clearPrivateProfileUi();
}

install();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
window.addEventListener('pageshow',install);
window.addEventListener('storage',e=>{if(!e.key||e.key==='astro-token'||e.key==='astra_profils')install()});
let tries=0;const timer=setInterval(()=>{install();if(++tries>=20)clearInterval(timer)},250);
})();
