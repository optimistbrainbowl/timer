// Current version
// Increment number whenever files change to refresh cache!
const VERSION = "0.0.1";

// Choose a different app prefix name
const APP_PREFIX = 'bbtimer_';
const CACHE_NAME = APP_PREFIX + VERSION;

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
];

// On install, caches pages and files
self.addEventListener("install", (event) => {
    console.log("Service worker installed");
    event.waitUntil(
        caches.open(CACHE_NAME)
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
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

const fallbackURL = "${GHPATH}/index.html";

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
        return responseFromNetwork;
    } catch (error) {
        const fallbackResponse = await caches.match(fallbackURL);
        if (fallbackResponse) {
            return fallbackResponse;
        }
        // Error 408 otherwise
        return new Response(
            "Requested page unavailable in offline cache, and network connection not available.",
            {status: 408, headers: {"Content-Type": "text/plain"}}
        );
    }
}

// Handles fetch requests
self.addEventListener("fetch", (event) => {
    event.respondWith(
        cacheFirst(event.request),
    );
});