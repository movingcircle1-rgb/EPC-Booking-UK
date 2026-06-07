import React from 'react'

export default function Page(pageContext: any) {
  const err = pageContext?.abortReason || pageContext?.errorWhileRendering || pageContext?.error
  const msg =
    (err && (err.message || String(err))) ||
    'Something went wrong.'

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <h1 style={{ margin: 0, fontSize: 24 }}>Error</h1>
      <p style={{ marginTop: 12 }}>{msg}</p>
      <p style={{ marginTop: 12, opacity: 0.7 }}>
        Try refreshing the page. If the problem persists, please contact support.
      </p>
    </div>
  )
}
