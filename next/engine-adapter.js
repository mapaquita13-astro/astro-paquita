(function(){
'use strict';
const ACTIVE_KEY='astro_paquita_profil_actif_v38';
const PROFILE_KEY='astra_profils';
let engineWindow=null;
let readyPromise=null;
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function frame(){return document.getElementById('v121-engine')}
function localProfiles(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')||{}}catch(e){return{}}}
function activeKey(){const all=localProfiles(),k=localStorage.getItem(ACTIVE_KEY)||'';if(k&&all[k])return k;const keys=Object.keys(all);return keys.length===1?keys[0]:''}
async function waitReady(){if(readyPromise)return readyPromise;readyPromise=(async()=>{const f=frame();if(!f)throw new Error('Moteur V121 introuvable');for(let i=0;i<120;i++){try{const w=f.contentWindow;if(w&&typeof w.getProfils==='function'&&typeof w.apV51Signals==='function'&&typeof w.v37ChangerProfil==='function'){engineWindow=w;const k=activeKey();if(k)try{w.v37ChangerProfil(k)}catch(e){}return w}}catch(e){}await sleep(100)}throw new Error('Le moteur V121 ne répond pas')})();return readyPromise}
async function selectProfile(key){const all=localProfiles();if(!all[key])return false;localStorage.setItem(ACTIVE_KEY,key);const w=await waitReady();try{w.v37ChangerProfil(key);return true}catch(e){return false}}
function profile(){const all=localProfiles(),k=activeKey();return k?{key:k,...all[k]}:null}
function normalizeSignals(rows){return (rows||[]).map(x=>({date:x.date,domain:x.domain,label:x.label,polarite:x.polarite,niveau:x.niveau,force:Number(x.force||0),strength:Number(x.strength||0),families:Array.isArray(x.coreFamilies)&&x.coreFamilies.length?x.coreFamilies:(x.families||[]),scenarios:Array.isArray(x.scenarios)?x.scenarios:[]}))}
async function dailySignals(date,minLevel='marque'){const w=await waitReady();const k=activeKey();if(k)try{w.v37ChangerProfil(k)}catch(e){}try{return normalizeSignals(w.apV51Signals(date,minLevel)||[])}catch(e){return[]}}
async function account(){const token=localStorage.getItem('astro-token');if(!token)return null;try{const r=await fetch('/api/me?ts='+Date.now(),{headers:{Authorization:'Bearer '+token},cache:'no-store'});if(!r.ok)return null;return await r.json()}catch(e){return null}}
async function ai(payload){const token=localStorage.getItem('astro-token');if(!token)throw new Error('Connexion requise');const headers={'Content-Type':'application/json','Authorization':'Bearer '+token};const admin=localStorage.getItem('astro-admin-key');if(admin)headers['x-admin-key']=admin;const r=await fetch('/api/claude',{method:'POST',headers,body:JSON.stringify(payload)});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.erreur||data.error||'Analyse indisponible');return data}
window.AstroEngine={waitReady,profiles:localProfiles,activeKey,profile,selectProfile,dailySignals,account,ai,version:'V121'};
})();