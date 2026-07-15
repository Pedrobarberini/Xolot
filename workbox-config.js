/** @type {import('workbox-build').GenerateSWOptions} */
module.exports = {
  globDirectory: "dist/",
  globPatterns: [
    "**/*.{html,js,css,json,png,ico,svg,webp,woff,woff2,ttf}"
  ],
  swDest: "dist/sw.js",
  sourcemap: false,
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  navigateFallback: "index.html",
  navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  runtimeCaching: [
    {
      urlPattern: ({ request }) => request.destination === "video",
      handler: "CacheFirst",
      options: {
        cacheName: "nextstar-videos",
        expiration: {
          maxEntries: 8,
          maxAgeSeconds: 60 * 60 * 24 * 7
        },
        rangeRequests: true
      }
    },
    {
      urlPattern: ({ request }) =>
        request.destination === "image" ||
        request.destination === "font" ||
        request.destination === "style",
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "nextstar-assets",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 60 * 24 * 30
        }
      }
    }
  ]
};
