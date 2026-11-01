/* Astro Paquita V195 — lecture locale rigoureusement fondée sur les configurations calculées.
   Fonctionnement hors fournisseur d'IA ; aucune configuration ni événement inventé. */
(function(){
'use strict';
if(window.APForecastReadableFallback)return;
function esc(s){return String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[ch]));}
function localeOf(input){const l=String(input||'fr').slice(0,2).toLowerCase();return ['fr','en','es','ar'].includes(l)?l:'fr';}
const D={
fr:{heading:'Lecture astrologique calculée',intro:'Les éléments ci-dessous proviennent des configurations effectivement calculées pour la période. Ils sont présentés par domaine et par date lorsque celles-ci sont disponibles.',slow:'Tendances de fond',prog:'Progressions secondaires',arc:'Directions d’arc solaire',pro:'Profection annuelle',fir:'Période firdaria',solar:'Révolution solaire',sky:'Éclipses et stations',none:'Aucun contact à 1° relevé dans cette technique pour cette période.',short:'Tendances du moteur quotidien',period:'Période',orb:'orbe',record:'relevé',conj:'activation',harm:'configuration fluide',chall:'configuration de tension',notEvent:'Ces configurations décrivent des thèmes d’interprétation ; elles ne constatent pas d’événement vécu.',missing:'Certaines techniques sont indisponibles. Les données calculées restent présentées ci-dessous.',noEvents:'Aucune éclipse ni station planétaire datée dans ce segment.'},
en:{heading:'Calculated astrological reading',intro:'Based only on computed configurations, not assumed events.',slow:'Long-term transits',prog:'Secondary progressions',arc:'Solar arc directions',pro:'Annual profection',fir:'Firdaria period',solar:'Solar return',sky:'Eclipses and stations',none:'No contact within 1° at sampled dates.',short:'Daily-engine indicators',period:'Period',orb:'orb',record:'sampled',conj:'activation',harm:'harmonious aspect',chall:'challenging aspect',notEvent:'These configurations are interpretive themes, not verified life events.',missing:'Some methods are unavailable.',noEvents:'No eclipse or planetary station recorded in this segment.'},
es:{heading:'Lectura astrológica calculada',intro:'Basada solo en configuraciones calculadas, no en acontecimientos supuestos.',slow:'Tránsitos lentos',prog:'Progresiones secundarias',arc:'Direcciones de arco solar',pro:'Profección anual',fir:'Período firdaria',solar:'Revolución solar',sky:'Eclipses y estaciones',none:'Ningún contacto dentro de 1° en las fechas examinadas.',short:'Indicadores diarios',period:'Período',orb:'orbe',record:'observado',conj:'activación',harm:'aspecto armónico',chall:'aspecto de tensión',notEvent:'Las configuraciones no prueban acontecimientos de la vida.',missing:'Algunos métodos no están disponibles.',noEvents:'Ningún eclipse o estación en este segmento.'},
ar:{heading:'قراءة فلكية محسوبة',intro:'تعتمد على الحسابات المتاحة، لا على أحداث مفترضة.',slow:'عبور الكواكب البطيئة',prog:'التقدمات الثانوية',arc:'توجيهات القوس الشمسي',pro:'التسيير السنوي',fir:'فترات الفردار',solar:'العودة الشمسية',sky:'الكسوف والمحطات',none:'لا اتصال ضمن درجة واحدة في التواريخ المختبرة.',short:'المؤشرات اليومية',period:'الفترة',orb:'الفارق الزاوي',record:'رصد',conj:'تنشيط',harm:'جانب متناغم',chall:'جانب متوتر',notEvent:'لا تثبت هذه الحسابات أحداثًا واقعية.',missing:'بعض الطرق غير متاحة.',noEvents:'لا توجد ظواهر مؤرخة في هذه الفترة.'}
};
function contact(a,t){
 const asp=a?.aspect===0?0:Number(a?.aspect);
 const shape=asp===90||asp===180?t.chall:asp===60||asp===120?t.harm:t.conj;
 return String(a?.source||'?')+' '+String(a?.aspectName||a?.aspect||'')+' '+String(a?.target||'?')+
 ' ('+t.orb+' '+String(a?.orb??'?')+'°'+(a?.observedDate?', '+t.record+' '+a.observedDate:'')+') — '+shape;
}
function summarize(period,point,sky,t){
 const pieces=[];
 const slow=point?.slowTransits||[];
 if(slow.length)pieces.push('<p><strong>'+esc(t.slow)+'.</strong> '+esc(slow.slice(0,4).map(x=>contact(x,t)).join(' ; '))+'.</p>');
 const progression=point?.progressions||[];
 if(progression.length)pieces.push('<p><strong>'+esc(t.prog)+'.</strong> '+esc(progression.slice(0,3).map(x=>contact(x,t)).join(' ; '))+'.</p>');
 const arcs=point?.solarArcDirections||[];
 if(arcs.length)pieces.push('<p><strong>'+esc(t.arc)+'.</strong> '+esc(arcs.slice(0,3).map(x=>contact(x,t)).join(' ; '))+'.</p>');
 if(point?.profection)pieces.push('<p><strong>'+esc(t.pro)+'.</strong> '+esc('Maison '+point.profection.house+' · '+point.profection.sign+' · '+point.profection.lord)+'.</p>');
 if(point?.firdaria)pieces.push('<p><strong>'+esc(t.fir)+'.</strong> '+esc(point.firdaria.major+(point.firdaria.sub?' / '+point.firdaria.sub:''))+' ('+esc(point.firdaria.sect)+').</p>');
 const from=String(period?.start||''),until=String(period?.end||'');
 const eclipses=(sky?.eclipses||[]).filter(e=>e.dateUtc?.slice(0,10)>=from&&e.dateUtc?.slice(0,10)<=until);
 const stations=(sky?.retrogradeStations||[]).filter(e=>e.dateUtc?.slice(0,10)>=from&&e.dateUtc?.slice(0,10)<=until);
 if(eclipses.length||stations.length){
  const details=[...eclipses.map(e=>e.dateUtc.slice(0,10)+' : éclipse '+e.type+' '+e.kind+' en '+e.zodiac?.sign),
  ...stations.map(e=>e.dateUtc.slice(0,10)+' : '+e.planet+' devient '+e.motion)].join(' ; ');
  pieces.push('<p><strong>'+esc(t.sky)+'.</strong> '+esc(details)+'.</p>');
 }
 if(!pieces.length)pieces.push('<p>'+esc(t.none)+'</p>');
 const label=String(period?.label||point?.period||from);
 return '<section style="margin:16px 0"><h4 style="margin:0 0 8px">'+esc(label)+'</h4>'+pieces.join('')+'</section>';
}
function render(truth,methods,language){
 const t=D[localeOf(language)],points=truth?.points||[],periods=methods?.points||[];
 const sky=methods?.sky;
 let out='<div class="ap-grounded-forecast"><h3>'+esc(t.heading)+'</h3><p>'+esc(t.intro)+'</p>';
 if(methods?.techniquesError||methods?.skyError)out+='<p>'+esc(t.missing)+'</p>';
 out+=points.map((p,i)=>summarize(p,periods[i],sky,t)).join('');
 const solar=(methods?.solarReturns||[]).filter(r=>r.instantUtc?.slice(0,10)<=truth?.end);
 if(solar.length)out+='<h4>'+esc(t.solar)+'</h4><p>'+esc(solar.map(r=>r.year+' : '+r.instantUtc?.slice(0,16).replace('T',' ')+' UTC'+(r.houseCusps?' ('+(r.location?.city||'')+', ASC '+r.ascendant+'°)':'')).join(' ; '))+'.</p>';
 out+='<p class="ap-muted" style="margin-top:14px">'+esc(t.notEvent)+'</p></div>';
 return out;
}
function compact(t,methods,language){
 const shortenContact=a=>({source:a.source,target:a.target,aspect:a.aspect,orb:a.orb,observedDate:a.observedDate||null,transitHouse:a.transitHouse||null});
 const summary={
  language:localeOf(language),period:t.period,start:t.start,end:t.end,domain:t.domain,samplingDays:t.samplingDays,
  points:(t.points||[]).map(p=>({label:p.label,start:p.start,end:p.end,trend:p.polarity,indicators:p.signalCount,
   signals:(p.signals||[]).slice(0,3).map(s=>({domain:s.domain,polarity:s.polarity,label:String(s.label||'').slice(0,100),source:s.source||null,target:s.target||null,aspect:s.aspect??null}))})),
  methods:(methods?.points||[]).map(p=>({period:p.period,date:p.date,
   slowTransits:(p.slowTransits||[]).slice(0,6).map(shortenContact),
   progressions:(p.progressions||[]).slice(0,4).map(shortenContact),
   solarArcDirections:(p.solarArcDirections||[]).slice(0,3).map(shortenContact),
   profection:p.profection?{house:p.profection.house,sign:p.profection.sign,lord:p.profection.lord}:null,
   firdaria:p.firdaria?{major:p.firdaria.major,sub:p.firdaria.sub,sect:p.firdaria.sect}:null})),
  solarReturns:(methods?.solarReturns||[]).slice(0,3).map(r=>({year:r.year,instantUtc:r.instantUtc,location:r.location?.city||null,ascendant:r.ascendant,houseSystem:r.houseSystem,planets:(r.planets||[]).filter(z=>z.house).slice(0,8).map(z=>({name:z.name,house:z.house})),aspects:(r.aspects||[]).slice(0,5).map(shortenContact)})),
  sky:{eclipses:(methods?.sky?.eclipses||[]).slice(0,12).map(e=>({dateUtc:e.dateUtc,type:e.type,kind:e.kind,sign:e.zodiac?.sign,contacts:(e.zodiac?.natalContacts||[]).slice(0,3)})),
   stations:(methods?.sky?.retrogradeStations||[]).slice(0,24).map(s=>({dateUtc:s.dateUtc,planet:s.planet,motion:s.motion,sign:s.zodiac?.sign})),
   lunations:(methods?.sky?.lunations||[]).filter(e=>e.zodiac?.natalContacts?.length).slice(0,8).map(e=>({dateUtc:e.dateUtc,type:e.type,sign:e.zodiac?.sign,contacts:e.zodiac.natalContacts.slice(0,2)}))},
  incomplete:!!(methods?.techniquesError||methods?.skyError)
 };
 return summary;
}
window.APForecastReadableFallback={version:'v195',render,compact};
})();