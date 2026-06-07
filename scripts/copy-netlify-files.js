// scripts/copy-netlify-files.js
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const publicDir = path.join(root, 'public')
const outDir = path.join(root, 'dist', 'client')

const filesToCopy = ['_redirects', 'robots.txt', 'sitemap.xml', 'build.txt']

function copyFile(name) {
  const src = path.join(publicDir, name)
  const dst = path.join(outDir, name)

  if (!fs.existsSync(src)) {
    console.warn(`⚠️ Missing ${src} (skipping)`)
    return
  }

  fs.mkdirSync(outDir, { recursive: true })
  fs.copyFileSync(src, dst)
  console.log(`✓ Copied ${name} -> dist/client/${name}`)
}

for (const f of filesToCopy) copyFile(f)
