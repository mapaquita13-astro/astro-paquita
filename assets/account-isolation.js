/* Astro Paquita — isolation stricte des données par compte.
   Les profils, le profil actif, le contexte personnel et l'historique local
   ne doivent jamais passer d'un compte connecté à un autre. */
(function(){
'use strict';
if(window.__AP_ACCOUNT_ISOLATION__)return;
window.__AP_ACCOUNT_ISOLATION__=true;

const LEGACY_PROFILES='astra_profils';
const ACTIVE_PROFILE='astro_paquita_profil_actif_v38';
const LIFE_CONTEXT='ap-life-context-v1';
const ACCOUNT_MARKER='ap-account-scope-current-v1';
const PREFIX='ap-account-scope-v1:';
let switching=false;
let lastAccount='';
let lastRole='';

function normalEmail(v){return String(v||'').trim().toLowerCase();}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
function account(){return normalEmail(window.USER_CONNECTE&&window.USER_CONNECTE.email);}
function role(){return window.USER_CONNECTE&&window.USER_CONNECTE.role==='admin'?'admin':'user';}
function aid(email){return hash(normalEmail(email));}
function key(email,name){return PREFIX+aid(email)+':'+name;}
function parseObj(raw){try{const x=JSON.parse(raw||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{};}catch(e){return {};}}
function stringify(x){try{return JSON.stringify(x&&typeof x==='object'?x:{});}catch(e){return '{}';}}
function currentToken(){return localStorage.getItem('astro-token')||'';}
function hasAdminBrowserFootprint(){return !!(localStorage.getItem('astro-admin-key')||localStorage.getItem('astro-admin-url'));}
function marker(){try{return JSON.parse(localStorage.getItem(ACCOUNT_MARKER)||'null');}catch(e){return null;}}
function writeMarker(email,r){localStorage.setItem(ACCOUNT_MARKER,JSON.stringify({email:normalEmail(email),role:r,updatedAt:new Date().toISOString()}));}

function scopedProfilesRaw(email){return localStorage.getItem(key(email,'profiles'));}
function scopedProfiles(email){return parseObj(scopedProfilesRaw(email));}
function saveProfiles(email,obj){localStorage.setItem(key(email,'profiles'),stringify(obj));}
function scopedActive(email){return localStorage.getItem(key(email,'active-profile'))||'';}
function saveActive(email,v){if(v)localStorage.setItem(key(email,'active-profile'),v);else localStorage.removeItem(key(email,'active-profile'));}
function scopedLife(email){return localStorage.getItem(key(email,'life-context'))||'{}';}
function saveLife(email,raw){localStorage.setItem(key(email,'life-context'),raw||'{}');}

function saveWorkingState(email){
  email=normalEmail(email);if(!email)return;
  saveProfiles(email,parseObj(localStorage.getItem(LEGACY_PROFILES)));
  saveActive(email,localStorage.getItem(ACTIVE_PROFILE)||'');
  saveLife(email,localStorage.getItem(LIFE_CONTEXT)||'{}');
}

function initialProfilesFor(email,r,previous){
  const existing=scopedProfilesRaw(email);
  if(existing!==null)return parseObj(existing);
  const legacy=parseObj(localStorage.getItem(LEGACY_PROFILES));
  const hasLegacy=Object.keys(legacy).length>0;

  // Les anciennes données globales appartiennent au compte qui utilisait déjà
  // ce navigateur. On ne les attribue jamais automatiquement à un nouveau compte
  // utilisateur lorsqu'un compte admin a déjà utilisé ce navigateur.
  if(r==='admin'){
    saveProfiles(email,legacy);
    return legacy;
  }
  if(previous&&normalEmail(previous.email)&&normalEmail(previous.email)!==email){
    saveProfiles(email,{});
    return {};
  }
  if(hasAdminBrowserFootprint()){
    saveProfiles(email,{});
    return {};
  }

  // Pour un utilisateur historique sur son propre appareil, on conserve sa
  // migration locale une seule fois afin de ne pas perdre ses profils existants.
  if(hasLegacy){saveProfiles(email,legacy);return legacy;}
  saveProfiles(email,{});return {};
}

function clearVisibleProfile(){
  try{if(typeof window.v37NouveauProfil==='function')window.v37NouveauProfil();}catch(e){}
  try{window.USER=null;}catch(e){}
  const ids=['s-prenom','s-date','s-heure','s-ville','s-lat','s-lon'];
  ids.forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
}

function restoreWorkingState(email,r,previous){
  const profiles=initialProfilesFor(email,r,previous);
  localStorage.setItem(LEGACY_PROFILES,stringify(profiles));
  const active=scopedActive(email);
  if(active&&profiles[active])localStorage.setItem(ACTIVE_PROFILE,active);else localStorage.removeItem(ACTIVE_PROFILE);
  localStorage.setItem(LIFE_CONTEXT,scopedLife(email));
  clearVisibleProfile();
  try{if(typeof window.rafraichirSelectProfilsSynastrie==='function')window.rafraichirSelectProfilsSynastrie();}catch(e){}
  try{if(typeof window.v37RafraichirSelectProfils==='function')window.v37RafraichirSelectProfils();}catch(e){}
}

async function ensureAccount(force){
  if(switching)return false;
  const email=account();
  if(!email||!currentToken())return false;
  const r=role();
  if(!force&&email===lastAccount&&r===lastRole)return true;
  switching=true;
  try{
    const prev=marker();
    if(prev&&prev.email&&normalEmail(prev.email)!==email)saveWorkingState(prev.email);
    restoreWorkingState(email,r,prev);
    writeMarker(email,r);
    lastAccount=email;lastRole=r;
    return true;
  }finally{switching=false;}
}

// Remplace la clé globale historique par une vue du compte actuellement connecté.
// Les fonctions existantes continuent donc de fonctionner sans toucher aux calculs.
const originalGet=typeof window.getProfils==='function'?window.getProfils:null;
const originalSet=typeof window.setProfils==='function'?window.setProfils:null;
window.getProfils=function(){
  const email=account();
  if(!email||!currentToken())return {};
  const raw=scopedProfilesRaw(email);
  if(raw===null){initialProfilesFor(email,role(),marker());}
  return scopedProfiles(email);
};
window.setProfils=function(obj){
  const email=account();
  if(!email||!currentToken())return;
  const clean=obj&&typeof obj==='object'&&!Array.isArray(obj)?obj:{};
  saveProfiles(email,clean);
  localStorage.setItem(LEGACY_PROFILES,stringify(clean));
};

// L'historique de questions devient lui aussi propre au compte, même si deux
// comptes possèdent des profils ayant le même prénom et la même date de naissance.
if(typeof window.getHistoriqueKey==='function'){
  window.getHistoriqueKey=function(){
    const email=account();if(!email||!currentToken())return null;
    let active=localStorage.getItem(ACTIVE_PROFILE)||'';
    if(!active){const ks=Object.keys(window.getProfils());active=ks[0]||'profil';}
    return 'astra_hist_account_'+aid(email)+'_'+hash(active||'profil');
  };
}

// Avant chaque synchronisation serveur, on s'assure que les profils envoyés
// appartiennent bien au compte connecté. Un nouveau compte n'envoie donc jamais
// les profils laissés par un autre compte dans le navigateur.
if(typeof window.apSyncProfilesV94==='function'){
  const oldSync=window.apSyncProfilesV94;
  window.apSyncProfilesV94=async function(){
    await ensureAccount(true);
    return oldSync.apply(this,arguments);
  };
}

// Déconnexion : on sauvegarde la vue du compte puis on retire immédiatement
// les données personnelles de la vue de travail du navigateur.
if(typeof window.deconnexionCompte==='function'){
  const oldLogout=window.deconnexionCompte;
  window.deconnexionCompte=function(){
    const email=account();if(email)saveWorkingState(email);
    localStorage.removeItem(LEGACY_PROFILES);
    localStorage.removeItem(ACTIVE_PROFILE);
    localStorage.removeItem(LIFE_CONTEXT);
    clearVisibleProfile();
    lastAccount='';lastRole='';
    return oldLogout.apply(this,arguments);
  };
}

// Après connexion / création de compte, bascule immédiatement sur l'espace du
// compte avant tout rafraîchissement de profils ou d'interface.
['soumettreConnexion','soumettreCompte'].forEach(name=>{
  try{
    const fn=window[name];if(typeof fn!=='function'||fn.__apAccountIsolated)return;
    const wrapped=async function(){const out=await fn.apply(this,arguments);await ensureAccount(true);return out;};
    wrapped.__apAccountIsolated=true;window[name]=wrapped;
  }catch(e){}
});

function mirrorActiveAndLife(){
  const email=account();if(!email||email!==lastAccount)return;
  const a=localStorage.getItem(ACTIVE_PROFILE)||'';
  if(a!==scopedActive(email))saveActive(email,a);
  const lc=localStorage.getItem(LIFE_CONTEXT)||'{}';
  if(lc!==scopedLife(email))saveLife(email,lc);
}

function start(){
  ensureAccount(true);
  setInterval(()=>{const email=account(),r=role();if(email&&currentToken()&&(email!==lastAccount||r!==lastRole))ensureAccount(true);else mirrorActiveAndLife();},250);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){const e=account();if(e)saveWorkingState(e);}});
  window.addEventListener('beforeunload',()=>{const e=account();if(e)saveWorkingState(e);});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
