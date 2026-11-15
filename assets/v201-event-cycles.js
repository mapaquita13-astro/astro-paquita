/* Astro Paquita — V201 : cycles majeurs calculables.
   Zodiacal Releasing traditionnel (annee = 360 jours, LB) et directions primaires
   meridiennes zodiacales (Naibod). Ne pas presenter ce sous-ensemble comme une
   table complete des directions primaires in-mundo. */
(function(){
'use strict';
if(window.APEventCycles)return;
const SIGNS=['Bélier','Taureau','Gémeaux','Cancer','Lion','Vierge','Balance','Scorpion','Sagittaire','Capricorne','Verseau','Poissons'];
const YEARS=[15,8,20,25,19,20,8,15,12,27,30,12];
const SEC=86400000,STEP=0.98564733,OBL=23.4366*Math.PI/180;
const mod=n=>(n%360+360)%360;
const sgn=n=>Math.floor(mod(n)/30);
const finite=n=>n!==null&&n!==undefined&&n!==''&&Number.isFinite(Number(n));
const pos=(map,n)=>{let v=map?.[n];if(!finite(v)&&n==='Vénus')v=map?.Venus;return finite(v)?Number(v):null;};
const iso=ms=>new Date(ms).toISOString().slice(0,10);
function seqAt(begin,end,startSign,level,when,collect){
 let left=begin,s=startSign,k=0,circuit=0,losing=false;
 const unit=level===1?360:level===2?30:level===3?2.5:5/24;
 while(left<end&&k<700){
   const right=Math.min(end,left+YEARS[s]*unit*SEC),value={sign:SIGNS[s],signIndex:s,level,start:iso(left),end:iso(right),startMs:left,endMs:right,loosingBond:losing};
   if(collect)collect.push(value);
   if(when>=left&&when<right)return value;
   left=right;k++;losing=false;
   if(level===1)s=(s+1)%12;
   else{
     circuit++;
     if(circuit===12){s=(startSign+6)%12;losing=true;}
     else s=(s+1)%12;
   }
 }
 return null;
}
function atLevel(from,to,sign,level,when){return seqAt(from,to,sign,level,when,null);}
function releasingAt(birthMs,lotSign,when){
 const lifeEnd=birthMs+125*365.2425*SEC;
 const path=[],a=atLevel(birthMs,lifeEnd,lotSign,1,when);
 if(!a)return null;
 path.push(a);
 for(let level=2;level<=4;level++){
   const parent=path[path.length-1];
   const part=atLevel(parent.startMs,parent.endMs,parent.signIndex,level,when);
   if(!part)break;
   path.push(part);
 }
 return path.map(p=>({level:p.level,sign:p.sign,start:p.start,end:p.end,loosingBond:p.loosingBond}));
}
function eventsIn(birthMs,lotSign,startMs,endMs){
 const endLife=birthMs+125*365.2425*SEC;
 const out=[];
 const L1=[];seqAt(birthMs,endLife,lotSign,1,endLife+1,L1);
 for(const l1 of L1){
   if(l1.endMs<startMs||l1.startMs>endMs)continue;
   if(l1.startMs>=startMs&&l1.startMs<=endMs)out.push({date:l1.start,level:1,sign:l1.sign,peak:false,loosingBond:false});
   const L2=[];seqAt(l1.startMs,l1.endMs,l1.signIndex,2,endLife+1,L2);
   for(const l2 of L2){
     if(l2.endMs<startMs||l2.startMs>endMs)continue;
     if(l2.startMs>=startMs&&l2.startMs<=endMs)out.push({date:l2.start,level:2,sign:l2.sign,loosingBond:l2.loosingBond});
   }
 }
 return out.sort((a,b)=>a.date.localeCompare(b.date));
}
function ra(lon){const x=mod(lon)*Math.PI/180;return mod(Math.atan2(Math.cos(OBL)*Math.sin(x),Math.cos(x))*180/Math.PI);}
function primaryMeridian(natal,birthMs,startMs,endMs){
 const mc=natal.angles?.mc;
 if(!finite(mc))return [];
 const targets=['Soleil','Lune','Mercure','Vénus','Mars','Jupiter','Saturne','Uranus','Neptune','Pluton'];
 const items=[],base=ra(Number(mc));
 for(const p of targets){const v=pos(natal.positions,p);if(v===null)continue;
   for(const aspect of [0,60,90,120,180]){
     for(const k of aspect===0||aspect===180?[1]:[1,-1]){
       const point=ra(v+aspect*k);
       for(const motion of ['directe','converse']){
         const arc=motion==='directe'?mod(point-base):mod(base-point);
         const age=arc/STEP;
         if(age>115||age<0.3)continue;
         const ms=birthMs+age*365.2425*SEC;
         if(ms<startMs||ms>endMs)continue;
         items.push({date:iso(ms),method:'direction_primaire_meridienne',motion,source:'MC',target:p,aspect,age:+age.toFixed(2),key:'Naibod 0,98564733°/an',precision:'longitude écliptique projetée en ascension droite, sans latitude planétaire; MC seulement'});
       }
     }
   }
 }
 return items.sort((a,b)=>a.date.localeCompare(b.date)).filter((x,i,arr)=>i===0||x.date!==arr[i-1].date||x.target!==arr[i-1].target||x.aspect!==arr[i-1].aspect||x.motion!==arr[i-1].motion);
}
function compute(A,p,start,end){
 if(!A?.computeProfile||!p)throw Error('Profil ou moteur natal indisponible');
 const natal=A.natal(p),raw=A.computeProfile(p),ms=(Number(raw.jd)-2440587.5)*SEC;
 if(!Number.isFinite(ms))throw Error('Heure de naissance à vérifier');
 const sun=pos(natal.positions,'Soleil'),moon=pos(natal.positions,'Lune'),asc=natal.angles?.ascendant;
 if(sun===null||moon===null||!finite(asc))throw Error('Positions ou Ascendant indisponibles');
 const M=window.APForecastMethods,sect=M?._test?.sectOf?.({...natal,rawJd:raw.jd,latitude:p.lat,longitude:p.lon})?.sect;
 if(!['nocturne','diurne'].includes(sect))return {available:false,reason:'Secte (jour/nuit) indéterminée : lots et Zodiacal Releasing non calculés',primary:primaryMeridian(natal,ms,Date.parse(start+'T00:00:00Z'),Date.parse(end+'T23:59:59Z'))};
 const f=mod(Number(asc)+(sect==='diurne'?moon-sun:sun-moon)),sp=mod(Number(asc)+(sect==='diurne'?sun-moon:moon-sun));
 const fortune=sgn(f),spiritRaw=sgn(sp),spirit=spiritRaw===fortune?(spiritRaw+1)%12:spiritRaw;
 const a=Date.parse(start+'T00:00:00Z'),b=Date.parse(end+'T23:59:59Z');
 const lots={fortune:{longitude:+f.toFixed(4),sign:SIGNS[fortune]},spirit:{longitude:+sp.toFixed(4),sign:SIGNS[spiritRaw],releasingSign:SIGNS[spirit],adjustedSameSign:spirit!==spiritRaw}};
 const current={fortune:releasingAt(ms,fortune,a),spirit:releasingAt(ms,spirit,a)};
 const transitions={fortune:eventsIn(ms,fortune,a,b),spirit:eventsIn(ms,spirit,a,b)};
 for(const part of ['fortune','spirit'])for(const ev of transitions[part]){
   const dist=(SIGNS.indexOf(ev.sign)-fortune+12)%12;
   ev.peak=([0,3,6,9].includes(dist));
   ev.peakLevel=dist===9?'fort':dist===0?'principal':dist===6?'intermédiaire':dist===3?'secondaire':null;
 }
 return {available:true,sect,lots,current,transitions,primary:primaryMeridian(natal,ms,a,b),
 conventions:'Valens / 360 jours / lot secte / même signe: Esprit avancé / L1-L4 / saut du lien après 12 sous-périodes',
 limitations:['Directions primaires disponibles : directions méridiennes zodiacales directes et converses sans latitude. Les directions in-mundo complètes ne sont pas calculées.','Les périodes ZR ne sont pas des prédictions de faits.']};
}
window.APEventCycles={version:'v201',compute,_test:{seqAt,releasingAt,eventsIn,primaryMeridian,ra}};
})();