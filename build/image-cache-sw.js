const IMAGE_CACHE_NAME = "bhakti-bhav-image-cache-v1";
const IMAGE_META_CACHE_NAME = "bhakti-bhav-image-meta-v1";
const IMAGE_CACHE_TTL = 30 * 24 * 60 * 60 * 1000;

const IMAGE_EXTENSIONS = /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i;

const isImageRequest = (request) => {
  if (request.method !== "GET") return false;
  if (request.destination === "image") return true;

  try {
    return IMAGE_EXTENSIONS.test(new URL(request.url).pathname);
  } catch (error) {
    return false;
  }
};

const getMetaRequest = (request) =>
  new Request(`https://image-cache.local/meta?url=${encodeURIComponent(request.url)}`);

const getCachedAt = async (request) => {
  const metaCache = await caches.open(IMAGE_META_CACHE_NAME);
  const metaResponse = await metaCache.match(getMetaRequest(request));

  if (!metaResponse) return 0;

  try {
    const meta = await metaResponse.json();
    return Number(meta.cachedAt) || 0;
  } catch (error) {
    return 0;
  }
};

const setCachedAt = async (request) => {
  const metaCache = await caches.open(IMAGE_META_CACHE_NAME);
  await metaCache.put(
    getMetaRequest(request),
    new Response(JSON.stringify({ cachedAt: Date.now() }), {
      headers: { "Content-Type": "application/json" },
    })
  );
};

const removeCachedImage = async (request) => {
  const imageCache = await caches.open(IMAGE_CACHE_NAME);
  const metaCache = await caches.open(IMAGE_META_CACHE_NAME);

  await imageCache.delete(request);
  await metaCache.delete(getMetaRequest(request));
};

const canCacheResponse = (response) =>
  response && (response.ok || response.type === "opaque");

const fetchAndCacheImage = async (request) => {
  const response = await fetch(request);

  if (canCacheResponse(response)) {
    const imageCache = await caches.open(IMAGE_CACHE_NAME);
    await imageCache.put(request, response.clone());
    await setCachedAt(request);
  }

  return response;
};

const handleImageRequest = async (request) => {
  const imageCache = await caches.open(IMAGE_CACHE_NAME);
  const cachedResponse = await imageCache.match(request);

  if (cachedResponse) {
    const cachedAt = await getCachedAt(request);

    if (cachedAt && Date.now() - cachedAt < IMAGE_CACHE_TTL) {
      return cachedResponse;
    }

    await removeCachedImage(request);
  }

  try {
    return await fetchAndCacheImage(request);
  } catch (error) {
    if (cachedResponse) return cachedResponse;
    throw error;
  }
};

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith("bhakti-bhav-image-") &&
                ![IMAGE_CACHE_NAME, IMAGE_META_CACHE_NAME].includes(cacheName)
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (!isImageRequest(event.request)) return;

  event.respondWith(handleImageRequest(event.request));
});
