/* Astro Paquita V144 — anti-cache interface, sans notifications */
const VERSION='astro-paquita-v144-20260922';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const n of await caches.keys())await caches.delete(n);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  const r=event.request;if(r.method!=='GET')return;
  const fresh=r.mode==='navigate'||r.destination==='document'||r.destination==='script'||r.destination==='style';
  if(fresh){event.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));return;}
  event.respondWith(fetch(r).catch(()=>caches.match(r)));
});
