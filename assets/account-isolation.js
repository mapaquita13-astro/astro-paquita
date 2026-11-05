/* Astro Paquita — isolation stricte des données par compte.
   Profils, profil actif, contexte personnel, historique local et configuration
   d'administration ne doivent jamais passer d'un compte connecté à un autre. */
(function(){
'use strict';
if(window.__AP_ACCOUNT_ISOLATION__)return;
window.__AP_ACCOUNT_ISOLATION__=true;

const LEGACY_PROFILES='astra_profils';
const ACTIVE_PROFILE='astro_paquita_profil_actif_v38';
const LIFE_CONTEXT='ap-life-context-v1';
const ADMIN_KEY_LOCAL='astro-admin-key';
const ADMIN_URL_LOCAL='astro-admin-url';
const ACCOUNT_MARKER='ap-account-scope-current-v1';
const PREFIX='ap-account-scope-v1:';
let switching=false;
let lastAccount='';
let lastRole='';
let volatileEmail='';
let volatileProfiles=null;
let scopedAuthoritativeEmail='';
function isQuota(e){return !!e&&(e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED'||e.code===22||e.code===1014);}
function setSafe(k,v){try{localStorage.setItem(k,v);return true;}catch(e){if(!isQuota(e))throw e;return false;}}


function normalEmail(v){return String(v||'').trim().toLowerCase();}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
function account(){return normalEmail(window.USER_CONNECTE&&window.USER_CONNECTE.email);}
function role(){return window.USER_CONNECTE&&window.USER_CONNECTE.role==='admin'?'admin':'user';}
function aid(email){return hash(normalEmail(email));}
function key(email,name){return PREFIX+aid(email)+':'+name;}
function parseObj(raw){try{const x=JSON.parse(raw||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{};}catch(e){return {};}}
function stringify(x){try{return JSON.stringify(x&&typeof x==='object'?x:{});}catch(e){return '{}';}}
function currentToken(){return localStorage.getItem('astro-token')||'';}
function hasAdminBrowserFootprint(){return !!(localStorage.getItem(ADMIN_KEY_LOCAL)||localStorage.getItem(ADMIN_URL_LOCAL)||localStorage.getItem('astro-maintenance-bypass'));}
function marker(){try{return JSON.parse(localStorage.getItem(ACCOUNT_MARKER)||'null');}catch(e){return null;}}
function writeMarker(email,r){localStorage.setItem(ACCOUNT_MARKER,JSON.stringify({email:normalEmail(email),role:r,updatedAt:new Date().toISOString()}));}

function scopedProfilesRaw(email){return localStorage.getItem(key(email,'profiles'));}
function scopedProfiles(email){
  if(volatileEmail===email&&volatileProfiles)return volatileProfiles;
  return parseObj(scopedProfilesRaw(email));
}
function saveProfiles(email,obj){
  const clean=obj&&typeof obj==='object'&&!Array.isArray(obj)?obj:{};
  try{
    localStorage.setItem(key(email,'profiles'),stringify(clean));
    if(volatileEmail===email){volatileEmail='';volatileProfiles=null;}
    scopedAuthoritativeEmail=email;
    return true;
  }catch(e){
    if(!isQuota(e))throw e;
    // Le serveur est la sauvegarde durable. Garder le profil en mémoire
    // permet son envoi sans effacer les autres données du navigateur.
    volatileEmail=email;volatileProfiles={...clean};
    scopedAuthoritativeEmail=email;
    return false;
  }
}
window.apProfileStorageState=function(){return {quotaExceeded:volatileEmail===account()&&!!volatileProfiles};};
function scopedActive(email){return localStorage.getItem(key(email,'active-profile'))||'';}
function saveActive(email,v){if(v)localStorage.setItem(key(email,'active-profile'),v);else localStorage.removeItem(key(email,'active-profile'));}
function scopedLife(email){return localStorage.getItem(key(email,'life-context'))||'{}';}
function saveLife(email,raw){localStorage.setItem(key(email,'life-context'),raw||'{}');}
function scopedAdminKey(email){return localStorage.getItem(key(email,'admin-key'))||'';}
function scopedAdminUrl(email){return localStorage.getItem(key(email,'admin-url'))||'';}
function saveAdminConfig(email){
  email=normalEmail(email);if(!email)return;
  const k=localStorage.getItem(ADMIN_KEY_LOCAL)||'';
  const u=localStorage.getItem(ADMIN_URL_LOCAL)||'';
  if(k)localStorage.setItem(key(email,'admin-key'),k);
  if(u)localStorage.setItem(key(email,'admin-url'),u);
}
function removeGlobalAdminConfig(){
  localStorage.removeItem(ADMIN_KEY_LOCAL);
  localStorage.removeItem(ADMIN_URL_LOCAL);
  localStorage.removeItem('astro-maintenance-bypass');
}
function restoreAdminConfig(email,r){
  if(r!=='admin'){removeGlobalAdminConfig();return;}
  const k=scopedAdminKey(email),u=scopedAdminUrl(email);
  if(k)localStorage.setItem(ADMIN_KEY_LOCAL,k);else localStorage.removeItem(ADMIN_KEY_LOCAL);
  if(u)localStorage.setItem(ADMIN_URL_LOCAL,u);else localStorage.removeItem(ADMIN_URL_LOCAL);
}

function saveWorkingState(email,r){
  email=normalEmail(email);if(!email)return;
  // Ne jamais réécrire une ancienne copie globale sur un profil plus récent,
  // notamment après dépassement du quota localStorage.
  const scoped=scopedProfilesRaw(email);
  const source=(volatileEmail===email&&volatileProfiles)?volatileProfiles:
    (scopedAuthoritativeEmail===email||scoped!==null)?scopedProfiles(email):parseObj(localStorage.getItem(LEGACY_PROFILES));
  saveProfiles(email,source);
  setSafe(key(email,'active-profile'),localStorage.getItem(ACTIVE_PROFILE)||'');
  setSafe(key(email,'life-context'),localStorage.getItem(LIFE_CONTEXT)||'{}');
  if(r==='admin')try{saveAdminConfig(email);}catch(e){if(!isQuota(e))throw e;}
}

function initialProfilesFor(email,r,previous){
  const existing=scopedProfilesRaw(email);
  if(existing!==null)return parseObj(existing);
  const legacy=parseObj(localStorage.getItem(LEGACY_PROFILES));
  const hasLegacy=Object.keys(legacy).length>0;

  // Les anciennes données globales appartiennent au compte qui utilisait déjà
  // ce navigateur. Elles ne sont jamais attribuées automatiquement à un nouveau
  // compte utilisateur après utilisation par un compte administrateur/autre compte.
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

  // Migration unique pour un ancien utilisateur sur son propre appareil.
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
  setSafe(LEGACY_PROFILES,stringify(profiles));
  const active=scopedActive(email);
  if(active&&profiles[active])setSafe(ACTIVE_PROFILE,active);else localStorage.removeItem(ACTIVE_PROFILE);
  setSafe(LIFE_CONTEXT,scopedLife(email));
  restoreAdminConfig(email,r);
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
    if(prev&&prev.email&&normalEmail(prev.email)!==email){
      saveWorkingState(prev.email,prev.role==='admin'?'admin':'user');
      // Isoler aussi le secours temporaire de l'ancien compte.
      volatileEmail='';volatileProfiles=null;scopedAuthoritativeEmail='';
    }
    // Si l'ancien compte était admin, sa clé de secours est sauvegardée avant
    // d'être retirée de la vue du nouveau compte utilisateur.
    if(prev&&prev.role==='admin'&&prev.email)saveAdminConfig(prev.email);
    restoreWorkingState(email,r,prev);
    writeMarker(email,r);
    lastAccount=email;lastRole=r;
    return true;
  }finally{switching=false;}
}

window.getProfils=function(){
  const email=account();
  if(!email||!currentToken())return {};
  const raw=scopedProfilesRaw(email);
  if(raw===null)initialProfilesFor(email,role(),marker());
  return scopedProfiles(email);
};
window.setProfils=function(obj){
  const email=account();
  if(!email||!currentToken())return;
  const clean=obj&&typeof obj==='object'&&!Array.isArray(obj)?obj:{};
  const persistent=saveProfiles(email,clean);
  const mirrored=setSafe(LEGACY_PROFILES,stringify(clean));
  if(!mirrored&&persistent){
    // La copie du compte est persistante, mais la copie historique n'a pas
    // pu être mise à jour : conserver la plus récente pendant cette session.
    volatileEmail=email;volatileProfiles={...clean};
  }
  return persistent;
};

// Historique local isolé par compte ET profil.
if(typeof window.getHistoriqueKey==='function'){
  window.getHistoriqueKey=function(){
    const email=account();if(!email||!currentToken())return null;
    let active=localStorage.getItem(ACTIVE_PROFILE)||'';
    if(!active){const ks=Object.keys(window.getProfils());active=ks[0]||'profil';}
    return 'astra_hist_account_'+aid(email)+'_'+hash(active||'profil');
  };
}

// Empêche la synchronisation de données laissées par un autre compte.
if(typeof window.apSyncProfilesV94==='function'){
  const oldSync=window.apSyncProfilesV94;
  window.apSyncProfilesV94=async function(){await ensureAccount(true);return oldSync.apply(this,arguments);};
}

// Déconnexion : sauvegarde du compte courant puis aucune donnée privée/admin ne
// reste exposée dans les clés de travail partagées du navigateur.
if(typeof window.deconnexionCompte==='function'){
  const oldLogout=window.deconnexionCompte;
  window.deconnexionCompte=function(){
    const email=account(),r=role();if(email)saveWorkingState(email,r);
    localStorage.removeItem(LEGACY_PROFILES);
    localStorage.removeItem(ACTIVE_PROFILE);
    localStorage.removeItem(LIFE_CONTEXT);
    removeGlobalAdminConfig();
    clearVisibleProfile();
    lastAccount='';lastRole='';
    return oldLogout.apply(this,arguments);
  };
}

// Après connexion / création de compte, bascule immédiatement vers son espace.
['soumettreConnexion','soumettreCompte'].forEach(name=>{
  try{
    const fn=window[name];if(typeof fn!=='function'||fn.__apAccountIsolated)return;
    const wrapped=async function(){const out=await fn.apply(this,arguments);await ensureAccount(true);return out;};
    wrapped.__apAccountIsolated=true;window[name]=wrapped;
  }catch(e){}
});

function mirrorWorkingState(){
  const email=account();if(!email||email!==lastAccount)return;
  const a=localStorage.getItem(ACTIVE_PROFILE)||'';
  if(a!==scopedActive(email))setSafe(key(email,'active-profile'),a);
  const lc=localStorage.getItem(LIFE_CONTEXT)||'{}';
  if(lc!==scopedLife(email))setSafe(key(email,'life-context'),lc);
  if(role()==='admin'){try{saveAdminConfig(email);}catch(e){if(!isQuota(e))throw e;}}
  else if(localStorage.getItem(ADMIN_KEY_LOCAL)||localStorage.getItem(ADMIN_URL_LOCAL))removeGlobalAdminConfig();
}

function start(){
  ensureAccount(true);
  setInterval(()=>{
    const email=account(),r=role();
    if(email&&currentToken()&&(email!==lastAccount||r!==lastRole))ensureAccount(true);else mirrorWorkingState();
  },250);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){const e=account();if(e)saveWorkingState(e,role());}});
  window.addEventListener('beforeunload',()=>{const e=account();if(e)saveWorkingState(e,role());});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
