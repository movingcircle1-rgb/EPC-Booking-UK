import fs from 'fs'
import path from 'path'

const SITE = 'https://nationalremovalsandstorage.co.uk'
const SERVICES = ['test-service']

const STATIC_PAGES = [
  '/',
  '/about/',
  '/contact/',
  '/services/',
  '/locations/',
  '/articles/',
  '/we-recycle/',
  '/we-donate/',
  '/low-emission-promise/',
  '/mid-week-move/',
  '/careers/',
  '/apprenticeships/',
  '/youth-unemployment/',
  '/nearest-office/',
  '/privacy-policy/',
  '/terms-and-conditions/',
  '/corporate-social-responsibility/',
  '/environmental-policy/'
]

function loadLocationSlugs() {
  const file = path.join(process.cwd(), 'public', '_locations.json')

  if (!fs.existsSync(file)) {
    console.log('⚠ No _locations.json found')
    return []
  }

  const raw = JSON.parse(fs.readFileSync(file, 'utf8'))

  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.slugs)) return raw.slugs
  if (Array.isArray(raw.locations)) {
    return raw.locations.map((l) => l.slug).filter(Boolean)
  }

  return []
}

function makeUrl(loc) {
  return `
  <url>
    <loc>${SITE}${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
}

function generate() {
  console.log('🔄 Generating sitemap...')

  const slugs = loadLocationSlugs()
  const urls = []

  STATIC_PAGES.forEach((p) => urls.push(makeUrl(p)))

  slugs.forEach((slug) => {
    urls.push(makeUrl(`/locations/${slug}/`))

    SERVICES.forEach((service) => {
      urls.push(makeUrl(`/locations/${slug}/${service}/`))
    })
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

  fs.writeFileSync('public/sitemap.xml', xml)
  console.log(`✅ Sitemap generated. URLs: ${urls.length}`)
}

generate()
