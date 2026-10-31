'use strict';
// Service de prévisualisation uniquement. Aucune vente ou donnée conservée.
const http=require('node:http');
const PORT=Number(process.env.PORT||3600),ALLOWED='https://atelier-des-astres-apercu.onrender.com';
const hits=new Map();
function json(res,code,body){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(body));}
function safe(s){return String(s).normalize('NFKD').replace(/[^\x20-\x7e]/g,'?').replace(/[\\()]/g,'\\$&').slice(0,140);}
function pdf(data){
 const rows=[['ATELIER DES ASTRES - RAPPORT TEST',18],['DOCUMENT DE DEMONSTRATION - AUCUNE PREVISION',11],
 ['Prenom : '+data.firstName,12],['Date : '+data.birthdate,12],['Heure : '+data.birthtime,12],
 ['Lieu saisi : '+data.birthplace,12],["La ville n'est pas geolocalisee dans ce test.",11],
 ['AUCUN CALCUL ASTROLOGIQUE - AUCUN PAIEMENT',11],
 ['Aucune donnee personnelle n est conservee sur le serveur.',10]];
 let commands='BT\n',y=740;for(const [s,size] of rows){commands+='/F1 '+size+' Tf 1 0 0 1 50 '+y+' Tm ('+safe(s)+') Tj\n';y-=size+24;}commands+='ET';
 const objects=[null,'<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
 '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
 '<< /Length '+Buffer.byteLength(commands,'latin1')+' >>\nstream\n'+commands+'\nendstream',
 '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
 let out='%PDF-1.4\n',positions=[0];for(let i=1;i<objects.length;i++){positions.push(Buffer.byteLength(out,'latin1'));out+=i+' 0 obj\n'+objects[i]+'\nendobj\n';}
 const xref=Buffer.byteLength(out,'latin1');out+='xref\n0 '+objects.length+'\n0000000000 65535 f \n';
 for(let i=1;i<positions.length;i++)out+=String(positions[i]).padStart(10,'0')+' 00000 n \n';
 out+='trailer\n<< /Size '+objects.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF';
 return Buffer.from(out,'latin1');
}
function body(req){return new Promise((resolve,reject)=>{let n=0,a=[];req.on('data',v=>{n+=v.length;if(n>8000){reject(Error('too_large'));req.destroy();}else a.push(v)});req.on('end',()=>resolve(Buffer.concat(a).toString('utf8')));req.on('error',reject)});}
function validDate(s){if(typeof s!=='string'||!/^(19\d\d|20\d\d)-\d\d-\d\d$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s&&d<=new Date();}
http.createServer(async(req,res)=>{
 const origin=req.headers.origin||'';
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store, private');res.setHeader('Referrer-Policy','no-referrer');
 if(origin===ALLOWED){res.setHeader('Access-Control-Allow-Origin',ALLOWED);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');}
 const path=new URL(req.url,'http://localhost').pathname;
 if(req.method==='OPTIONS'){res.writeHead(origin===ALLOWED?204:403);return res.end();}
 if(req.method==='GET'&&path==='/health')return json(res,200,{ok:true,service:'atelier-des-astres-apercu-serveur',salesEnabled:false});
 if(req.method==='GET'&&path==='/api/status')return json(res,200,{mode:'preview',payments:false,originalAstroPaquita:false,cityCoordinates:false,reportPdfTest:true,dataStored:false});
 if(req.method==='GET'&&path==='/api/astro-connectivity'){
    try{const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),10000);
      const response=await fetch('https://astro-paquita.onrender.com/app-v121.html',{signal:ctrl.signal,redirect:'error'});clearTimeout(t);
      return json(res,200,{astroFrontendAccessible:response.ok,status:response.status,forecastGenerationVerified:false});}
    catch{return json(res,200,{astroFrontendAccessible:false,forecastGenerationVerified:false});}
 }
 if(req.method==='POST'&&path==='/api/test/pdf'){
   if(origin!==ALLOWED)return json(res,403,{error:'Origine non autorisee'});
   const ip=req.socket.remoteAddress||'unknown',now=Date.now();let v=hits.get(ip)||{n:0,t:now};if(now-v.t>60000)v={n:0,t:now};v.n++;hits.set(ip,v);if(v.n>8)return json(res,429,{error:'Trop de tests'});
   let data;try{data=JSON.parse(await body(req));}catch{return json(res,400,{error:'Saisie invalide'});}
   if(!data||typeof data.firstName!=='string'||data.firstName.length<1||data.firstName.length>70||!/^[\p{L}\p{M} .'-]+$/u.test(data.firstName)||!validDate(data.birthdate)||typeof data.birthtime!=='string'||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(data.birthtime)||typeof data.birthplace!=='string'||data.birthplace.trim().length<3||data.birthplace.length>140)return json(res,422,{error:'Prenom, date, heure ou lieu invalide'});
   const result=pdf(data);res.writeHead(200,{'Content-Type':'application/pdf','Content-Length':result.length,'Content-Disposition':'attachment; filename="rapport-atelier-TEST.pdf"'});return res.end(result);
 }
 return json(res,404,{error:'Route inconnue'});
}).listen(PORT,'0.0.0.0',()=>{
 console.log('Atelier previsualisation :'+PORT+' — ventes desactivees');
 (async()=>{
  try{
   const response=await fetch('http://127.0.0.1:'+PORT+'/api/test/pdf',{method:'POST',headers:{'Origin':ALLOWED,'Content-Type':'application/json'},body:JSON.stringify({firstName:'Camille',birthdate:'1990-05-15',birthtime:'08:30',birthplace:'Marseille, France'}),signal:AbortSignal.timeout(6000)});
   const result=Buffer.from(await response.arrayBuffer());
   console.log('SELFTEST_PDF',JSON.stringify({ok:response.ok && result.subarray(0,5).toString()==='%PDF-' && result.includes('Marseille, France'),status:response.status,bytes:result.length}));
  }catch(e){console.log('SELFTEST_PDF',JSON.stringify({ok:false,reason:e.name}));}
  try{
   const response=await fetch('https://astro-paquita.onrender.com/app-v121.html',{redirect:'error',signal:AbortSignal.timeout(12000)});
   console.log('SELFTEST_ASTRO_FRONTEND',JSON.stringify({accessible:response.ok,httpStatus:response.status,forecastGenerated:false}));
  }catch(e){console.log('SELFTEST_ASTRO_FRONTEND',JSON.stringify({accessible:false,reason:e.name,forecastGenerated:false}));}
 })();
});
