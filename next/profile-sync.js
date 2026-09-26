(function(){
'use strict';
const E=window.AstroEngine;
if(!E)throw new Error('Synchronisation profils : moteur indisponible');
function token(){return localStorage.getItem('astro-token')||''}
function payload(){const all=E.profiles()||{};return{active_key:E.activeKey()||'',profiles:Object.entries(all).map(([key,p])=>({key,prenom:p.prenom||'',date:p.date||'',heure:p.heure||'',ville:p.ville||'',lat:p.lat,lon:p.lon,tz:p.tz||'',genre:p.genre||''}))}}
let running=null,pending=false,lastExternalProfile=null;
async function sync(){if(!token())return false;if(running){pending=true;return running}running=(async()=>{try{const r=await fetch('/api/me/profiles/sync',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token()},body:JSON.stringify(payload())});return r.ok}catch(e){return false}finally{running=null;if(pending){pending=false;setTimeout(sync,50)}})();return running}
for(const name of ['saveProfile','deleteProfile','selectProfile']){
  if(typeof E[name]!=='function')continue;
  const base=E[name].bind(E);
  E[name]=async function(...args){const result=await base(...args);sync();return result};
}
for(const name of ['natalTechnicalFor','prepareNatalFor']){
  if(typeof E[name]!=='function')continue;
  const base=E[name].bind(E);
  E[name]=async function(key,...args){const p=(E.profiles()||{})[key];if(p)lastExternalProfile={key,name:p.prenom||key};return base(key,...args)};
}
if(typeof E.ai==='function'){
  const baseAi=E.ai.bind(E);
  E.ai=async function(input){const p=input&&typeof input==='object'?{...input}:{};p.featureContext={...(p.featureContext||{})};let ref=null;if(p.featureContext.child&&lastExternalProfile)ref=lastExternalProfile;else{const key=E.activeKey(),cur=E.profile();if(key&&cur)ref={key,name:cur.prenom||key}}if(ref){if(!p.featureContext.profile_key)p.featureContext.profile_key=ref.key;if(!p.featureContext.profile_name)p.featureContext.profile_name=ref.name}try{return await baseAi(p)}finally{if(p.featureContext.child)lastExternalProfile=null}};
}
E.syncProfiles=sync;
E.waitReady().then(()=>sync()).catch(()=>{});
})();
