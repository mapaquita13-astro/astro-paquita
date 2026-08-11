/* ASTRO PAQUITA V30 — always-fresh service worker */
const VERSION='astro-paquita-v30-20260811';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const n of await caches.keys())await caches.delete(n);await self.clients.claim();})()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;if(e.request.mode==='navigate'||e.request.destination==='document'){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));return;}e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));});
