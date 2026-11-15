/* Run: node tests/life-story-regression.cjs
   Synthetic software regression tests only — NOT validation of astrology as
   a predictor of real events. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const script=fs.readFileSync(path.join(__dirname,'../assets/v211-life-story-engine.js'),'utf8');
const jd=2441303.604;
const positions={Soleil:265.51,Lune:269.14,Mercure:253.94,'Vénus':293.59,Mars:354.49,Jupiter:259.23,Saturne:61.29,Uranus:190,Neptune:242,Pluton:180};
const velocities={Soleil:.98565,Lune:13.176,Mercure:1.1,'Vénus':1.02,Mars:.524,Jupiter:.0831,Saturne:.03346,Uranus:.0117,Neptune:.006,Pluton:.004};
const cusps=[206.19,233.34,266.49,303.78,337.78,4.99,26.19,53.34,86.49,123.78,157.78,184.99];
const natal={positions,houses:Object.fromEntries(cusps.map((v,i)=>['H'+(i+1),v])),angles:{ascendant:206.19,mc:123.78}};
const window={calcPos:J=>Object.fromEntries(Object.keys(velocities).map(k=>[k,((positions[k]+velocities[k]*(J-jd))%360+360)%360]))};
vm.runInNewContext(script,{window,setTimeout,Date,console}, {filename:'v211-life-story-engine.js'});
const engine=window.APLifeStory;
assert.equal(engine.version,'v213');
const profile={profileId:'regression',timeStatus:'exact',date:'18/12/1971'};
const A={computeProfile:()=>({jd}),natal:()=>natal};
function makeHit(day,method,body,target,aspect,orb){
 const t=engine._test.makeTargets(natal).targets.find(x=>x.name===target);
 assert.ok(t, 'Missing target '+target);
 return {method,at:Date.parse(day+'T12:00:00Z'),body,target,targetType:t.type,roles:t.roles,houses:t.groups,aspect,orb};
}
(async()=>{
 const targets=engine._test.makeTargets(natal);
 assert.equal(new Set(targets.targets.flatMap(t=>t.groups)).size,12,'Every natal house is considered');
 assert.equal(targets.targets.find(x=>x.name==='Mars').roles[5],'occupant','Resident Mars in V must count');
 const hits=[
  makeHit('1995-12-27','transit','Saturne','Jupiter',90,.13),
  makeHit('1995-12-27','transit','Neptune','Mars',60,.03),
  makeHit('1996-02-05','arc','Mars','Jupiter',120,.15),
  makeHit('1996-02-08','transit','Jupiter','Maison 5',60,.40)
 ];
 const matched=engine._test.assemble(hits,Date.parse('1971-12-18T12:00:00Z'),Date.now());
 assert.ok(matched.some(x=>x.date.startsWith('1996-')&&x.title.includes('enfants')),'Independent family signals should yield a child-related chapter');
 const life=await engine.compute({A,profile,alive:()=>true});
 assert.equal(life.events[0].date,'1971-12-18','Birth must use local profile date');
 const all=life.events.slice(1);
 const perDecade={};
 for(const x of all){
  const decade=Math.floor(x.age/10);
  perDecade[decade]=(perDecade[decade]||0)+1;
  assert.ok(perDecade[decade]<=3,'No decade should dominate the biography');
  assert.ok(!(x.age<5&&/scolarit|études/i.test(x.title)),'No schooling in infancy');
  assert.ok(!(x.age>=70&&/promotion/i.test(x.title)),'No workplace promotion at advanced age');
 }
 for(let i=1;i<all.length;i++)assert.ok(Date.parse(all[i].date)-Date.parse(all[i-1].date)>=365*86400000,'Major chapters must not recur within a year');
 assert.ok(new Set(all.map(x=>x.domain)).size>=8,'The biography should not be dominated by one life area');
 console.log('Life chronology V213 regression checks passed ('+life.events.length+' synthetic chapters)');
})().catch(error=>{console.error(error);process.exitCode=1});
