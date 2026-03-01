// Smart School AI — Service Worker
const CACHE_NAME = "smart-school-v1";

// Files to cache for offline use
const STATIC_FILES = [
  "/index.html",
  "/manifest.json"
];

// Install — cache static files
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache, fallback to network
self.addEventListener("fetch", event => {
  // API calls — always use network
  if (event.request.url.includes("googleapis.com") ||
      event.request.url.includes("groq.com") ||
      event.request.url.includes("deepseek.com") ||
      event.request.url.includes("perplexity.ai") ||
      event.request.url.includes("cerebras.ai") ||
      event.request.url.includes("nvidia.com") ||
      event.request.url.includes("mistral.ai")) {
    return; // let browser handle API calls normally
  }

  // App files — cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(response => {
        // Cache new files
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    }).catch(() => caches.match("/index.html"))
  );
});
