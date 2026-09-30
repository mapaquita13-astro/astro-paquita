/* Astro Paquita — barrière anti-fuite entre comptes.
   Objectif : aucun profil local d'un compte A ne doit pouvoir être synchronisé
   vers un compte B pendant une connexion / inscription sur le même navigateur. */
(function(){
'use strict';
if(window.__AP_ACCOUNT_SWITCH_GUARD__)return;
window.__AP_ACCOUNT_SWITCH_GUARD__=true;

const LEGACY_PROFILES='astra_profils';
const ACTIVE_PROFILE='astro_paquita_profil_actif_v38';
const LIFE_CONTEXT='ap-life-context-v1';
const ACCOUNT_MARKER='ap-account-scope-current-v1';
const ADMIN_KEY_LOCAL='astro-admin-key';
const ADMIN_URL_LOCAL='astro-admin-url';
let transition=null;

function normalEmail(v){return String(v||'').trim().toLowerCase();}
function marker(){try{return JSON.parse(localStorage.getItem(ACCOUNT_MARKER)||'null');}catch(e){return null;}}
function currentEmail(){return normalEmail(window.USER_CONNECTE&&window.USER_CONNECTE.email);}
function currentToken(){try{return localStorage.getItem('astro-token')||'';}catch(e){return '';}}
function snapshot(){
  return {
    profiles:localStorage.getItem(LEGACY_PROFILES),
    active:localStorage.getItem(ACTIVE_PROFILE),
    life:localStorage.getItem(LIFE_CONTEXT),
    adminKey:localStorage.getItem(ADMIN_KEY_LOCAL),
    adminUrl:localStorage.getItem(ADMIN_URL_LOCAL)
  };
}
function restore(s){
  if(!s)return;
  const put=(k,v)=>v===null?localStorage.removeItem(k):localStorage.setItem(k,v);
  put(LEGACY_PROFILES,s.profiles);put(ACTIVE_PROFILE,s.active);put(LIFE_CONTEXT,s.life);
  put(ADMIN_KEY_LOCAL,s.adminKey);put(ADMIN_URL_LOCAL,s.adminUrl);
}
function clearSharedPrivateState(){
  try{localStorage.setItem(LEGACY_PROFILES,'{}');}catch(e){}
  try{localStorage.removeItem(ACTIVE_PROFILE);}catch(e){}
  try{localStorage.setItem(LIFE_CONTEXT,'{}');}catch(e){}
  try{localStorage.removeItem(ADMIN_KEY_LOCAL);localStorage.removeItem(ADMIN_URL_LOCAL);localStorage.removeItem('astro-maintenance-bypass');}catch(e){}
  try{window.USER=null;}catch(e){}
}
function urlOf(input){
  try{return typeof input==='string'?input:(input&&input.url)||'';}catch(e){return '';}
}
function methodOf(input,init){
  return String((init&&init.method)||(input&&input.method)||'GET').toUpperCase();
}
function bodyOf(input,init){
  if(init&&typeof init.body==='string')return init.body;
  return '';
}
function targetEmail(input,init){
  try{const b=JSON.parse(bodyOf(input,init)||'{}');return normalEmail(b.email);}catch(e){return '';}
}
function isAuthSwitch(url,method){return method==='POST'&&(url.includes('/api/auth/login')||url.includes('/api/auth/signup'));}
function isProfileSync(url,method){return method==='POST'&&url.includes('/api/me/profiles/sync');}
function syntheticSkippedResponse(){
  return new Response(JSON.stringify({succes:true,count:0,profiles:[],skipped:true,reason:'account-switch'}),{
    status:200,headers:{'Content-Type':'application/json'}
  });
}

const previousFetch=window.fetch.bind(window);
window.fetch=async function(input,init){
  const url=urlOf(input),method=methodOf(input,init);

  if(isAuthSwitch(url,method)){
    const target=targetEmail(input,init);
    const m=marker();
    const owner=normalEmail((m&&m.email)||currentEmail());
    if(target&&target!==owner){
      const snap=snapshot();
      clearSharedPrivateState();
      transition={target,snapshot:snap,started:Date.now()};
      try{
        const response=await previousFetch(input,init);
        if(!response.ok){restore(snap);transition=null;}
        return response;
      }catch(e){restore(snap);transition=null;throw e;}
    }
  }

  // Pendant le très court changement de compte, aucune donnée de profils ne part au serveur.
  if(transition&&isProfileSync(url,method))return syntheticSkippedResponse();

  return previousFetch(input,init);
};

// La déconnexion doit immédiatement masquer toute donnée privée partagée,
// même si une ancienne fonction de déconnexion n'a pas pu être enveloppée.
let lastToken=currentToken();
setInterval(()=>{
  const token=currentToken();
  if(lastToken&&!token)clearSharedPrivateState();
  lastToken=token;

  if(!transition)return;
  const email=currentEmail();
  if(email&&email===transition.target&&token){
    transition=null;
    // L'isolation de compte a désormais eu le temps de restaurer l'espace ciblé.
    setTimeout(()=>{try{if(typeof window.apSyncProfilesV94==='function')window.apSyncProfilesV94();}catch(e){}},500);
    return;
  }
  // Si l'authentification n'a finalement pas abouti, ne restaure l'ancien espace
  // que s'il n'existe toujours aucun nouveau jeton de session.
  if(Date.now()-transition.started>12000&&!token){restore(transition.snapshot);transition=null;}
},100);
})();
