import React, { useEffect, useState } from 'react'
import { hardNavigate } from '../../src/lib/nav'

type Role = 'client' | 'partner' | 'trade' | 'staff' | 'admin' | 'admin-2' | 'temp_admin'
type Portal = 'client' | 'partner' | 'trade' | 'staff'

const normalizeRole = (role: unknown): Role | null => {
  const r = String(role ?? '').trim().toLowerCase()
  if (!r) return null
  if (r === 'admin2') return 'admin-2'
  if (r === 'temp-admin') return 'temp_admin'
  return r as Role
}

const portalAllowedRoles: Record<Portal, Role[]> = {
  client: ['client'],
  partner: ['partner'],
  trade: ['trade'],
  staff: ['staff', 'admin', 'admin-2', 'temp_admin']
}

function portalRootForRole(role: Role): string {
  switch (role) {
    case 'client':
      return '/client-portal'
    case 'partner':
      return '/partner-portal/'
    case 'trade':
      return '/trade-portal/'
    case 'staff':
    case 'admin':
    case 'temp_admin':
      return '/staff-portal'
    case 'admin-2':
      return '/admin-2'
    default:
      return '/portal/login/'
  }
}

async function getRoleForUser(supabase: any, userId: string): Promise<Role | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return null
  return normalizeRole(data?.role)
}

export function PortalGuard(props: { portal: Portal; children: React.ReactNode }) {
  const { portal, children } = props
  const [state, setState] = useState<'loading' | 'ready'>('loading')

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        // Keep SSR safe: only runs in browser
        const mod = await import('@supabase/supabase-js')

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          hardNavigate('/portal/login/')
          return
        }

        const supabase = mod.createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
            storageKey: 'nr_storage_supabase_auth',
            storage: typeof window !== 'undefined' ? window.localStorage : undefined
          }
        })

        const { data: sessionRes } = await supabase.auth.getSession()
        const session = sessionRes.session

        if (!session) {
          hardNavigate('/portal/login/')
          return
        }

        const role = await getRoleForUser(supabase, session.user.id)

        if (!role) {
          hardNavigate('/portal/login/')
          return
        }

        const allowed = portalAllowedRoles[portal]
        if (!allowed.includes(role)) {
          hardNavigate(portalRootForRole(role))
          return
        }

        if (!cancelled) setState('ready')
      } catch {
        hardNavigate('/portal/login/')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [portal])

  if (state === 'loading') {
    return (
      <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <h1>Loading portal…</h1>
        <p>Checking session…</p>
      </main>
    )
  }

  return <>{children}</>
}
