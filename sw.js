const CACHE_NAME = "kubagym-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/src/styles/index.css",
    "/src/js/app.js",
    "/src/js/main.js",
    "/src/js/views.js",
    "/src/js/constants.js",
    "/src/js/utils.js",
    "/manifest.json",
];

// Install event
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache).catch((err) => {
                console.log("Cache addAll error:", err);
            });
        })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (!response || response.status !== 200 || response.type !== "basic") {
                    return response;
                }
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then((response) => {
                    return response || new Response("Offline - cache empty", { status: 503 });
                });
            })
    );
});
