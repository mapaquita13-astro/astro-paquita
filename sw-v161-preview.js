/* Astro Paquita V161 — service worker dédié à la prévisualisation mobile. */
const VERSION='astro-paquita-v161-preview-20260927-d';
const UI_PATHS=new Set([
  '/truth-engine.js','/refonte-final.js','/refonte-final.css',
  '/assets/truth-engine.js','/assets/refonte-final.js','/assets/refonte-final.css',
  '/assets/refonte-v127-base.js','/assets/refonte-v127-base.css',
  '/assets/v161-logic.js','/assets/v161-ui.css','/assets/v161-future.css'
]);
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const n of await caches.keys()) await caches.delete(n);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const r=event.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.mode==='navigate'||r.destination==='document'){
    event.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));
    return;
  }
  if(u.origin===self.location.origin&&UI_PATHS.has(u.pathname)){
    u.searchParams.set('v','20260927-v161d');
    event.respondWith(fetch(u.toString(),{cache:'no-store',credentials:'same-origin'}).catch(()=>fetch(r,{cache:'no-store'})));
    return;
  }
  event.respondWith(fetch(r,{cache:'no-store'}).catch(()=>caches.match(r)));
});
