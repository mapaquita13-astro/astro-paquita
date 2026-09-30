/* Astro Paquita — sécurité de synchronisation des profils.
   - Ne jamais synchroniser une liste locale vide vers le serveur.
   - Si le serveur possède encore les profils DU compte connecté, les restaurer localement.
   - Ne jamais récupérer des profils tant que l'espace local n'est pas rattaché au même compte. */
(function(){
'use strict';
if(window.__AP_PROFILE_RECOVERY_FIX__)return;
window.__AP_PROFILE_RECOVERY_FIX__=true;

const API='https://astro-paquita-backend.onrender.com';
const ACTIVE_PROFILE='astro_paquita_profil_actif_v38';
const ACCOUNT_MARKER='ap-account-scope-current-v1';
let recoveryRunning=false;

function token(){try{return localStorage.getItem('astro-token')||'';}catch(e){return '';}}
function normalEmail(v){return String(v||'').trim().toLowerCase();}
function currentEmail(){return normalEmail(window.USER_CONNECTE&&window.USER_CONNECTE.email);}
function markerEmail(){try{return normalEmail(JSON.parse(localStorage.getItem(ACCOUNT_MARKER)||'null')?.email);}catch(e){return '';}}
function accountReady(){const e=currentEmail(),m=markerEmail();return !!e&&!!m&&e===m&&!!token();}
function localProfiles(){
  try{
    const p=typeof window.getProfils==='function'?window.getProfils():{};
    return p&&typeof p==='object'&&!Array.isArray(p)?p:{};
  }catch(e){return {};}
}
function hasLocalProfiles(){return Object.keys(localProfiles()).length>0;}
function fromServer(row){
  const p={
    prenom:String(row&&row.prenom||''),
    date:String(row&&row.date||''),
    heure:String(row&&row.heure||''),
    ville:String(row&&row.ville||''),
    lat:row&&row.lat!=null?Number(row.lat):null,
    lon:row&&row.lon!=null?Number(row.lon):null,
    tz:String(row&&row.tz||''),
    genre:String(row&&row.genre||'')
  };
  if(p.heure)p.timeStatus='exact';
  return p;
}
function refreshSelectors(){
  try{if(typeof window.v37RafraichirSelectProfil==='function')window.v37RafraichirSelectProfil();}catch(e){}
  try{if(typeof window.v37RafraichirSelectProfils==='function')window.v37RafraichirSelectProfils();}catch(e){}
  try{if(typeof window.rafraichirSelectProfilsSynastrie==='function')window.rafraichirSelectProfilsSynastrie();}catch(e){}
}
async function recoverFromServer(){
  if(recoveryRunning||!accountReady()||hasLocalProfiles())return false;
  recoveryRunning=true;
  try{
    const expected=currentEmail();
    const r=await fetch(API+'/api/me/profiles?ts='+Date.now(),{
      headers:{Authorization:'Bearer '+token()},cache:'no-store'
    });
    if(!r.ok||!accountReady()||currentEmail()!==expected)return false;
    const d=await r.json().catch(()=>({}));
    const rows=Array.isArray(d.profiles)?d.profiles:[];
    if(!rows.length)return false;
    const obj={};
    for(const row of rows){
      const k=String(row&&row.profile_key||row&&row.key||'').trim();
      if(k)obj[k]=fromServer(row);
    }
    const keys=Object.keys(obj);
    if(!keys.length||!accountReady()||currentEmail()!==expected)return false;
    if(typeof window.setProfils==='function')window.setProfils(obj);
    else return false;
    localStorage.setItem(ACTIVE_PROFILE,keys[0]);
    refreshSelectors();
    return true;
  }catch(e){return false;}
  finally{recoveryRunning=false;}
}

function installSyncGuard(){
  if(typeof window.apSyncProfilesV94!=='function'||window.apSyncProfilesV94.__apRecoveryGuard)return false;
  const previous=window.apSyncProfilesV94;
  const wrapped=async function(){
    if(!accountReady())return false;
    if(!hasLocalProfiles()){
      const restored=await recoverFromServer();
      if(!restored)return false;
    }
    if(!accountReady())return false;
    return previous.apply(this,arguments);
  };
  wrapped.__apRecoveryGuard=true;
  window.apSyncProfilesV94=wrapped;
  return true;
}

// Les fonctions historiques peuvent être créées après ce fichier : on installe
// donc la garde dès qu'elles existent, et pas uniquement au premier chargement.
let tries=0;
const timer=setInterval(()=>{tries++;if(installSyncGuard()||tries>120)clearInterval(timer);},100);
setTimeout(()=>{if(accountReady())recoverFromServer();},750);
})();
