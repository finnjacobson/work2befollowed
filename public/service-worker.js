self.addEventListener('install', event => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

const CACHE = 'w2bf-v1'
const ASSETS = [ '/', '/index.html', '/src/main.jsx', '/styles.css' ]

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  event.respondWith(caches.match(event.request).then(res => res || fetch(event.request).then(r=>{
    try{ const copy = r.clone(); caches.open(CACHE).then(c=>c.put(event.request, copy)) }catch(e){}
    return r
  }).catch(()=> caches.match('/index.html'))))
})
