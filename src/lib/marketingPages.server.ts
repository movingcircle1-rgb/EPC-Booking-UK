import fs from 'node:fs'
import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

function loadProjectEnv() {
  const root = process.cwd()

  const envFiles = [
    path.join(root, '.env'),
    path.join(root, '.env.local'),
  ]

  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      loadEnv({ path: file, override: true })
    }
  }
}

loadProjectEnv()

function normalizePath(pathname: string) {
  if (!pathname) return '/'
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL in .env or .env.local')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY in .env or .env.local')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

type ServiceRow = {
  id: string
  slug: string
  name: string
  marketing_path: string
}

type ServicePageContentRow = {
  id: string
  service_id: string
  h1: string
  intro?: string | null
  content?: string | null
  meta_title?: string | null
  meta_description?: string | null
  cta_title?: string | null
  cta_text?: string | null
}

type ServicePageBlockRow = {
  id: string
  service_id: string
  block_position: number
  heading: string
  content: string
  image_url?: string | null
  image_alt?: string | null
}

type ServicePageFaqRow = {
  id: string
  service_id: string
  position: number
  question: string
  answer: string
}

export async function getMarketingPagePaths(): Promise<Array<{ marketing_path: string }>> {
  const { data, error } = await supabase
    .from('services')
    .select('marketing_path')
    .eq('is_active', true)
    .eq('show_in_menu', true)
    .not('marketing_path', 'is', null)

  if (error) {
    throw error
  }

  return (data ?? [])
    .filter((row): row is { marketing_path: string } => Boolean(row?.marketing_path))
    .map((row) => ({
      marketing_path: normalizePath(row.marketing_path),
    }))
}

export async function getMarketingPageDataByPath(pathname: string) {
  const normalizedPath = normalizePath(pathname)

  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id, slug, name, marketing_path')
    .eq('marketing_path', normalizedPath)
    .eq('is_active', true)
    .single<ServiceRow>()

  if (serviceError || !service) {
    return null
  }

  const [
    { data: content, error: contentError },
    { data: blocks, error: blocksError },
    { data: faqs, error: faqsError },
  ] = await Promise.all([
    supabase
      .from('service_page_content')
      .select('*')
      .eq('service_id', service.id)
      .single<ServicePageContentRow>(),
    supabase
      .from('service_page_blocks')
      .select('*')
      .eq('service_id', service.id)
      .order('block_position', { ascending: true })
      .returns<ServicePageBlockRow[]>(),
    supabase
      .from('service_page_faqs')
      .select('*')
      .eq('service_id', service.id)
      .order('position', { ascending: true })
      .returns<ServicePageFaqRow[]>(),
  ])

  if (contentError || !content) {
    return null
  }

  if (blocksError) {
    throw blocksError
  }

  if (faqsError) {
    throw faqsError
  }

  return {
    service: {
      ...service,
      marketing_path: normalizePath(service.marketing_path),
    },
    content,
    blocks: blocks ?? [],
    faqs: faqs ?? [],
  }
}
