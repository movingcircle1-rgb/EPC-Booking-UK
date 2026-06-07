import fs from "node:fs";
import path from "node:path";

const PUBLISH_DIR = path.resolve("dist/client");

// Keep this small but meaningful; add more routes as needed
const REQUIRED_FILES = [
  "index.html",
  "house-removals/index.html",
];

// Either marker is enough to prove prerender worked
const REQUIRED_MARKERS = [
  "vike_pageContext",
  'data-rh="true"',
];

function fail(msg) {
  console.error(`\n❌ NETLIFY VERIFY FAILED\n${msg}\n`);
  process.exit(1);
}

console.log("NETLIFY_VERIFY: publish dir =", PUBLISH_DIR);

if (!fs.existsSync(PUBLISH_DIR)) {
  fail(`Publish directory not found: ${PUBLISH_DIR}`);
}

// If a dist/client/_redirects exists, it overrides netlify.toml rules (bad for this setup)
const redirectsFile = path.join(PUBLISH_DIR, "_redirects");
if (fs.existsSync(redirectsFile)) {
  const content = fs.readFileSync(redirectsFile, "utf8").slice(0, 4000);
  fail(
    `Found dist/client/_redirects which overrides netlify.toml rules.\n` +
      `Delete it or stop it being generated.\n\n` +
      `--- dist/client/_redirects (first 4KB) ---\n${content}\n`
  );
}

for (const rel of REQUIRED_FILES) {
  const file = path.join(PUBLISH_DIR, rel);
  console.log("NETLIFY_VERIFY: checking", rel);

  if (!fs.existsSync(file)) {
    fail(`Missing required file:\n  ${file}`);
  }

  const html = fs.readFileSync(file, "utf8");
  const found = REQUIRED_MARKERS.filter((m) => html.includes(m));

  if (found.length === 0) {
    const preview = html.slice(0, 800).replace(/\s+/g, " ");
    fail(
      `SSR markers missing in:\n  ${file}\n\nExpected any of:\n  ${REQUIRED_MARKERS.join(
        "\n  "
      )}\n\nPreview:\n  ${preview}`
    );
  }

  const idx = html.indexOf(found[0]);
  const proof = html
    .slice(Math.max(0, idx - 60), idx + 120)
    .replace(/\s+/g, " ");

  console.log(`NETLIFY_VERIFY: marker found in ${rel}:`, found[0]);
  console.log("NETLIFY_VERIFY: proof snippet:", proof);
}

console.log("\n✅ NETLIFY PRERENDER VERIFY PASSED");
