/* Astro Paquita V49 — âge réel + alertes familiales lourdes + prévisions hiérarchisées */
const VERSION='astro-paquita-v49-age-alertes-familiales-20260813';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const n of await caches.keys())await caches.delete(n);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{const r=event.request;if(r.method!=='GET')return;if(r.mode==='navigate'||r.destination==='document'){event.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));return;}event.respondWith(fetch(r).catch(()=>caches.match(r)));});
