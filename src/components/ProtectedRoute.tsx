import { ReactNode, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../lib/auth-service'

type AllowedRole =
  | 'admin'
  | 'admin-2'
  | 'staff'
  | 'partner'
  | 'client'
  | 'trade'
  | 'temp_admin'
  | 'unknown'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: AllowedRole[]
  requireAuth?: boolean
}

const normalizeRole = (role: unknown): AllowedRole | null => {
  const r = String(role ?? '').trim().toLowerCase()
  if (!r) return null
  if (r === 'admin2') return 'admin-2'
  if (r === 'temp-admin') return 'temp_admin'
  return r as AllowedRole
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true
}: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth()
  const isBrowser = typeof window !== 'undefined'
  const role = normalizeRole(userRole)

  useEffect(() => {
    if (!isBrowser) return
    if (loading) return

    // Not logged in
    if (requireAuth && !user) {
      window.location.replace('/portal/login')
      return
    }

    // Logged in but role missing -> force back to login (prevents infinite spinner)
    if (user && !role) {
      window.location.replace('/portal/login')
      return
    }

    // Logged in but wrong role
    if (user && role && allowedRoles) {
      if (!allowedRoles.includes(role)) {
        const correctPath = authService.getRedirectPathForRole(role)
        window.location.replace(correctPath)
        return
      }
    }
  }, [loading, user, role, allowedRoles, requireAuth, isBrowser])

  // Spinner only while loading (never wait forever on missing role)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#be0e0c] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  // SSR safe
  if (!isBrowser) return null
  if (requireAuth && !user) return null

  // If role missing at this point, we already redirected in useEffect; render nothing.
  if (user && !role) return null

  if (allowedRoles && role && !allowedRoles.includes(role)) return null

  return <>{children}</>
}
