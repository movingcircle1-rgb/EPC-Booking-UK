import { createClient } from '@supabase/supabase-js'

export { onBeforePrerenderStart }

async function onBeforePrerenderStart() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[articles prerender] Missing Supabase env vars, skipping article prerender.')
    return []
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data, error } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published')
    .not('slug', 'is', null)

  if (error) {
    console.error('[articles prerender] Failed to fetch article slugs:', error)
    return []
  }

  const urls = (data || [])
    .map((row: any) => String(row.slug || '').trim())
    .filter(Boolean)
    .map((slug: string) => `/articles/${slug.replace(/\s+/g, '-').toLowerCase()}/`)

  console.log(`[articles prerender] Pre-rendering ${urls.length} article URLs`)
  return urls
}
