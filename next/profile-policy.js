(function(){
'use strict';
const E=window.AstroEngine;
if(!E||typeof E.saveProfile!=='function')throw new Error('Validation profils : moteur indisponible');
function validDate(raw){const s=String(raw||'').trim();let y,m,d;let x=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(x){d=Number(x[1]);m=Number(x[2]);y=Number(x[3])}else{x=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!x)return null;y=Number(x[1]);m=Number(x[2]);d=Number(x[3])}const date=new Date(y,m-1,d,12);if(date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d)return null;const today=new Date();today.setHours(23,59,59,999);if(date>today)return null;return date}
function validate(data,oldKey=''){const p=data||{},date=validDate(p.date);if(!String(p.prenom||'').trim())throw new Error('Prénom requis.');if(!date)throw new Error('Date de naissance invalide. Utilisez JJ/MM/AAAA.');if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(p.heure||'').trim()))throw new Error('Heure de naissance invalide. Utilisez HH:MM entre 00:00 et 23:59.');const lat=Number(p.lat),lon=Number(p.lon);if(!Number.isFinite(lat)||lat<-90||lat>90||!Number.isFinite(lon)||lon<-180||lon>180)throw new Error('Sélectionnez une ville proposée afin de valider les coordonnées de naissance.');const key=`${String(p.prenom).trim()} (${String(p.date).trim()})`,all=E.profiles()||{};if(all[key]&&key!==String(oldKey||''))throw new Error('Un profil avec ce prénom et cette date existe déjà.');return true}
const baseSave=E.saveProfile.bind(E);
E.saveProfile=async function(data,oldKey=''){validate(data,oldKey);return baseSave(data,oldKey)};
window.AstroProfilePolicy={validate};
})();
