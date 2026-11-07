/* Astro Paquita — calendar indicators based on V121 AstroTruth.
   This additive module does not modify the daily horoscope or other routes. */
(function(){
'use strict';
if(window.__AP_V196_CALENDAR_SIGNALS__)return;
window.__AP_V196_CALENDAR_SIGNALS__=true;
const DOMAINS=['amour','travail','argent','bienetre'];
const WORDS={
 fr:{title:'Comprendre les 4 points',order:'De gauche à droite :',domains:['Amour','Travail','Argent','Bien-être'],good:'Signaux favorables',hard:'Signaux délicats',mixed:'Signaux contrastés',none:'Aucun signal marqué',error:'Calcul indisponible',detail:'Tendances calculées pour le',note:'Ces repères proviennent des signaux astrologiques calculés pour la date et le profil actifs. Ils ne remplacent pas l’horoscope détaillé. Les autres domaines sont disponibles dans Prévisions.'},
 en:{title:'Understanding the 4 dots',order:'From left to right:',domains:['Love','Work','Money','Well-being'],good:'Favourable signals',hard:'Challenging signals',mixed:'Mixed signals',none:'No significant signal',error:'Calculation unavailable',detail:'Calculated trends for',note:'These markers use astrological signals calculated for the selected date and profile. They do not replace the detailed daily report.'},
 es:{title:'Comprender los 4 puntos',order:'De izquierda a derecha:',domains:['Amor','Trabajo','Dinero','Bienestar'],good:'Señales favorables',hard:'Señales difíciles',mixed:'Señales mixtas',none:'Sin señales destacadas',error:'Cálculo no disponible',detail:'Tendencias calculadas para',note:'Estos indicadores utilizan señales astrológicas calculadas para la fecha y el perfil activos. No sustituyen el informe detallado.'},
 ar:{title:'معنى النقاط الأربع',order:'من اليسار إلى اليمين:',domains:['الحب','العمل','المال','العافية'],good:'إشارات مواتية',hard:'إشارات صعبة',mixed:'إشارات متباينة',none:'لا توجد إشارات بارزة',error:'الحساب غير متاح',detail:'اتجاهات محسوبة ليوم',note:'تعتمد هذه العلامات على الإشارات الفلكية المحسوبة للتاريخ والملف المحددين، ولا تحل محل التقرير المفصل.'}
};
let scheduled=false,working=false,observer=null,activeDate='';
function lang(){const a=(document.documentElement.lang||'').slice(0,2).toLowerCase();let b='fr';try{b=(localStorage.getItem('astro-lang')||'fr').slice(0,2).toLowerCase();}catch(e){}return WORDS[a]?a:WORDS[b]?b:'fr';}
function tr(){return WORDS[lang()];}
function pId(){try{return String(window.AstroTruth.currentProfile()?.profileId||'legacy');}catch(e){return 'legacy';}}
function current(){return document.querySelector('.ap-route-calendar #ap-page');}
function color(value){return value==='good'?'#62816a':value==='hard'?'#a35566':value==='mixed'?'#aa957e':'#a8a5a4';}
function tone(signals,domain){
 const found=(signals||[]).filter(s=>s&&s.domain===domain);
 if(!found.length)return {value:'none',count:0};
 let positive=0,negative=0;
 found.forEach(s=>{
   const p=String(s.polarity||'').toLowerCase();
   const w=Math.max(1,Math.min(8,Number(s.force)||1));
   if(p==='positive')positive+=w;
   else if(p==='difficile'||p==='difficult')negative+=w;
 });
 if(positive>negative*1.25)return {value:'good',count:found.length};
 if(negative>positive*1.25)return {value:'hard',count:found.length};
 return {value:'mixed',count:found.length};
}
function scores(iso){
 if(!window.AstroTruth||typeof window.AstroTruth.day!=='function')return DOMAINS.map(()=>({value:'error',count:0}));
 try{
   const result=window.AstroTruth.day(iso,'all');
   if(!result||!Array.isArray(result.signals))throw new Error('No calculation');
   return DOMAINS.map(d=>tone(result.signals,d));
 }catch(e){return DOMAINS.map(()=>({value:'error',count:0}));}
}
function status(x){const t=tr();return x.value==='good'?t.good:x.value==='hard'?t.hard:x.value==='mixed'?t.mixed:x.value==='none'?t.none:t.error;}
function dot(x){const e=document.createElement('i');e.className='ap-v196-dot';e.style.backgroundColor=color(x.value);e.setAttribute('aria-hidden','true');return e;}
function injectStyles(){
 if(document.getElementById('ap-v196-calendar-style'))return;
 const st=document.createElement('style');st.id='ap-v196-calendar-style';
 st.textContent='.ap-route-calendar [data-day] .ap-v196-dots{display:flex;justify-content:center;gap:4px;margin:5px 0 1px;direction:ltr}'
 +'.ap-v196-dot{display:inline-block;flex:none;width:8px;height:8px;border-radius:50%}'
 +'.ap-v196-guide{margin:16px 0 8px;padding:15px;border:1px solid #dfd4c8;border-radius:17px;background:#fffaf4;color:#4a2945;font-size:14px;line-height:1.5}'
 +'.ap-v196-guide strong{font-weight:700}.ap-v196-guide p{margin:6px 0}'
 +'.ap-v196-domain-list,.ap-v196-colors{display:flex;gap:7px 12px;flex-wrap:wrap;margin-top:8px}'
 +'.ap-v196-domain-list span,.ap-v196-colors span{display:inline-flex;align-items:center;gap:5px;font-size:12px}'
 +'.ap-v196-colors{border-top:1px solid #e8ded3;padding-top:9px;margin-top:12px}'
 +'.ap-v196-colors .ap-v196-dot,.ap-v196-selected .ap-v196-dot{width:9px;height:9px}'
 +'.ap-v196-guide small{display:block;margin-top:10px;color:#71666d;line-height:1.45}'
 +'.ap-v196-selected{margin-top:12px;padding-top:10px;border-top:1px solid #e8ded3}'
 +'.ap-v196-selected-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px 12px;margin-top:8px}'
 +'.ap-v196-selected-grid span{display:flex;gap:8px;align-items:center;font-size:12px}'
 +'@media(max-width:360px){.ap-v196-selected-grid{grid-template-columns:1fr}}';
 document.head.appendChild(st);
}
function addGuide(page,button){
 const container=button.closest('.ap-card')||page;
 let guide=container.querySelector('.ap-v196-guide');
 if(guide)return guide;
 const t=tr();guide=document.createElement('section');guide.className='ap-v196-guide';
 guide.setAttribute('aria-label',t.title);
 const h=document.createElement('strong');h.textContent=t.title;guide.appendChild(h);
 const p=document.createElement('p');p.textContent=t.order;guide.appendChild(p);
 const domains=document.createElement('div');domains.className='ap-v196-domain-list';
 t.domains.forEach((name,i)=>{const v=document.createElement('span');v.textContent=(i+1)+'. '+name;domains.appendChild(v);});
 guide.appendChild(domains);
 const colors=document.createElement('div');colors.className='ap-v196-colors';
 ['good','hard','mixed','none'].forEach(value=>{
   const label=document.createElement('span');label.appendChild(dot({value}));
   const x=document.createElement('span');x.textContent=status({value});label.appendChild(x);colors.appendChild(label);
 });guide.appendChild(colors);
 const n=document.createElement('small');n.textContent=t.note;guide.appendChild(n);
 const selection=document.createElement('div');selection.className='ap-v196-selected';selection.hidden=true;guide.appendChild(selection);
 container.appendChild(guide);
 return guide;
}
function selectDay(iso,page,button,computed){
 activeDate=iso;const guide=addGuide(page,button);const target=guide.querySelector('.ap-v196-selected');if(!target)return;
 const t=tr();target.replaceChildren();
 const heading=document.createElement('strong');
 const date=new Date(iso+'T12:00:00');
 heading.textContent=t.detail+' '+date.toLocaleDateString(lang()==='fr'?'fr-FR':lang()==='en'?'en-GB':lang()==='es'?'es-ES':'ar',{day:'numeric',month:'long',year:'numeric'});
 target.appendChild(heading);
 const grid=document.createElement('div');grid.className='ap-v196-selected-grid';
 (computed||scores(iso)).forEach((x,i)=>{
  const el=document.createElement('span');el.appendChild(dot(x));
  const tx=document.createElement('span');tx.textContent=t.domains[i]+' : '+status(x);el.appendChild(tx);grid.appendChild(el);
 });target.appendChild(grid);target.hidden=false;
}
function decorate(button,page,profile){
 const iso=button.getAttribute('data-day');if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||''))return;
 const signature=profile+'|'+iso;
 if(button.dataset.apV196Calendar===signature)return;
 const states=scores(iso);
 // Keep the existing date button, its handler and its selected-day attributes.
 let num=button.querySelector('.ap-day-num');
 if(num)num=num.cloneNode(true);
 else{num=document.createElement('span');num.className='ap-day-num';num.textContent=String(Number(iso.slice(8)));}
 const dots=document.createElement('span');dots.className='ap-v196-dots';dots.setAttribute('aria-hidden','true');
 states.forEach(s=>dots.appendChild(dot(s)));
 button.dataset.apV196Calendar=signature;
 button.replaceChildren(num,dots);
 button.setAttribute('aria-label',iso+' — '+tr().domains.map((d,i)=>d+' : '+status(states[i])).join(', '));
 if(!button.dataset.apV196Bound){
   button.dataset.apV196Bound='1';
   button.addEventListener('click',function(){
     // Leave existing horoscope selection untouched; show the domain breakdown beside it.
     setTimeout(()=>{const pg=current();if(pg&&button.isConnected)selectDay(iso,pg,button,scores(iso));},0);
   });
 }
 if(activeDate===iso)selectDay(iso,page,button,states);
}
function apply(){
 if(working)return;const page=current();if(!page||!window.AstroTruth)return;
 const days=[...page.querySelectorAll('[data-day]')].filter(b=>/^\d{4}-\d{2}-\d{2}$/.test(b.getAttribute('data-day')||''));
 if(!days.length)return;
 injectStyles();addGuide(page,days[0]);working=true;
 const profile=pId();let pos=0;
 function part(){
   if(!page.isConnected){working=false;return;}
   for(let n=0;n<4&&pos<days.length;n++,pos++){
     if(days[pos].isConnected)decorate(days[pos],page,profile);
   }
   if(pos<days.length)setTimeout(part,0);
   else working=false;
 }
 part();
}
function schedule(){if(scheduled||working)return;scheduled=true;setTimeout(()=>{scheduled=false;apply();},90);}
function boot(){
 const root=document.getElementById('ap-final-root');if(!root){setTimeout(boot,200);return;}
 observer=new MutationObserver(schedule);observer.observe(root,{childList:true,subtree:true});
 schedule();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
