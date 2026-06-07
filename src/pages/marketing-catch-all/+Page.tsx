import ServiceMarketingTemplate from '../../components/marketing/ServiceMarketingTemplate'

type Block = {
  block_position: number
  heading: string
  content: string
  image_url?: string | null
  image_alt?: string | null
}

type Faq = {
  position: number
  question: string
  answer: string
}

type Props = {
  pageContext: {
    pageProps?: {
      service?: {
        id: string
        slug: string
        name: string
        marketing_path: string
      }
      content?: {
        h1: string
        intro?: string | null
        content?: string | null
        cta_title?: string | null
        cta_text?: string | null
        meta_title?: string | null
        meta_description?: string | null
      }
      blocks?: Block[]
      faqs?: Faq[]
    }
  }
}

export default function Page({ pageContext }: Props) {
  console.log('[marketing-page] pageContext:', pageContext)

  const content = pageContext.pageProps?.content
  const blocks = pageContext.pageProps?.blocks ?? []
  const faqs = pageContext.pageProps?.faqs ?? []

  if (!content) {
    return (
      <main className="min-h-screen bg-white">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="text-3xl font-bold text-slate-900">
            Marketing page content missing
          </h1>
          <p className="mt-4 text-slate-600">
            The route matched, but no marketing content was passed to the page.
          </p>
        </section>
      </main>
    )
  }

  return (
    <ServiceMarketingTemplate
      h1={content.h1}
      intro={content.intro ?? ''}
      content={content.content ?? ''}
      blocks={blocks}
      faqs={faqs}
      ctaTitle={content.cta_title ?? ''}
      ctaText={content.cta_text ?? ''}
    />
  )
}
