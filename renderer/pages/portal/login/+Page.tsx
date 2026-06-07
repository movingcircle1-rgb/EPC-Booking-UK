import React, { useEffect, useState } from 'react'

export default function Page() {
  const [Comp, setComp] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // Client-only import to keep SSR/prerender safe
      const mod = await import('../../../../src/pages/LoginPage')
      if (!cancelled) setComp(() => mod.default)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!Comp) {
    return (
      <main style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
        <h1>Portal Login</h1>
        <p>Loading…</p>
      </main>
    )
  }

  return <Comp />
}
