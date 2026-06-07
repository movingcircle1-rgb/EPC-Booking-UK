import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

/**
 * Loads env vars for Node scripts.
 * Priority:
 *   1) existing process.env (e.g. CI/Netlify)
 *   2) .env.local
 *   3) .env
 */
export function loadEnv() {
  const cwd = process.cwd()

  const candidates = [
    path.join(cwd, '.env.local'),
    path.join(cwd, '.env')
  ]

  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath })
    }
  }

  return {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY
  }
}
