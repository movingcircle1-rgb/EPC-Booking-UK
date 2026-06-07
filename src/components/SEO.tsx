import { Helmet } from '../lib/helmetAsync'
import { branding } from '../config/branding'

interface SEOProps {
  title: string
  description: string
  keywords?: string
  canonicalUrl?: string | null
  ogImage?: string
  ogType?: string
  noindex?: boolean

  // ✅ NEW: Optional FAQ structured data
  faqJsonLd?: any
}

export default function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = `${branding.seo.siteUrl}/National_Removals_and_Storage-.png`,
  ogType = 'website',
  noindex = false,
  faqJsonLd
}: SEOProps) {
  const robotsContent = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl || branding.seo.siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:site_name" content="National Removals and Storage" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* ✅ NEW: FAQPage Structured Data */}
      {faqJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(faqJsonLd)}
        </script>
      )}
    </Helmet>
  )
}
