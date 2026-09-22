/* Astro Paquita — compatibilité V135
   Ancien moteur parallèle V127 volontairement neutralisé.
   La V121 reste l’unique source de vérité pour les maisons, transits,
   prévisions, synastries et scores.
   Ce fichier ne fait qu'amorcer les correctifs d'interface sûrs : nettoyage
   visuel, maintenance, notifications, restauration de « Ma question » et
   raccordement des parcours de paiement déjà prévus par l'application. */
(function(){
'use strict';
window.__AP_TRUTH_ENGINE_DISABLED__=true;

const originalQuestion=document.getElementById('mod-question');
const questionTemplate=originalQuestion?originalQuestion.cloneNode(true):null;
const questionOriginalParent=originalQuestion&&originalQuestion.parentElement?originalQuestion.parentElement:null;

function ensureQuestionStyle(){
  if(document.getElementById('ap-v135-question-style'))return;
  const s=document.createElement('style');s.id='ap-v135-question-style';s.textContent=`
  body.ap-v130-question-open #mod-question{display:block!important}
  body.ap-v130-question-open #q-credit-box{display:block!important}
  body.ap-v130-question-open #q-pack-btn,
  body.ap-v130-question-open button[onclick*="acheterPackQuestions"]{display:inline-flex!important}
  #q-historique-bloc,#q-historique{display:none!important}
  `;document.head.appendChild(s);
}
function ensureQuestionModule(){
  if(!questionTemplate||document.getElementById('mod-question'))return;
  const host=document.getElementById('section-modules')||questionOriginalParent;
  if(!host)return;
  host.appendChild(questionTemplate.cloneNode(true));
  try{if(typeof window.majCreditsQuestionsUI==='function')window.majCreditsQuestionsUI()}catch(e){}
  try{if(typeof window.adapterInterfaceAge==='function')window.adapterInterfaceAge(new Date())}catch(e){}
}
function protectQuestionModule(){
  if(!questionTemplate)return;
  ensureQuestionStyle();
  const root=document.body||document.documentElement;
  if(root&&!window.__AP_V135_QUESTION_OBSERVER__){
    window.__AP_V135_QUESTION_OBSERVER__=new MutationObserver(()=>{
      if(!document.getElementById('mod-question'))queueMicrotask(ensureQuestionModule);
    });
    window.__AP_V135_QUESTION_OBSERVER__.observe(root,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{
    ensureQuestionModule();
    setTimeout(ensureQuestionModule,550);
    setTimeout(ensureQuestionModule,1700);
  },{once:true});
  else ensureQuestionModule();
}

function bridgeQuestionCredits(){
  const base=window.appelerClaude;
  if(typeof base!=='function'||base.__apV135CreditsBridge)return;
  const wrapped=async function(payload){
    const data=await base.apply(this,arguments);
    try{
      if(payload&&payload.feature==='question'&&data&&Object.prototype.hasOwnProperty.call(data,'question_credits')){
        const credits=Number(data.question_credits)||0;
        data.astro_meta={...(data.astro_meta||{}),question_credits:credits};
        if(window.USER_CONNECTE){
          window.USER_CONNECTE.question_credits=credits;
          if(typeof window.majCreditsQuestionsUI==='function')window.majCreditsQuestionsUI();
          if(typeof window.majVueCompte==='function')window.majVueCompte();
        }
      }
    }catch(e){}
    return data;
  };
  wrapped.__apV135CreditsBridge=true;
  wrapped.__apV135Base=base;
  window.appelerClaude=wrapped;
}

function disablePublicQuestionHistory(){
  try{
    window.sauvegarderHistorique=function(){};
    window.chargerHistorique=function(){
      const bloc=document.getElementById('q-historique-bloc');if(bloc)bloc.style.setProperty('display','none','important');
      const cont=document.getElementById('q-historique');if(cont)cont.style.setProperty('display','none','important');
    };
  }catch(e){}
}

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

if(!document.querySelector('script[src*="assets/v128-visual-cleanup.js"]')){
  const s=document.createElement('script');
  s.src='assets/v128-visual-cleanup.js?v=135';
  s.defer=true;
  s.setAttribute('data-ap-v135-visual-cleanup','1');
  document.head.appendChild(s);
}
protectQuestionModule();
bridgeQuestionCredits();
disablePublicQuestionHistory();
bridgePremiumPromo();
secureMaintenanceBypass();
disableLegacyNotifications();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bridgeQuestionCredits();disablePublicQuestionHistory();bridgePremiumPromo()},{once:true});
setTimeout(()=>{bridgeQuestionCredits();disablePublicQuestionHistory();bridgePremiumPromo()},250);
setTimeout(()=>{bridgeQuestionCredits();disablePublicQuestionHistory();bridgePremiumPromo()},1200);
})();
