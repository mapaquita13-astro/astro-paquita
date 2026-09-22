/* Astro Paquita — V139 verrouillage du module « Ma question ».
   Interface uniquement : aucun calcul astrologique n'est modifié. */
(function(){
'use strict';
const ID='ap-v130-question-card';

function ensureSentinel(){
  let q=document.getElementById(ID);
  if(q&&q.dataset.apQuestionGuard==='1')return q;
  if(q)q.remove();
  q=document.createElement('span');
  q.id=ID;
  q.dataset.apQuestionGuard='1';
  q.hidden=true;
  q.setAttribute('aria-hidden','true');
  q.style.setProperty('display','none','important');
  (document.body||document.documentElement).appendChild(q);
  return q;
}

function guard(){
  try{document.body&&document.body.classList.remove('ap-v130-question-open')}catch(e){}
  const q=ensureSentinel();
  q.onclick=null;
  q.style.setProperty('display','none','important');
  q.setAttribute('aria-hidden','true');

  const mod=document.getElementById('mod-question');
  if(mod){mod.style.setProperty('display','none','important');mod.setAttribute('aria-hidden','true')}

  document.querySelectorAll('[data-feature="question"],[data-module="question"],[onclick*="question" i]').forEach(el=>{
    if(el.id===ID)return;
    el.style.setProperty('display','none','important');
    el.setAttribute('aria-hidden','true');
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',guard,{once:true});else guard();
let timer;
new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(guard,60)}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(guard,250);
setTimeout(guard,1200);
})();
