/* Astro Paquita V181 — restauration des actions d'export des prévisions.
   Aucun calcul astrologique n'est modifié. */
(function(){
'use strict';
if(window.__AP_V181_FORECAST_EXPORT__)return;
window.__AP_V181_FORECAST_EXPORT__=true;

const q=(s,r)=> (r||document).querySelector(s);
const lang=()=>String(localStorage.getItem('astro-lang')||window.AP_LANG||'fr').toLowerCase().slice(0,2);
const TX={
  fr:{print:'Imprimer / PDF',download:'Télécharger',title:'Prévisions Astro Paquita'},
  en:{print:'Print / PDF',download:'Download',title:'Astro Paquita Forecast'},
  es:{print:'Imprimir / PDF',download:'Descargar',title:'Previsiones Astro Paquita'},
  ar:{print:'طباعة / PDF',download:'تنزيل',title:'توقعات Astro Paquita'}
};
function tr(k){return (TX[lang()]||TX.fr)[k]||TX.fr[k]||k;}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function profileName(){
  try{
    const p=window.AstroTruth&&AstroTruth.currentProfile?AstroTruth.currentProfile():null;
    return p&&p.prenom?String(p.prenom):'';
  }catch(e){return'';}
}
function cleanClone(card){
  const clone=card.cloneNode(true);
  clone.querySelectorAll('.ap-forecast-export-actions').forEach(x=>x.remove());
  return clone;
}
function documentHtml(card){
  const title=(q('h2',card)?.textContent||tr('title')).trim();
  const who=profileName();
  const clone=cleanClone(card);
  return '<!doctype html><html lang="'+esc(lang())+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title)+'</title><style>'+
    'body{font-family:Arial,Helvetica,sans-serif;color:#2f2430;background:#fff;margin:0;padding:32px;line-height:1.55}'+
    '.wrap{max-width:850px;margin:0 auto}.brand{font-family:Georgia,serif;color:#6b305b;font-size:30px;font-weight:700;margin-bottom:4px}.who{color:#756875;margin-bottom:24px}.ap-eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8c6d88}.ap-card{border:0!important;box-shadow:none!important;padding:0!important;background:#fff!important}.ap-report h1,.ap-report h2,.ap-report h3{font-family:Georgia,serif;color:#5a304f}.ap-report p{margin:0 0 12px}.ap-report li{margin-bottom:6px}@media print{body{padding:0}.wrap{max-width:none}}'+
    '</style></head><body><div class="wrap"><div class="brand">Astro Paquita</div>'+(who?'<div class="who">'+esc(who)+'</div>':'')+clone.outerHTML+'</div></body></html>';
}
function printForecast(card){
  const w=window.open('','_blank');
  if(!w)return;
  w.document.open();
  w.document.write(documentHtml(card));
  w.document.close();
  const go=()=>{try{w.focus();w.print();}catch(e){}};
  if(w.document.readyState==='complete')setTimeout(go,150);
  else w.addEventListener('load',()=>setTimeout(go,150),{once:true});
}
function safeFileName(card){
  const raw=(q('h2',card)?.textContent||'previsions').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'previsions';
  return 'astro-paquita-'+raw+'.html';
}
function downloadForecast(card){
  const blob=new Blob([documentHtml(card)],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=safeFileName(card);
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function enhance(){
  const out=q('#ap-forecast-result');
  if(!out)return;
  const card=q('.ap-forecast-v174,.ap-forecast-v164',out);
  if(!card||q('.ap-forecast-export-actions',card))return;
  const actions=document.createElement('div');
  actions.className='ap-actions ap-forecast-export-actions';
  actions.style.cssText='display:flex;flex-wrap:wrap;gap:10px;margin-top:22px;padding-top:16px;border-top:1px solid rgba(91,48,79,.14)';
  const p=document.createElement('button');
  p.type='button';p.className='ap-btn ap-btn-primary';p.textContent='🖨 '+tr('print');
  p.onclick=()=>printForecast(card);
  const d=document.createElement('button');
  d.type='button';d.className='ap-btn ap-btn-soft';d.textContent='↓ '+tr('download');
  d.onclick=()=>downloadForecast(card);
  actions.append(p,d);
  card.appendChild(actions);
}
let pending=false;
const obs=new MutationObserver(()=>{
  if(pending)return;
  pending=true;
  requestAnimationFrame(()=>{pending=false;enhance();});
});
function start(){
  enhance();
  obs.observe(document.getElementById('ap-final-root')||document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();