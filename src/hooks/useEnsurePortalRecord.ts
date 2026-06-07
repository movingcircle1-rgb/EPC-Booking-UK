import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const normalizeRole = (role: unknown) => String(role ?? '').trim().toLowerCase()

export function useEnsurePortalRecord() {
  const { user, userRole, loading } = useAuth()

  const role = useMemo(() => normalizeRole(userRole?.role), [userRole?.role])
  const userId = user?.id ?? null

  const [isVerifying, setIsVerifying] = useState(true)
  const [hasRecord, setHasRecord] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      // Auth still loading -> keep verifying true so pages don't misinterpret state
      if (loading) return

      // Not logged in -> nothing to verify
      if (!userId) {
        if (!cancelled) {
          setHasRecord(false)
          setError(null)
          setIsVerifying(false)
        }
        return
      }

      // Logged in but role not ready yet -> wait (do NOT flip isVerifying off)
      if (!role) return

      if (!cancelled) {
        setIsVerifying(true)
        setError(null)
      }

      try {
        // Roles that don't require a portal record
        if (role === 'client' || role === 'admin' || role === 'admin-2') {
          if (!cancelled) {
            setHasRecord(true)
          }
          return
        }

        const ensureTableRecord = async (table: string) => {
          const { data, error: checkError } = await supabase
            .from(table)
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()

          if (checkError && checkError.code !== 'PGRST116') throw checkError

          if (data) return true

          const { error: createError } = await supabase.rpc('create_missing_portal_records', {
            p_user_id: userId
          })

          // Non-fatal: RPC might be restricted; we still retry the select
          if (createError) {
            console.warn(`Failed to create ${table} record via RPC:`, createError)
          }

          // brief delay then retry
          await new Promise((r) => setTimeout(r, 500))

          const { data: retryData, error: retryError } = await supabase
            .from(table)
            .select('id')
            .eq('user_id', userId)
            .maybeSingle()

          if (retryError && retryError.code !== 'PGRST116') throw retryError

          return !!retryData
        }

        let recordExists = true

        if (role === 'partner') recordExists = await ensureTableRecord('partners')
        else if (role === 'trade') recordExists = await ensureTableRecord('trade_accounts')
        else if (role === 'staff') recordExists = await ensureTableRecord('staff_profiles')
        else {
          // Unknown role: don't block the app forever, but surface it
          recordExists = true
          if (!cancelled) setError(`Unknown role "${role}". Please contact support.`)
        }

        if (!cancelled) {
          setHasRecord(recordExists)
          if (!recordExists) {
            setError('Portal account is being set up. Please refresh the page in a moment.')
          }
        }
      } catch (err: any) {
        console.error('Error ensuring portal record:', err)
        if (!cancelled) {
          setHasRecord(false)
          setError(err?.message || 'Failed to verify portal account')
        }
      } finally {
        if (!cancelled) setIsVerifying(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [loading, userId, role])

  return { isVerifying, hasRecord, error }
}
