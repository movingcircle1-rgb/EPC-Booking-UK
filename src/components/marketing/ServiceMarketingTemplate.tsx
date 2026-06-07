import { brandConfig } from '../../config/branding'

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
  h1: string
  intro?: string
  content?: string
  blocks?: Block[]
  faqs?: Faq[]
  ctaTitle?: string
  ctaText?: string
}

export default function ServiceMarketingTemplate({
  h1,
  intro,
  content,
  blocks = [],
  faqs = [],
  ctaTitle,
  ctaText,
}: Props) {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-24">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
              National Removals and Storage
            </p>

            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              {h1}
            </h1>

            {intro ? (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200 md:text-xl">
                {intro}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/contact/"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Get a Quote
              </a>
              <a
                href={brandConfig.contact.phoneHref}
                className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Call {brandConfig.contact.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Intro / Main body */}
      {content ? (
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-14 md:px-8">
            <div className="max-w-4xl">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm md:p-10">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Trusted Support When You Need It Most
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-700 md:text-lg">
                  {content}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Service highlights */}
      {blocks.length > 0 ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                How We Help
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Practical removals support for damaged properties, temporary relocation
                and secure onward storage where needed.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {blocks.map((block) => (
                <div
                  key={block.block_position}
                  className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold text-slate-700">
                    {block.block_position}
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900">
                    {block.heading}
                  </h3>

                  <p className="mt-4 text-base leading-7 text-slate-600">
                    {block.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Why choose us */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Why Choose National Removals and Storage
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Fire and flood related removals often need careful handling, fast
                response and a practical team that can support the next stage of the
                process. We focus on protecting items, clear communication and reliable
                logistics from collection to delivery or storage.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Fast Response
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Support for urgent removals where damaged properties need to be
                  cleared quickly and carefully.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Secure Handling
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Careful handling of salvageable belongings, furniture and contents
                  during collection, loading and onward movement.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Storage Options
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Flexible storage support where access is delayed or the property is
                  not ready for immediate return.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Professional Coordination
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Suitable for homeowners, landlords, insurers and commercial property
                  managers needing practical removals support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      {faqs.length > 0 ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Answers to common questions about fire and flood removals, storage and
                urgent support.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.position}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      {ctaTitle || ctaText ? (
        <section className="bg-slate-900 text-white">
          <div className="mx-auto max-w-7xl px-6 py-16 md:px-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
              {ctaTitle ? (
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  {ctaTitle}
                </h2>
              ) : null}

              {ctaText ? (
                <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-200">
                  {ctaText}
                </p>
              ) : null}

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/contact/"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Contact Us
                </a>
                <a
                  href={brandConfig.contact.phoneHref}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Call {brandConfig.contact.phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}
