const CACHE_NAME = 'naija-insights-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/article.html',
  '/admin.html',
  '/logo.png'
];

// Install — cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Push notification received
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Naija Insights';
  const options = {
    body: data.body || 'New article published',
    icon: 'https://iili.io/n98EJ5v.png',
    badge: 'https://iili.io/n98EJ5v.png',
    data: { url: data.url || '/index.html' },
    vibrate: [200, 100, 200],
    actions: [
      { action: 'read', title: 'Read Now' },
      { action: 'close', title: 'Dismiss' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'read' || !event.action) {
    const url = event.notification.data?.url || '/index.html';
    event.waitUntil(clients.openWindow(url));
  }
});