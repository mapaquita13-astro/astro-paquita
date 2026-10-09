/* Astro Paquita — complements i18n pour les libelles dynamiques. */
(function(){
'use strict';
if(window.__AP_GLOBAL_I18N_UI_FIXES__)return;
window.__AP_GLOBAL_I18N_UI_FIXES__=true;
const META={fr:{locale:'fr-FR',dir:'ltr'},en:{locale:'en-GB',dir:'ltr'},es:{locale:'es-ES',dir:'ltr'},ar:{locale:'ar',dir:'rtl'}};
const T={
  fr:{home:'Accueil',portrait:'Portrait',future:'Avenir',more:'Plus',natal:'Mon<br>portrait natal',timing:'Le bon<br>moment',relations:'Relations<br>& Synastrie',child:'Portrait<br>enfant',calendar:'Mon<br>calendrier',from:'du',to:'au',peak:'Point culminant autour du',couple:'Amour',family:'Famille',work:'Travail',friend:'Amitié'},
  en:{home:'Home',portrait:'Portrait',future:'Future',more:'More',natal:'My<br>birth chart',timing:'Best<br>timing',relations:'Relationships<br>& Synastry',child:'Child<br>portrait',calendar:'My<br>calendar',from:'from',to:'to',peak:'Peak around',couple:'Love',family:'Family',work:'Work',friend:'Friendship'},
  es:{home:'Inicio',portrait:'Retrato',future:'Futuro',more:'Más',natal:'Mi<br>retrato natal',timing:'Mejor<br>momento',relations:'Relaciones<br>y sinastría',child:'Retrato<br>infantil',calendar:'Mi<br>calendario',from:'del',to:'al',peak:'Punto culminante alrededor del',couple:'Amor',family:'Familia',work:'Trabajo',friend:'Amistad'},
  ar:{home:'الرئيسية',portrait:'الخريطة',future:'المستقبل',more:'المزيد',natal:'خريطتي<br>الميلادية',timing:'أفضل<br>توقيت',relations:'العلاقات<br>والتوافق',child:'خريطة<br>الطفل',calendar:'تقويمي',from:'من',to:'إلى',peak:'الذروة حول',couple:'الحب',family:'العائلة',work:'العمل',friend:'الصداقة'}
};
const MONTHS={fr:['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],en:['January','February','March','April','May','June','July','August','September','October','November','December'],es:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],ar:['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']};
function lang(){const x=String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2);return T[x]?x:'fr';}
// Ne pas traduire "mai" à l'intérieur de "maison" ni des fragments de noms propres.
function months(s,l){
 if(l==='fr')return s;
 let out=s;
 MONTHS.fr.forEach((m,i)=>{
  const rx=new RegExp('(^|[^\\p{L}])('+m+')(?=$|[^\\p{L}])','giu');
  out=out.replace(rx,(_,before)=>before+MONTHS[l][i]);
 });
 return out;
}
function setText(sel,html){const e=document.querySelector(sel);if(e)e.innerHTML=html;}
function fixNav(l){
  setText('.ap-mob-btn[data-route="home"] span',T[l].home);
  setText('.ap-mob-btn[data-route="natal"] span',T[l].portrait);
  setText('.ap-mob-btn[data-route="future"] span',T[l].future);
  setText('.ap-mob-btn[data-route="profile"] span',T[l].more);
  setText('.ap-home-shortcuts [data-route="natal"] span',T[l].natal);
  setText('.ap-home-shortcuts [data-route="future"] span',l==='fr'?'Mon<br>avenir':l==='en'?'My<br>future':l==='es'?'Mi<br>futuro':'مستقبلي');
  setText('.ap-home-shortcuts [data-route="timing"] span',T[l].timing);
  setText('.ap-home-shortcuts [data-route="relations"] span',T[l].relations);
  setText('.ap-home-shortcuts [data-route="child"] span',T[l].child);
  setText('.ap-home-shortcuts [data-route="calendar"] span',T[l].calendar);
}
function fixRelationOptions(l){const s=document.getElementById('ap-rel-type');if(!s)return;const a=[["couple",T[l].couple],["famille",T[l].family],["pro",T[l].work],["amitie",T[l].friend]];Array.from(s.options).forEach((o,i)=>{if(!a[i])return;o.value=a[i][0];o.textContent=a[i][1];});}
function fixRelationPeriods(l){const s=document.getElementById('ap-rel-forecast-period');if(!s)return;const labels={fr:['30 prochains jours','3 prochains mois','6 prochains mois','12 prochains mois','2 prochaines années','3 prochaines années','5 prochaines années','Autour d’une date précise'],en:['Next 30 days','Next 3 months','Next 6 months','Next 12 months','Next 2 years','Next 3 years','Next 5 years','Around a specific date'],es:['Próximos 30 días','Próximos 3 meses','Próximos 6 meses','Próximos 12 meses','Próximos 2 años','Próximos 3 años','Próximos 5 años','Alrededor de una fecha concreta'],ar:['الأيام الثلاثون القادمة','الأشهر الثلاثة القادمة','الأشهر الستة القادمة','الأشهر الاثنا عشر القادمة','السنتان القادمتان','السنوات الثلاث القادمة','السنوات الخمس القادمة','حول تاريخ محدد']};Array.from(s.options).forEach((o,i)=>{if(labels[l][i])o.textContent=labels[l][i];});}
function fixDynamic(l){
  const root=document.getElementById('ap-final-root')||document.body;if(!root)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
  nodes.forEach(n=>{const p=n.parentElement;if(!p||p.closest('script,style,textarea,.ap-report,.rapport-texte'))return;let s=n.nodeValue,t=s.trim();if(!t)return;let x=months(t,l);
    let m=x.match(/^du\s+(.+?)\s+au\s+(.+)$/i);if(m&&l!=='fr')x=T[l].from+' '+m[1]+' '+T[l].to+' '+m[2];
    m=x.match(/^Point culminant autour du\s+(.+?)(\s+·.*)?$/i);if(m&&l!=='fr')x=T[l].peak+' '+m[1]+(m[2]||'');
    m=x.match(/^Bonjour\s+(.+?)\s*✧$/i);if(m&&l!=='fr')x=(l==='en'?'Hello ':l==='es'?'Hola ':'مرحباً ')+m[1]+' ✧';
    if(x!==t)n.nodeValue=s.replace(t,x);
  });
}
let busy=false,queued=false;function apply(){if(busy)return;busy=true;try{const l=lang();document.documentElement.lang=l;document.documentElement.dir=META[l].dir;fixNav(l);fixRelationOptions(l);fixRelationPeriods(l);fixDynamic(l);}finally{busy=false;}}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
function start(){apply();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});document.addEventListener('change',e=>{if(e.target&&['ap-lang','ap-profile-lang'].includes(e.target.id)){setTimeout(schedule,0);setTimeout(schedule,100);}},true);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
