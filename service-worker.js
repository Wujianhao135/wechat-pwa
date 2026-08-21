const CACHE_NAME = 'wechat-pwa-v25';
const APP_FILES = [
    './',
    './index.html',
    './scan.html',
    './settings.html',
    './transfer.html',
    './success.html',
    './manifest.webmanifest',
    './js/lucide.min.js',
    './js/ocr/tesseract.min.js',
    './js/ocr/worker.min.js',
    './js/ocr/core/tesseract-core.wasm.js',
    './js/ocr/core/tesseract-core-simd.wasm.js',
    './js/ocr/core/tesseract-core-lstm.wasm.js',
    './js/ocr/core/tesseract-core-simd-lstm.wasm.js',
    './js/ocr/lang/chi_sim.traineddata.gz',
    './js/ocr/lang/eng.traineddata.gz',
    './img/mmexport1787144425409.jpg',
    './img/mmexport1787144417901.jpg',
    './img/mmexport1787144411359.jpg',
    './img/mmexport1787144405785.jpg',
    './img/mmexport1787144397379.jpg',
    './img/mmexport1787144389657.jpg',
    './img/wallet-balance-icon.png',
    './img/mmexport1787144381595.jpg',
    './img/mmexport1787144375708.jpg',
    './img/default-transfer-avatar.png',
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

    const requestUrl = new URL(event.request.url);
    const isPageRequest = event.request.mode === 'navigate' ||
        event.request.destination === 'document' ||
        requestUrl.pathname.endsWith('.html');

    if (isPageRequest) {
        event.respondWith(
            fetch(event.request, { cache: 'no-store' }).then(function (networkResponse) {
                if (networkResponse && networkResponse.status === 200 && requestUrl.origin === self.location.origin) {
                    const responseCopy = networkResponse.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(event.request, responseCopy);
                    });
                }
                return networkResponse;
            }).catch(function () {
                return caches.match(event.request).then(function (cachedResponse) {
                    return cachedResponse || caches.match('./index.html');
                });
            })
        );
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
