const CACHE_VERSION = 'sf-v30';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/css/ai.css',
  '/assets/css/pages.css',
  '/assets/js/ai.js',
  '/assets/js/component-loader.js',
  '/assets/js/script.js',
  '/assets/js/v15-integration.js',
  '/assets/js/v16-integration.js',
  '/assets/js/v17-integration.js',
  '/assets/js/v19-integration.js',
  '/assets/js/v20-integration.js',
  '/assets/js/v21-integration.js',
  '/assets/js/v22-integration.js',
  '/assets/images/logo/logo.png',
  '/assets/images/logo/favicon.png',
  '/manifest.json',
];

function isCacheableRequest(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.protocol === 'chrome-extension:') return false;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  return true;
}

function isCacheableResponse(response) {
  if (!response || !response.ok) return false;
  if (response.redirected) return false;
  if (response.type === 'opaqueredirect') return false;
  return true;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async cache => {
      for (const asset of STATIC_ASSETS) {
        try { await cache.add(asset); }
        catch (err) { console.warn('[SW] Pre-cache skip:', asset); }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
        .map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (!isCacheableRequest(request)) {
    event.respondWith(fetch(request));
    return;
  }

  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.destination === 'document' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }

  if (/\.(css|js|png|jpe?g|gif|svg|webp|ico|woff2?|json)$/i.test(url.pathname) || url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);

  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    if (cached) return cached;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}
