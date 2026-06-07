import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type AuthContextType = {
  user: any
  session: any
  userRole: string | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRole: null,
  loading: true,
  signOut: async () => {}
})

export const useAuth = () => useContext(AuthContext)

const normalizeRole = (role: unknown): string | null => {
  const r = String(role ?? '').trim().toLowerCase()
  if (!r) return null
  if (r === 'admin2') return 'admin-2'
  if (r === 'temp-admin') return 'temp_admin'
  return r
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadUserRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()

      if (error || !data?.role) {
        setUserRole('unknown')
        return
      }

      setUserRole(normalizeRole(data.role) ?? 'unknown')
    } catch (err) {
      console.error('[Auth] role load exception:', err)
      setUserRole('unknown')
    }
  }

  useEffect(() => {
    let cancelled = false

    const applySession = async (nextSession: any) => {
      if (cancelled) return
      setSession(nextSession ?? null)
      setUser(nextSession?.user ?? null)

      const id = nextSession?.user?.id
      if (id) await loadUserRole(id)
      else setUserRole('unknown')

      if (!cancelled) setLoading(false)
    }

    // With persistSession:false, this is fast + avoids storage locks
    supabase.auth.getSession()
      .then(({ data }) => applySession(data?.session ?? null))
      .catch((e) => {
        console.warn('[Auth] getSession error:', e)
        applySession(null)
      })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession)
    })

    return () => {
      cancelled = true
      sub?.subscription?.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setUserRole('unknown')
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
