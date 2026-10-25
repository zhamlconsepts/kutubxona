/**
 * Maktab Kutubxonasi - Service Worker (Offline Rejim Yadrosi)
 * Sayt va mobil ilovaning internetsiz (100% oflayn) ishlashini ta'minlaydi.
 */

const CACHE_NAME = 'kutubxona-offline-v2';

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
  './assets/app-icon.jpg'
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

  // API so'rovlari: Network-First (Avval serverdan yangisini olish, internet yo'q bo'lsa oflayn ishlayveradi)
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Internet yo'q bo'lsa, xatolik berib qotib qolmasligi uchun oflayn javob
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

  // Statik resurslar (HTML, CSS, JS, Rasmlar): Cache-First
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Keshdan darhol beramiz, tarmoq orqali keshni yangilab qo'yamiz (Stale-While-Revalidate)
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }

        // Keshda yo'q bo'lsa, tarmoqdan so'raymiz
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
        // Agar navigatsiya bo'lsa va tarmoq yo'q bo'lsa, index.html ni berish
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});
