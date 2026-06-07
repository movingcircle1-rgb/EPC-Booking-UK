export type LocationRow = {
  slug: string
  name: string
  menu_region: string | null
  county?: string | null
}

export type GroupedLocation = {
  region: string
  locations: { slug: string; label: string }[]
}

const REGION_ORDER = [
  'Shropshire',
  'Staffordshire',
  'West Midlands',
  'Worcestershire',
  'Warwickshire',
  'Derbyshire'
]

export function buildLocationGroups(rows: LocationRow[]): GroupedLocation[] {
  const grouped = rows.reduce<Record<string, { slug: string; label: string }[]>>((acc, row) => {
    const region = (row.menu_region || row.county || '').trim()
    if (!region) return acc

    if (!acc[region]) acc[region] = []
    acc[region].push({
      slug: row.slug,
      label: row.name
    })

    return acc
  }, {})

  return Object.keys(grouped)
    .sort((a, b) => {
      const aIndex = REGION_ORDER.indexOf(a)
      const bIndex = REGION_ORDER.indexOf(b)

      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return a.localeCompare(b)
    })
    .map((region) => ({
      region,
      locations: grouped[region].sort((a, b) => a.label.localeCompare(b.label))
    }))
}
