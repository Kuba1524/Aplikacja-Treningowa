const CACHE_NAME = "kubagym-v85";
const urlsToCache = [
    "/Aplikacja-Treningowa/",
    "/Aplikacja-Treningowa/index.html",
    "/Aplikacja-Treningowa/css/style.css?v=84",
    "/Aplikacja-Treningowa/js/utils.js?v=84",
    "/Aplikacja-Treningowa/js/storage.js?v=84",
    "/Aplikacja-Treningowa/js/stats.js?v=84",
    "/Aplikacja-Treningowa/js/exercises-lib.js?v=84",
    "/Aplikacja-Treningowa/js/progression.js?v=84",
    "/Aplikacja-Treningowa/js/views.js?v=84",
    "/Aplikacja-Treningowa/js/app.js?v=84",
    "/Aplikacja-Treningowa/manifest.json?v=84",
    "/Aplikacja-Treningowa/favicon.ico",
    "/Aplikacja-Treningowa/apple-touch-icon.png",
    "/Aplikacja-Treningowa/favicon-32x32.png",
    "/Aplikacja-Treningowa/favicon-192x192.png",
    "/Aplikacja-Treningowa/favicon-512x512.png",
    "/Aplikacja-Treningowa/favicon-192x192-maskable.png",
    "/Aplikacja-Treningowa/favicon-512x512-maskable.png"
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
            .catch(() => caches.match(event.request).then((r) => r || new Response("Offline", { status: 503 })))
    );
});
