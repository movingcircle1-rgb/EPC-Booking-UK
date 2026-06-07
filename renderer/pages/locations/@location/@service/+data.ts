import type { DataAsync } from 'vike/types'
import { createClient } from '@supabase/supabase-js'

const SERVICES = [{ slug: 'test-service', title: 'Test Service' }]

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('[Supabase] Missing URL or KEY')
    return null
  }

  return createClient(url, key)
}

export const data: DataAsync = async (pageContext) => {
  const locationSlug = String(pageContext.routeParams?.location ?? '')
  const serviceSlug = String(pageContext.routeParams?.service ?? '')

  const supabase = getSupabase()

  const pageProps: any = {
    location: locationSlug,
    service: serviceSlug,
    locationData: null,
    serviceSeo: null,
    contentBlocks: [],
    faqs: [],
    services: SERVICES,
    template: null,
    notFound: false
  }

  if (serviceSlug !== 'test-service') {
    pageProps.notFound = true
    return { pageProps }
  }

  if (!supabase || !locationSlug || !serviceSlug) {
    return { pageProps }
  }

  const { data: city, error: cityError } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', locationSlug)
    .maybeSingle()

  if (cityError) {
    console.error('[Cities] Error fetching city:', { locationSlug, cityError })
  }

  if (!city) {
    pageProps.notFound = true
    return { pageProps }
  }

  pageProps.locationData = city

  const { data: serviceSeo, error: serviceSeoError } = await supabase
    .from('city_service_content')
    .select('*')
    .eq('city_id', city.id)
    .eq('service_type', serviceSlug)
    .maybeSingle()

  if (serviceSeoError) {
    console.error('[Service SEO] Error fetching:', {
      locationSlug,
      serviceSlug,
      serviceSeoError
    })
  }

  pageProps.serviceSeo = serviceSeo ?? null

  const { data: blocks, error: blocksError } = await supabase
    .from('city_content_blocks')
    .select('*')
    .eq('city_id', city.id)
    .eq('service_type', serviceSlug)
    .order('block_position', { ascending: true })

  if (blocksError) {
    console.error('[Content blocks] Error fetching:', {
      locationSlug,
      serviceSlug,
      blocksError
    })
  }

  pageProps.contentBlocks = Array.isArray(blocks) ? blocks : []

  const { data: faqs, error: faqsError } = await supabase
    .from('city_service_faqs')
    .select('id, city_id, service_type, position, question, answer, created_at, updated_at')
    .eq('city_id', city.id)
    .eq('service_type', serviceSlug)
    .order('position', { ascending: true })

  if (faqsError) {
    console.error('[FAQs] Error fetching:', {
      locationSlug,
      serviceSlug,
      faqsError
    })
  }

  pageProps.faqs = Array.isArray(faqs) ? faqs : []

  const { data: templateData, error: templateError } = await supabase
    .from('location_content_templates')
    .select('*')
    .eq('service_type', serviceSlug)
    .eq('is_active', true)
    .maybeSingle()

  if (templateError) {
    console.error('[Template] Error fetching:', {
      locationSlug,
      serviceSlug,
      templateError
    })
  }

  pageProps.template = templateData || null

  return { pageProps }
}
