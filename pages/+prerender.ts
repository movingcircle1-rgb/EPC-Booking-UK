// pages/+prerender.ts
import fs from 'node:fs'
import path from 'node:path'

type LocationsJson = {
  generatedAt?: string
  slugs: string[]
}

function readLocations(): string[] {
  const p = path.join(process.cwd(), 'public', '_locations.json')
  if (!fs.existsSync(p)) return []
  const raw = fs.readFileSync(p, 'utf8')
  const parsed = JSON.parse(raw) as LocationsJson
  return Array.isArray(parsed.slugs) ? parsed.slugs.filter(Boolean) : []
}

export default function prerender() {
  const slugs = readLocations()

  const routes = [
    '/',
    '/about/',
    '/services/',
    '/contact/',
    '/articles/',
    '/locations/',

    '/careers/',
    '/apprenticeships/',
    '/youth-unemployment/',
    '/nearest-office/',
    '/terms-and-conditions/',
    '/privacy-policy/',
    '/corporate-social-responsibility/',
    '/environmental-policy/',
    '/we-donate/',
    '/we-recycle/',
    '/low-emission-promise/'
  ]

  const services = ['house-removals', 'office-removals', 'packing-services', 'storage-solutions'] as const

  for (const slug of slugs) {
    routes.push(`/locations/${slug}/`)
    for (const s of services) {
      routes.push(`/locations/${slug}/${s}/`)
    }
  }

  return routes
}
