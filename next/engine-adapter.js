(function(){
'use strict';
const ACTIVE_KEY='astro_paquita_profil_actif_v38';
const PROFILE_KEY='astra_profils';
let readyPromise=null;
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function frame(){return document.getElementById('v121-engine')}
function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(e){return v}}
function text(el){return String(el?.innerText||el?.textContent||'').replace(/\s+/g,' ').trim()}
function localProfiles(){try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')||{}}catch(e){return{}}}
function activeKey(){const all=localProfiles(),k=localStorage.getItem(ACTIVE_KEY)||'';if(k&&all[k])return k;const keys=Object.keys(all);return keys.length===1?keys[0]:''}
function profile(){const all=localProfiles(),k=activeKey();return k?{key:k,...all[k]}:null}
async function waitReady(){
 if(readyPromise)return readyPromise;
 readyPromise=(async()=>{
  const f=frame();if(!f)throw new Error('Moteur V121 introuvable');
  for(let i=0;i<180;i++){
   try{
    const w=f.contentWindow;
    if(w&&typeof w.getProfils==='function'&&typeof w.apV51Signals==='function'&&typeof w.v37ChangerProfil==='function'){
     const k=activeKey();if(k)try{w.v37ChangerProfil(k)}catch(e){}
     try{if(typeof w.chargerStatutCompte==='function')await w.chargerStatutCompte()}catch(e){}
     return w;
    }
   }catch(e){}
   await sleep(100);
  }
  throw new Error('Le moteur V121 ne répond pas');
 })();
 return readyPromise;
}
async function syncProfile(){const w=await waitReady(),k=activeKey();if(k)try{w.v37ChangerProfil(k)}catch(e){}return w}
async function selectProfile(key){const all=localProfiles();if(!all[key])return false;localStorage.setItem(ACTIVE_KEY,key);const w=await waitReady();try{w.v37ChangerProfil(key);return true}catch(e){return false}}
function normalizeSignals(rows){return (rows||[]).map(x=>({date:x.date,domain:x.domain,label:x.label,polarite:x.polarite,niveau:x.niveau,force:Number(x.force||0),strength:Number(x.strength||0),families:Array.isArray(x.coreFamilies)&&x.coreFamilies.length?x.coreFamilies:(x.families||[]),scenarios:Array.isArray(x.scenarios)?x.scenarios:[]}))}
async function dailySignals(date,minLevel='marque'){const w=await syncProfile();try{return normalizeSignals(w.apV51Signals(date,minLevel)||[])}catch(e){return[]}}
async function monthlyTrends(){const w=await syncProfile();try{return typeof w.monthlyData==='function'?clone(w.monthlyData()):null}catch(e){return null}}
async function natalTechnical(){const w=await syncProfile();if(typeof w.natalTechnical!=='function')throw new Error('Portrait natal V121 indisponible');const m=w.natalTechnical();if(!m)throw new Error('Profil natal incomplet');return clone(m)}
async function natalTechnicalFor(key){const all=localProfiles();if(!all[key])throw new Error('Profil introuvable');const old=activeKey(),w=await waitReady();try{localStorage.setItem(ACTIVE_KEY,key);w.v37ChangerProfil(key);await sleep(20);const m=typeof w.natalTechnical==='function'?w.natalTechnical():null;if(!m)throw new Error('Calcul natal indisponible');return clone(m)}finally{if(old&&all[old]){localStorage.setItem(ACTIVE_KEY,old);try{w.v37ChangerProfil(old)}catch(e){}}}}
async function account(){const token=localStorage.getItem('astro-token');if(!token)return null;try{const r=await fetch('/api/me?ts='+Date.now(),{headers:{Authorization:'Bearer '+token},cache:'no-store'});if(!r.ok)return null;return await r.json()}catch(e){return null}}
async function premium(){const a=await account();return !!(a&&(a.premium||a.role==='admin'||a.is_admin))}
async function ai(payload){const token=localStorage.getItem('astro-token');if(!token)throw new Error('Connexion requise');const headers={'Content-Type':'application/json','Authorization':'Bearer '+token};const admin=localStorage.getItem('astro-admin-key');if(admin)headers['x-admin-key']=admin;const r=await fetch('/api/claude',{method:'POST',headers,body:JSON.stringify(payload)});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.erreur||data.error||'Analyse indisponible');return data}
async function syncAccountInEngine(w){try{if(typeof w.chargerStatutCompte==='function')await w.chargerStatutCompte()}catch(e){}}
async function events24(){
 const w=await syncProfile();await syncAccountInEngine(w);
 if(!await premium())throw new Error('Fonction Premium');
 if(typeof w.genererEvenements!=='function')throw new Error('Détecteur V121 indisponible');
 try{if(typeof w.resetEvenements==='function')w.resetEvenements()}catch(e){}
 await w.genererEvenements();
 const d=w.document,box=d.getElementById('ev-alertes');
 const cards=[...(box?.querySelectorAll('.ev-card')||[])].map(c=>({
  title:text(c.querySelector('.ev-card-titre')),
  trend:text(c.querySelector('.ev-trend')),
  domain:text(c.querySelector('.ev-domain-tag')),
  period:[...c.querySelectorAll('.ev-period-line')].map(text),
  details:[...c.querySelectorAll('.ev-card-desc,.ev-scenario,.ev-concrete-list li,.ev-concrete-item')].map(text).filter(Boolean),
  raw:text(c)
 }));
 return {cards,summary:text(d.getElementById('ev-rapport')),title:text(d.querySelector('.ev-hero-title')),subtitle:text(d.querySelector('.ev-hero-sub'))};
}
async function timing(intention){
 const w=await syncProfile();await syncAccountInEngine(w);
 if(!await premium())throw new Error('Fonction Premium');
 if(typeof w.lancerFenetre!=='function'||typeof w.selIntent!=='function')throw new Error('Moteur de timing V121 indisponible');
 try{if(typeof w.resetFenetre==='function')w.resetFenetre()}catch(e){}
 const buttons=[...w.document.querySelectorAll('#f-intentions .f-btn')];
 const btn=buttons.find(b=>String(b.getAttribute('onclick')||'').includes("'"+intention+"'"));
 if(!btn)throw new Error('Intention non prise en charge par V121');
 w.selIntent(intention,btn);
 await w.lancerFenetre();
 const d=w.document;
 return {title:text(d.getElementById('f-res-titre')),subtitle:text(d.getElementById('f-res-sous')),windows:[...(d.getElementById('f-fenetres')?.children||[])].map(text).filter(Boolean),report:text(d.getElementById('f-rapport'))};
}
async function relation(otherKey,type='couple'){
 const w=await syncProfile();await syncAccountInEngine(w);
 if(!await premium())throw new Error('Fonction Premium');
 if(typeof w.analyserSynastrie!=='function'||typeof w.chargerProfilSynastrie!=='function')throw new Error('Synastrie V121 indisponible');
 const d=w.document;
 try{if(typeof w.resetSynastrie==='function')w.resetSynastrie()}catch(e){}
 try{if(typeof w.rafraichirSelectProfilsSynastrie==='function')w.rafraichirSelectProfilsSynastrie()}catch(e){}
 const sel=d.getElementById('y-profils-select');if(!sel)throw new Error('Sélecteur de relation indisponible');
 sel.value=otherKey;if(sel.value!==otherKey)throw new Error('Le second profil n’est pas disponible dans V121');
 w.chargerProfilSynastrie();
 const typ=d.getElementById('y-type-relation');if(typ){typ.value=type;try{if(typeof w.yActualiserTypeSynastrieV26==='function')w.yActualiserTypeSynastrieV26()}catch(e){}}
 await w.analyserSynastrie();
 return {title:text(d.getElementById('y-res-titre')),subtitle:text(d.getElementById('y-res-sous')),report:text(d.getElementById('y-rapport')),periods:text(d.getElementById('y-fenetres'))};
}
async function question(q,domain='general'){
 const w=await syncProfile();await syncAccountInEngine(w);
 const a=await account();if(!a)throw new Error('Connexion requise');
 if(typeof w.poserQuestion!=='function')throw new Error('Module question V121 indisponible');
 const d=w.document;
 try{if(typeof w.resetQuestion==='function')w.resetQuestion()}catch(e){}
 const input=d.getElementById('q-texte');if(!input)throw new Error('Question V121 indisponible');input.value=q;
 if(domain&&domain!=='general'&&typeof w.selDomQ==='function'){
  const bs=[...d.querySelectorAll('#q-domaines .dom-btn')];const b=bs.find(x=>String(x.getAttribute('onclick')||'').includes("'"+domain+"'"));if(b)w.selDomQ(domain,b);
 }else{try{if(typeof w.selDomQ==='function'){const bs=[...d.querySelectorAll('#q-domaines .dom-btn')];const b=bs.find(x=>String(x.getAttribute('onclick')||'').includes("'general'"));if(b)w.selDomQ('general',b)}}catch(e){}}
 await w.poserQuestion();
 return {title:text(d.getElementById('q-res-titre')),subtitle:text(d.getElementById('q-res-sous')),report:text(d.getElementById('q-rapport'))};
}
function diagnostics(){return {activeKey:activeKey(),profiles:Object.keys(localProfiles()).length,token:!!localStorage.getItem('astro-token'),engine:!!frame()?.contentWindow}}
window.AstroEngine={waitReady,profiles:localProfiles,activeKey,profile,selectProfile,dailySignals,monthlyTrends,natalTechnical,natalTechnicalFor,events24,timing,relation,question,account,premium,ai,diagnostics,version:'V121'};
})();
