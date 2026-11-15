/* Astro Paquita V201 — Événements majeurs.
   Module additionnel: ne modifie ni profil, ni moteur V121, ni prévisions.
   Les interprétations sont contextuelles et les événements réels saisis manuellement. */
(function(){
'use strict';
if(window.__AP_V201_EVENTS_UI__)return;
window.__AP_V201_EVENTS_UI__=true;
const VERSION='v204-20261115';
const A=window.AstroTruth;
const qs=(s,r)=>(r||document).querySelector(s),qsa=(s,r)=>Array.from((r||document).querySelectorAll(s));
const es=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toDate=s=>new Date(String(s)+'T12:00:00Z');
const iso=d=>d.toISOString().slice(0,10);
const fmt=s=>toDate(s).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const fmonth=s=>toDate(s).toLocaleDateString('fr-FR',{month:'long',year:'numeric',timeZone:'UTC'});
const CATS={
 famille:{name:'Enfants et famille',symbol:'♡',scenes:['Évolution familiale, nouvelles responsabilités ou événements concernant des proches.','Arrivée d’un enfant dans la famille, puisque la grossesse a été renseignée.','Évolution autour des enfants et de la transmission familiale.']},
 relation:{name:'Amour et relations',symbol:'♢',scenes:['Évolution d’un engagement, officialisation ou redéfinition d’une relation.','Clarification des engagements ; si une séparation est déjà en cours, ses suites peuvent prendre de l’importance.','Rencontre, union ou redéfinition du couple selon la situation vécue.']},
 travail:{name:'Carrière et statut',symbol:'♜',scenes:['Changement de rôle, de responsabilités ou de position professionnelle.','Décision contractuelle ou réorganisation de la situation professionnelle.','Évolution de carrière, transition ou préparation d’un nouveau projet.']},
 finances:{name:'Argent et patrimoine',symbol:'◇',scenes:['Réorganisation des ressources, des dépenses ou des obligations financières.','Décision concernant un contrat, un financement ou un patrimoine.','Évolution de revenus ou engagement financier important.']},
 logement:{name:'Logement et cadre de vie',symbol:'⌂',scenes:['Changement des conditions de vie, du foyer ou des responsabilités domestiques.','Projet immobilier, acquisition, vente ou déménagement si une démarche existe.','Réorganisation des bases familiales ou du lieu de vie.']},
 personnel:{name:'Grandes étapes de vie',symbol:'✦',scenes:['Changement de priorités et réorientation personnelle.','Décision durable concernant l’organisation de la vie.','Période de redéfinition des objectifs personnels.']}
};
const TYPES={naissance:'Naissance / nouvel enfant',grossesse:'Grossesse',mariage:'Mariage / union',separation:'Séparation / divorce',deuil:'Deuil',emploi:'Début d’emploi',depart:'Fin d’emploi',promotion:'Promotion / changement de poste',retraite:'Retraite',immobilier:'Achat / vente immobilière',dem:'Déménagement',finances:'Événement financier',famille:'Événement familial',autre:'Autre événement majeur'};
const CTX={aucun:'Aucun contexte renseigné',grossesse:'Grossesse connue dans la famille',petitenfant:'Petit-enfant attendu',couple:'Projet d’union',separation:'Séparation ou divorce déjà engagé',deuil:'Deuil déjà survenu',travail:'Évolution professionnelle envisagée',immobilier:'Projet immobilier en cours',finances:'Décision financière en préparation'};
let opened=false,job=0,months=12,category='all',mode='future',latest=null,snapshot='',observer=null,pending=false,applying=false,baseAccount='';
function email(){return String(window.USER_CONNECTE?.email||'').trim().toLowerCase()}
function profile(){return A?.currentProfile?.()}
function storageKey(){return 'ap-major-events-v201:'+encodeURIComponent(email())}
function loadData(){if(!email())return {events:[],contexts:{},terms:{}};try{const x=JSON.parse(localStorage.getItem(storageKey())||'{}');return {events:Array.isArray(x.events)?x.events:[],contexts:x.contexts&&typeof x.contexts==='object'?x.contexts:{},terms:x.terms&&typeof x.terms==='object'?x.terms:{}}}catch(e){return{events:[],contexts:{},terms:{}}}}
function persist(x){if(!email())throw Error('Connexion requise.');localStorage.setItem(storageKey(),JSON.stringify(x))}
function pkey(p){return String(p?.profileId||p?.legacyKey||'')}
function ctx(p){return loadData().contexts[pkey(p)]||'aucun'}
function due(p){return loadData().terms[pkey(p)]||''}
function ok(p){return !!p&&(!A?.validation||A.validation(p).ok)}
function premium(){return !!(window.USER_CONNECTE?.role==='admin'||window.USER_CONNECTE?.premium===true||document.body.classList.contains('ap-premium-user'))}
function addCss(){
 if(qs('#ap-events-v201-css'))return;
 const st=document.createElement('style');st.id='ap-events-v201-css';
 st.textContent=[
 '.ap-events-nav{margin-top:3px!important}.ap-events-nav.active{background:#f1e6ec}',
 '.ap-events-tile{border-color:#d7b2c7!important;background:#fff6f8!important}',
 '.ap-events-layer{position:fixed;inset:0;background:rgba(32,15,33,.6);z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:14px;box-sizing:border-box}',
 '.ap-events-panel{width:min(1140px,100%);max-height:calc(100dvh - 28px);overflow:auto;overscroll-behavior:contain;background:#f9f2e9;color:#4b2149;border:1px solid #dcc6d3;border-radius:24px;box-shadow:0 18px 70px #1c0c1d50;padding:24px;box-sizing:border-box;font-family:system-ui,sans-serif}',
 '.ap-events-panel *{box-sizing:border-box}.ap-events-panel h1{font:600 clamp(31px,4vw,48px)/1.1 Georgia,serif;margin:5px 0 12px}.ap-events-panel h2{font:600 25px Georgia,serif;margin:0 0 12px}.ap-events-panel p{line-height:1.55}.ap-events-panel .muted{font-size:13px;color:#786b73}',
 '.ap-events-top,.ap-events-row{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}.ap-events-tools{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}',
 '.ap-events-btn{border:1px solid #c5a6b8;border-radius:11px;background:#fffaf4;color:#542b4d;cursor:pointer;padding:10px 15px;font-weight:600;font-size:14px}.ap-events-btn.selected,.ap-events-btn.primary{background:#60264f;color:#fff;border-color:#60264f}.ap-events-btn:disabled{opacity:.55;cursor:wait}',
 '.ap-events-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ap-events-card{padding:17px;border:1px solid #dfcbd7;background:#fffaf4;border-radius:16px}.ap-events-card strong{font-size:16px}.ap-events-card ul{padding-left:21px;margin:8px 0}.ap-events-card li{margin:5px 0;font-size:14px}',
 '.ap-events-pill{display:inline-block;font-size:12px;border-radius:7px;background:#f1e6eb;padding:5px 9px;color:#582b4d}.ap-events-lines{border-left:2px solid #dcc4d2;padding-left:14px;margin:12px 0}',
 '.ap-events-panel input,.ap-events-panel select,.ap-events-panel textarea{font:inherit;border:1px solid #cdbcc5;background:white;border-radius:9px;padding:10px;color:#4b2149;min-width:0;max-width:100%}.ap-events-panel textarea{width:100%;resize:vertical}',
 '.ap-events-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ap-events-fields label{display:flex;flex-direction:column;gap:6px;font-size:14px;font-weight:600}.ap-events-result{margin-top:12px}',
 '@media(max-width:760px){.ap-events-layer{padding:0}.ap-events-panel{width:100%;max-height:100dvh;height:100dvh;border-radius:0;padding:19px 14px 85px}.ap-events-grid,.ap-events-fields{grid-template-columns:1fr}.ap-events-panel h1{font-size:33px}.ap-events-card{padding:14px}}'
 ].join('\n');
 document.head.appendChild(st);
}
function makeButton(parent,tag,cls,attrs,text){
 const b=document.createElement(tag);b.className=cls;for(const [k,v] of Object.entries(attrs||{}))b.setAttribute(k,v);b.textContent=text;parent.appendChild(b);return b;
}
function decorate(){
 if(!window.USER_CONNECTE||document.body.classList.contains('ap-auth-open'))return;
 const nav=qs('.ap-side .ap-nav');
 if(nav&&!qs('#ap-events-nav',nav)){
   const b=makeButton(nav,'button','ap-navbtn ap-events-nav',{id:'ap-events-nav',type:'button'},'✦  Événements majeurs');
   b.onclick=open;
 }
 const hub=qs('#ap-v168-future .v168-grid');
 if(hub&&!qs('#ap-events-tile',hub)){
   const btn=document.createElement('button');btn.type='button';btn.id='ap-events-tile';btn.className='v168-card ap-events-tile';
   btn.innerHTML='<div class="v168-icon">✦</div><h2>Événements majeurs</h2><p>Vie affective, enfants, mariage, séparation, travail, immobilier et finances : une chronologie des grands tournants.</p><span class="v168-arrow">→</span>';
   btn.onclick=open;hub.appendChild(btn);
 }
}
function close(){
 job++;opened=false;latest=null;
 const layer=qs('#ap-events-layer');if(layer)layer.remove();
 document.removeEventListener('keydown',escKey);
}
function escKey(e){if(e.key==='Escape')close()}
function open(){
 if(!A||!window.USER_CONNECTE)return;
 close();opened=true;baseAccount=email();
 const layer=document.createElement('div');layer.className='ap-events-layer';layer.id='ap-events-layer';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','Événements majeurs');
 const panel=document.createElement('div');panel.className='ap-events-panel';panel.id='ap-events-panel';layer.appendChild(panel);document.body.appendChild(layer);
 layer.addEventListener('click',e=>{if(e.target===layer)close()});
 document.addEventListener('keydown',escKey);
 render();
}
function header(){
 const p=profile(),panel=qs('#ap-events-panel');
 if(!panel)return;
 panel.innerHTML='<div class="ap-events-top"><span class="muted">ASTRO PAQUITA · GRANDES ÉTAPES DE VIE</span><button class="ap-events-btn" id="ap-events-close" type="button">✕ Fermer</button></div>'
 +'<h1>Événements majeurs</h1><p>Les dates qui ressortent le plus, les événements possibles, sans tableaux de calculs.</p>';
 qs('#ap-events-close').onclick=close;
 if(!ok(p)){panel.insertAdjacentHTML('beforeend','<div class="ap-events-card">Sélectionnez d’abord un profil dont la date, l’heure et le lieu de naissance sont complets.</div>');return false}
 if(!premium()){
  panel.insertAdjacentHTML('beforeend','<div class="ap-events-card"><h2>Fonction Premium</h2><p>Les analyses des événements majeurs sont réservées aux comptes Premium. Vos profils et prévisions existants restent inchangés.</p></div>');return false;
 }
 panel.insertAdjacentHTML('beforeend','<div class="ap-events-card"><div class="ap-events-row"><strong>Profil : '+es(p.prenom||'Profil actif')+'</strong><span class="muted">Heure : '+es(p.heure||'non renseignée')+' · '+es(p.ville||'')+'</span></div></div>'
 +'<div class="ap-events-tools"><button class="ap-events-btn '+(mode==='future'?'selected':'')+'" data-ap-mode="future">Périodes à venir</button><button class="ap-events-btn '+(mode==='history'?'selected':'')+'" data-ap-mode="history">Événements vécus</button></div><div id="ap-events-content"></div>');
 qsa('[data-ap-mode]',panel).forEach(b=>b.onclick=()=>{job++;mode=b.dataset.apMode;render()});
 return true;
}
function render(){if(!header())return;if(mode==='history')renderHistory();else renderFuture();}
function renderFuture(){
 const p=profile(),holder=qs('#ap-events-content');
 holder.innerHTML='<div class="ap-events-card"><div class="ap-events-fields">'
 +'<label>Période à examiner<select id="ap-events-horizon"><option value="12">12 prochains mois</option><option value="24">24 prochains mois</option><option value="60">5 prochaines années</option><option value="120">10 prochaines années</option></select></label>'
 +'<label>Événements recherchés<select id="ap-events-category"><option value="all">Tous les événements majeurs</option>'+Object.entries(CATS).filter(([k])=>k!=='personnel').map(([k,v])=>'<option value="'+k+'">'+es(v.name)+'</option>').join('')+'</select></label>'
 +'<label>Comparer avec un proche (facultatif)<select id="ap-events-family"><option value="">Seulement ce profil</option>'+A.listProfiles().filter(x=>x.profileId!==p.profileId&&ok(x)).map(x=>'<option value="'+es(pkey(x))+'">'+es(x.prenom||'Autre profil')+'</option>').join('')+'</select></label>'
 +'</div><div class="ap-events-tools"><button class="ap-events-btn primary" id="ap-events-run">Rechercher les événements</button><button class="ap-events-btn" id="ap-events-copy" disabled>Copier les résultats</button></div></div>'
 +'<div id="ap-events-progress" aria-live="polite" class="muted"></div><div id="ap-events-output" class="ap-events-result"></div>';
 qs('#ap-events-horizon').value=String(months);
 qs('#ap-events-category').value=category;
 qs('#ap-events-run').onclick=runForecast;
 qs('#ap-events-copy').onclick=()=>{const t=qs('#ap-events-output')?.innerText||'';if(!t)return;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(t).catch(()=>fallbackCopy(t));else fallbackCopy(t)};
}
function fallbackCopy(s){const t=document.createElement('textarea');t.value=s;t.style.position='fixed';t.style.left='-10000px';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();}
function setStatus(s){const n=qs('#ap-events-progress');if(n)n.textContent=s||'';}
function monthSpecs(total){
 const n=new Date(),begin=new Date(Date.UTC(n.getFullYear(),n.getMonth(),1,12));
 const out=[];
 for(let m=0;m<total;m++){
  const from=new Date(Date.UTC(begin.getUTCFullYear(),begin.getUTCMonth()+m,1,12)),finish=new Date(Date.UTC(begin.getUTCFullYear(),begin.getUTCMonth()+m+1,1,12));
  out.push({start:iso(from),end:iso(finish),label:fmonth(iso(from))});
 }
 return out;
}
function domainFor(s){
 const a=new Set();const target=s.target||s.significator||'',house=Number(s.natalHouse)||0;
 if(target==='MC'||house===10||house===6||target==='Saturne')a.add('travail');
 if(target==='Ascendant'||target==='Soleil'||house===1)a.add('personnel');
 if(target==='Lune'||target==='Fortune'||house===4||house===5||house===9)a.add('famille');
 if(target==='Vénus'||target==='Descendant'||house===7||house===5)a.add('relation');
 if(house===2||house===8||target==='Jupiter'||target==='Vénus')a.add('finances');
 if(house===4||target==='IC'||target==='Lune')a.add('logement');
 if(!a.size)a.add('personnel');return [...a];
}
function aspectText(a){
 const nm={0:'conjonction',60:'sextile',90:'carré',120:'trigone',180:'opposition'};
 if(a.method==='direction_primaire_placidus')return 'Direction primaire Placidus '+(a.kind==='in_mundo'?'in mundo':'in zodiaco')+' '+a.direction+' : '+a.promissor+' '+(nm[a.aspect]||'aspect')+' '+a.significator+' (arc '+a.arc+'° ; '+a.key+')';
 if(a.method==='direction_primaire_meridienne')return 'Direction primaire méridienne '+a.motion+' : MC vers '+a.target+' ('+(nm[a.aspect]||a.aspect)+' ; clé de Naibod)';
 return ({transit_lent:'Transit lent',progression_secondaire:'Progression secondaire',direction_arc_solaire:'Arc solaire',eclipse:'Éclipse'}[a.method]||a.method)+': '+a.source+' '+(a.aspectName||nm[a.aspect]||'aspect')+' '+a.target+(a.orb!=null?' (orbe '+Number(a.orb).toFixed(2)+'°)':'');
}
function mood(arr){let hard=0,soft=0;for(const a of arr){if([90,180].includes(a.aspect))hard++;if([60,120].includes(a.aspect))soft++}return hard&&soft?'Enjeux contrastés':hard?'Tensions ou décisions exigeantes':soft?'Ouvertures et appuis':'Activation importante, sans sens favorable ou défavorable automatique'}
function narr(cat,context,signals,profection){const c=CATS[cat];if(cat==='famille'&&['grossesse','petitenfant'].includes(context))return c.scenes[1];if(cat==='famille'&&((signals||[]).some(x=>[5,9].includes(Number(x.natalHouse)))||[5,9].includes(profection?.house)))return 'Enfants et descendance : grossesse, naissance, arrivée d’un enfant ou événement important concernant les enfants figurent parmi les manifestations astrologiques de cette période.';if(cat==='relation'&&context==='separation')return c.scenes[1];if(cat==='relation'&&context==='couple')return c.scenes[2];if(cat==='finances'&&context==='finances')return c.scenes[1];if(cat==='logement'&&context==='immobilier')return c.scenes[1];if(cat==='travail'&&context==='travail')return c.scenes[1];if(cat==='famille'&&context==='deuil')return 'Réorganisation familiale en lien avec le deuil déjà vécu, sans prédiction d’un autre décès.';
 const difficult=(signals||[]).filter(x=>[90,180].includes(x.aspect)).length>=1;
 if(difficult&&cat==='relation')return 'Engagement ou couple sous tension : confrontation, éloignement, séparation ou divorce si la relation est fragilisée ; un réaménagement des accords est également possible.';
 if(difficult&&cat==='travail')return 'Changement professionnel exigeant : conflit, rupture ou renégociation de contrat, restructuration ou changement important de fonction.';
 if(difficult&&cat==='finances')return 'Arbitrage financier important : dépenses, dettes, indemnités ou modification des ressources et des obligations contractuelles.';
 if(difficult&&cat==='logement')return 'Modification importante du cadre de vie : vente, travaux, départ, changement de foyer ou tensions autour du logement.';
 if(difficult&&cat==='famille')return 'Événement familial demandant une adaptation : responsabilités, tensions, réorganisation des liens ou de la vie familiale.';
 return c.scenes[0]}
function bucketResult(b,point,cycle,sky,context,selected){
 const all=[];
 for(const k of ['slowTransits','progressions','solarArcDirections'])for(const a of point?.[k]||[])all.push(a);
 for(const a of cycle?.fullPrimary?.points||[])if(a.date>=b.start&&a.date<b.end)all.push(a);
 for(const e of sky?.eclipses||[])if(e.dateUtc?.slice(0,10)>=b.start&&e.dateUtc?.slice(0,10)<b.end)for(const a of e.zodiac?.natalContacts||[])all.push({...a,method:'eclipse',source:'Éclipse '+e.type});
 const groups={};for(const a of all)for(const d of domainFor(a)) (groups[d]||(groups[d]=[])).push(a);
 const out=[];for(const [domain,rows] of Object.entries(groups)){
   if(selected!=='all'&&selected!==domain)continue;
   const keys=new Set(rows.map(x=>x.method)),distinct=[...new Set(rows.map(x=>[x.method,x.source,x.target,x.aspect].join('|')))];
   const primary=rows.filter(x=>['direction_arc_solaire','direction_primaire_placidus','progression_secondaire'].includes(x.method));
   const long=rows.filter(x=>x.method==='transit_lent');
   const theme=point?.profection?.house;
   const relHouse={famille:[4,5,9],relation:[5,7],travail:[6,10],finances:[2,8],logement:[4],personnel:[1,12]}[domain]||[];
   const profection=relHouse.includes(theme)?point.profection:null;
   const relevance=keys.size>=2&&(primary.length||long.length)?'Convergence de plusieurs techniques':'Signal isolé ou répétitif';
   const order=rows.slice().sort((a,b)=>(a.orb??1)-(b.orb??1)).slice(0,5);
   if(keys.size<2)continue;
   out.push({domain,distinct,rows,methods:keys.size,rank:(keys.size>=2?12:0)+Math.min(8,distinct.length)+primary.length*2+(profection?2:0),relevance,profection,context,order,mood:mood(rows)});
 }
 return out.sort((a,b)=>b.rank-a.rank).slice(0,selected==='all'?3:5);
}
/* Independent technical indicators are combined in memory; no astrology jargon is
   printed in the public report. Every displayed date is an astronomical timing
   anchor, never an invented exact date of a future life event. */
function actualDate(s){
 const x=String(s||'').slice(0,10);
 return /^\d{4}-\d{2}-\d{2}$/.test(x)&&!isNaN(Date.parse(x+'T12:00:00Z'))?x:null;
}
function separation(a,b){return Math.abs((Date.parse(a+'T12:00:00Z')-Date.parse(b+'T12:00:00Z'))/86400000)}
function nearby(d,n){return iso(new Date(Date.parse(d+'T12:00:00Z')+n*86400000))}
function datedSignals(specs,methods,cycle,sky,lunar){
 const signals=[];
 const push=(day,domain,a,precision='repère')=>{
   const date=actualDate(day);if(!date||!CATS[domain])return;
   signals.push({date,domain,method:a.method,source:a.source||a.promissor||'',target:a.target||a.significator||'',aspect:Number(a.aspect),natalHouse:a.natalHouse||0,orb:Number(a.orb)||0,precision});
 };
 for(let i=0;i<specs.length;i++){
  const m=methods?.points?.[i]||{};
  for(const s of m.slowTransits||[]){
   const date=actualDate(s.observedDate);if(!date)continue;
   for(const d of domainFor(s))push(date,d,s,'relevé de transit');
  }
  for(const key of ['progressions','solarArcDirections']){
   for(const s of m[key]||[]){
     // Monthly midpoints are *not* exact aspect dates and cannot anchor a dated result.
     // They are admitted only as corroboration inside the same month.
     for(const d of domainFor(s))signals.push({date:specs[i].start,domain:d,method:s.method,background:true,month:specs[i].start.slice(0,7),source:s.source,target:s.target,aspect:Number(s.aspect),orb:Number(s.orb)});
   }
  }
 }
 for(const x of cycle?.fullPrimary?.points||[])for(const d of domainFor(x))push(x.date,d,x,'direction');
 for(const kind of ['spirit','fortune']){
  for(const x of cycle?.transitions?.[kind]||[]){
   if(x.level>2)continue;
   const a={method:'zodiacal_releasing_'+kind,source:kind,aspect:null};
   for(const d of ['travail','famille','relation','logement','finances'])push(x.date,d,a,'changement de période');
  }
 }
 for(const e of sky?.eclipses||[]){
   for(const x of e.zodiac?.natalContacts||[]){
    const a={...x,method:'eclipse',source:'éclipse'};
    for(const d of domainFor(a))push(e.dateUtc,d,a,'éclipse');
   }
 }
 for(const x of lunar?.returns||[]){
   if(!x.housesAvailable)continue;
   if(x.houseV?.length)push(x.date,'famille',{method:'revolution_lunaire',source:'retour lunaire',aspect:null},'retour');
   if(x.houseIX?.length)push(x.date,'famille',{method:'revolution_lunaire',source:'retour lunaire',aspect:null},'retour');
 }
 return signals;
}
/* A birth is not inferred from a generic Moon, Venus, or family signal.
   Use natal fifth-house rulership and distinct techniques to decide whether
   this scenario even deserves to be named in a tentative, undated reading. */
function natalFifth(p){
 try{
  const natal=A.natal(p),cusps=natal?.houses;
  let cusp=Array.isArray(cusps)?(cusps.length>=13?cusps[5]:cusps[4]):(cusps?.H5??cusps?.[5]??cusps?.['5']);
  if(cusp===null||cusp===undefined||!Number.isFinite(Number(cusp)))return null;
  cusp=((Number(cusp)%360)+360)%360;
  const ruler=['Mars','Vénus','Mercure','Lune','Soleil','Mercure','Vénus','Mars','Jupiter','Saturne','Saturne','Jupiter'][Math.floor(cusp/30)];
  return {ruler,cusp};
 }catch(e){return null}
}
function canonPlanet(x){return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function childbirthCandidate(signals,fifth){
 if(!fifth)return false;
 const accepted=new Set(['transit_lent','progression_secondaire','direction_arc_solaire','direction_primaire_placidus','eclipse']);
 const strict=signals.filter(s=>accepted.has(s.method));
 const fifthLinks=strict.filter(s=>s.natalHouse===5||canonPlanet(s.target)===canonPlanet(fifth.ruler));
 const methods=new Set(fifthLinks.map(s=>s.method));
 const rulerMethods=new Set(fifthLinks.filter(s=>canonPlanet(s.target)===canonPlanet(fifth.ruler)).map(s=>s.method));
 const structural=['progression_secondaire','direction_arc_solaire','direction_primaire_placidus'];
 const structuralHit=structural.some(m=>methods.has(m));
 const slowHit=methods.has('transit_lent')||methods.has('eclipse');
 // Multiple distinct contacts, including specifically the *ruler* of house V:
 // a repeated monthly Moon/Venus contact can never pass.
 return methods.size>=3 && rulerMethods.size>=2 && structuralHit && slowHit;
}
function chooseTitle(domain,arr,birthFlag){
 const tension=arr.some(x=>Number.isFinite(x.aspect)&&[90,180].includes(x.aspect));
 if(domain==='famille'){
  if(birthFlag)return 'Naissance ou arrivée d’un enfant possible';
  const childFocus=arr.some(x=>Number(x.natalHouse)===5);
  return childFocus?'Événement important concernant les enfants':'Changement important dans la famille';
 }
 if(domain==='relation')return tension?'Changement décisif dans le couple':'Rencontre ou évolution de la vie sentimentale';
 if(domain==='travail')return tension?'Changement professionnel exigeant':'Évolution professionnelle importante';
 if(domain==='finances')return tension?'Décision financière ou patrimoniale exigeante':'Évolution financière importante';
 if(domain==='logement')return 'Déménagement ou décision immobilière importante';
 return 'Tournant personnel majeur';
}
function eventsWithDates(specs,methods,cycle,sky,lunar,wanted,subject){
 const signals=datedSignals(specs,methods,cycle,sky,lunar);
 const fifth=natalFifth(subject);
 const anchors=signals.filter(s=>!s.background&&!s.method.startsWith('zodiacal_releasing_'));
 const candidates=[];
 for(const a of anchors){
  if(wanted!=='all'&&a.domain!==wanted)continue;
  if(a.domain==='personnel')continue;
  const around=signals.filter(s=>s.domain===a.domain&&(s.background?s.month===a.date.slice(0,7):separation(s.date,a.date)<=9));
  const techniques=new Set(around.filter(s=>!s.method.startsWith('zodiacal_releasing_')).map(s=>s.method));
  const hasStructural=around.some(s=>['direction_primaire_placidus','direction_arc_solaire','progression_secondaire','transit_lent','eclipse'].includes(s.method));
  if(techniques.size<2||!hasStructural)continue;
  const anchorsFound=around.filter(s=>!s.background&&s.method!=='revolution_lunaire'&&!s.method.startsWith('zodiacal_releasing_'));
  if(!anchorsFound.length)continue;
  const aspectSupport=around.filter(s=>!s.background&&s.orb<=0.3).length;
  const rating=techniques.size*4+Math.min(5,aspectSupport)+Math.min(4,anchorsFound.length);
  const birthFlag=a.domain==='famille'&&childbirthCandidate(around,fifth);
  candidates.push({date:a.date,domain:a.domain,rating,birthFlag,methods:techniques.size,
    windowDays:a.precision==='relevé de transit'?5:3,around});
 }
 candidates.sort((a,b)=>b.rating-a.rating||a.date.localeCompare(b.date));
 const selected=[];
 for(const e of candidates){
  // Long-lived transits create many nearby dates, but not repeated life events.
  if(selected.some(x=>x.domain===e.domain&&separation(x.date,e.date)<=90))continue;
  selected.push(e);
 }
 // Birth is treated as an exceptional event and is never repeated in successive
 // months/years simply because fifth-house indicators recur.
 const prioritized=selected.filter(x=>x.domain==='famille'&&x.birthFlag)
   .sort((a,b)=>b.rating-a.rating||a.date.localeCompare(b.date));
 const allowedBirths=[];
 for(const e of prioritized){
  if(!allowedBirths.some(x=>separation(x.date,e.date)<(3*365)))allowedBirths.push(e);
 }
 const birthSet=new Set(allowedBirths);
 for(const e of selected){
  e.birthFlag=e.domain==='famille'&&birthSet.has(e);
  e.title=chooseTitle(e.domain,e.around,e.birthFlag);
 }
 // A selective timeline, without a repetitive event for every month.
 const maximum=Math.max(2,Math.ceil(specs.length/12)*4);
 return selected.slice(0,maximum).sort((a,b)=>a.date.localeCompare(b.date));
}
function renderEntries(rows,cycle,sky,p,context,solarReturns,lunar,technical,comparison){
 const holder=qs('#ap-events-output');if(!holder)return;
 const events=eventsWithDates(rows.map(r=>r.b),technical,cycle,sky,lunar,category,p);
 let output='<div class="ap-events-card"><h2>Dates des événements majeurs</h2><p>Profil : <strong>'+es(p.prenom||'Profil actif')+'</strong></p></div>';
 if(!events.length)output+='<div class="ap-events-card"><h2>Aucun événement majeur suffisamment marqué</h2><p>Il n’y a pas de date justifiable à afficher pour la période choisie.</p></div>';
 for(const x of events){
  const from=nearby(x.date,-x.windowDays),to=nearby(x.date,x.windowDays);
  output+='<div class="ap-events-card ap-major-dated"><span class="ap-events-pill">'+es(CATS[x.domain].name)+'</span>'
   +'<h2 style="margin:12px 0 8px">'+es(x.title)+'</h2>'
   +'<p style="font-size:19px;font-weight:700;margin:8px 0">Autour du '+es(fmt(x.date))+'</p>'
   +'<p>Fenêtre à examiner : du '+es(fmt(from))+' au '+es(fmt(to))+'.</p>'
   +'</div>';
 }
 holder.innerHTML=output;
 latest=output;qs('#ap-events-copy').disabled=false;
 return events;
}
function loadScript(path,global){return new Promise((resolve,reject)=>{
 if(window[global]){resolve();return}
 const tag=document.createElement('script');tag.src=path+'?v='+VERSION;tag.onload=()=>window[global]?resolve():reject(Error('Module '+global+' absent après chargement'));tag.onerror=()=>reject(Error('Chargement impossible : '+path));document.head.appendChild(tag);
 })}
async function getMethods(){if(!window.APForecastMethods)await loadScript('assets/v190-forecast-techniques.js','APForecastMethods');if(!window.APEventCycles)await loadScript('assets/v201-event-cycles.js','APEventCycles');if(!window.APPrimaryDirections)await loadScript('assets/v202-primary-directions.js','APPrimaryDirections');if(!window.APLunarReturns)await loadScript('assets/v203-lunar-returns.js','APLunarReturns')}
async function analyzeProfile(p,spec,alive){
 if((p.timeStatus||'exact')!=='exact')throw Error('Heure de naissance exacte nécessaire pour les directions primaires et les angles des maisons.');
 const now=Date.now();const truth={start:spec[0].start,end:spec[spec.length-1].end,points:spec.map(s=>({...s})),months:spec.length};
 const M=window.APForecastMethods;
 const location=window.APForecastSolarLocations?.getLocations?.()||{};
 const methods=await M.compute({A,profile:p,truth,locations:location,jobActive:alive});
 if(!alive())throw Error('Analyse interrompue');
 const cycle=window.APEventCycles.compute(A,p,truth.start,truth.end);
 const fullPrimary=window.APPrimaryDirections.compute(A,p,truth.start,truth.end);cycle.fullPrimary=fullPrimary;
 let sky=null;
 try{
   if(!window.APForecastSkyEvents)await loadScript('assets/v191-forecast-eclipses.js','APForecastSkyEvents');
   if(window.Astronomy)sky=await window.APForecastSkyEvents.compute({truth,natal:A.natal(p),jobActive:alive});
 }catch(e){console.warn('Éclipses non disponibles :',e?.message||e)}
 let lunar=null;
 try{
  lunar=await window.APLunarReturns.compute({A,profile:p,start:truth.start,end:truth.end,jobActive:alive});
 }catch(e){console.warn('Révolutions lunaires non disponibles',e?.message||e)}
 return {methods,cycle,sky,lunar,finishedAt:now};
}
async function runForecast(){
 const p=profile();if(!ok(p))return;
 months=Number(qs('#ap-events-horizon').value)||12;category=qs('#ap-events-category').value;
 const target=qs('#ap-events-family').value;const other=target?A.listProfiles().find(x=>pkey(x)===target):null;
 const selectedContext='aucun',myJob=++job,alive=()=>opened&&job===myJob&&baseAccount===email();
 const run=qs('#ap-events-run');run.disabled=true;qs('#ap-events-output').innerHTML='';qs('#ap-events-copy').disabled=true;
 try{
  await getMethods();if(!alive())return;
  const specs=monthSpecs(months);
  setStatus('Calcul des transits, progressions, directions et cycles pour '+es(p.prenom||'le profil')+'…');
  const r=await analyzeProfile(p,specs,alive);if(!alive())return;
  const entries=specs.map((b,i)=>({b,point:r.methods.points?.[i],events:bucketResult(b,r.methods.points?.[i],r.cycle,r.sky,selectedContext,category)}));
  renderEntries(entries,r.cycle,r.sky,p,selectedContext,r.methods.solarReturns,r.lunar,r.methods);
  if(other&&ok(other)){
    if(months>24){qs('#ap-events-output').insertAdjacentHTML('beforeend','<div class="ap-events-card">Le croisement familial est limité à 24 mois pour éviter des calculs excessifs. Le profil principal reste analysé sur l’horizon choisi.</div>')}
    const subset=specs.slice(0,months>24?8:specs.length);
    setStatus('Croisement avec le profil '+es(other.prenom||'secondaire')+'…');
    const r2=await analyzeProfile(other,subset,alive);if(!alive())return;
    const rows=subset.map((b,i)=>({b,point:r2.methods.points?.[i],events:bucketResult(b,r2.methods.points?.[i],r2.cycle,r2.sky,ctx(other),category)}));
    const dates1=eventsWithDates(specs,r.methods,r.cycle,r.sky,r.lunar,category,p),dates2=eventsWithDates(subset,r2.methods,r2.cycle,r2.sky,r2.lunar,category,other);const overlap=dates1.filter(x=>dates2.some(y=>x.domain===y.domain&&separation(x.date,y.date)<=9)).map(x=>fmt(x.date));
    qs('#ap-events-output').insertAdjacentHTML('beforeend','<div class="ap-events-card"><h2>Comparaison familiale : '+es(other.prenom||'autre profil')+'</h2><p>'+ (overlap.length?'Dates présentant un rapprochement dans les deux profils : '+es(overlap.slice(0,10).join(' ; '))+'.':'Aucune date commune suffisamment marquée pour ce filtre.')+'</p><p class="muted">Deux activations simultanées ne démontrent pas qu’un même événement se produira.</p></div>');
  }
  setStatus('Recherche terminée. Seules les périodes ayant plusieurs indications concordantes sont présentées.');
 }catch(e){if(alive()){console.error('Événements majeurs :',e);setStatus('Analyse non disponible : '+(e?.message||String(e)));}}
 finally{if(alive())run.disabled=false}
}
function renderHistory(){
 const p=profile(),holder=qs('#ap-events-content');
 const rows=loadData().events.filter(e=>e.profile===pkey(p)).sort((a,b)=>a.date.localeCompare(b.date));
 holder.innerHTML='<div class="ap-events-card"><h2>Journal des événements vécus</h2><p>Notez les grands événements positifs ou difficiles avec leurs dates réelles. Ils serviront à comparer les configurations rétrospectives, sans modifier les calculs pour les faire correspondre.</p>'
 +'<div class="ap-events-fields"><label>Date de l’événement<input type="date" id="ap-event-when" required></label><label>Type d’événement<select id="ap-event-type">'+Object.entries(TYPES).map(([k,v])=>'<option value="'+k+'">'+es(v)+'</option>').join('')+'</select></label></div>'
 +'<label style="display:block;margin:12px 0 6px">Description facultative<textarea id="ap-event-note" rows="2" maxlength="350" placeholder="Précisez les circonstances, sans données inutiles sur des tiers"></textarea></label>'
 +'<button class="ap-events-btn primary" id="ap-event-save">Enregistrer l’événement</button><p class="muted">Historique conservé sur cet appareil, dans le compte connecté. Il n’est pas encore synchronisé entre appareils.</p></div>'
 +'<div class="ap-events-card"><h2>Historique de '+es(p.prenom||'ce profil')+'</h2><div id="ap-events-history">'+(rows.length?rows.map(e=>'<div class="ap-events-row" style="border-bottom:1px solid #ead9e3;padding:10px 0"><div><strong>'+es(fmt(e.date))+' · '+es(TYPES[e.type]||e.type)+'</strong><p class="muted">'+es(e.note||'')+'</p></div><button class="ap-events-btn" data-ap-delete="'+es(e.id)+'">Supprimer</button></div>').join(''):'<p>Aucun événement enregistré pour ce profil.</p>')+'</div></div>';
 qs('#ap-event-save').onclick=()=>{
   const date=qs('#ap-event-when').value,type=qs('#ap-event-type').value,note=qs('#ap-event-note').value.trim();
   if(!/^\d{4}-\d\d-\d\d$/.test(date)||Number.isNaN(toDate(date).getTime())){alert('Choisissez une date valide.');return}
   const d=loadData();if(d.events.length>=150){alert('Limite de 150 événements par compte.');return}
   d.events.push({id:String(Date.now())+'-'+Math.random().toString(36).slice(2,9),profile:pkey(p),date,type,note});
   try{persist(d);renderHistory()}catch(e){alert('Enregistrement impossible : '+e.message)}
 };
 qsa('[data-ap-delete]',holder).forEach(btn=>btn.onclick=()=>{if(!confirm('Supprimer cet événement du journal ?'))return;const d=loadData();d.events=d.events.filter(x=>x.id!==btn.dataset.apDelete);persist(d);renderHistory()});
}
function apply(){
 if(applying)return;pending=false;applying=true;
 try{
  if(observer)observer.disconnect();
  addCss();
  if(opened&&(email()!==baseAccount||!window.USER_CONNECTE||document.body.classList.contains('ap-auth-open')))close();
  decorate();
 }finally{applying=false;if(observer)observer.observe(qs('#ap-final-root')||document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']})}
}
function schedule(){if(pending||applying)return;pending=true;requestAnimationFrame(apply)}
function start(){observer=new MutationObserver(schedule);schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.APEventsV201={version:VERSION,open,close};
})();