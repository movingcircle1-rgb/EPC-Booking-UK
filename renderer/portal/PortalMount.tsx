import React, { useEffect, useState } from 'react'

export function PortalMount(props: { load: () => Promise<{ default: React.ComponentType<any> }> }) {
  const { load } = props
  const [Comp, setComp] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const mod = await load()
      if (!cancelled) setComp(() => mod.default)
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  if (!Comp) {
    return (
      <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <h1>Loading portal…</h1>
        <p>Please wait…</p>
      </main>
    )
  }

  return <Comp />
}
