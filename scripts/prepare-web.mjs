import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const appConfig = JSON.parse(readFileSync(new URL("../app.json", import.meta.url), "utf8")).expo;

const distDir = join(process.cwd(), "dist");
const editableExtensions = new Set([".html", ".js", ".css"]);
const pageShellStyle = `    <style id="xolot-page-shell">
      html,
      body,
      #root {
        background-color: ${appConfig.web.backgroundColor};
        min-height: 100%;
        min-height: 100dvh;
      }

      body {
        margin: 0;
        overscroll-behavior: none;
      }

      #xolot-feed-scroll {
        overscroll-behavior-y: contain;
        scroll-behavior: smooth;
        scroll-snap-type: y mandatory;
      }

      #xolot-volume-slider {
        overscroll-behavior: contain;
        touch-action: none;
      }
      [id^="xolot-feed-section-"] {
        scroll-snap-align: start;
        scroll-snap-stop: always;
      }

      @supports (height: 100dvh) {
        html,
        body,
        #root {
          height: 100dvh;
        }
      }
    </style>`;

const pwaHeadTags = `    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="${appConfig.name}" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icons/folko-apple-touch-icon.png" />`;

const serviceWorkerScript = `    <script id="xolot-pwa-register">
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", function () {
          navigator.serviceWorker.register("/sw.js").catch(function () {
            /* PWA opcional: falha silenciosa em ambientes sem SW */
          });
        });
      }
    </script>`;

function getExtension(filePath) {
  const lastDot = filePath.lastIndexOf(".");
  return lastDot === -1 ? "" : filePath.slice(lastDot);
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      walk(path);
      continue;
    }

    if (!editableExtensions.has(getExtension(path))) {
      continue;
    }

    const source = readFileSync(path, "utf8");
    let updated = source;

    if (getExtension(path) === ".html") {
      if (!updated.includes("xolot-page-shell")) {
        updated = updated
          .replace('<html lang="en">', '<html lang="pt-BR">')
          .replace(/<\/head>/i, `${pageShellStyle}\n  </head>`);
      }

      if (!updated.includes('rel="manifest"')) {
        updated = updated.replace(/<\/head>/i, `${pwaHeadTags}\n  </head>`);
      }

      if (!updated.includes("xolot-pwa-register")) {
        updated = updated.replace(/<\/body>/i, `${serviceWorkerScript}\n  </body>`);
      }
    }

    if (updated !== source) {
      writeFileSync(path, updated);
    }
  }
}

walk(distDir);
