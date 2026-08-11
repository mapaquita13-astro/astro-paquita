/* ASTRO PAQUITA V34 — cache refresh */
const VERSION='astro-paquita-luxe-v34-20260811';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.map(n=>caches.delete(n)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{const r=event.request;if(r.method!=='GET')return;if(r.mode==='navigate'||r.destination==='document'){event.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));return;}event.respondWith(fetch(r).catch(()=>caches.match(r)));});
