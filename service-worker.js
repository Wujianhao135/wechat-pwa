const CACHE_NAME = 'wechat-pwa-v13';
const APP_FILES = [
    './',
    './index.html',
    './scan.html',
    './transfer.html',
    './success.html',
    './manifest.webmanifest',
    './js/lucide.min.js',
    './js/jsQR.min.js',
    './img/mmexport1787144425409.jpg',
    './img/mmexport1787144417901.jpg',
    './img/mmexport1787144411359.jpg',
    './img/mmexport1787144405785.jpg',
    './img/mmexport1787144397379.jpg',
    './img/mmexport1787144389657.jpg',
    './img/mmexport1787144381595.jpg',
    './img/mmexport1787144375708.jpg',
    './img/bottom/t1.png',
    './img/bottom/t2.png',
    './img/bottom/t3.png',
    './img/bottom/t4.png',
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
