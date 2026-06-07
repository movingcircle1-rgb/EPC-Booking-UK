import React, { useEffect, useState } from 'react'

export default function Page() {
  const [Comp, setComp] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const mod = await import('../../../src/pages/ClientPortalPage')
      if (!cancelled) setComp(() => mod.default)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!Comp) return <main style={{ padding: 24 }}>Loading…</main>
  return <Comp />
}
