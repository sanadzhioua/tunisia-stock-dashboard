const CACHE_NAME = 'tunisiastock-v1'
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.svg'
]

// Install service worker and cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Caching static assets')
            return cache.addAll(STATIC_ASSETS)
        })
    )
    self.skipWaiting()
})

// Activate and clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', name)
                        return caches.delete(name)
                    }
                })
            )
        })
    )
    self.clients.claim()
})

// Network first, fallback to cache strategy
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return

    // Skip WebSocket and API calls - always network
    if (event.request.url.includes('/api/') ||
        event.request.url.includes('socket.io') ||
        event.request.url.includes('localhost:3001')) {
        return
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone response for caching
                const responseClone = response.clone()

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone)
                })

                return response
            })
            .catch(() => {
                // Fallback to cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse
                    }
                    // Return offline page for navigation requests
                    if (event.request.mode === 'navigate') {
                        return caches.match('/')
                    }
                })
            })
    )
})

// Handle push notifications for price alerts
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json()

        const options = {
            body: data.body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/'
            },
            actions: [
                { action: 'view', title: 'Voir' },
                { action: 'close', title: 'Fermer' }
            ]
        }

        event.waitUntil(
            self.registration.showNotification(data.title || 'TunisiaStock Alert', options)
        )
    }
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    if (event.action === 'view' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        )
    }
})
