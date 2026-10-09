'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const cp=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Tous les scripts JS du site sont syntaxiquement valides',()=>{
 const dirs=['assets'];let n=0;
 for(const d of dirs)for(const f of fs.readdirSync(path.join(root,d)).filter(x=>x.endsWith('.js'))){
  try{new vm.Script(read(d+'/'+f),{filename:f});}catch(e){throw new Error('Erreur syntaxique dans '+d+'/'+f+' : '+(e.stack||e.message));}n++;
 }
 assert.ok(n>=35,'Scripts assets manquants');
 for(const f of ['index.html','admin.html']){
  const html=read(f),rx=/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g;
  for(const hit of html.matchAll(rx))if(hit[1].trim())assert.doesNotThrow(()=>new vm.Script(hit[1],{filename:f}));
 }
});
test('Moteur principal V121 inchangé',()=>{
 assert.equal(cp.execFileSync('git',['hash-object','app-v121.html'],{cwd:root,encoding:'utf8'}).trim(),'1fe3b2db9afcdec3fd5191acd6e01223d9fa88e0');
});
test('Corrections Premium et journal chargées depuis les deux démarrages',()=>{
 for(const f of ['index.html','assets/refonte-final.js']){
  const src=read(f);
  assert.match(src,/v186-premium-current-offer\.js/);
  assert.match(src,/v195-activity-tracking\.js/);
 }
 assert.match(read('assets/v186-premium-current-offer.js'),/tableau\\s\+de\\s\+bord/);
});
test('Historique affiche contexte complet et 300 événements',()=>{
 const s=read('admin.html');
 assert.match(s,/activity\?limit=300/);
 for(const token of ['c.profile_name','c.period','c.domain','c.module','esc(extra)'])assert.ok(s.includes(token),token);
});
test('Navigation compilée : aucune évaluation du code téléchargé au démarrage',()=>{
 const loader=read('assets/forecast-prev-next-loader.js');
 assert.doesNotMatch(loader,/\beval\s*\(/);
 assert.doesNotMatch(loader,/\beval\s*\)\s*\(/);
 assert.match(read('assets/refonte-v127-base.js'),/function forecastSpanDays/);
});
test('Calendrier : nouvelles notes isolées sans effacement de l’ancien stockage',()=>{
 const src=read('assets/refonte-v127-base.js');
 assert.match(src,/function calendarStorageKey\(/);
 assert.match(src,/ap-calendar-notes-v2:/);
 assert.match(src,/ap-account-scope-current-v1/);
 assert.doesNotMatch(src,/removeItem\(['"]ap-calendar-notes-v1['"]\)/);
});
test('Traduction : protège les mois à l’intérieur des mots',()=>{
 const src=read('assets/global-i18n-ui-fixes.js');
 const m=src.match(/function months\(s,l\)\{[\s\S]*?\n\}/);
 assert.ok(m,'Fonction months introuvable');
 const months=vm.runInNewContext(m[0]+';months',{MONTHS:{fr:['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],en:['January','February','March','April','May','June','July','August','September','October','November','December']}});
 assert.equal(months('Maison 3','en'),'Maison 3');
 assert.equal(months('9 mai 2026','en'),'9 May 2026');
});
