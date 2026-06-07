import { useEffect } from 'react'
import { hardNavigate } from '../lib/nav'
import { useAuth } from '../contexts/AuthContext'

export function useRequireAuth() {
  const { user, loading } = useAuth() as any

  useEffect(() => {
    if (!loading && !user) {
      hardNavigate('/portal/login')
    }
  }, [loading, user])
}
