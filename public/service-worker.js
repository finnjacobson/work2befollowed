const CACHE = 'w2bf-v2'

self.addEventListener('install', event => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  // Drop old caches (e.g. v1, which wrongly cached Supabase API responses)
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // Never intercept cross-origin requests (Supabase REST + realtime must always
  // hit the live network, never a cache) — let the browser handle them normally.
  if (url.origin !== self.location.origin) return

  // Network-first for our own assets: always try the live version (so deploys
  // take effect immediately), falling back to cache only when offline.
  event.respondWith(
    fetch(event.request)
      .then(r => {
        try { const copy = r.clone(); caches.open(CACHE).then(c => c.put(event.request, copy)) } catch (e) {}
        return r
      })
      .catch(() => caches.match(event.request).then(res => res || caches.match('/index.html')))
  )
})
