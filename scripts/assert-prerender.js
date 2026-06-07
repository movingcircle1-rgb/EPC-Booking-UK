import fs from "fs";

const file = "dist/client/locations/wolverhampton/index.html";

if (!fs.existsSync(file)) {
  console.error("❌ Missing prerendered location file:", file);
  process.exit(1);
}

const html = fs.readFileSync(file, "utf8");
const size = Buffer.byteLength(html, "utf8");

// If Netlify accidentally publishes the tiny SPA shell, it’s usually ~1–2KB
if (size < 5000) {
  console.error(`❌ Prerender output looks too small (${size} bytes) — likely SPA shell`);
  process.exit(1);
}

const checks = [
  ['<meta name="viewport"', 'viewport meta'],
  ['<nav', 'nav'],
  ['<footer', 'footer'],
];

const missing = checks
  .filter(([needle]) => !html.includes(needle))
  .map(([, label]) => label);

if (missing.length) {
  console.error("❌ Prerender check failed — missing:", missing.join(", "));
  process.exit(1);
}

console.log("✅ Prerender looks correct:", file, `(${size} bytes)`);
