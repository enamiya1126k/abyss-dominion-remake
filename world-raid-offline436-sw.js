const CACHE='abyss-world-offline-build436';
const base=new URL('./',self.location.href);
const key=url=>{const u=new URL(url,base);u.search='';u.hash='';return u.href;};
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
 if(event.data?.type!=='prepareWorldRaid430')return;
 event.waitUntil((async()=>{
  try{const cache=await caches.open(CACHE),urls=[...new Set(event.data.urls)].map(u=>new URL(u,base)).filter(u=>u.origin===base.origin&&u.pathname.startsWith(base.pathname));
   let index=0;const worker=async()=>{while(index<urls.length){const url=urls[index++];if(await cache.match(key(url)))continue;const response=await fetch(url.href,{cache:'reload'});if(!response.ok)throw new Error(url.pathname);await cache.put(key(url),response);}};
   await Promise.all(Array.from({length:4},worker));event.ports[0]?.postMessage({ok:true});
  }catch{event.ports[0]?.postMessage({ok:false});}
 })());
});
self.addEventListener('fetch',event=>{
 const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==base.origin||!u.pathname.startsWith(base.pathname))return;
 if(r.mode==='navigate'){event.respondWith((async()=>{const cache=await caches.open(CACHE),index=new URL('index.html',base).href;try{const response=await fetch(r);if(response.ok)await cache.put(index,response.clone());return response;}catch{return await cache.match(index)||Response.error();}})());return;}
 if(!/\.(?:js|css|png|webp|gif|jpe?g|svg|woff2?|mp3|ogg)$/.test(u.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(key(u));if(cached)return cached;const response=await fetch(r);if(response.ok)await cache.put(key(u),response.clone());return response;})());
});
