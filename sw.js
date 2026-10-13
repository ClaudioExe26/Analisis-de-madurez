// Cambia el número de versión cada vez que subas cambios a GitHub
const CACHE = "madurez-v2";
const FILES = [
  "./", "./index.html", "./manifest.json",
  "./html2canvas.min.js", "./jspdf.umd.min.js",
  "./icon-192.png", "./icon-512.png", "./maskable-512.png",
  "./apple-touch-icon.png", "./favicon.png", "./logo-header.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      // guarda también las tipografías de Google para uso sin señal
      if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
