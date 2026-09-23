/* Astro Paquita — compatibilité V149
   Couche technique interne. Aucun calcul astrologique n'est remplacé ici. */
(function(){
'use strict';
window.__AP_TRUTH_ENGINE_DISABLED__=true;

const UI_MESSAGES={
  fr:{
    promo_ok:'Code {code} validé : -{pct}% sera appliqué au paiement Premium.',
    promo_unavailable:'Code promo ou paiement indisponible.',
    payment_unavailable:'Paiement indisponible pour le moment.',
    invalid_response:'Réponse Stripe invalide.',
    connection_error:'Erreur de connexion au paiement.'
  },
  en:{
    promo_ok:'Code {code} confirmed: {pct}% off will be applied to the Premium payment.',
    promo_unavailable:'Promo code or payment unavailable.',
    payment_unavailable:'Payment is currently unavailable.',
    invalid_response:'Invalid Stripe response.',
    connection_error:'Unable to connect to the payment service.'
  },
  es:{
    promo_ok:'Código {code} validado: se aplicará un {pct}% de descuento al pago Premium.',
    promo_unavailable:'Código promocional o pago no disponible.',
    payment_unavailable:'El pago no está disponible en este momento.',
    invalid_response:'Respuesta de Stripe no válida.',
    connection_error:'Error de conexión con el servicio de pago.'
  },
  ar:{
    promo_ok:'تم اعتماد الرمز {code}: سيُطبّق خصم بنسبة {pct}% على دفع Premium.',
    promo_unavailable:'رمز الخصم أو الدفع غير متاح حاليًا.',
    payment_unavailable:'الدفع غير متاح حاليًا.',
    invalid_response:'استجابة Stripe غير صالحة.',
    connection_error:'تعذر الاتصال بخدمة الدفع.'
  }
};
function uiLang(){
  const candidates=[window.AP_LANG,localStorage.getItem('astro-lang'),document.documentElement.getAttribute('lang')];
  for(const raw of candidates){const l=String(raw||'').toLowerCase().slice(0,2);if(UI_MESSAGES[l])return l}
  return 'fr';
}
function uiMessage(key,vars){
  let s=(UI_MESSAGES[uiLang()]||UI_MESSAGES.fr)[key]||UI_MESSAGES.fr[key]||key;
  Object.entries(vars||{}).forEach(([k,v])=>{s=s.replace(new RegExp('\\{'+k+'\\}','g'),String(v))});
  return s;
}

function installPublicGuardStyle(){
  if(document.getElementById('ap-v139-public-guard-style'))return;
  const s=document.createElement('style');s.id='ap-v139-public-guard-style';
  s.textContent='#mod-question,#ap-v130-question-card,[data-feature="question"],[data-module="question"],[onclick*="question" i]{display:none!important}';
  (document.head||document.documentElement).appendChild(s);
}
function bridgePremiumPromo(){
  const applyBase=window.appliquerCodePromo;
  if(typeof applyBase==='function'&&!applyBase.__apV135PromoBridge){
    const wrappedApply=async function(code,msgEl){const data=await applyBase.apply(this,arguments);try{if(data&&data.type==='reduction_pourcentage'&&data.checkout_required){const promo=String(data.code||code||'').trim().toUpperCase();if(promo)sessionStorage.setItem('ap-premium-promo-pending',promo);if(msgEl){msgEl.textContent=uiMessage('promo_ok',{code:promo,pct:Number(data.valeur)||0});msgEl.style.color='#4ade80'}}else if(data){sessionStorage.removeItem('ap-premium-promo-pending')}}catch(e){}return data};wrappedApply.__apV135PromoBridge=true;window.appliquerCodePromo=wrappedApply;
  }
  const premiumBase=window.passerPremium;
  if(typeof premiumBase==='function'&&!premiumBase.__apV135PromoBridge){
    const wrappedPremium=async function(){const input=document.getElementById('compte-champ-promo');let code='';try{code=String(input&&input.value||sessionStorage.getItem('ap-premium-promo-pending')||'').trim().toUpperCase()}catch(e){}if(!code)return premiumBase.apply(this,arguments);const token=localStorage.getItem('astro-token')||'';if(!token){if(typeof window.ouvrirCompte==='function')window.ouvrirCompte();return}const msg=document.getElementById('compte-promo-msg');try{const resp=await fetch('/api/stripe/checkout',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({codePromo:code})});const data=await resp.json().catch(()=>({}));if(!resp.ok){const text=data.erreur||uiMessage('promo_unavailable');if(msg){msg.textContent=text;msg.style.color='#f87171'}else alert(text);return}if(data.url){window.location.href=data.url;return}if(msg){msg.textContent=uiMessage('invalid_response');msg.style.color='#f87171'}}catch(e){const text=uiMessage('connection_error');if(msg){msg.textContent=text;msg.style.color='#f87171'}else alert(text)}};wrappedPremium.__apV135PromoBridge=true;wrappedPremium.__apV135Base=premiumBase;window.passerPremium=wrappedPremium;
  }
}
function secureMaintenanceBypass(){try{const url=new URL(location.href);if(url.searchParams.has('maintenance_preview')){url.searchParams.delete('maintenance_preview');history.replaceState(history.state,'',url.pathname+(url.searchParams.toString()?'?'+url.searchParams.toString():'')+url.hash)}localStorage.removeItem('astro-maintenance-bypass')}catch(e){}if(typeof window.verifierMaintenanceSite==='function')setTimeout(()=>{try{window.verifierMaintenanceSite()}catch(e){}},0)}
function disableLegacyNotifications(){try{localStorage.removeItem('ap-notifications');for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&k.indexOf('ap-notified-')===0)localStorage.removeItem(k)}}catch(e){}document.getElementById('ap-notification-badge')?.remove();window.apEnableNotifications=async function(){try{localStorage.removeItem('ap-notifications')}catch(e){}document.getElementById('ap-notification-badge')?.remove();return false};window.apCheckUpcomingWindows=function(){document.getElementById('ap-notification-badge')?.remove();return []}}
function hideQuestionModule(){try{document.body&&document.body.classList.remove('ap-v130-question-open')}catch(e){}document.querySelectorAll('#mod-question,#ap-v130-question-card,[onclick*="question" i],[data-feature="question"],[data-module="question"]').forEach(el=>{el.style.setProperty('display','none','important');el.setAttribute('aria-hidden','true')})}
function loadOnce(src,marker){
  if(document.querySelector(`script[${marker}]`)||document.querySelector(`script[src*="${src.split('?')[0]}"]`))return;
  const s=document.createElement('script');
  s.src=src;
  s.async=false;
  s.setAttribute(marker,'1');
  document.head.appendChild(s);
}

installPublicGuardStyle();
loadOnce('assets/v139-question-guard.js?v=139','data-ap-v139-question-guard');
loadOnce('assets/v141-child-portrait.js?v=146','data-ap-v141-child-portrait');
loadOnce('assets/v128-visual-cleanup.js?v=147','data-ap-v147-visual-cleanup');
loadOnce('assets/client-cleanup-v137.js?v=138','data-ap-v138-client-cleanup');
loadOnce('assets/v143-ui-sync.js?v=143','data-ap-v143-ui-sync');
loadOnce('assets/v149-copy-fix.js?v=149','data-ap-v149-copy-fix');
hideQuestionModule();bridgePremiumPromo();secureMaintenanceBypass();disableLegacyNotifications();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{hideQuestionModule();bridgePremiumPromo()},{once:true});
setTimeout(()=>{hideQuestionModule();bridgePremiumPromo()},250);setTimeout(()=>{hideQuestionModule();bridgePremiumPromo()},1200);
})();
