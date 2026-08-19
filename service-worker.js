const CACHE_NAME = 'wechat-pwa-v5';
const APP_FILES = [
    './',
    './index.html',
    './scan.html',
    './transfer.html',
    './success.html',
    './manifest.webmanifest',
    './js/lucide.min.js',
    './js/jsQR.min.js',
    './icons/app-icon.svg',
    './icons/app-icon-180.png',
    './icons/app-icon-192.png',
    './icons/app-icon-512.png'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(APP_FILES);
        }).then(function () {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(cacheNames.map(function (cacheName) {
                if (cacheName !== CACHE_NAME) {
                    return caches.delete(cacheName);
                }
            }));
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function (cachedResponse) {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then(function (networkResponse) {
                if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
                    const responseCopy = networkResponse.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(event.request, responseCopy);
                    });
                }
                return networkResponse;
            });
        })
    );
});
