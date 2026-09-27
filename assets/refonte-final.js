/* Astro Paquita V161 — chargeur d’interface sécurisé.
   Le moteur d’interface V127 est conservé dans refonte-v127-base.js.
   V161 ajoute ensuite uniquement ses corrections d’interface. */
(function(){
'use strict';
if(window.__AP_V161_LOADER__)return;
window.__AP_V161_LOADER__=true;
function load(src,id,onload){
  if(document.getElementById(id)){if(onload)onload();return;}
  const s=document.createElement('script');
  s.id=id;s.src=src;s.async=false;
  if(onload)s.onload=onload;
  s.onerror=function(){console.error('Astro Paquita: chargement impossible',src);};
  document.head.appendChild(s);
}
load('assets/refonte-v127-base.js?v=20260927-v161','ap-v161-base',function(){
  load('assets/v161-logic.js?v=20260927-v161','ap-v161-logic');
});
})();
