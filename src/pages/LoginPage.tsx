import { useEffect, useState, FormEvent } from 'react'
import { hardNavigate } from '../lib/nav'
import { LogIn, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { authService } from '../lib/auth-service'
import SEO from '../components/SEO'

function getNextParam(): string | null {
  if (typeof window === 'undefined') return null
  const url = new URL(window.location.href)
  const next = url.searchParams.get('next')
  return next && next.trim().length > 0 ? next : null
}

function isAllowedNext(next: string): boolean {
  return (
    next === '/client-portal' ||
    next === '/partner-portal/' ||
    next === '/staff-portal' ||
    next === '/trade-portal/'
  )
}

function roleToPortalPath(roleRaw?: string | null): string {
  const role = String(roleRaw || 'client').toLowerCase()

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
    default:
      return '/client-portal'
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  // If already signed in, redirect away from login page
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const existingUser = await authService.getCurrentUser?.()
        if (cancelled) return
        if (!existingUser) return

        const next = getNextParam()
        if (next && isAllowedNext(next)) {
          hardNavigate(next)
          return
        }

        const roleData = await authService.getUserRole(existingUser.id)
        if (cancelled) return

        const role = (roleData?.role || 'client') as string
        hardNavigate(roleToPortalPath(role))
      } catch {
        // silently ignore; user may not be logged in
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('[LoginPage] Attempting login for:', email)
      const { user } = await authService.signIn(email, password)

      if (!user) {
        setError('Login failed. Please try again.')
        return
      }

      console.log('[LoginPage] Login successful, user ID:', user.id)

      // If a portal sent us here, go back there
      const next = getNextParam()
      if (next && isAllowedNext(next)) {
        console.log('[LoginPage] Redirecting to next:', next)
        hardNavigate(next)
        return
      }

      // Otherwise redirect by role
      const roleData = await authService.getUserRole(user.id)
      console.log('[LoginPage] User role data:', roleData)

      if (!roleData) {
        console.error('[LoginPage] No role data found for user')
        setError('Unable to load user role. Please try again.')
        return
      }

      const role = String(roleData.role || "client").toLowerCase()
      const roleToPath: Record<string, string> = {
        client: "/client-portal",
        partner: "/partner-portal/",
        staff: "/staff-portal",
        trade: "/trade-portal/",
        "admin-2": "/admin-2",
      }

      const redirectPath = roleToPath[role] ?? "/staff-portal"

      console.log('[LoginPage] Redirecting to:', redirectPath, 'for role:', role)
      hardNavigate(redirectPath)
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.')
      console.error('[LoginPage] Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.resetPassword(email)
      setResetSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <SEO
        title="Login"
        description="Login to your National Removals and Storage account"
        canonicalUrl="https://nationalremovalsandstorage.co.uk/portal/login"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#e71c5e] rounded-full mb-4">
                <LogIn size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {resetSuccess && (
              <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm">Password reset email sent! Check your inbox.</p>
              </div>
            )}

            {showResetPassword ? (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={20} className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-[#e71c5e] transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#e71c5e] hover:bg-[#c91852] text-white py-3 px-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false)
                    setResetSuccess(false)
                    setError('')
                  }}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm font-semibold"
                >
                  Back to Login
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={20} className="text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-[#e71c5e] transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={20} className="text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-[#e71c5e] transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

             <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#e71c5e] hover:bg-[#c91852] text-white py-3 px-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-sm text-[#e71c5e] hover:text-[#c91852] font-semibold"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm mb-2">
                Don&apos;t have an account?{' '}
                <a
                  href="/signup/"
                  className="text-[#e71c5e] hover:text-[#c91852] font-semibold transition-colors"
                >
                  Sign Up
                </a>
              </p>
              <a
                href="/"
                className="text-[#e71c5e] hover:text-[#c91852] font-semibold transition-colors text-sm"
              >
                Back to Homepage
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


