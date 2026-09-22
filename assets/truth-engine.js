/* Astro Paquita — compatibilité V138
   Couche technique interne. Aucun calcul astrologique n'est remplacé ici. */
(function(){
'use strict';
window.__AP_TRUTH_ENGINE_DISABLED__=true;

function bridgePremiumPromo(){
  const applyBase=window.appliquerCodePromo;
  if(typeof applyBase==='function'&&!applyBase.__apV135PromoBridge){
    const wrappedApply=async function(code,msgEl){
      const data=await applyBase.apply(this,arguments);
      try{
        if(data&&data.type==='reduction_pourcentage'&&data.checkout_required){
          const promo=String(data.code||code||'').trim().toUpperCase();
          if(promo)sessionStorage.setItem('ap-premium-promo-pending',promo);
          if(msgEl){
            msgEl.textContent=`Code ${promo} validé : -${Number(data.valeur)||0}% sera appliqué au paiement Premium.`;
            msgEl.style.color='#4ade80';
          }
        }else if(data){
          sessionStorage.removeItem('ap-premium-promo-pending');
        }
      }catch(e){}
      return data;
    };
    wrappedApply.__apV135PromoBridge=true;
    window.appliquerCodePromo=wrappedApply;
  }

  const premiumBase=window.passerPremium;
  if(typeof premiumBase==='function'&&!premiumBase.__apV135PromoBridge){
    const wrappedPremium=async function(){
      const input=document.getElementById('compte-champ-promo');
      let code='';
      try{code=String(input&&input.value||sessionStorage.getItem('ap-premium-promo-pending')||'').trim().toUpperCase()}catch(e){}
      if(!code)return premiumBase.apply(this,arguments);
      const token=localStorage.getItem('astro-token')||'';
      if(!token){
        if(typeof window.ouvrirCompte==='function')window.ouvrirCompte();
        return;
      }
      const msg=document.getElementById('compte-promo-msg');
      try{
        const resp=await fetch('/api/stripe/checkout',{
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
          body:JSON.stringify({codePromo:code})
        });
        const data=await resp.json().catch(()=>({}));
        if(!resp.ok){
          if(msg){msg.textContent=data.erreur||'Code promo ou paiement indisponible.';msg.style.color='#f87171';}
          else alert(data.erreur||'Paiement indisponible pour le moment.');
          return;
        }
        if(data.url){window.location.href=data.url;return;}
        if(msg){msg.textContent='Réponse Stripe invalide.';msg.style.color='#f87171';}
      }catch(e){
        if(msg){msg.textContent='Erreur de connexion au paiement.';msg.style.color='#f87171';}
        else alert('Erreur de connexion au paiement.');
      }
    };
    wrappedPremium.__apV135PromoBridge=true;
    wrappedPremium.__apV135Base=premiumBase;
    window.passerPremium=wrappedPremium;
  }
}

function secureMaintenanceBypass(){
  try{
    const url=new URL(location.href);
    if(url.searchParams.has('maintenance_preview')){
      url.searchParams.delete('maintenance_preview');
      history.replaceState(history.state,'',url.pathname+(url.searchParams.toString()?'?'+url.searchParams.toString():'')+url.hash);
    }
    localStorage.removeItem('astro-maintenance-bypass');
  }catch(e){}
  if(typeof window.verifierMaintenanceSite==='function'){
    setTimeout(()=>{try{window.verifierMaintenanceSite()}catch(e){}},0);
  }
}

function disableLegacyNotifications(){
  try{
    localStorage.removeItem('ap-notifications');
    for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&k.indexOf('ap-notified-')===0)localStorage.removeItem(k)}
  }catch(e){}
  document.getElementById('ap-notification-badge')?.remove();
  window.apEnableNotifications=async function(){
    try{localStorage.removeItem('ap-notifications')}catch(e){}
    document.getElementById('ap-notification-badge')?.remove();
    return false;
  };
  window.apCheckUpcomingWindows=function(){document.getElementById('ap-notification-badge')?.remove();return []};
}

function hideQuestionModule(){
  try{document.body&&document.body.classList.remove('ap-v130-question-open')}catch(e){}
  document.querySelectorAll('#mod-question,#ap-v130-question-card,[onclick*="question" i],[data-feature="question"],[data-module="question"]').forEach(el=>{
    el.style.setProperty('display','none','important');
    el.setAttribute('aria-hidden','true');
  });
}

function loadOnce(src,marker){
  if(document.querySelector(`script[${marker}]`)||document.querySelector(`script[src*="${src.split('?')[0]}"]`))return;
  const s=document.createElement('script');s.src=src;s.defer=true;s.setAttribute(marker,'1');document.head.appendChild(s);
}

loadOnce('assets/v128-visual-cleanup.js?v=137','data-ap-v137-visual-cleanup');
loadOnce('assets/client-cleanup-v137.js?v=138','data-ap-v138-client-cleanup');
hideQuestionModule();
bridgePremiumPromo();
secureMaintenanceBypass();
disableLegacyNotifications();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{hideQuestionModule();bridgePremiumPromo()},{once:true});
setTimeout(()=>{hideQuestionModule();bridgePremiumPromo()},250);
setTimeout(()=>{hideQuestionModule();bridgePremiumPromo()},1200);
})();
