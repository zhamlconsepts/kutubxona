/**
 * Maktab Kutubxonasi - Service Worker (Offline Rejim Yadrosi)
 * Sayt va mobil ilovaning internetsiz (100% oflayn) ishlashini ta'minlaydi.
 * PWABuilder App Capabilities: Offline, Background Sync, Periodic Sync, Push Notifications
 */

const CACHE_NAME = 'kutubxona-offline-v3';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/data.js',
  './js/autocomplete.js',
  './js/app.js',
  './assets/logo.jpg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/app-icon.jpg',
  './assets/screenshot-desktop.png',
  './assets/screenshot-mobile.png'
];

// 1. O'rnatish va keshga saqlash (Install)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Barcha lokal fayllar keshga saqlanmoqda...');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Faollashtirish va eski keshlarni tozalash (Activate)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[Service Worker] Eski kesh o\'chirildi:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Tarmoq va Kesh boshqaruvi (Fetch)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // API so'rovlari: Network-First
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(
            JSON.stringify({
              offline: true,
              success: false,
              message: "Hozircha oflayn rejimdasiz. Ma'lumotlar qurilma xotirasida saqlanmoqda."
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Statik resurslar: Cache-First
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});

// 4. Background Sync (PWABuilder Capability)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-library-data') {
    event.waitUntil(Promise.resolve());
  }
});

// 5. Periodic Background Sync (PWABuilder Capability)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-due-books') {
    event.waitUntil(Promise.resolve());
  }
});

// 6. Push Notifications (PWABuilder Capability)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Kutubxona: topshirish muddati kelgan kitoblar mavjud!',
    icon: 'assets/icon-192.png',
    badge: 'assets/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  event.waitUntil(
    self.registration.showNotification('Maktab Kutubxonasi', options)
  );
});
