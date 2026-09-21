/* Astro Paquita V128.8 — anti-cache interface */
const VERSION='astro-paquita-v128-8-20260921';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const n of await caches.keys())await caches.delete(n);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  const r=event.request;if(r.method!=='GET')return;
  const fresh=r.mode==='navigate'||r.destination==='document'||r.destination==='script'||r.destination==='style';
  if(fresh){event.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));return;}
  event.respondWith(fetch(r).catch(()=>caches.match(r)));
});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SHOW_NOTIFICATION'){self.registration.showNotification(event.data.title||'Astro Paquita',{body:event.data.body||'',icon:event.data.icon||undefined});}});
