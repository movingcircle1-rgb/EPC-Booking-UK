import type { OnBeforePrerenderStart } from 'vike/types'
import { createClient } from '@supabase/supabase-js'

const SERVICES = ['test-service']

function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase server environment variables')
  }

  return createClient(url, key)
}

export const onBeforePrerenderStart: OnBeforePrerenderStart = async () => {
  const supabase = getSupabaseServerClient()

  const { data: cities, error } = await supabase
    .from('cities')
    .select('slug')
    .order('slug', { ascending: true })

  if (error) throw error

  const slugs = (cities ?? []).map((c) => c.slug)

  const routes: string[] = []
  for (const slug of slugs) {
    for (const service of SERVICES) {
      routes.push(`/locations/${slug}/${service}`)
    }
  }

  return routes
}
