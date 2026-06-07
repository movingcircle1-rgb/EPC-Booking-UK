import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface SEOData {
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  canonical_url: string | null
}

/**
 * Normalise paths so:
 * /about/  -> /about
 * /about   -> /about
 * /        -> /
 */
function normalisePath(path: string): string {
  if (path === '/') return '/'
  return path.replace(/\/+$/, '')
}

export function useSEO(rawPath: string) {
  const [seoData, setSeoData] = useState<SEOData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSEO = async () => {
      setLoading(true)

      const path = normalisePath(rawPath)

      const { data, error } = await supabase
        .from('page_seo_metadata')
        .select('meta_title, meta_description, meta_keywords, canonical_url')
        .eq('page_path', path)
        .maybeSingle()

      if (error) {
        console.error('SEO load error:', error)
        setSeoData(null)
      } else {
        setSeoData(data)
      }

      setLoading(false)
    }

    loadSEO()
  }, [rawPath])

  return { seoData, loading }
}
