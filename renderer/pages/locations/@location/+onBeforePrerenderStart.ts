import { createClient } from '@supabase/supabase-js'

export { onBeforePrerenderStart }

async function onBeforePrerenderStart() {
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('cities')
    .select(`
      slug,
      location_services!inner (
        service_slug,
        is_available
      )
    `)
    .eq('location_services.is_available', true)

  if (error) {
    throw new Error(`Failed to fetch prerender location slugs: ${error.message}`)
  }

  const uniqueSlugs = Array.from(
    new Set((data ?? []).map((row: { slug: string }) => row.slug).filter(Boolean))
  )

  return uniqueSlugs.map((slug) => `/locations/${slug}/`)
}
