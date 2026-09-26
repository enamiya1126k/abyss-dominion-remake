const CACHE='abyss-world-offline-build563';
const base=new URL('./',self.location.href);
const key=url=>{const u=new URL(url,base);u.search='';u.hash='';return u.href;};
// Media belongs to the browser's streaming stack. Safari requests byte ranges;
// Cache.put rejects a 206, and a cached 200 cannot stand in for a requested range.
// Do not intercept even a full audio request: this also avoids reusing an old
// full-body cache entry for a later range probe. Native HTTP caching still works.
const isMedia=url=>/\.(?:mp3|ogg|wav|m4a|aac|mp4|webm)$/i.test(new URL(url,base).pathname);
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
 if(event.data?.type!=='prepareWorldRaid430')return;
 event.waitUntil((async()=>{
  try{const cache=await caches.open(CACHE),urls=[...new Set(event.data.urls)].map(u=>new URL(u,base)).filter(u=>u.origin===base.origin&&u.pathname.startsWith(base.pathname)&&!isMedia(u));
   let index=0;const worker=async()=>{while(index<urls.length){const url=urls[index++];if(await cache.match(key(url)))continue;const response=await fetch(url.href,{cache:'reload'});if(response.status!==200)throw new Error(url.pathname);await cache.put(key(url),response);}};
   await Promise.all(Array.from({length:4},worker));event.ports[0]?.postMessage({ok:true});
  }catch{event.ports[0]?.postMessage({ok:false});}
 })());
});
self.addEventListener('fetch',event=>{
 const r=event.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==base.origin||!u.pathname.startsWith(base.pathname))return;
 if(r.headers.has('range')||r.destination==='audio'||r.destination==='video'||isMedia(u))return;
 if(r.mode==='navigate'){event.respondWith((async()=>{let cache;try{cache=await caches.open(CACHE);}catch{}const index=new URL('index.html',base).href;try{const response=await fetch(r);if(response.status===200&&cache)event.waitUntil(cache.put(index,response.clone()).catch(()=>{}));return response;}catch{return await cache?.match(index)||Response.error();}})());return;}
 if(!/\.(?:js|css|png|webp|gif|jpe?g|svg|woff2?)$/.test(u.pathname))return;
 event.respondWith((async()=>{let cache;try{cache=await caches.open(CACHE);const cached=await cache.match(key(u));if(cached)return cached;}catch{}const response=await fetch(r);if(response.status===200&&cache)event.waitUntil(cache.put(key(u),response.clone()).catch(()=>{}));return response;})());
});
