// Current version
// Increment number whenever files change to refresh cache!
const VERSION = "0.0.1";

// Path prefix for all files
const GHPATH = '/timer';

// The files to make available for offline use
const URLs = [   
    `${GHPATH}/`,
    `${GHPATH}/index.html`,
    `${GHPATH}/help.html`,
    `${GHPATH}/timer.js`,
    `${GHPATH}/media/icons/app_144.png`,
    `${GHPATH}/media/icons/app_192.png`,
    `${GHPATH}/media/icons/favicon_32.png`,
    `${GHPATH}/media/icons/maskable_512.png`,
    `${GHPATH}/media/sounds/beep.mp3`,
    `${GHPATH}/media/sounds/silence.mp3`
]

// On install, caches pages and files
self.addEventListener("install", (event) => {
    console.log("Service worker installed");
    event.waitUntil(
        caches.open(VERSION)
        .then((cache) => {
            console.log("Caching assets for offline use...");
            cache.addAll(URLs);
        })
    );
});

// Delete old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== VERSION) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Puts a request/response pair into the current version's cache
const putInCache = async (request, response) => {
    const cache = await caches.open(VERSION);
    await cache.put(request,response);
}

// Processes a request, trying network if it can't fetch from cache
const cacheFirst = async (request) => {
    // First, attempt to get from cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }
    // Otherwise, attempt to get over network
    try {
        const responseFromNetwork = await fetch(request);
        // If we got something, clone it
        // Cache the clone and return the original
        putInCache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    } catch (error) {
        // Error 404
        return new Response("Network error happened", {
            status: 408,
            headers: {"Content-Type": "text/plain"}
        });
    }
}

// Handles fetch requests
self.addEventListener("fetch", (event) => {
    event.respondWith(
        cacheFirst({
            request: event.request,
            fallbackURL: fallback,
        }),
    );
});

// Choose a different app prefix name
var APP_PREFIX = 'bbtimer_';
