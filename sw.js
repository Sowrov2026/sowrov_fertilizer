const CACHE_VERSION = 'sf-v18';
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

const CACHEABLE_METHODS = ['GET'];
const CACHEABLE_CONTENT_TYPES = [
  'text/html',
  'text/css',
  'text/javascript',
  'application/javascript',
  'application/json',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
  'image/webp',
  'image/x-icon',
  'font/woff',
  'font/woff2',
  'application/font-woff',
  'application/font-woff2',
  'application/vnd.ms-fontobject',
];

function isCacheableRequest(request) {
  if (!CACHEABLE_METHODS.includes(request.method)) return false;
  const url = new URL(request.url);
  if (url.protocol === 'chrome-extension:') return false;
  if (url.hostname !== self.location.hostname) return false;
  return true;
}

function isCacheableResponse(response) {
  if (!response || !response.ok) return false;
  if (response.redirected) return false;
  if (response.type === 'opaqueredirect') return false;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/octet-stream')) return false;
  return true;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .catch(err => {
        console.warn('[SW] Pre-cache failed:', err);
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

  if (request.destination === 'document' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    return;
  }

  if (request.destination === 'image' || /\.(png|jpe?g|gif|svg|webp|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  if (/\.(css|js)$/i.test(url.pathname) || url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (url.pathname === '/manifest.json' || url.pathname === '/robots.txt') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      const cache = await caches.open(cacheName);
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
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
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

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-questions') {
    event.waitUntil(syncPendingQuestions());
  }
});

async function syncPendingQuestions() {
  // Placeholder for future sync logic
}
