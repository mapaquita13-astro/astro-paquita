/* Astro Paquita V169 — Maisons natales fidèles au moteur V121.
   Aucun calcul astrologique n'est remplacé : ce raccord expose les numéros de
   maisons déjà déterminables par V121 et redessine la roue avec les vraies
   cuspides retournées par AstroTruth.natal(). */
(function(){
'use strict';
if(window.__AP_V169_NATAL_HOUSES__)return;
window.__AP_V169_NATAL_HOUSES__=true;

const GLYPHS={Soleil:'☉',Lune:'☽',Mercure:'☿','Vénus':'♀',Venus:'♀',Mars:'♂',Jupiter:'♃',Saturne:'♄',Uranus:'♅',Neptune:'♆',Pluton:'♇',Noeud:'☊'};
const SVG_NS='http://www.w3.org/2000/svg';

function norm(v){
  v=Number(v);
  return Number.isFinite(v)?((v%360)+360)%360:null;
}
function v121House(lon,cusps){
  if(typeof window.prevHouseNumberFromCuspsV88!=='function')return null;
  try{return window.prevHouseNumberFromCuspsV88(Number(lon),cusps);}catch(e){return null;}
}
function enrichNatal(t){
  if(!t||!t.positions||!t.houses)return t;
  const planetHouses={};
  Object.entries(t.positions).forEach(([name,lon])=>{
    if(!Number.isFinite(Number(lon)))return;
    const h=v121House(lon,t.houses);
    if(h)planetHouses[name]=h;
  });
  // On ajoute seulement une donnée dérivée par LA fonction V121 existante.
  // Les positions, angles et cuspides ne sont jamais modifiés.
  t.planetHouses=planetHouses;
  return t;
}

function installTruthBridge(){
  if(!window.AstroTruth||window.AstroTruth.__v169NatalWrapped)return false;
  const original=window.AstroTruth.natal;
  if(typeof original!=='function')return false;
  window.AstroTruth.natal=function(profile){return enrichNatal(original.call(window.AstroTruth,profile));};
  window.AstroTruth.__v169NatalWrapped=true;
  return true;
}

function add(svg,tag,attrs,text){
  const el=document.createElementNS(SVG_NS,tag);
  Object.entries(attrs||{}).forEach(([k,v])=>el.setAttribute(k,String(v)));
  if(text!==undefined)el.textContent=String(text);
  svg.appendChild(el);
  return el;
}
function point(deg,r,cx,cy){
  const a=(norm(deg)-90)*Math.PI/180;
  return [cx+r*Math.cos(a),cy+r*Math.sin(a)];
}
function houseMid(a,b){
  a=norm(a);b=norm(b);
  if(a===null||b===null)return null;
  const span=((b-a)%360+360)%360;
  return norm(a+span/2);
}
function buildWheel(t){
  const positions=t.positions||{},cusps=t.houses||{},cx=200,cy=200,R=172,zodiacInner=139,planetR=118,houseLabelR=73;
  const svg=document.createElementNS(SVG_NS,'svg');
  svg.setAttribute('class','ap-wheel');
  svg.setAttribute('viewBox','0 0 400 400');
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label','Roue natale avec les maisons V121');
  svg.dataset.v169='1';

  add(svg,'circle',{cx,cy,r:R,fill:'#fff9f0',stroke:'#7a4c65','stroke-width':1});
  add(svg,'circle',{cx,cy,r:zodiacInner,fill:'none',stroke:'#cbb297','stroke-width':1});

  // Limites des signes : uniquement dans la couronne extérieure.
  for(let i=0;i<12;i++){
    const [x1,y1]=point(i*30,zodiacInner,cx,cy),[x2,y2]=point(i*30,R,cx,cy);
    add(svg,'line',{x1:x1.toFixed(2),y1:y1.toFixed(2),x2:x2.toFixed(2),y2:y2.toFixed(2),stroke:'#e0d2c4','stroke-width':0.8});
  }

  // Vraies cuspides de maisons calculées par V121.
  for(let h=1;h<=12;h++){
    const cusp=Number(cusps['H'+h]);
    if(!Number.isFinite(cusp))continue;
    const [x2,y2]=point(cusp,zodiacInner,cx,cy);
    const strong=h===1||h===4||h===7||h===10;
    add(svg,'line',{x1:cx,y1:cy,x2:x2.toFixed(2),y2:y2.toFixed(2),stroke:strong?'#9a7047':'#bca58f','stroke-width':strong?1.7:1.05});
    const next=Number(cusps['H'+(h===12?1:h+1)]),mid=houseMid(cusp,next);
    if(mid!==null){
      const [tx,ty]=point(mid,houseLabelR,cx,cy);
      add(svg,'text',{x:tx.toFixed(2),y:ty.toFixed(2),'text-anchor':'middle','dominant-baseline':'central','font-size':11,'font-family':'Lato, Arial, sans-serif',fill:'#8b776d'},h);
    }
  }

  // Planètes : leur longitude V121 est conservée telle quelle.
  let idx=0;
  Object.entries(positions).forEach(([name,lon])=>{
    if(!GLYPHS[name]||!Number.isFinite(Number(lon)))return;
    const r=planetR-(idx%2)*14;idx++;
    const [x,y]=point(Number(lon),r,cx,cy);
    add(svg,'text',{x:x.toFixed(2),y:y.toFixed(2),'text-anchor':'middle','dominant-baseline':'central','font-size':17,fill:'#57304d'},GLYPHS[name]);
  });

  const asc=Number(t.angles&&t.angles.ascendant);
  if(Number.isFinite(asc)){
    const [x,y]=point(asc,R,cx,cy);
    add(svg,'circle',{cx:x.toFixed(2),cy:y.toFixed(2),r:5,fill:'#b58b52'});
  }
  add(svg,'circle',{cx,cy,r:3.2,fill:'#9a7047'});
  return svg;
}

function annotatePlanetRows(t,root){
  const houses=t&&t.planetHouses||{};
  root.querySelectorAll('.ap-planet-row').forEach(row=>{
    if(row.querySelector('.ap-v169-house'))return;
    const left=row.querySelector('span');
    if(!left)return;
    const label=(left.textContent||'').trim();
    const name=Object.keys(GLYPHS).find(k=>label.includes(k));
    const h=name&&houses[name];
    if(!h)return;
    const badge=document.createElement('small');
    badge.className='ap-v169-house';
    badge.textContent='Maison '+h;
    badge.style.cssText='display:inline-block;margin-left:8px;padding:2px 7px;border:1px solid #d9c6b2;border-radius:999px;color:#755b69;font-size:11px;font-weight:700;white-space:nowrap;';
    left.appendChild(badge);
  });
}

function patchNatalDom(){
  const root=document.getElementById('ap-final-root');
  if(!root)return;
  const oldWheel=root.querySelector('svg.ap-wheel');
  if(!oldWheel||oldWheel.dataset.v169==='1')return;
  let t;
  try{t=enrichNatal(window.AstroTruth&&window.AstroTruth.natal?window.AstroTruth.natal():null);}catch(e){return;}
  if(!t||!t.houses)return;
  oldWheel.replaceWith(buildWheel(t));
  annotatePlanetRows(t,root);
}

function start(){
  installTruthBridge();
  patchNatalDom();
  const root=document.getElementById('ap-final-root');
  if(root){
    const obs=new MutationObserver(()=>{installTruthBridge();patchNatalDom();});
    obs.observe(root,{childList:true,subtree:true});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
