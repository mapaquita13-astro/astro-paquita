(function(){
'use strict';
const E=window.AstroEngine;
if(!E||typeof E.saveProfile!=='function')throw new Error('Validation profils : moteur indisponible');
function parseDate(raw){const s=String(raw||'').trim();let y,m,d;let x=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(x){d=Number(x[1]);m=Number(x[2]);y=Number(x[3])}else{x=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!x)return null;y=Number(x[1]);m=Number(x[2]);d=Number(x[3])}const date=new Date(y,m-1,d,12);if(date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d)return null;const today=new Date();today.setHours(23,59,59,999);if(date>today)return null;return{date,normalized:`${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`}}
function parseTime(raw){const x=String(raw||'').trim().match(/^(\d{1,2}):([0-5]\d)$/);if(!x)return null;const h=Number(x[1]),m=Number(x[2]);if(h<0||h>23)return null;return`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`}
function normalize(data,oldKey=''){const p={...(data||{})},date=parseDate(p.date),heure=parseTime(p.heure);p.prenom=String(p.prenom||'').trim();if(!p.prenom)throw new Error('Prénom requis.');if(!date)throw new Error('Date de naissance invalide. Utilisez JJ/MM/AAAA.');if(!heure)throw new Error('Heure de naissance invalide. Utilisez HH:MM entre 00:00 et 23:59.');p.date=date.normalized;p.heure=heure;p.ville=String(p.ville||'').trim();p.tz=String(p.tz||'Europe/Paris').trim()||'Europe/Paris';p.genre=String(p.genre||'N').trim()||'N';const lat=Number(p.lat),lon=Number(p.lon);if(!Number.isFinite(lat)||lat<-90||lat>90||!Number.isFinite(lon)||lon<-180||lon>180)throw new Error('Sélectionnez une ville proposée afin de valider les coordonnées de naissance.');p.lat=String(lat);p.lon=String(lon);const key=`${p.prenom} (${p.date})`,all=E.profiles()||{};if(all[key]&&key!==String(oldKey||''))throw new Error('Un profil avec ce prénom et cette date existe déjà.');return p}
const baseSave=E.saveProfile.bind(E);
E.saveProfile=async function(data,oldKey=''){const p=normalize(data,oldKey);return baseSave(p,oldKey)};
window.AstroProfilePolicy={normalize};
})();
