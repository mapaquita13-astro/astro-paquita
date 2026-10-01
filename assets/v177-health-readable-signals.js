/* Astro Paquita V177 — traduction lisible des signaux Santé V121.
   Couche de présentation uniquement : aucun calcul astrologique n'est modifié. */
(function(){
'use strict';
if(window.__AP_V177_HEALTH_READABLE__)return;
window.__AP_V177_HEALTH_READABLE__=true;

const base=window.apRunStrictHealthForecastV175;
if(typeof base!=='function')return;

const TEXT={
 fr:{detail:'Détail astrologique',whyVery:'Plusieurs familles d’indicateurs V121 se recoupent fortement autour de cette période.',whyConfirmed:'Plusieurs indicateurs indépendants du moteur V121 convergent vers la même tendance autour de cette période.',whyLightGood:'Une configuration favorable apparaît autour de cette date. Elle reste secondaire car elle est soutenue par moins d’indices convergents que les signaux principaux.',whyLightWatch:'Une configuration plus exigeante apparaît autour de cette date, mais elle n’est pas assez confirmée pour être classée comme alerte principale.'},
 en:{detail:'Astrological detail',whyVery:'Several V121 indicator families converge strongly around this period.',whyConfirmed:'Several independent V121 indicators converge toward the same trend around this period.',whyLightGood:'A favourable configuration appears around this date. It remains secondary because fewer converging indicators support it than the main signals.',whyLightWatch:'A more demanding configuration appears around this date, but it is not confirmed strongly enough to be classified as a main alert.'},
 es:{detail:'Detalle astrológico',whyVery:'Varias familias de indicadores V121 convergen con fuerza en torno a este período.',whyConfirmed:'Varios indicadores independientes de V121 convergen hacia la misma tendencia en torno a este período.',whyLightGood:'Aparece una configuración favorable alrededor de esta fecha. Sigue siendo secundaria porque cuenta con menos indicadores convergentes que las señales principales.',whyLightWatch:'Aparece una configuración más exigente alrededor de esta fecha, pero no está lo bastante confirmada para clasificarse como alerta principal.'},
 ar:{detail:'التفصيل الفلكي',whyVery:'تتقاطع عدة عائلات من مؤشرات V121 بقوة خلال هذه الفترة.',whyConfirmed:'تتلاقى عدة مؤشرات مستقلة من V121 في الاتجاه نفسه خلال هذه الفترة.',whyLightGood:'تظهر دلالة فلكية داعمة حول هذا التاريخ، لكنها تبقى ثانوية لأن عدد المؤشرات المتقاطعة أقل من الإشارات الرئيسية.',whyLightWatch:'تظهر دلالة أكثر تطلباً حول هذا التاريخ، لكنها ليست مؤكدة بما يكفي لتصنيفها كتنبيه رئيسي.'}
};
const ASPECTS={
 fr:{0:['conjonction','un aspect de concentration'],60:['sextile','un aspect harmonique'],90:['carré','un aspect de tension'],120:['trigone','un aspect harmonique'],180:['opposition','un aspect de tension']},
 en:{0:['conjunction','a concentrating aspect'],60:['sextile','a harmonious aspect'],90:['square','a tension aspect'],120:['trine','a harmonious aspect'],180:['opposition','a tension aspect']},
 es:{0:['conjunción','un aspecto de concentración'],60:['sextil','un aspecto armónico'],90:['cuadratura','un aspecto de tensión'],120:['trígono','un aspecto armónico'],180:['oposición','un aspecto de tensión']},
 ar:{0:['اقتران','زاوية تركيز'],60:['تسديس','زاوية منسجمة'],90:['تربيع','زاوية توتر'],120:['تثليث','زاوية منسجمة'],180:['مقابلة','زاوية توتر']}
};
const PLANETS={
 fr:{soleil:'Soleil',lune:'Lune',mercure:'Mercure','vénus':'Vénus',venus:'Vénus',mars:'Mars',jupiter:'Jupiter',saturne:'Saturne',uranus:'Uranus',neptune:'Neptune','neptune':'Neptune',pluton:'Pluton'},
 en:{soleil:'Sun',lune:'Moon',mercure:'Mercury','vénus':'Venus',venus:'Venus',mars:'Mars',jupiter:'Jupiter',saturne:'Saturn',uranus:'Uranus',neptune:'Neptune',pluton:'Pluto'},
 es:{soleil:'Sol',lune:'Luna',mercure:'Mercurio','vénus':'Venus',venus:'Venus',mars:'Marte',jupiter:'Júpiter',saturne:'Saturno',uranus:'Urano',neptune:'Neptuno',pluton:'Plutón'},
 ar:{soleil:'الشمس',lune:'القمر',mercure:'عطارد','vénus':'الزهرة',venus:'الزهرة',mars:'المريخ',jupiter:'المشتري',saturne:'زحل',uranus:'أورانوس',neptune:'نبتون',pluton:'بلوتو'}
};
function lang(){const l=String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2);return TEXT[l]?l:'fr';}
function roman(n){const vals=[[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let out='';for(const [v,s] of vals){while(n>=v){out+=s;n-=v;}}return out;}
function planetName(raw,l){const k=String(raw||'').trim().toLowerCase();return (PLANETS[l]&&PLANETS[l][k])||String(raw||'').trim().replace(/^./,c=>c.toUpperCase());}
function targetText(target,l){
 const t=String(target||'').trim().toUpperCase();
 if(t==='R6'){
   if(l==='fr')return 'le maître du secteur VI, lié au quotidien et au travail';
   if(l==='en')return 'the ruler of sector VI, linked to daily life and work';
   if(l==='es')return 'el regente del sector VI, ligado a la vida cotidiana y al trabajo';
   return 'حاكم القطاع السادس المرتبط بالحياة اليومية والعمل';
 }
 if(t==='H6'){
   if(l==='fr')return 'le secteur VI, lié au quotidien et au travail';
   if(l==='en')return 'sector VI, linked to daily life and work';
   if(l==='es')return 'el sector VI, ligado a la vida cotidiana y al trabajo';
   return 'القطاع السادس المرتبط بالحياة اليومية والعمل';
 }
 const m=t.match(/^R(\d{1,2})$/);
 if(m){const r=roman(Number(m[1]));if(l==='fr')return 'le maître du secteur '+r;if(l==='en')return 'the ruler of sector '+r;if(l==='es')return 'el regente del sector '+r;return 'حاكم القطاع '+r;}
 const h=t.match(/^H(\d{1,2})$/);
 if(h){const r=roman(Number(h[1]));if(l==='fr')return 'le secteur '+r;if(l==='en')return 'sector '+r;if(l==='es')return 'el sector '+r;return 'القطاع '+r;}
 const special={
   fr:{MC:'le Milieu du Ciel',AS:'l’Ascendant',DS:'le Descendant',IC:'le Fond du Ciel'},
   en:{MC:'the Midheaven',AS:'the Ascendant',DS:'the Descendant',IC:'the Imum Coeli'},
   es:{MC:'el Medio Cielo',AS:'el Ascendente',DS:'el Descendente',IC:'el Fondo del Cielo'},
   ar:{MC:'وسط السماء',AS:'الطالع',DS:'الهابط',IC:'قاع السماء'}
 };
 return (special[l]&&special[l][t])||target;
}
function readableSignal(raw){
 const s=String(raw||'').replace(/\s+/g,' ').trim();
 const m=s.match(/^([A-Za-zÀ-ÿŒœ]+)\s*(?:·\s*)?(\d{1,3}(?:[.,]\d+)?)°\s*·\s*([A-Za-z]+\d*)$/i);
 if(!m)return s;
 const l=lang(),planet=planetName(m[1],l),angle=Number(String(m[2]).replace(',','.')),target=targetText(m[3],l);
 const def=(ASPECTS[l]&&ASPECTS[l][angle])||null;
 if(l==='fr')return def?`${planet} forme un ${def[0]} (${m[2]}°), ${def[1]}, avec ${target}.`:`${planet} forme un aspect de ${m[2]}° avec ${target}.`;
 if(l==='en')return def?`${planet} forms a ${def[0]} (${m[2]}°), ${def[1]}, with ${target}.`:`${planet} forms a ${m[2]}° aspect with ${target}.`;
 if(l==='es')return def?`${planet} forma un ${def[0]} (${m[2]}°), ${def[1]}, con ${target}.`:`${planet} forma un aspecto de ${m[2]}° con ${target}.`;
 return def?`${planet} يشكّل ${def[0]} (${m[2]}°)، ${def[1]}، مع ${target}.`:`${planet} يشكّل زاوية ${m[2]}° مع ${target}.`;
}
function classify(card){
 const l=lang();
 const level=(card.querySelector('.ap-health-detail-top b')?.textContent||'').toLowerCase();
 const watch=card.classList.contains('is-watch');
 const very=/forte|strong|fuerte|قوي/.test(level);
 const confirmed=/confirm|مؤكد/.test(level);
 if(very)return TEXT[l].whyVery;
 if(confirmed)return TEXT[l].whyConfirmed;
 return watch?TEXT[l].whyLightWatch:TEXT[l].whyLightGood;
}
function transform(html){
 const box=document.createElement('div');box.innerHTML=String(html||'');
 box.querySelectorAll('.ap-health-detail').forEach(card=>{
   const ps=card.querySelectorAll('.ap-health-detail-grid p');
   if(ps[1]){const sp=ps[1].querySelector('span');const title=sp?sp.textContent:'';ps[1].innerHTML=(title?'<span>'+title.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</span>':'')+classify(card);}
   const src=card.querySelector('.ap-health-source');
   if(src){const sp=src.querySelector('span');let raw='';for(const node of src.childNodes){if(node.nodeType===Node.TEXT_NODE)raw+=node.textContent;}const t=TEXT[lang()];src.innerHTML='<span>'+t.detail+'</span>'+readableSignal(raw);}
 });
 return box.innerHTML;
}
window.apRunStrictHealthForecastV175=async function(){const html=await base.apply(this,arguments);return transform(html);};
window.AP_HEALTH_METHOD_V177={engine:'V121',presentation:'human-readable-signals',calculationsChanged:false};
})();
