/* Astro Paquita V37 — cache propre et réseau prioritaire */
const CACHE_VERSION='astro-paquita-v37-clean-20260812';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const r=event.request;if(r.method!=='GET')return;
  if(r.mode==='navigate'||r.destination==='document'){
    event.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));return;
  }
  event.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));
});
