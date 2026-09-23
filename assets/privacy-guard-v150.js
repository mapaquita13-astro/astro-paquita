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
  resetSelect('v37-profile-select','—');
  resetSelect('profils-select','— Sélectionner un profil —');
  resetSelect('y-profils-select','— Sélectionner un profil —');
  resetSelect('ap100-profile-select','—');
  const pb=document.getElementById('profils-bloc');if(pb)pb.style.display='none';
  const yb=document.getElementById('y-profils-bloc');if(yb)yb.style.display='none';
  document.getElementById('ap-v130-child-pop')?.remove();
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
  wrap('v37RafraichirSelectProfil');
  wrap('v37ChangerProfil',{returnValue:false});
  wrap('rafraichirSelectProfils');
  wrap('rafraichirSelectProfilsSynastrie');
  clearPrivateProfileUi();
}

install();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
window.addEventListener('pageshow',install);
window.addEventListener('storage',e=>{if(!e.key||e.key==='astro-token'||e.key==='astra_profils')install()});
let tries=0;const timer=setInterval(()=>{install();if(++tries>=12)clearInterval(timer)},250);
})();
