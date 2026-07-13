import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const editableExtensions = new Set([".html", ".js", ".css"]);
const pageShellStyle = `    <style id="nextstar-page-shell">
      html,
      body,
      #root {
        background-color: #F5F8F5;
        min-height: 100%;
        min-height: 100dvh;
      }

      body {
        margin: 0;
        overscroll-behavior: none;
      }

      #nextstar-feed-scroll {
        overscroll-behavior-y: contain;
        scroll-behavior: smooth;
        scroll-snap-type: y mandatory;
      }

      [id^="nextstar-feed-section-"] {
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
    let updated = source
      .replace(/(["'=])\/_expo\//g, "$1./_expo/")
      .replace(/(["'=])\/assets\//g, "$1./assets/")
      .replace(/(["'=])\/favicon\.ico/g, "$1./favicon.ico");

    if (getExtension(path) === ".html" && !updated.includes("nextstar-page-shell")) {
      updated = updated
        .replace('<html lang="en">', '<html lang="pt-BR">')
        .replace(/<\/head>/i, `${pageShellStyle}\n  </head>`);
    }

    if (updated !== source) {
      writeFileSync(path, updated);
    }
  }
}

walk(distDir);
