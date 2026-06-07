import React from 'react'
import LocationPage from '../../../../../src/pages/LocationPage'

export default function Page(props: any) {
  const pageContext = props?.pageContext ?? props

  // +data.ts returns: { pageProps: {...} }
  // Vike exposes it at: pageContext.data.pageProps
  const pageProps = pageContext?.data?.pageProps ?? {}

  // SSR debug marker: should appear in prerendered HTML
  const dbg =
    `SSR_DEBUG route=/locations/${pageContext?.routeParams?.location ?? ''}/${pageContext?.routeParams?.service ?? ''} ` +
    `blocks=${Array.isArray((pageProps as any)?.contentBlocks) ? (pageProps as any).contentBlocks.length : 'no'} ` +
    `keys=${pageProps ? Object.keys(pageProps).join(',') : 'none'}`

  return (
    <>
      <div style={{ display: 'none' }}>{dbg}</div>
      <LocationPage {...pageProps} />
    </>
  )
}
