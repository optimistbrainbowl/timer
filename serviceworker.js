// Current version
// Increment number whenever files change to refresh cache!
const VERSION = "0.0.1";

// On install, caches pages and files
self.addEventListener("install", (e) => {
    console.log("Service worker installed");
    e.waitUntil(
        caches.open(VERSION)
        .then((cache) => cache.addAll(URLs),),
        console.log("App files installed to cache.")
    );
});

// Puts a request/response pair into the current version's cache
const putInCache = async (request, response) => {
    const cache = await caches.open(VERSION);
    await cache.put(request,response);
}

// Default fallback: main timer
const fallback = "/index.html";

// Processes a request, using fallbackURL if it can't fetch it
const cacheFirst = async ({request, fallbackURL}) => {
    // First, attempt to get from cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }
    // Otherwise, attempt to get over network from fallback URL
    try {
        const responseFromNetwork = await fetch(request);
        // If we got something, clone it
        // Cache the clone and return the original
        putInCache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    } catch (error) {
        const fallbackResponse = await caches.match(fallbackURL);
        // If the fallback is found, return that
        if (fallbackResponse) {
            return fallbackResponse;
        }
        // Otherwise, error 404
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

// Change this to your repository name
var GHPATH = '/timer';

// Choose a different app prefix name
var APP_PREFIX = 'bbtimer_';

// The files to make available for offline use. make sure to add 
// others to this list
var URLs = [    
    `${GHPATH}/`,
    `${GHPATH}/index.html`,
    `${GHPATH}/help.html`,
    `${GHPATH}/timer.js`,
    `${GHPATH}/media/icons/app_144.png`,
    `${GHPATH}/media/icons/app_192.png`,
    `${GHPATH}/media/icons/favicon_32.png`,
    `${GHPATH}/media/icons/maskable_512.png`,
    `${GHPATH}/media/sounds/beep.wav`,
    `${GHPATH}/media/sounds/silence.mp3`
]