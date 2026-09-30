/* Astro Paquita — fusion sûre des profils serveur du compte connecté.
   Ajoute uniquement les profils manquants du même compte, sans écraser les profils locaux. */
(function(){
'use strict';
if(window.__AP_PROFILE_SERVER_MERGE__)return;
window.__AP_PROFILE_SERVER_MERGE__=true;
const API='https://astro-paquita-backend.onrender.com';
const ACTIVE='astro_paquita_profil_actif_v38';
const MARKER='ap-account-scope-current-v1';
let busy=false,lastEmail='';
function norm(v){return String(v||'').trim().toLowerCase();}
function token(){try{return localStorage.getItem('astro-token')||'';}catch(e){return '';}}
function email(){return norm(window.USER_CONNECTE&&window.USER_CONNECTE.email);}
function marker(){try{return norm(JSON.parse(localStorage.getItem(MARKER)||'null')?.email);}catch(e){return '';}}
function ready(){const e=email();return !!e&&e===marker()&&!!token();}
function locals(){try{const p=typeof window.getProfils==='function'?window.getProfils():{};return p&&typeof p==='object'&&!Array.isArray(p)?p:{};}catch(e){return {};}}
function convert(r){const p={prenom:String(r?.prenom||''),date:String(r?.date||''),heure:String(r?.heure||''),ville:String(r?.ville||''),lat:r?.lat==null?null:Number(r.lat),lon:r?.lon==null?null:Number(r.lon),tz:String(r?.tz||''),genre:String(r?.genre||'')};if(p.heure)p.timeStatus='exact';return p;}
function refresh(){try{window.v37RafraichirSelectProfil?.();}catch(e){}try{window.v37RafraichirSelectProfils?.();}catch(e){}try{window.rafraichirSelectProfilsSynastrie?.();}catch(e){}}
async function merge(force){
 if(busy||!ready())return false;
 const expected=email();if(!force&&lastEmail===expected)return true;busy=true;
 try{
   const r=await fetch(API+'/api/me/profiles?ts='+Date.now(),{headers:{Authorization:'Bearer '+token()},cache:'no-store'});
   if(!r.ok||!ready()||email()!==expected)return false;
   const d=await r.json().catch(()=>({}));const rows=Array.isArray(d.profiles)?d.profiles:[];
   const local=locals(), merged={...local};let added=0;
   for(const row of rows){const k=String(row?.profile_key||row?.key||'').trim();if(!k||merged[k])continue;merged[k]=convert(row);added++;}
   if(added&&typeof window.setProfils==='function'){
     window.setProfils(merged);
     const a=localStorage.getItem(ACTIVE)||'';if(!a||!merged[a]){const first=Object.keys(merged)[0]||'';if(first)localStorage.setItem(ACTIVE,first);}
     refresh();
   }
   lastEmail=expected;return true;
 }catch(e){return false;}finally{busy=false;}
}
window.apMergeServerProfiles=merge;
let n=0;const t=setInterval(()=>{n++;if(ready()){merge(true);clearInterval(t);}else if(n>160)clearInterval(t);},125);
})();
