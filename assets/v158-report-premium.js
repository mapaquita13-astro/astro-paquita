/* Astro Paquita — V158 rapports / PDF premium.
   Mise en page uniquement. */
(function(){
'use strict';
if(window.__AP_V158_REPORT_PREMIUM__)return;
window.__AP_V158_REPORT_PREMIUM__=true;
function clean(v){return String(v||'').replace(/\s+/g,' ').trim()}
function lang(){return String(window.AP_LANG||localStorage.getItem('astro-lang')||document.documentElement.lang||'fr').toLowerCase().slice(0,2)}
function locale(){return({fr:'fr-FR',en:'en-GB',es:'es-ES',ar:'ar'})[lang()]||'fr-FR'}
function profileName(){for(const s of ['#ap100-mobile-profile-name','#ap100-profile-name','.ap121-profile-name','[data-active-profile-name]']){const t=clean(document.querySelector(s)?.textContent);if(t&&!/profil|profile|créer|create|ajouter|add/i.test(t))return t}try{if(window.USER)return clean(USER.prenom||USER.nom||'')}catch(e){}return ''}
function addStyle(){if(document.getElementById('ap158-pdf-style'))return;const s=document.createElement('style');s.id='ap158-pdf-style';s.textContent=`
.ap158-pdf-cover{display:none}.ap158-pdf-footer{display:none}
@media print{
 @page{size:A4;margin:16mm 14mm 18mm}
 .ap158-print-target{font-size:10.5pt!important;line-height:1.48!important;background:#fff!important;color:#241b21!important}
 .ap158-print-target .ap158-pdf-cover{display:flex!important;min-height:245mm;flex-direction:column;justify-content:center;align-items:flex-start;break-after:page;padding:18mm;background:linear-gradient(150deg,#fffaf2 0%,#f3e7df 70%,#ead8df 100%)!important;color:#42183d!important;border:1px solid #eadfd8}
 .ap158-pdf-cover .brand{font-size:10pt;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#9b7132;margin-bottom:22mm}
 .ap158-pdf-cover h1{font:600 34pt/1.02 'Cormorant Garamond',Georgia,serif!important;max-width:155mm;margin:0 0 8mm!important;color:#42183d!important}
 .ap158-pdf-cover .meta{font-size:11pt;color:#6e5966;margin-bottom:18mm}.ap158-pdf-cover .rule{width:34mm;height:1px;background:#bd9653;margin-bottom:10mm}.ap158-pdf-cover .note{max-width:130mm;color:#7a6672;font-size:10pt;line-height:1.5}
 .ap158-print-target .ap158-pdf-footer{display:block!important;position:fixed;bottom:-11mm;left:0;right:0;text-align:center;font-size:8pt;color:#8c7a84;letter-spacing:.05em}
 .ap158-print-target h1,.ap158-print-target h2,.ap158-print-target h3,.ap158-print-target h4{break-after:avoid;page-break-after:avoid;color:#42183d!important}
 .ap158-print-target p,.ap158-print-target li{orphans:3;widows:3}.ap158-print-target article,.ap158-print-target section,.ap158-print-target .card{break-inside:avoid-page}
 .ap158-print-target button,.ap158-print-target .ap158-report-tools,.ap158-print-target details:not([open]){display:none!important}
}
`;document.head.appendChild(s)}
function ensureCover(target){if(!target||target.querySelector(':scope > .ap158-pdf-cover'))return;const title=clean(target.querySelector('h1,h2,h3')?.textContent)||'Astro Paquita';const name=profileName();const date=new Intl.DateTimeFormat(locale(),{dateStyle:'long'}).format(new Date());const cover=document.createElement('section');cover.className='ap158-pdf-cover';cover.innerHTML=`<div class="brand">ASTRO PAQUITA</div><div class="rule"></div><h1></h1><div class="meta"></div><div class="note">Analyse personnalisée · Les calculs astrologiques, l’interprétation et les manifestations possibles sont présentés séparément afin de garder une lecture claire.</div>`;cover.querySelector('h1').textContent=title;cover.querySelector('.meta').textContent=[name,date].filter(Boolean).join(' · ');target.prepend(cover);const footer=document.createElement('div');footer.className='ap158-pdf-footer';footer.textContent='Astro Paquita · Rapport personnel';target.appendChild(footer)}
function prepare(){addStyle();const target=document.querySelector('.ap158-print-target');if(target)ensureCover(target)}
addStyle();window.addEventListener('beforeprint',prepare);document.addEventListener('click',e=>{if(e.target.closest('.ap158-tool'))setTimeout(prepare,0)},true);
})();