// renderer/+onRenderHtml.tsx
import '../src/index.css'

import React from 'react'
import { renderToString } from 'react-dom/server'
import type { PageContextServer } from 'vike/types'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { branding } from '../src/config/branding'
import AppShell from './AppShell'

export { onRenderHtml }

const structuredData = `{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "National Removals and Storage",
  "image": "https://nationalremovalsandstorage.co.uk/National_Removals_and_Storage-.png",
  "@id": "https://nationalremovalsandstorage.co.uk",
  "url": "https://nationalremovalsandstorage.co.uk",
  "telephone": "08000472607"
}`

async function onRenderHtml(pageContext: PageContextServer) {
  const { Page } = pageContext
  if (!Page) {
    throw new Error('onRenderHtml(): pageContext.Page is missing')
  }

  const helmetContext: any = {}

  const appHtml = renderToString(
    <AppShell isSsr={true} helmetContext={helmetContext}>
      <Page pageContext={pageContext as any} />
    </AppShell>
  )

  const helmet = helmetContext.helmet

  const pathname = pageContext.urlPathname
  const canonicalHref =
    branding.seo.siteUrl +
    (pathname === '/'
      ? '/'
      : pathname.endsWith('/')
      ? pathname
      : pathname + '/')

  const canonicalFallback = `<link data-rh="true" rel="canonical" href="${canonicalHref}"/>`
  const metaDescriptionFallback =
    `<meta data-rh="true" name="description" content="National Removals and Storage – removals and storage across the UK. Free quote: 0800 047 2607."/>`
  const titleFallback = `<title data-rh="true">National Removals and Storage</title>`

  const helmetTitle = helmet?.title?.toString?.() ?? ''
  const helmetMeta = helmet?.meta?.toString?.() ?? ''
  const helmetLink = helmet?.link?.toString?.() ?? ''

  const canonicalRe =
    /<link[^>]*rel\s*=\s*(?:"|\x27|&quot;)canonical(?:"|\x27|&quot;)[^>]*>/i
  const descRe =
    /<meta[^>]*name\s*=\s*(?:"|\x27|&quot;)description(?:"|\x27|&quot;)[^>]*>/i
  const titleRe = /<title[^>]*>\s*[^<\s][^<]*<\/title>/i

  const hasCanonical = canonicalRe.test(helmetLink)
  const hasDescription = descRe.test(helmetMeta)
  const hasNonEmptyTitle = titleRe.test(helmetTitle)

  const joined = [
    hasNonEmptyTitle ? helmetTitle : titleFallback,
    helmetMeta,
    helmetLink,
    hasCanonical ? '' : canonicalFallback,
    hasDescription ? '' : metaDescriptionFallback
  ]
    .filter(Boolean)
    .join('\n')

  const headLinesRaw = joined
    .replace(/></g, '>\n<')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const out: string[] = []
  let seenCanonical = false
  let seenDesc = false
  let seenTitle = false

  for (const line of headLinesRaw) {
    const l = line.trim()
    if (!l) continue

    if (/<link[^>]*rel\s*=\s*(?:"|\x27|&quot;)canonical(?:"|\x27|&quot;)/i.test(l)) {
      if (seenCanonical) continue
      seenCanonical = true
    }

    if (/<meta[^>]*name\s*=\s*(?:"|\x27|&quot;)description(?:"|\x27|&quot;)/i.test(l)) {
      if (seenDesc) continue
      seenDesc = true
    }

    if (/<title\b/i.test(l)) {
      if (seenTitle) continue
      seenTitle = true
    }

    out.push(l)
  }

  const headFinal = dangerouslySkipEscape(out.join('\n'))

  const documentHtml = escapeInject`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <meta name="google-site-verification" content="zZj0CcEr7dDTpZLbxXEbEqwpcbPoQWgtmjt4ogsJ0L8" />

    ${headFinal}

    <script type="application/ld+json">${dangerouslySkipEscape(structuredData)}</script>
  </head>
  <body>
    <div id="root">${dangerouslySkipEscape(appHtml)}</div>
  </body>
</html>`

  return { documentHtml }
}
