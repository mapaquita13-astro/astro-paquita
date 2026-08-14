/* Astro Paquita V74 — événements / timeline cohérents */
const VERSION='astro-paquita-v74-evenements-timeline-coherents-20260814';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const n of await caches.keys())await caches.delete(n);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{const r=event.request;if(r.method!=='GET')return;if(r.mode==='navigate'||r.destination==='document'){event.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));return;}event.respondWith(fetch(r).catch(()=>caches.match(r)));});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SHOW_NOTIFICATION'){self.registration.showNotification(event.data.title||'Astro Paquita',{body:event.data.body||'',icon:event.data.icon||undefined});}});
