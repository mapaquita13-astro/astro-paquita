/* Astro Paquita — V160 runtime guard. */
(function(){
'use strict';
if(window.__AP_V160_RUNTIME_GUARD__)return;
window.__AP_V160_RUNTIME_GUARD__=true;
document.addEventListener('change',function(e){
  const sel=e.target&&e.target.closest&&e.target.closest('#ap160-app [data-lang]');
  if(!sel)return;
  e.stopImmediatePropagation();
  const l=String(sel.value||'fr').toLowerCase().slice(0,2);
  window.AP_LANG=l;
  try{localStorage.setItem('astro-lang',l)}catch(err){}
  document.documentElement.lang=l;
  document.documentElement.dir=l==='ar'?'rtl':'ltr';
  const old=document.getElementById('ap100-lang');
  if(old){old.value=l;old.dispatchEvent(new Event('change',{bubbles:true}))}
  setTimeout(()=>location.reload(),30);
},true);
})();