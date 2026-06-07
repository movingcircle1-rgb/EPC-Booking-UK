export type ServiceDefinition = {
  slug: string
  label: string
  shortLabel?: string
  description?: string
}

export const SERVICES: readonly ServiceDefinition[] = [
  {
    slug: 'domestic-epc',
    label: 'Domestic EPC Certificates',
    shortLabel: 'Domestic EPC',
    description: 'EPC certificates for houses, flats, maisonettes and residential properties.'
  },
  {
    slug: 'landlord-epc',
    label: 'Landlord EPC Certificates',
    shortLabel: 'Landlord EPC',
    description: 'EPC appointments for rental properties, landlords, agents and portfolio compliance.'
  },
  {
    slug: 'commercial-epc',
    label: 'Commercial EPC Certificates',
    shortLabel: 'Commercial EPC',
    description: 'Energy Performance Certificates for commercial premises and business properties.'
  },
  {
    slug: 'epc-renewals',
    label: 'EPC Renewals',
    shortLabel: 'EPC Renewals',
    description: 'Renew an expired or soon-to-expire EPC certificate for sale, let or compliance.'
  }
] as const

const SERVICE_LABELS = new Map(
  SERVICES.map((service) => [service.slug, service.label])
)

export function titleFromServiceSlug(slug?: string | null): string {
  if (!slug) return ''

  const configured = SERVICE_LABELS.get(slug)
  if (configured) return configured

  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function toServiceNavItem(slug?: string | null) {
  if (!slug) return null
  return {
    slug,
    title: titleFromServiceSlug(slug)
  }
}
