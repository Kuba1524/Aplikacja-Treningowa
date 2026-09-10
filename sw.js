const CACHE_NAME = "kubagym-v48";
const urlsToCache = [
    "/Aplikacja-Treningowa/",
    "/Aplikacja-Treningowa/index.html",
    "/Aplikacja-Treningowa/css/style.css",
    "/Aplikacja-Treningowa/js/utils.js",
    "/Aplikacja-Treningowa/js/storage.js",
    "/Aplikacja-Treningowa/js/stats.js",
    "/Aplikacja-Treningowa/js/exercises-lib.js",
    "/Aplikacja-Treningowa/js/views.js",
    "/Aplikacja-Treningowa/js/app.js",
    "/Aplikacja-Treningowa/manifest.json"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache).catch(() => {});
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(
                names.map((n) => {
                    if (n !== CACHE_NAME) return caches.delete(n);
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (!response || response.status !== 200 || response.type !== "basic") {
                    return response;
                }
                const clone = response.clone();
                caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
                return response;
            })
            .catch(() => caches.match(event.request).then((r) => r || Response("Offline", { status: 503 })))
    );
});
