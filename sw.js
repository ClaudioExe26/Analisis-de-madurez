// Cambia el número de versión cada vez que subas cambios a GitHub
const CACHE = "madurez-v7";
const FILES = [
  "./", "./index.html", "./manifest.json",
  "./html2canvas.min.js", "./jspdf.umd.min.js",
  "./icon-192.png", "./icon-512.png", "./maskable-512.png",
  "./apple-touch-icon.png", "./favicon.png"
];
self.addEventListener("install", e => {
  // cache:"reload" evita que se guarde una copia vieja del navegador
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(FILES.map(f => fetch(new Request(f, { cache: "reload" })).then(r => r.ok && c.put(f, r)).catch(() => {}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const isPage = req.mode === "navigate" || req.url.endsWith(".html") || req.url.endsWith("/") || req.url.endsWith("manifest.json");
  if (isPage) {
    // Con señal: siempre la versión más nueva de GitHub. Sin señal: la guardada.
    e.respondWith(
      fetch(new Request(req, { cache: "no-store" })).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match("./index.html")))
    );
    return;
  }
  // Librerías, íconos y fuentes: primero lo guardado (rápido y offline)
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
