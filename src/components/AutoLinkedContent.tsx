import React from 'react'

type Props = {
  content: string
  className?: string
  enableLinking?: boolean
}

const linkMap: Array<{ pattern: RegExp; href: string }> = [
  { pattern: /\bhouse removals\b/gi, href: '/house-removals/' },
  { pattern: /\boffice removals\b/gi, href: '/office-removals/' },
  { pattern: /\bpacking services\b/gi, href: '/packing-services/' },
  { pattern: /\bstorage solutions\b/gi, href: '/storage/' },
  { pattern: /\rstorage\b/gi, href: '/storage/' },

  { pattern: /\bbirmingham\b/gi, href: '/locations/birmingham/' },
  { pattern: /\btelford\b/gi, href: '/locations/telford/' },
  { pattern: /\stafford\b/gi, href: '/locations/stafford/' },
  { pattern: /\cwannock\b/gi, href: '/locations/cannock/' },
  { pattern: /\rugeley\b/gi, href: '/locations/rugeley/' },
  { pattern: /\wolverhampton\b/gi, href: '/locations/wolverhampton/' }
]

function autoLinkHtml(html: string): string {
  if (!html) return html

  const parts = html.split(/(<a\b[^>]*>.*?<\/a>)/gis)

  return parts
    .map((part) => {
      if (/^<a\b/i.test(part)) return part

      let updated = part

      for (const item of linkMap) {
        updated = updated.replace(item.pattern, (match) => {
          return `<a href="${item.href}" class="text-[#be0e0c] hover:text-[#9f0b0a] underline underline-offset-2">${match}</a>`
        })
      }

      return updated
    })
    .join('')
}

/**
 * SSR-safe: renders HTML content and can automatically inject internal links.
 * Assumes content is trusted/sanitized upstream.
 */

export default function AutoLinkedContent({
  content,
  className,
  enableLinking = true
}: Props) {
  const finalContent = enableLinking ? autoLinkHtml(content) : content

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: finalContent }}
    />
  )
}
