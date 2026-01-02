// Current version
// Change version whenever files change to refresh cache!
const VERSION = "0.2";

// Path prefix for all files
const GHPATH = '/timer';

// The files to make available for offline use
// All files are listed here, but in a "cache less" philosophy
// some nonessential ones are commented out.
const URLs = [   
    `${GHPATH}/`,
    `${GHPATH}/index.html`,
    `${GHPATH}/help.html`,
    `${GHPATH}/timer.js`,
    `${GHPATH}/sliders.css`,
    // `${GHPATH}/media/icons/app_144.png`,
    // `${GHPATH}/media/icons/app_192.png`,
    `${GHPATH}/media/icons/favicon_32.png`,
    `${GHPATH}/media/icons/maskable_512.png`,
    // `${GHPATH}/media/icons/sun.png`,
    // `${GHPATH}/media/icons/moon.png`,
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

function fetchCache() {
    console.log("Looking for cache...");
    caches.open(VERSION)
    .then((cache) => {
        cache.addAll(URLs);
    })
}

// Delete old caches
self.addEventListener("activate", (event) => {
    const keepMe = [VERSION];
    event.waitUntil(
        caches.keys().then((keyList) => 
            Promise.all(
                keyList.map((key) => {
                    if (!keepMe.includes(key)) {
                        console.log("Deleting cache ", key);
                        return caches.delete(key);
                    } return undefined;
                }),
            ),
        ),
        fetchCache();
    );
});

// Processes a request, trying network if it can't fetch from cache
const cacheFirst = async (request) => {
    // First, attempt to get from cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }
    // Otherwise, attempt to get over network
    try {
        // fetchCache();
        const responseFromNetwork = await fetch(request);
    } catch (error) {
        // Error if no network connection
        return new Response(
            "Needed file not found in cache, and network connection not found.",
            {status: 408,headers: {"Content-Type": "text/plain"}}
        );
    }
}

// Handles fetch requests
self.addEventListener("fetch", (event) => {
    event.respondWith(
        cacheFirst({request: event.request}),
    );
});