// Service Worker for NOW Security Marketplace PWA
const CACHE_VERSION = "v1.0.0"
const CACHE_NAME = `now-security-${CACHE_VERSION}`
const STATIC_CACHE = `${CACHE_NAME}-static`
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`
const IMAGE_CACHE = `${CACHE_NAME}-images`

// Assets to cache immediately
const STATIC_ASSETS = ["/", "/offline", "/manifest.json", "/icons/icon-192x192.png", "/icons/icon-512x512.png"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Caching static assets")
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith("now-security-") && name !== CACHE_NAME)
          .map((name) => {
            console.log("[SW] Deleting old cache:", name)
            return caches.delete(name)
          }),
      )
    }),
  )
  return self.clients.claim()
})

// Fetch event - network first, then cache
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // API requests - network first
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response
        })
        .catch(() => {
          return new Response(JSON.stringify({ error: "Offline", message: "Sem conexão com internet" }), {
            headers: { "Content-Type": "application/json" },
            status: 503,
          })
        }),
    )
    return
  }

  // Images - cache first
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          return caches.open(IMAGE_CACHE).then((cache) => {
            cache.put(request, response.clone())
            return response
          })
        })
      }),
    )
    return
  }

  // HTML pages - network first, fallback to cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clonedResponse)
          })
          return response
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match("/offline")
          })
        }),
    )
    return
  }

  // Other requests - cache first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((response) => {
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, response.clone())
            return response
          })
        })
      )
    }),
  )
})

// Background sync for service requests
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-service-requests") {
    event.waitUntil(syncServiceRequests())
  }
})

async function syncServiceRequests() {
  console.log("[SW] Syncing service requests...")
  // Implementation for syncing pending requests
}

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {}
  const title = data.title || "NOW Security"
  const options = {
    body: data.body || "Nova notificação",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [200, 100, 200],
    data: data.url || "/",
    actions: [
      { action: "open", title: "Abrir" },
      { action: "close", title: "Fechar" },
    ],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "open" || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data || "/"))
  }
})
