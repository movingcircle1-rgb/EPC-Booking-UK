import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuote } from '../contexts/QuoteContext'

type Crumb = { name: string; href: string }

type PostalCodesValue =
  | string[]
  | {
      note?: string
      districts?: string[]
    }
  | null

type InternalLink = {
  label: string
  url: string
}

type StepItem = {
  title: string
  text: string
}

type FaqItem = {
  question: string
  answer: string
}

type CityContentBlock = {
  id: string
  city_id?: string | null
  block_position: number
  heading: string
  content: string
  image_url?: string | null
  image_alt?: string | null
  service_type?: string | null
  created_at?: string | null
  updated_at?: string | null
  block_type?: string | null
  display_style?: string | null
  anchor_id?: string | null
  is_enabled?: boolean | null
  internal_links?: InternalLink[] | null
  block_data?: {
    items?: Array<string | StepItem>
  } | null
}

type LocationData = {
  id?: string
  name?: string
  slug?: string
  description?: string | null
  meta_title?: string | null
  meta_description?: string | null
  county?: string | null
  region?: string | null
  postal_codes?: PostalCodesValue
  areas_covered?: string[] | null
  local_info?: string | null
  map_embed_url?: string | null
  featured_image?: string | null
  nearby_landmarks?: string[] | null
  local_drivers?: string[] | null
  transport_notes?: string | null
  location_intro?: string | null
}

type ServiceContent = {
  meta_title?: string | null
  meta_description?: string | null
  content?: string | null
  service_type?: string | null
  h1?: string | null
  intro?: string | null
  summary?: string | null
  service_benefits?: string[] | null
  process_steps?: StepItem[] | null
  service_includes?: string[] | null
  audience_types?: string[] | null
  common_move_types?: string[] | null
  related_service_intro?: string | null
  cta_title?: string | null
  cta_text?: string | null
  schema_service_name?: string | null
  schema_description?: string | null
}

type ServiceNavItem = {
  slug: string
  title?: string
}

export type LocationPageProps = {
  location?: string
  service?: string
  locationData?: LocationData | null
  serviceSeo?: ServiceContent | null
  contentBlocks?: CityContentBlock[] | null
  services?: ServiceNavItem[] | null
  faqs?: FaqItem[] | null
}

const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'Business Moves UK'
const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:3000'
const SITE_PHONE = import.meta.env.VITE_SITE_PHONE || ''
const SITE_EMAIL = import.meta.env.VITE_SITE_EMAIL || ''

function titleFromSlug(slug?: string) {
  if (!slug) return ''
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function splitParagraphs(text: string) {
  return text
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean)
}

function normalizePostalCodes(value?: PostalCodesValue) {
  if (!value) {
    return { districts: [] as string[], note: '' }
  }

  if (Array.isArray(value)) {
    return { districts: value.filter(Boolean), note: '' }
  }

  if (typeof value === 'object') {
    return {
      districts: Array.isArray(value.districts) ? value.districts.filter(Boolean) : [],
      note: value.note || ''
    }
  }

  return { districts: [] as string[], note: '' }
}

function buildBreadcrumbs(args: {
  locationSlug: string
  locationName: string
  serviceSlug?: string
}) {
  const { locationSlug, locationName, serviceSlug } = args
  const crumbs: Crumb[] = [
    { name: 'Home', href: '/' },
    { name: 'Locations', href: '/locations/' },
    { name: locationName || locationSlug, href: `/locations/${locationSlug}/` }
  ]

  if (serviceSlug) {
    crumbs.push({
      name: titleFromSlug(serviceSlug),
      href: `/locations/${locationSlug}/${serviceSlug}/`
    })
  }

  return crumbs
}

function defaultFaqs(args: { locationName: string; serviceTitle?: string }): FaqItem[] {
  const { locationName, serviceTitle } = args
  const subject = serviceTitle ? `${serviceTitle} in ${locationName}` : `services in ${locationName}`

  return [
    {
      question: `How much does ${subject} cost?`,
      answer:
        'Pricing depends on the scope of work, access, timing and the level of support required. Contact the team for a tailored quote.'
    },
    {
      question: 'Can I request a quote before booking?',
      answer:
        'Yes. We can review your requirements, explain the process and provide a no-obligation quote.'
    },
    {
      question: 'Do you provide flexible scheduling?',
      answer:
        'Yes. Availability depends on demand, but we aim to offer practical scheduling options wherever possible.'
    },
    {
      question: 'Do you support local and regional jobs?',
      answer:
        'Yes. We can support both local work and wider regional requirements depending on the service.'
    }
  ]
}

function faqJsonLd(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer
      }
    }))
  }
}

function localBusinessJsonLd(args: {
  locationName: string
  canonicalPath: string
  metaDescription: string
  mapEmbedUrl?: string | null
  postalDistricts: string[]
  areasCovered: string[]
}) {
  const { locationName, canonicalPath, metaDescription, mapEmbedUrl, postalDistricts, areasCovered } =
    args

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${SITE_NAME} ${locationName}`.trim(),
    url: `${SITE_URL}${canonicalPath}`,
    description: metaDescription,
    telephone: SITE_PHONE || undefined,
    email: SITE_EMAIL || undefined,
    areaServed: [locationName, ...areasCovered, ...postalDistricts],
    hasMap: mapEmbedUrl || undefined
  }
}

function serviceJsonLd(args: {
  serviceName: string
  description: string
  canonicalPath: string
  locationName: string
}) {
  const { serviceName, description, canonicalPath, locationName } = args

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: serviceName,
    name: serviceName,
    description,
    areaServed: {
      '@type': 'Place',
      name: locationName
    },
    provider: {
      '@type': 'LocalBusiness',
      name: SITE_NAME,
      telephone: SITE_PHONE || undefined,
      url: `${SITE_URL}${canonicalPath}`
    }
  }
}

function ListSection(args: {
  title: string
  items?: string[] | null
  intro?: string | null
  icon?: string
}) {
  const { title, items, intro, icon = '✓' } = args
  if (!items || !items.length) return null

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
      {intro ? <p className="mt-3 text-gray-700 leading-relaxed">{intro}</p> : null}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700">
            <span className="font-semibold text-gray-900">{icon} </span>
            {item}
          </div>
        ))}
      </div>
    </section>
  )
}

function StepsSection(args: { title: string; steps?: StepItem[] | null; intro?: string | null }) {
  const { title, steps, intro } = args
  if (!steps || !steps.length) return null

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
      {intro ? <p className="mt-3 text-gray-700 leading-relaxed">{intro}</p> : null}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step) => (
          <div key={step.title} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
            <p className="mt-2 text-gray-700 leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function RichTextBlock({ block }: { block: CityContentBlock }) {
  return (
    <article
      id={block.anchor_id || undefined}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
    >
      {block.image_url ? (
        <div className="w-full">
          <img
            src={block.image_url}
            alt={block.image_alt ?? block.heading}
            className="w-full h-64 object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{block.heading}</h2>
        <div className="mt-4 space-y-4 text-gray-700 leading-relaxed">
          {splitParagraphs(block.content || '').map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {Array.isArray(block.internal_links) && block.internal_links.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {block.internal_links.map((link) => (
              <a
                key={`${link.url}-${link.label}`}
                href={link.url}
                className="px-4 py-2 rounded-full border border-gray-200 text-gray-800 hover:border-[#e71c5e] hover:text-[#e71c5e] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}

function ServiceBlockRenderer({ block }: { block: CityContentBlock }) {
  const items = block.block_data?.items || []
  const stringItems = items.filter((i): i is string => typeof i === 'string')
  const stepItems = items.filter(
    (i): i is StepItem =>
      typeof i === 'object' &&
      i !== null &&
      'title' in i &&
      'text' in i &&
      typeof i.title === 'string' &&
      typeof i.text === 'string'
  )
  const links = Array.isArray(block.internal_links) ? block.internal_links : []

  switch (block.block_type) {
    case 'benefits':
    case 'trust-signals':
    case 'areas-covered':
    case 'industry-types':
      return (
        <section
          id={block.anchor_id || undefined}
          className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{block.heading}</h2>
          {block.content ? <p className="mt-3 text-gray-700 leading-relaxed">{block.content}</p> : null}
          {stringItems.length ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {stringItems.map((item) => (
                <div
                  key={item}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700"
                >
                  <span className="font-semibold text-gray-900">✓ </span>
                  {item}
                </div>
              ))}
            </div>
          ) : null}
        </section>
      )

    case 'process':
      return (
        <section
          id={block.anchor_id || undefined}
          className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{block.heading}</h2>
          {block.content ? <p className="mt-3 text-gray-700 leading-relaxed">{block.content}</p> : null}
          {stepItems.length ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {stepItems.map((step) => (
                <div key={step.title} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-gray-700 leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      )

    case 'cross-links':
    case 'nearby-links':
      return (
        <section
          id={block.anchor_id || undefined}
          className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{block.heading}</h2>
          {block.content ? <p className="mt-3 text-gray-700 leading-relaxed">{block.content}</p> : null}
          {links.length ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {links.map((link) => (
                <a
                  key={`${link.url}-${link.label}`}
                  href={link.url}
                  className="px-4 py-2 rounded-full border border-gray-200 text-gray-800 hover:border-[#e71c5e] hover:text-[#e71c5e] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </section>
      )

    default:
      return <RichTextBlock block={block} />
  }
}

function QuoteCta(args: {
  title: string
  text: string
  onOpenQuote: () => void
}) {
  const { title, text, onOpenQuote } = args

  return (
    <section className="max-w-5xl mx-auto">
      <div className="bg-gray-900 text-white rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
          <p className="mt-2 text-gray-300">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {SITE_PHONE ? (
            <a
              href={`tel:${SITE_PHONE.replace(/\s+/g, '')}`}
              className="px-5 py-3 rounded-xl bg-[#e71c5e] hover:bg-[#c91852] transition-colors font-semibold"
            >
              Call {SITE_PHONE}
            </a>
          ) : null}
          <button
            type="button"
            onClick={onOpenQuote}
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors font-semibold border border-white/20"
          >
            Open quote form
          </button>
        </div>
      </div>
    </section>
  )
}

function MapSection(args: { mapEmbedUrl?: string | null; locationName: string }) {
  const { mapEmbedUrl, locationName } = args
  if (!mapEmbedUrl) return null

  return (
    <section className="max-w-5xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900">{`Coverage near ${locationName}`}</h2>
          <p className="mt-2 text-gray-700">
            This map helps confirm the location and surrounding area covered by this page.
          </p>
        </div>
        <div className="w-full h-[420px]">
          <iframe
            src={mapEmbedUrl}
            title={`Map of ${locationName}`}
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}

function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  return (
    <section className="max-w-5xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">FAQs</h2>

        <div className="mt-6 space-y-4">
          {faqs.map((f, idx) => (
            <details key={idx} className="group border border-gray-200 rounded-xl p-4">
              <summary className="cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                <span>{f.question}</span>
                <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <div className="mt-3 text-gray-700 leading-relaxed">{f.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function LocationPage(props: LocationPageProps) {
  let openQuote = () => {}

  try {
    const quoteContext = useQuote()
    if (quoteContext && typeof quoteContext.openQuote === 'function') {
      openQuote = quoteContext.openQuote
    }
  } catch (error) {
    console.warn('[LocationPage] Quote context unavailable:', error)
  }

  const locationSlug = props.location ?? props.locationData?.slug ?? ''
  const serviceSlug = props.service ?? props.serviceSeo?.service_type ?? ''

  const locationName = props.locationData?.name ?? titleFromSlug(locationSlug)
  const mapEmbedUrl = props.locationData?.map_embed_url ?? null

  const blocks: CityContentBlock[] = (Array.isArray(props.contentBlocks) ? props.contentBlocks : [])
    .filter((b) => b && b.is_enabled !== false)
    .sort((a, b) => (a.block_position ?? 0) - (b.block_position ?? 0))

  const servicesToRender =
    Array.isArray(props.services) && props.services.length
      ? props.services.map((s) => ({
          slug: s.slug,
          title: s.title ?? titleFromSlug(s.slug)
        }))
      : []

  const isServicePage = Boolean(serviceSlug)
  const serviceTitle = isServicePage ? titleFromSlug(serviceSlug) : undefined

  const content = props.serviceSeo ?? null

  const crumbs = buildBreadcrumbs({
    locationSlug,
    locationName,
    serviceSlug: isServicePage ? serviceSlug : undefined
  })

  const faqs: FaqItem[] =
    Array.isArray(props.faqs) && props.faqs.length
      ? props.faqs.map((f) => ({ question: f.question, answer: f.answer }))
      : defaultFaqs({ locationName, serviceTitle })

  const metaTitle =
    (isServicePage ? content?.meta_title : props.locationData?.meta_title) ??
    (isServicePage
      ? `${titleFromSlug(serviceSlug)} in ${locationName} | ${SITE_NAME}`
      : `${locationName} | ${SITE_NAME}`)

  const metaDescription =
    (isServicePage ? content?.meta_description : props.locationData?.meta_description) ??
    `Professional services in ${locationName}.`

  const canonicalPath = isServicePage
    ? `/locations/${locationSlug}/${serviceSlug}/`
    : `/locations/${locationSlug}/`

  const heroTitle = isServicePage
    ? content?.h1 || `${titleFromSlug(serviceSlug)} in ${locationName}`
    : props.locationData?.meta_title || `${locationName} Services`

  const heroSubtitle = isServicePage
    ? content?.intro ||
      `Explore ${titleFromSlug(serviceSlug).toLowerCase()} in ${locationName}, including service information, coverage details and common questions.`
    : props.locationData?.description ||
      props.locationData?.location_intro ||
      `Explore services available in ${locationName} and nearby areas.`

  const normalizedPostcodes = normalizePostalCodes(props.locationData?.postal_codes)
  const postcodeDistricts = normalizedPostcodes.districts
  const postcodeNote = normalizedPostcodes.note

  const areasCovered = Array.isArray(props.locationData?.areas_covered)
    ? props.locationData.areas_covered.filter(Boolean)
    : []

  const servicePageBlocks = blocks
    .filter((b) => !b.service_type || b.service_type === serviceSlug)
    .filter((block, index, arr) => {
      const key = [
        block.service_type || 'generic',
        block.block_type || 'none',
        block.heading || '',
        block.anchor_id || '',
        block.content || ''
      ].join('|')

      return (
        arr.findIndex((candidate) => {
          const candidateKey = [
            candidate.service_type || 'generic',
            candidate.block_type || 'none',
            candidate.heading || '',
            candidate.anchor_id || '',
            candidate.content || ''
          ].join('|')

          return candidateKey === key
        }) === index
      )
    })

  const hasMeaningfulServiceContent = Boolean(
    content?.summary ||
      content?.content ||
      content?.service_benefits?.length ||
      content?.service_includes?.length ||
      content?.process_steps?.length ||
      content?.audience_types?.length ||
      content?.common_move_types?.length ||
      servicePageBlocks.length
  )

  const robotsContent =
    isServicePage && !hasMeaningfulServiceContent ? 'noindex,follow' : 'index,follow'

  const businessJsonLd = localBusinessJsonLd({
    locationName,
    canonicalPath,
    metaDescription,
    mapEmbedUrl,
    postalDistricts: postcodeDistricts,
    areasCovered
  })

  const serviceSchema =
    isServicePage && serviceTitle
      ? serviceJsonLd({
          serviceName: content?.schema_service_name || `${serviceTitle} in ${locationName}`,
          description:
            content?.schema_description ||
            content?.summary ||
            content?.intro ||
            metaDescription,
          canonicalPath,
          locationName
        })
      : null

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content={robotsContent} />
        <link rel="canonical" href={`${SITE_URL}${canonicalPath}`} />
      </Helmet>

      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-20 pb-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold">{heroTitle}</h1>
          <p className="text-xl text-gray-300 mt-6 max-w-4xl mx-auto">{heroSubtitle}</p>

          {servicesToRender.length ? (
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              {servicesToRender.map((s) => {
                const href = `/locations/${locationSlug}/${s.slug}/`
                const active = isServicePage && s.slug === serviceSlug
                return (
                  <a
                    key={s.slug}
                    href={href}
                    className={[
                      'px-4 py-2 rounded-full text-sm font-semibold transition-colors border',
                      active
                        ? 'bg-[#e71c5e] border-[#e71c5e] text-white'
                        : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                    ].join(' ')}
                  >
                    {s.title}
                  </a>
                )
              })}
            </div>
          ) : null}

          <nav aria-label="Breadcrumb" className="mt-6">
            <ol className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-300">
              {crumbs.map((c, idx) => (
                <li key={c.href} className="flex items-center gap-2">
                  <a href={c.href} className="hover:text-white transition-colors">
                    {c.name}
                  </a>
                  {idx < crumbs.length - 1 ? <span className="text-white/30">/</span> : null}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      <main className="bg-white">
        <div className="container mx-auto px-4 py-12 space-y-12">
          {!isServicePage && (
            <>
              <MapSection mapEmbedUrl={mapEmbedUrl} locationName={locationName} />

              <section className="max-w-4xl mx-auto">
                {props.locationData?.description ? (
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {props.locationData.description}
                  </p>
                ) : null}

                {props.locationData?.local_info ? (
                  <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900">About {locationName}</h2>
                    <div className="mt-4 space-y-4 text-gray-700 leading-relaxed">
                      {splitParagraphs(props.locationData.local_info).map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  </div>
                ) : null}

                {postcodeDistricts.length || areasCovered.length ? (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {postcodeDistricts.length ? (
                      <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900">Postcodes covered</h3>
                        <p className="mt-3 text-gray-700">{postcodeDistricts.join(', ')}</p>
                        {postcodeNote ? <p className="mt-3 text-sm text-gray-500">{postcodeNote}</p> : null}
                      </div>
                    ) : null}

                    {areasCovered.length ? (
                      <div className="bg-white border border-gray-200 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900">Areas covered</h3>
                        <p className="mt-3 text-gray-700">{areasCovered.join(', ')}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>

              {servicesToRender.length ? (
                <section className="max-w-5xl mx-auto">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Services available in {locationName}
                    </h2>
                    <p className="mt-3 text-gray-700 leading-relaxed">
                      Explore available service pages for {locationName}.
                    </p>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {servicesToRender.map((service) => (
                        <article
                          key={service.slug}
                          className="border border-gray-200 rounded-2xl p-6 bg-gray-50"
                        >
                          <h3 className="text-xl font-bold text-gray-900">
                            {service.title} in {locationName}
                          </h3>
                          <p className="mt-3 text-gray-700 leading-relaxed">
                            View service information, FAQs and location-specific content for {service.title.toLowerCase()} in {locationName}.
                          </p>
                          <a
                            href={`/locations/${locationSlug}/${service.slug}/`}
                            className="inline-flex mt-4 text-[#e71c5e] font-semibold hover:text-[#c91852] transition-colors"
                          >
                            View {service.title}
                          </a>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}

              <QuoteCta
                title="Request information"
                text={`Need help with ${locationName}? Get in touch and we’ll guide you through the next steps.`}
                onOpenQuote={openQuote}
              />
            </>
          )}

          {isServicePage && (
            <>
              {content?.summary ? (
                <section className="max-w-5xl mx-auto">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
                    <p className="text-lg leading-relaxed text-gray-700">{content.summary}</p>
                  </div>
                </section>
              ) : null}

              {content?.content ? (
                <section className="max-w-5xl mx-auto">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                      {splitParagraphs(content.content).map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}

              <div className="max-w-5xl mx-auto space-y-10">
                <ListSection
                  title={`Why choose ${serviceTitle?.toLowerCase()} in ${locationName}`}
                  items={content?.service_benefits}
                />

                <ListSection
                  title={`What’s included`}
                  items={content?.service_includes}
                />

                <StepsSection
                  title={`How it works`}
                  steps={content?.process_steps}
                />

                <ListSection
                  title={`Who this service is for`}
                  items={content?.audience_types}
                />

                <ListSection
                  title={`Common use cases`}
                  items={content?.common_move_types}
                />

                {areasCovered.length ? (
                  <section className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                      Areas covered in {locationName}
                    </h2>
                    <p className="mt-3 text-gray-700 leading-relaxed">
                      This service page covers {locationName} and nearby areas.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {areasCovered.map((area) => (
                        <span
                          key={area}
                          className="px-4 py-2 rounded-full border border-gray-200 text-gray-800 bg-gray-50"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : null}

                {servicePageBlocks.length === 0 ? (
                  !content?.summary &&
                  !content?.content &&
                  !content?.service_benefits?.length &&
                  !content?.service_includes?.length &&
                  !content?.process_steps?.length &&
                  !content?.audience_types?.length &&
                  !content?.common_move_types?.length ? (
                    <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Explore {serviceTitle?.toLowerCase()} in {locationName}
                      </h2>
                      <p className="mt-3 text-gray-700 leading-relaxed">
                        This page is ready for service-specific content, blocks and FAQs.
                      </p>
                    </section>
                  ) : null
                ) : (
                  servicePageBlocks.map((block) => <ServiceBlockRenderer key={block.id} block={block} />)
                )}

                {!servicePageBlocks.some((b) => b.block_type === 'cross-links') && servicesToRender.length ? (
                  <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-900">Related services in {locationName}</h2>
                    {content?.related_service_intro ? (
                      <p className="mt-3 text-gray-700 leading-relaxed">{content.related_service_intro}</p>
                    ) : null}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <a
                        href={`/locations/${locationSlug}/`}
                        className="px-4 py-2 rounded-full border border-gray-200 text-gray-800 hover:border-[#e71c5e] hover:text-[#e71c5e] transition-colors"
                      >
                        {locationName} location page
                      </a>
                      {servicesToRender
                        .filter((s) => s.slug !== serviceSlug)
                        .map((s) => (
                          <a
                            key={s.slug}
                            href={`/locations/${locationSlug}/${s.slug}/`}
                            className="px-4 py-2 rounded-full border border-gray-200 text-gray-800 hover:border-[#e71c5e] hover:text-[#e71c5e] transition-colors"
                          >
                            {s.title} in {locationName}
                          </a>
                        ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </>
          )}

          <FaqSection faqs={faqs} />

          {isServicePage ? <MapSection mapEmbedUrl={mapEmbedUrl} locationName={locationName} /> : null}

          <QuoteCta
            title={isServicePage ? content?.cta_title || 'Request information' : 'Request information'}
            text={
              isServicePage
                ? content?.cta_text || 'Contact the team for more information about this service.'
                : 'Contact the team for more information.'
            }
            onOpenQuote={openQuote}
          />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
          />
          {serviceSchema ? (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
          ) : null}
        </div>
      </main>
    </>
  )
}
