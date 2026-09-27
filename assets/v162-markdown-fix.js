/* Astro Paquita V162f — rendu propre des interprétations IA.
   Couche d'affichage uniquement : aucun calcul astrologique n'est modifié. */
(function(){
'use strict';
if(window.__AP_V162F_MARKDOWN_FIX__)return;
window.__AP_V162F_MARKDOWN_FIX__=true;

function esc(s){
  return String(s==null?'':s).replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
function inline(s){
  let x=esc(s);
  x=x.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
  x=x.replace(/__(.+?)__/g,'<strong>$1</strong>');
  x=x.replace(/(^|[\s(])\*([^*\n]+?)\*(?=$|[\s).,;:!?])/g,'$1<em>$2</em>');
  x=x.replace(/`([^`]+)`/g,'<code>$1</code>');
  return x;
}
function render(text){
  const lines=String(text||'').replace(/\r/g,'').split('\n');
  let out='',para=[],list=null,items=[];
  const flushPara=()=>{
    if(!para.length)return;
    const t=para.join(' ').trim();
    if(t)out+='<p>'+inline(t)+'</p>';
    para=[];
  };
  const flushList=()=>{
    if(!list||!items.length){list=null;items=[];return;}
    const tag=list==='ol'?'ol':'ul';
    out+='<'+tag+'>'+items.map(x=>'<li>'+inline(x)+'</li>').join('')+'</'+tag+'>';
    list=null;items=[];
  };
  const flush=()=>{flushPara();flushList();};

  for(const raw of lines){
    const t=raw.trim();
    if(!t){flush();continue;}
    if(/^```/.test(t)){flush();continue;}
    if(/^[-_*]{3,}$/.test(t)){flush();continue;}

    const h=t.match(/^(#{1,6})\s*(.+)$/);
    if(h){
      flush();
      const level=h[1].length<=2?'h2':'h3';
      out+='<'+level+'>'+inline(h[2].replace(/^#+\s*/,''))+'</'+level+'>';
      continue;
    }
    const bullet=t.match(/^[-*•]\s+(.+)$/);
    if(bullet){
      flushPara();
      if(list&&list!=='ul')flushList();
      list='ul';items.push(bullet[1]);continue;
    }
    const numbered=t.match(/^\d+[.)]\s+(.+)$/);
    if(numbered){
      flushPara();
      if(list&&list!=='ol')flushList();
      list='ol';items.push(numbered[1]);continue;
    }
    const quote=t.match(/^>\s*(.+)$/);
    if(quote){flush();out+='<blockquote>'+inline(quote[1])+'</blockquote>';continue;}

    // Certains modèles renvoient parfois les marqueurs Markdown collés au titre.
    // On les retire ici au lieu de les afficher tels quels à l'utilisateur.
    if(/^#{1,6}/.test(t)){
      flush();out+='<h3>'+inline(t.replace(/^#{1,6}\s*/,''))+'</h3>';continue;
    }
    para.push(t);
  }
  flush();
  return out;
}

try{window.formatRapport=render;}catch(e){}
try{formatRapport=render;}catch(e){}
window.__AP_FORMAT_RAPPORT_V162F__=render;
document.documentElement.dataset.astroMarkdown='v162f';
})();
