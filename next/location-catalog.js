(function(){
'use strict';
const E=window.AstroEngine;
if(!E||typeof E.searchCities!=='function')throw new Error('Catalogue de lieux : moteur indisponible');
// Données complémentaires issues de GeoNames (www.geonames.org), utilisées sous licence CC BY.
// Source vérifiée le 26/09/2026. Le fuseau civil des villes italiennes ci-dessous est Europe/Rome.
const EXTRA_CITIES=[
  {nom:'Roma',fr:'Rome',aliases:['roma','rome'],pays:'Italie',lat:41.891934052998856,lon:12.51132607922509,tz:'Europe/Rome'},
  {nom:'Napoli',fr:'Naples',aliases:['napoli','naples'],pays:'Italie',lat:40.85216,lon:14.26811,tz:'Europe/Rome'},
  {nom:'Milano',fr:'Milan',aliases:['milano','milan'],pays:'Italie',lat:45.4642693810258,lon:9.1895055770874,tz:'Europe/Rome'},
  {nom:'Torino',fr:'Turin',aliases:['torino','turin'],pays:'Italie',lat:45.0704898496472,lon:7.68682479858398,tz:'Europe/Rome'},
  {nom:'Firenze',fr:'Florence',aliases:['firenze','florence'],pays:'Italie',lat:43.77925380701532,lon:11.246261761337584,tz:'Europe/Rome'},
  {nom:'Palermo',fr:'Palerme',aliases:['palermo','palerme'],pays:'Italie',lat:38.1166,lon:13.3636,tz:'Europe/Rome'},
  {nom:'Bologna',fr:'Bologne',aliases:['bologna','bologne'],pays:'Italie',lat:44.4938114812334,lon:11.3387489318848,tz:'Europe/Rome'},
  {nom:'Bari',fr:'Bari',aliases:['bari'],pays:'Italie',lat:41.12066,lon:16.86982,tz:'Europe/Rome'},
  {nom:'Rimini',fr:'Rimini',aliases:['rimini'],pays:'Italie',lat:44.05754522920029,lon:12.56527557325842,tz:'Europe/Rome'},
  {nom:'Modena',fr:'Modène',aliases:['modena','modene','modène'],pays:'Italie',lat:44.64783400724508,lon:10.92538833618164,tz:'Europe/Rome'},
  {nom:'Trieste',fr:'Trieste',aliases:['trieste'],pays:'Italie',lat:45.64953,lon:13.77678,tz:'Europe/Rome'},
  {nom:'Catania',fr:'Catane',aliases:['catania','catane'],pays:'Italie',lat:37.49223188203155,lon:15.07041272681263,tz:'Europe/Rome'},
  {nom:'Cagliari',fr:'Cagliari',aliases:['cagliari'],pays:'Italie',lat:39.230535238453236,lon:9.119168121428238,tz:'Europe/Rome'},
  {nom:'Taranto',fr:'Tarente',aliases:['taranto','tarente'],pays:'Italie',lat:40.46438,lon:17.24707,tz:'Europe/Rome'},
  {nom:'Potenza',fr:'Potenza',aliases:['potenza'],pays:'Italie',lat:40.64175080592058,lon:15.807940565001758,tz:'Europe/Rome'},
  {nom:'Pisa',fr:'Pise',aliases:['pisa','pise'],pays:'Italie',lat:43.70853454720805,lon:10.403598511775325,tz:'Europe/Rome'},
  {nom:'Perugia',fr:'Pérouse',aliases:['perugia','perouse','pérouse'],pays:'Italie',lat:43.112195741543545,lon:12.388780117034912,tz:'Europe/Rome'},
  {nom:'Livorno',fr:'Livourne',aliases:['livorno','livourne'],pays:'Italie',lat:43.544265152344494,lon:10.326152711826676,tz:'Europe/Rome'},
  {nom:'Genova',fr:'Gênes',aliases:['genova','genes','gênes','genoa'],pays:'Italie',lat:44.40478,lon:8.94439,tz:'Europe/Rome'},
  {nom:'Forlì',fr:'Forlì',aliases:['forli','forlì'],pays:'Italie',lat:44.22177,lon:12.04144,tz:'Europe/Rome'},
  {nom:'Ferrara',fr:'Ferrare',aliases:['ferrara','ferrare'],pays:'Italie',lat:44.83804,lon:11.62057,tz:'Europe/Rome'},
  {nom:'Brescia',fr:'Brescia',aliases:['brescia'],pays:'Italie',lat:45.53558328241292,lon:10.214722667806893,tz:'Europe/Rome'},
  {nom:'Bolzano',fr:'Bolzano',aliases:['bolzano','bozen'],pays:'Italie',lat:46.49067156646696,lon:11.339821130180834,tz:'Europe/Rome'},
  {nom:'Ancona',fr:'Ancône',aliases:['ancona','ancone','ancône'],pays:'Italie',lat:43.60717,lon:13.5103,tz:'Europe/Rome'},
  {nom:'Verona',fr:'Vérone',aliases:['verona','verone','vérone'],pays:'Italie',lat:45.43853887868985,lon:10.993798207572276,tz:'Europe/Rome'},
  {nom:'Venezia',fr:'Venise',aliases:['venezia','venise','venice'],pays:'Italie',lat:45.4371342147904,lon:12.332650434521076,tz:'Europe/Rome'},
  {nom:'Trento',fr:'Trente',aliases:['trento','trente'],pays:'Italie',lat:46.0678714011874,lon:11.1210823059082,tz:'Europe/Rome'},
  {nom:'Siracusa',fr:'Syracuse',aliases:['siracusa','syracuse'],pays:'Italie',lat:37.07542,lon:15.28664,tz:'Europe/Rome'},
  {nom:'Messina',fr:'Messine',aliases:['messina','messine'],pays:'Italie',lat:38.19393661132784,lon:15.552559966639844,tz:'Europe/Rome'},
  {nom:'Catanzaro',fr:'Catanzaro',aliases:['catanzaro'],pays:'Italie',lat:38.88247239952063,lon:16.600860986085152,tz:'Europe/Rome'},
  {nom:'Terni',fr:'Terni',aliases:['terni'],pays:'Italie',lat:42.56335,lon:12.64329,tz:'Europe/Rome'},
  {nom:'Siena',fr:'Sienne',aliases:['siena','sienne'],pays:'Italie',lat:43.31822,lon:11.33064,tz:'Europe/Rome'},
  {nom:'Salerno',fr:'Salerne',aliases:['salerno','salerne'],pays:'Italie',lat:40.675454993712464,lon:14.793277245858185,tz:'Europe/Rome'},
  {nom:'Como',fr:'Côme',aliases:['como','come','côme'],pays:'Italie',lat:45.80819,lon:9.0832,tz:'Europe/Rome'},
  {nom:'Cesena',fr:'Césène',aliases:['cesena','cesene','césène'],pays:'Italie',lat:44.13910215406817,lon:12.243146896362305,tz:'Europe/Rome'},
  {nom:'Alessandria',fr:'Alexandrie',aliases:['alessandria','alexandrie'],pays:'Italie',lat:44.909235669983154,lon:8.610073801160066,tz:'Europe/Rome'},
  {nom:'Ravenna',fr:'Ravenne',aliases:['ravenna','ravenne'],pays:'Italie',lat:44.413437735941386,lon:12.201212187178747,tz:'Europe/Rome'}
];
let worldConfigured=null;
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()}
function score(city,q){const n=norm(q);if(!n)return 99;const aliases=[city.nom,city.fr,...(city.aliases||[])].map(norm);if(aliases.some(a=>a===n))return 0;if(aliases.some(a=>a.startsWith(n)))return 1;if(aliases.some(a=>a.includes(n)))return 2;return 99}
function extraSearch(q){return EXTRA_CITIES.map(c=>({c,s:score(c,q)})).filter(x=>x.s<99).sort((a,b)=>a.s-b.s||a.c.nom.localeCompare(b.c.nom,'fr')).map(({c})=>({label:`${c.fr} / ${c.nom} — Italie · GeoNames`,nom:c.nom,pays:c.pays,lat:c.lat,lon:c.lon,tz:c.tz,source:'GeoNames'}))}
function uiLang(){const l=String(document.documentElement.lang||navigator.language||'fr').toLowerCase().slice(0,2);return ['fr','en','es','ar'].includes(l)?l:'fr'}
async function worldSearch(q){if(worldConfigured===false)return[];try{const r=await fetch(`/api/locations/search?q=${encodeURIComponent(q)}&lang=${encodeURIComponent(uiLang())}`,{cache:'no-store'});if(r.status===404||r.status===503){worldConfigured=false;return[]}if(!r.ok)return[];const data=await r.json().catch(()=>({}));worldConfigured=data.configured!==false;return Array.isArray(data.results)?data.results:[]}catch(e){return[]}}
const baseSearch=E.searchCities.bind(E);
E.searchCities=async function(q){const [baseResult,worldResult]=await Promise.allSettled([baseSearch(q),worldSearch(q)]);const base=baseResult.status==='fulfilled'?(baseResult.value||[]):[],world=worldResult.status==='fulfilled'?(worldResult.value||[]):[],extra=extraSearch(q),all=[...extra,...base,...world],seen=new Set(),out=[];for(const r of all){const lat=Number(r.lat),lon=Number(r.lon);if(!Number.isFinite(lat)||!Number.isFinite(lon)||!String(r.tz||'').trim())continue;const k=`${norm(r.nom)}|${norm(r.pays)}|${lat.toFixed(4)}|${lon.toFixed(4)}`;if(seen.has(k))continue;seen.add(k);out.push(r);if(out.length>=10)break}return out};
window.AstroLocationCatalog={count:EXTRA_CITIES.length,countries:['IT'],source:'GeoNames',license:'CC BY',attribution:'GeoNames — www.geonames.org',worldSearch:'optional-backend'};
})();
