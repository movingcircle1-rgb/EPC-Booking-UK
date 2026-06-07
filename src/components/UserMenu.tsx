// src/components/UserMenu.tsx
import { useState, useRef, useEffect } from 'react'
import { User, LogOut, Shield, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, userRole, signOut } = useAuth()

  const isBrowser = typeof window !== 'undefined'

  useEffect(() => {
    if (!isBrowser) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isBrowser])

  const goto = (path: string) => {
    if (!isBrowser) return
    // Keep your trailing-slash convention for public pages
    const noSlash = new Set([
      '/admin',
      '/admin2',
      '/temp-admin',
      '/client-portal',
      '/staff-portal',
      '/partner-portal',
      '/trade-portal',
      '/portal/login',
      '/signup',
    ])

    const clean = path.startsWith('/') ? path : `/${path}`
    const finalPath = noSlash.has(clean) ? clean : (clean.endsWith('/') ? clean : `${clean}/`)

    window.location.assign(finalPath)
  }

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
    goto('/') // go home
  }

  const getDashboardRoute = () => {
    if (userRole?.role === 'admin') return '/admin'
    if (userRole?.role === 'staff') return '/staff-portal'
    if (userRole?.role === 'partner') return '/partner-portal'
    if (userRole?.role === 'trade') return '/trade-portal'
    return '/client-portal'
  }

  // SSR: don’t render this (prevents hydration weirdness + safe)
  if (!isBrowser) return null

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[#e71c5e] hover:bg-[#c91852] text-white rounded-lg transition-all"
      >
        <User size={20} />
        <span className="hidden sm:inline font-semibold">
          {userRole?.full_name || user?.email?.split('@')[0] || 'Account'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border-2 border-gray-100 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">
              {userRole?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            {userRole?.role && (
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-[#e71c5e]/10 rounded text-xs font-semibold text-[#e71c5e] uppercase">
                <Shield size={12} />
                {userRole.role}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              goto(getDashboardRoute())
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
          >
            <Settings size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 text-red-600 border-t border-gray-100"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  )
}
