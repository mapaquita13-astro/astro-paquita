/* Astro Paquita V43 — événements dédupliqués + périodes d'influence + network-first */
const VERSION='astro-paquita-v43-20260812';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const n of await caches.keys()) await caches.delete(n);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  const r=event.request;
  if(r.method!=='GET') return;
  if(r.mode==='navigate'||r.destination==='document'){
    event.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));
  } else {
    event.respondWith(fetch(r).catch(()=>caches.match(r)));
  }
});
