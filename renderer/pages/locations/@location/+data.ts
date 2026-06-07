import type { DataAsync } from 'vike/types'
import { createClient } from '@supabase/supabase-js'

const SERVICES = [{ slug: 'test-service', title: 'Test Service' }]

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) return null
  return createClient(url, key)
}

export const data: DataAsync = async (pageContext) => {
  const location = String(pageContext.routeParams?.location ?? '')
  const supabase = getSupabase()

  const pageProps: any = {
    location,
    service: undefined,
    locationData: null,
    serviceSeo: null,
    contentBlocks: [],
    faqs: [],
    services: SERVICES,
    template: null
  }

  if (!supabase || !location) {
    return { pageProps }
  }

  const { data: cityData, error: cityErr } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', location)
    .maybeSingle()

  if (cityErr || !cityData) {
    return { pageProps }
  }

  pageProps.locationData = cityData

  const { data: blocks, error: blocksErr } = await supabase
    .from('city_content_blocks')
    .select('*')
    .eq('city_id', cityData.id)
    .eq('service_type', 'general')
    .order('block_position', { ascending: true })

  pageProps.contentBlocks = !blocksErr && Array.isArray(blocks) ? blocks : []

  const { data: faqs, error: faqsErr } = await supabase
    .from('city_service_faqs')
    .select('id, city_id, service_type, position, question, answer, created_at, updated_at')
    .eq('city_id', cityData.id)
    .eq('service_type', 'general')
    .order('position', { ascending: true })

  pageProps.faqs = !faqsErr && Array.isArray(faqs) ? faqs : []

  const { data: templateData } = await supabase
    .from('location_content_templates')
    .select('*')
    .eq('service_type', 'general')
    .eq('is_active', true)
    .maybeSingle()

  pageProps.template = templateData || null

  return { pageProps }
}
