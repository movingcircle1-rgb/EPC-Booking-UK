#!/usr/bin/env node

import { loadEnv } from './_loadEnv.js'
loadEnv()

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function mustGetEnv(name) {
  const v = process.env[name]
  return v && String(v).trim().length > 0 ? String(v).trim() : null
}

async function main() {
  console.log('🔄 Fetching locations for prerender list...')

  const outPath = path.join(process.cwd(), 'public', '_locations.json')

  const supabaseUrl = mustGetEnv('VITE_SUPABASE_URL')
  const supabaseAnonKey = mustGetEnv('VITE_SUPABASE_ANON_KEY')

  if (!supabaseUrl || !supabaseAnonKey) {
    const out = {
      generatedAt: new Date().toISOString(),
      count: 0,
      slugs: []
    }

    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')
    console.warn('⚠️  Supabase credentials not found. Wrote empty location list and continuing.')
    console.log(`✓ Wrote 0 slugs to ${outPath}`)
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data, error } = await supabase
    .from('cities')
    .select('slug')
    .order('name')

  if (error) throw error

  const slugs = (data || [])
    .map((x) => String(x.slug || '').trim())
    .filter(Boolean)

  const out = {
    generatedAt: new Date().toISOString(),
    count: slugs.length,
    slugs
  }

  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')

  console.log(`✓ Wrote ${slugs.length} slugs to ${outPath}`)
}

main().catch((e) => {
  console.error('❌ prerender-locations failed:', e)
  process.exit(1)
})
