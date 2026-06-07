export type ServiceDefinition = {
  slug: string
  label: string
}

export const SERVICES: readonly ServiceDefinition[] = [
  { slug: 'test-service', label: 'Test Service' }
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
