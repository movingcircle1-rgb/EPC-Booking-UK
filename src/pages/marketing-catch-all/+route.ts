import type { PageContext } from 'vike/types'

function normalizePath(path: string) {
  if (!path) return '/'
  return path.endsWith('/') ? path : `${path}/`
}

const allowedMarketingPaths = new Set([
  '/removals/',
  '/office-removals/',
  '/packing-services/',
  '/storage/',
  '/house-clearances/',
  '/partial-house-clearances/',
  '/full-house-clearances/',
  '/probate-house-clearance/',
  '/bereavement-house-clearance/',
  '/end-of-tenancy-clearance/',
  '/carpet-removal-service/',
  '/deep-cleaning-service/',
  '/two-man-delivery/',
  '/two-man-delivery/furniture/',
  '/two-man-delivery/appliances/',
  '/man-and-van/',
  '/man-and-van/day-rate/',
  '/man-and-van/hourly-rate/',
  '/garden-building-relocation/',
  '/piano-relocation/',
  '/vehicle-transport/',
  '/flat-pack-assembly/',
  '/antiques/',
  '/fine-art/',
  '/fine-art/prints/',
  '/fine-art/specialist-crates/',
  '/exhibition-event-transport/',
  '/fire-and-flood/',
  '/property-staging/',
  '/trade/',
  '/two-man-delivery/garden-buildings/',
  '/two-man-delivery/disposal/',
  '/garden-building-relocation/small-shed/',
  '/garden-building-relocation/large-shed/',
  '/garden-building-relocation/office-buildings/',
  '/garden-building-relocation/hot-tub-relocation/',
  '/piano-relocation/upright-piano/',
  '/piano-relocation/baby-grand-piano/',
  '/piano-relocation/grand-piano/',
  '/vehicle-transport/cars/',
  '/vehicle-transport/motorbikes/',
  '/flat-pack-assembly/assembly/',
  '/flat-pack-assembly/disassembly/',
  '/flat-pack-assembly/disposal/',
  '/flat-pack-assembly/ikea/',
  '/flat-pack-assembly/next/',
  '/antiques/grandfather-clocks/',
  '/antiques/chandeliers/'
])

export default function route(pageContext: PageContext) {
  const pathname = normalizePath(pageContext.urlPathname)
  return allowedMarketingPaths.has(pathname)
}
