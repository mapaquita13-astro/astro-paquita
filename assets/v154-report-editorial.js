/* Astro Paquita — V154 présentation éditoriale du rapport 24 mois.
   Affichage uniquement : aucune date, score, technique, maison, transit ou calcul astrologique n'est modifié. */
(function(){
'use strict';

if(window.__AP_V154_REPORT_EDITORIAL__) return;
window.__AP_V154_REPORT_EDITORIAL__=true;

const COPY={
  fr:{
    quick:'Synthèse rapide',major:'fenêtres majeures',domain:'Domaine le plus activé',strongest:'Fenêtre la plus intense',watch:'Point de vigilance',count:'Fenêtres majeures',
    periods:'Les périodes importantes',periodsSub:'Une vue chronologique des temps forts réellement détectés sur les 24 prochains mois.',
    favorable:'Période favorable',delicate:'Période plus délicate',mixed:'Période contrastée',neutral:'Période active',point:'Point fort',detail:'Voir le détail',
    brief:'En bref',possible:'Manifestations possibles',why:'Pourquoi cette période ressort ?',technical:'Convergence technique',close:'Fermer',
    note:'Les manifestations proposées sont des possibilités astrologiques relatives, jamais des probabilités statistiques ni des certitudes.',
    techNote:'Le nombre de familles indique combien de catégories de techniques astrologiques distinctes convergent sur cette période. Il mesure la convergence technique, pas la probabilité qu’un événement précis se produise.',
    noManifest:'Aucune manifestation concrète supplémentaire n’est détaillée dans le rapport source.',
    coverage:'Périodes sans convergence majeure supplémentaire',
    noWatch:'Aucune fenêtre de vigilance majeure n’est affichée dans ce rapport.',
    summary:(n,d)=>`${n} ${n>1?'fenêtres majeures ressortent':'fenêtre majeure ressort'} dans ce rapport. ${d?d+' est le domaine le plus souvent activé.':''}`,
    briefText:(domains)=>`Cette fenêtre concentre plusieurs signaux autour de ${domains.toLowerCase()}. Les exemples ci-dessous reprennent uniquement les manifestations compatibles déjà présentes dans le rapport.`
  },
  en:{
    quick:'Quick summary',major:'major windows',domain:'Most active area',strongest:'Strongest window',watch:'Watch point',count:'Major windows',
    periods:'Important periods',periodsSub:'A chronological view of the strongest periods actually detected over the next 24 months.',
    favorable:'Supportive period',delicate:'More delicate period',mixed:'Mixed period',neutral:'Active period',point:'Peak',detail:'View details',
    brief:'In brief',possible:'Possible manifestations',why:'Why does this period stand out?',technical:'Technical convergence',close:'Close',
    note:'The manifestations shown are relative astrological possibilities, not statistical probabilities or certainties.',
    techNote:'The number of technique families indicates how many distinct astrological technique categories converge on this period. It measures technical convergence, not the probability of a specific event.',
    noManifest:'No additional concrete manifestation is detailed in the source report.',coverage:'Periods without another major convergence',noWatch:'No major watch window is displayed in this report.',
    summary:(n,d)=>`${n} ${n>1?'major windows stand out':'major window stands out'} in this report. ${d?d+' is the most frequently activated area.':''}`,
    briefText:(domains)=>`This window concentrates several signals around ${domains.toLowerCase()}. The examples below only repeat compatible manifestations already present in the report.`
  },
  es:{
    quick:'Síntesis rápida',major:'ventanas principales',domain:'Área más activada',strongest:'Ventana más intensa',watch:'Punto de vigilancia',count:'Ventanas principales',
    periods:'Los períodos importantes',periodsSub:'Una vista cronológica de los períodos más fuertes realmente detectados en los próximos 24 meses.',
    favorable:'Período favorable',delicate:'Período más delicado',mixed:'Período contrastado',neutral:'Período activo',point:'Punto fuerte',detail:'Ver detalle',
    brief:'En breve',possible:'Manifestaciones posibles',why:'¿Por qué destaca este período?',technical:'Convergencia técnica',close:'Cerrar',
    note:'Las manifestaciones propuestas son posibilidades astrológicas relativas, no probabilidades estadísticas ni certezas.',
    techNote:'El número de familias indica cuántas categorías distintas de técnicas astrológicas convergen en este período. Mide la convergencia técnica, no la probabilidad de un acontecimiento concreto.',
    noManifest:'No se detalla ninguna manifestación concreta adicional en el informe fuente.',coverage:'Períodos sin otra convergencia importante',noWatch:'No se muestra ninguna ventana de vigilancia importante en este informe.',
    summary:(n,d)=>`${n} ${n>1?'ventanas principales destacan':'ventana principal destaca'} en este informe. ${d?d+' es el área activada con mayor frecuencia.':''}`,
    briefText:(domains)=>`Esta ventana concentra varias señales alrededor de ${domains.toLowerCase()}. Los ejemplos siguientes repiten únicamente manifestaciones compatibles ya presentes en el informe.`
  }
};

function lang(){const l=String(window.AP_LANG||localStorage.getItem('astro-lang')||document.documentElement.lang||'fr').toLowerCase().slice(0,2);return COPY[l]?l:'fr'}
function tx(k){return COPY[lang()][k]||COPY.fr[k]||k}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function clean(v){return String(v||'').replace(/\s+/g,' ').trim()}
function norm(v){return clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function countMatches(text,re){return (String(text||'').match(re)||[]).length}
function lines(el){return String(el&&el.innerText||'').split(/\n+/).map(clean).filter(Boolean)}

function isTitleText(t){const n=norm(t);return n.includes('temps forts des 24 prochains mois')||n.includes('24 mois qui comptent')||n.includes('evenements marquants des 24 prochains mois')||n.includes('key periods in the next 24 months')||n.includes('periodos clave de los proximos 24 meses')}
function findHeading(){
  const els=[...document.querySelectorAll('h1,h2,h3,h4,p,div,span')];
  return els.find(el=>{const t=clean(el.textContent);return t.length>6&&t.length<170&&isTitleText(t)})||null;
}
function hasPeriodPoint(text){const n=norm(text);return (n.includes('periode :')||n.includes('period:')||n.includes('periodo:'))&&(n.includes('point fort :')||n.includes('peak:')||n.includes('punto fuerte:'))}
function rawCandidates(scope){
  const all=[...scope.querySelectorAll('article,section,li,div')].filter(el=>{
    if(el.closest('.ap-v154-report,.ap-v154-detail'))return false;
    const t=clean(el.innerText);if(t.length<100||t.length>5000||!hasPeriodPoint(t))return false;
    const pc=countMatches(norm(t),/(?:periode\s*:|period\s*:|periodo\s*:)/g);
    const xc=countMatches(norm(t),/(?:point fort\s*:|peak\s*:|punto fuerte\s*:)/g);
    return pc===1&&xc===1;
  });
  return all.filter(el=>!all.some(other=>other!==el&&el.contains(other)));
}
function findScope(heading){
  let node=heading&&heading.parentElement;
  for(let i=0;node&&node!==document.body&&i<9;i++,node=node.parentElement){if(rawCandidates(node).length>=2)return node}
  return document.body;
}
function labelValue(ls,labels){
  for(let i=0;i<ls.length;i++){
    const n=norm(ls[i]);
    for(const label of labels){
      const key=norm(label);if(n.startsWith(key)){
        const original=ls[i];const idx=original.indexOf(':');
        if(idx>=0&&clean(original.slice(idx+1)))return clean(original.slice(idx+1));
        if(ls[i+1])return ls[i+1];
      }
    }
  }
  return '';
}
function detectDomain(ls,text){
  const joined=clean(text);
  let m=joined.match(/(?:Un tournant important touche|A major turning point affects|Un giro importante afecta)\s+([^·]+?)(?=\s+(?:Favorable|Délicat|Delicate|Période|Period|Periodo)|$)/i);
  if(m)return clean(m[1]);
  const pidx=ls.findIndex(x=>/^Période\s*:|^Period\s*:|^Periodo\s*:/i.test(x));
  for(let i=Math.max(0,pidx-4);i<pidx;i++){
    const s=ls[i];if(!/favorable|délicat|delicate|importance|tournant important|turning point|giro importante/i.test(s)&&s.length<90)return s;
  }
  return '';
}
function parseManifestations(ls){
  const out=[];let capture=false,expect=false;
  for(const s of ls){
    const n=norm(s);
    if(n.includes('manifestations possibles')||n.includes('ce qui est le plus susceptible de se produire')||n.includes('possible manifestations')){capture=true;expect=false;continue}
    if(!capture)continue;
    if(n.includes('possibilites astrologiques relatives')||n.includes('astrological possibilities')||n==='en bref'||n.includes('périodes sans convergence'))break;
    if(n==='scenario principal'||n==='autre possibilite'||n==='manifestation possible'||n==='main scenario'||n==='other possibility'){expect=true;continue}
    if(expect||(!n.includes('importance')&&!n.includes('point fort')&&!n.includes('periode :'))){
      if(s.length>12&&s.length<240&&!/^Manifestations? possibles?$/i.test(s)){out.push(s);expect=false}
    }
  }
  return [...new Set(out)].slice(0,5);
}
function parseCard(el){
  const ls=lines(el),text=clean(el.innerText);
  const period=labelValue(ls,['Période :','Period:','Periodo:']);
  const point=labelValue(ls,['Point fort :','Peak:','Punto fuerte:']);
  const importance=labelValue(ls,['Importance :','Importance:','Importancia:']);
  const domain=detectDomain(ls,text);
  const n=norm(text);
  const polarity=n.includes('delicat')||n.includes('delicate')||n.includes('dificil')?'delicate':(n.includes('favorable')?'favorable':'neutral');
  const fm=text.match(/(\d+)\s+familles?\s+de\s+techniques/i)||text.match(/(\d+)\s+technique\s+famil/i)||text.match(/(\d+)\s+familias?\s+de\s+técnicas/i);
  const familyCount=fm?Number(fm[1]):0;
  return {el,period,point,importance,domain,polarity,familyCount,manifestations:parseManifestations(ls),raw:text};
}
function groupCards(cards){
  const map=new Map();
  cards.map(parseCard).filter(x=>x.period&&x.point).forEach(item=>{
    const key=norm(item.period)+'|'+norm(item.point);
    if(!map.has(key))map.set(key,{period:item.period,point:item.point,importance:item.importance,polarity:item.polarity,familyCount:item.familyCount,domains:[],manifestations:[],els:[]});
    const g=map.get(key);g.els.push(item.el);
    if(item.domain&&!g.domains.includes(item.domain))g.domains.push(item.domain);
    item.manifestations.forEach(m=>{if(!g.manifestations.includes(m))g.manifestations.push(m)});
    if(item.familyCount>g.familyCount)g.familyCount=item.familyCount;
    if(!g.importance&&item.importance)g.importance=item.importance;
    if(g.polarity!==item.polarity)g.polarity='neutral';
  });
  return [...map.values()];
}
function dominantDomain(groups){
  const counts=new Map();groups.forEach(g=>g.domains.forEach(d=>counts.set(d,(counts.get(d)||0)+1)));
  return [...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'';
}
function strongestGroup(groups){return groups.slice().sort((a,b)=>(b.familyCount||0)-(a.familyCount||0))[0]||null}
function watchGroup(groups){return groups.find(g=>g.polarity==='delicate')||null}
function polarityLabel(p){return p==='favorable'?tx('favorable'):p==='delicate'?tx('delicate'):p==='neutral'?tx('neutral'):tx('mixed')}
function polarityClass(p){return p==='favorable'?'good':p==='delicate'?'bad':'neutral'}
function iconFor(domain){const n=norm(domain);if(n.includes('foyer')||n.includes('logement')||n.includes('home'))return '⌂';if(n.includes('famille')||n.includes('family'))return '♟';if(n.includes('travail')||n.includes('work')||n.includes('activite'))return '▣';if(n.includes('etude')||n.includes('apprentissage')||n.includes('study'))return '◇';if(n.includes('relation')||n.includes('couple')||n.includes('love'))return '♡';if(n.includes('argent')||n.includes('money')||n.includes('patrimoine'))return '◈';return '✦'}

function installStyle(){
  if(document.getElementById('ap-v154-style'))return;
  const s=document.createElement('style');s.id='ap-v154-style';s.textContent=`
  .ap-v154-report{margin:18px 0 30px;color:#3e2840;font-family:Lato,Arial,sans-serif}
  .ap-v154-report *{box-sizing:border-box}.ap-v154-quick{background:linear-gradient(145deg,#25142f,#4a2348);color:#fff8ef;border-radius:26px;padding:22px;margin:0 0 20px;box-shadow:0 16px 38px rgba(46,25,49,.16)}
  .ap-v154-kicker{color:#e1be78;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-bottom:7px}.ap-v154-quick h2{font:600 31px/1.05 'Cormorant Garamond',Georgia,serif;margin:0 0 10px;color:#fff8ef}.ap-v154-quick p{margin:0;color:#eadfed;line-height:1.55;font-size:14px}
  .ap-v154-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:18px}.ap-v154-stat{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.12);border-radius:17px;padding:13px;min-height:92px}.ap-v154-stat b{display:block;color:#d9bb7c;font-size:10px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:7px}.ap-v154-stat strong{display:block;font:600 19px/1.15 'Cormorant Garamond',Georgia,serif;color:#fff8ef}.ap-v154-stat small{display:block;margin-top:5px;color:#cdbfce;font-size:11px;line-height:1.3}
  .ap-v154-period-head{margin:28px 0 12px}.ap-v154-period-head h2{font:600 30px/1.05 'Cormorant Garamond',Georgia,serif;margin:0;color:#311d38}.ap-v154-period-head p{margin:7px 0 0;color:#765f75;font-size:13px;line-height:1.45}
  .ap-v154-timeline{position:relative;padding-left:26px}.ap-v154-timeline:before{content:'';position:absolute;left:8px;top:8px;bottom:8px;width:1px;background:linear-gradient(#4da77b,#d4b46d,#d7767d)}
  .ap-v154-item{position:relative;background:rgba(255,250,243,.94);border:1px solid rgba(73,42,70,.12);border-radius:20px;padding:17px 17px 15px;margin:0 0 14px;box-shadow:0 10px 26px rgba(67,42,65,.08)}.ap-v154-item:before{content:'';position:absolute;left:-24px;top:23px;width:13px;height:13px;border-radius:50%;border:2px solid #fdf7ef;background:#b3946d;box-shadow:0 0 0 1px rgba(50,30,48,.15)}.ap-v154-item.good:before{background:#39a675}.ap-v154-item.bad:before{background:#d95f6d}.ap-v154-item.neutral:before{background:#c29a56}
  .ap-v154-date{font-weight:800;color:#382139;font-size:14px}.ap-v154-badge{display:inline-flex;align-items:center;gap:6px;margin:8px 0 10px;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:800;background:#efe4e9;color:#5b3856}.ap-v154-item.good .ap-v154-badge{background:#e5f4eb;color:#24784f}.ap-v154-item.bad .ap-v154-badge{background:#fae7e8;color:#a64250}
  .ap-v154-domains{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px}.ap-v154-domain{display:inline-flex;align-items:center;gap:6px;background:#f5ece5;border-radius:10px;padding:7px 9px;font-size:11px;color:#51364e}.ap-v154-point{font-size:12px;color:#7d566d;margin-bottom:10px}.ap-v154-point b{color:#7a3047}.ap-v154-item p{margin:0;color:#665267;font-size:12px;line-height:1.5}
  .ap-v154-detail-btn{margin-top:12px;width:100%;border:0;border-radius:12px;padding:10px 13px;background:#f2e5dd;color:#4c2a45;font-weight:800;cursor:pointer;text-align:left}.ap-v154-detail-btn span{float:right}
  .ap-v154-coverage{margin-top:14px;padding:16px 17px;background:linear-gradient(145deg,#efe4ef,#f6eee5);border:1px solid rgba(75,47,74,.12);border-radius:18px}.ap-v154-coverage h3{font:600 20px/1.1 'Cormorant Garamond',Georgia,serif;margin:0 0 7px;color:#493047}.ap-v154-coverage p{margin:0;color:#6c586b;font-size:12px;line-height:1.5}
  .ap-v154-detail{position:fixed;inset:0;z-index:999999;background:rgba(25,12,30,.68);display:none;align-items:flex-start;justify-content:center;padding:24px;overflow:auto}.ap-v154-detail.open{display:flex}.ap-v154-sheet{width:min(720px,100%);background:#fff9f1;border-radius:28px;overflow:hidden;box-shadow:0 30px 80px rgba(20,10,22,.35)}
  .ap-v154-sheet-head{padding:24px;background:radial-gradient(circle at 90% 0,#6d3d6a 0,#35203f 42%,#211529 100%);color:#fff}.ap-v154-sheet-head button{float:right;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;border-radius:999px;padding:7px 10px;cursor:pointer}.ap-v154-sheet-head h2{font:600 30px/1.05 'Cormorant Garamond',Georgia,serif;margin:18px 0 7px;color:#fff}.ap-v154-sheet-head p{margin:0;color:#e5d8e5;font-size:12px}.ap-v154-sheet-body{padding:22px}.ap-v154-section{padding:0 0 20px;margin-bottom:20px;border-bottom:1px solid #eadfd8}.ap-v154-section:last-child{border:0;margin:0;padding:0}.ap-v154-section h3{font:600 24px/1.05 'Cormorant Garamond',Georgia,serif;color:#3e2740;margin:0 0 10px}.ap-v154-section p{color:#6d5a6d;font-size:13px;line-height:1.55;margin:0}.ap-v154-manifest{display:grid;gap:8px}.ap-v154-manifest div{background:#f8efe7;border:1px solid #ebddd4;border-radius:13px;padding:11px 12px;color:#584457;font-size:12px;line-height:1.4}.ap-v154-tech{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:10px}.ap-v154-tech div{background:#f4e8e1;border-radius:12px;padding:11px}.ap-v154-tech b{display:block;color:#8a5a45;font-size:10px;text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px}.ap-v154-tech strong{font:600 17px/1.15 'Cormorant Garamond',Georgia,serif;color:#4c3349}
  @media(max-width:760px){.ap-v154-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ap-v154-quick{border-radius:20px;padding:18px}.ap-v154-quick h2{font-size:27px}.ap-v154-timeline{padding-left:22px}.ap-v154-timeline:before{left:6px}.ap-v154-item:before{left:-21px}.ap-v154-detail{padding:0;align-items:stretch}.ap-v154-sheet{border-radius:0;min-height:100vh;width:100%}.ap-v154-tech{grid-template-columns:1fr}.ap-v154-sheet-head{padding:20px}.ap-v154-sheet-body{padding:18px}}
  `;(document.head||document.documentElement).appendChild(s);
}

function findCoverage(scope){
  const els=[...scope.querySelectorAll('div,section,p,article')];
  const hit=els.find(el=>{const t=clean(el.innerText);const n=norm(t);return t.length>80&&t.length<1800&&(n.includes('aucune autre fenetre independante')||n.includes('periodes sans convergence majeure supplementaire')||n.includes('no other independent window'))});
  return hit?clean(hit.innerText):'';
}
function hideOldSummary(scope){
  [...scope.querySelectorAll('h2,h3,h4,strong,b')].forEach(h=>{const n=norm(h.textContent);if(n==='en bref'||n==='in brief'){let p=h.parentElement;for(let i=0;p&&p!==scope&&i<3;i++,p=p.parentElement){const t=clean(p.innerText);if(t.length>150&&t.length<2200&&!hasPeriodPoint(t)){p.style.display='none';break}}}});
  [...scope.querySelectorAll('h2,h3,h4,p,div')].forEach(el=>{const t=clean(el.textContent);if(t.length<90&&(norm(t)==='les domaines les plus fortement actives'||norm(t)==='ce qui peut reellement changer'))el.style.display='none'});
}
function buildReport(groups,scope){
  const dominant=dominantDomain(groups),strong=strongestGroup(groups),watch=watchGroup(groups),coverage=findCoverage(scope);
  const summary=tx('summary')(groups.length,dominant);
  const view=document.createElement('div');view.className='ap-v154-report';
  const strongValue=strong?strong.period:'—';
  const watchValue=watch?watch.period:tx('noWatch');
  view.innerHTML=`<section class="ap-v154-quick"><div class="ap-v154-kicker">${esc(tx('quick'))}</div><h2>${esc(tx('quick'))}</h2><p>${esc(summary)}</p><div class="ap-v154-stat-grid"><div class="ap-v154-stat"><b>${esc(tx('domain'))}</b><strong>${esc(dominant||'—')}</strong></div><div class="ap-v154-stat"><b>${esc(tx('strongest'))}</b><strong>${esc(strongValue)}</strong>${strong&&strong.familyCount?`<small>${strong.familyCount} familles de techniques</small>`:''}</div><div class="ap-v154-stat"><b>${esc(tx('watch'))}</b><strong>${esc(watchValue)}</strong></div><div class="ap-v154-stat"><b>${esc(tx('count'))}</b><strong>${groups.length}</strong><small>${esc(tx('major'))}</small></div></div></section><header class="ap-v154-period-head"><h2>${esc(tx('periods'))}</h2><p>${esc(tx('periodsSub'))}</p></header><div class="ap-v154-timeline"></div>${coverage?`<section class="ap-v154-coverage"><h3>${esc(tx('coverage'))}</h3><p>${esc(coverage)}</p></section>`:''}`;
  const timeline=view.querySelector('.ap-v154-timeline');
  groups.forEach((g,i)=>{
    const article=document.createElement('article');article.className='ap-v154-item '+polarityClass(g.polarity);
    const domains=g.domains.length?g.domains:['Domaine activé'];
    const summaryText=`Plusieurs signaux convergent autour de ${domains.join(' · ')}.`;
    article.innerHTML=`<div class="ap-v154-date">${esc(g.period)}</div><div class="ap-v154-badge">● ${esc(polarityLabel(g.polarity))}</div><div class="ap-v154-domains">${domains.map(d=>`<span class="ap-v154-domain"><span>${esc(iconFor(d))}</span>${esc(d)}</span>`).join('')}</div><div class="ap-v154-point"><b>${esc(tx('point'))} :</b> ${esc(g.point)}${g.familyCount?` · ${g.familyCount} familles de techniques`:''}</div><p>${esc(summaryText)}</p><button type="button" class="ap-v154-detail-btn" data-i="${i}">${esc(tx('detail'))}<span>›</span></button>`;
    timeline.appendChild(article);
  });
  view.querySelectorAll('.ap-v154-detail-btn').forEach(btn=>btn.onclick=()=>openDetail(groups[Number(btn.dataset.i)]));
  return view;
}
function ensureDetail(){
  let d=document.getElementById('ap-v154-detail');if(d)return d;
  d=document.createElement('div');d.id='ap-v154-detail';d.className='ap-v154-detail';d.innerHTML='<div class="ap-v154-sheet"></div>';
  d.addEventListener('click',e=>{if(e.target===d)d.classList.remove('open')});document.body.appendChild(d);return d;
}
function openDetail(g){
  const d=ensureDetail(),sheet=d.querySelector('.ap-v154-sheet'),domains=g.domains.length?g.domains.join(' · '):'Domaine activé';
  const manifests=g.manifestations.length?g.manifestations:[tx('noManifest')];
  sheet.innerHTML=`<header class="ap-v154-sheet-head"><button type="button" class="ap-v154-close">× ${esc(tx('close'))}</button><div class="ap-v154-kicker">${esc(g.period)}</div><h2>${esc(domains)}</h2><p>${esc(polarityLabel(g.polarity))} · ${esc(tx('point'))} : ${esc(g.point)}</p></header><div class="ap-v154-sheet-body"><section class="ap-v154-section"><h3>${esc(tx('brief'))}</h3><p>${esc(tx('briefText')(domains))}</p></section><section class="ap-v154-section"><h3>${esc(tx('possible'))}</h3><div class="ap-v154-manifest">${manifests.map(m=>`<div>✦ ${esc(m)}</div>`).join('')}</div><p style="margin-top:10px">${esc(tx('note'))}</p></section><section class="ap-v154-section"><h3>${esc(tx('why'))}</h3><div class="ap-v154-tech"><div><b>${esc(tx('technical'))}</b><strong>${g.familyCount?g.familyCount+' familles de techniques':esc(g.importance||'Signal convergent')}</strong></div><div><b>${esc(tx('point'))}</b><strong>${esc(g.point)}</strong></div><div><b>Période</b><strong>${esc(g.period)}</strong></div></div><p style="margin-top:12px">${esc(tx('techNote'))}</p></section></div>`;
  sheet.querySelector('.ap-v154-close').onclick=()=>d.classList.remove('open');d.classList.add('open');
}

function run(){
  installStyle();const heading=findHeading();if(!heading)return;const scope=findScope(heading);const cards=rawCandidates(scope);if(cards.length<2)return;
  const groups=groupCards(cards);if(!groups.length)return;
  const fingerprint=groups.map(g=>[g.period,g.point,g.domains.join('|'),g.familyCount].join('~')).join('||');
  let existing=scope.querySelector(':scope > .ap-v154-report');if(!existing)existing=scope.querySelector('.ap-v154-report');
  if(existing&&existing.dataset.fp===fingerprint)return;
  if(existing)existing.remove();
  cards.forEach(c=>{c.style.display='none';c.dataset.apV154Hidden='1'});hideOldSummary(scope);
  const view=buildReport(groups,scope);view.dataset.fp=fingerprint;
  const anchor=cards[0];anchor.parentElement.insertBefore(view,anchor);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(run,120)}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
setTimeout(run,350);setTimeout(run,1200);setInterval(run,3500);
})();
