import { Helmet } from 'react-helmet-async'
import { brandConfig } from '../config/branding'
import { useQuote } from '../contexts/QuoteContext'

export default function HomePage() {
  const { openQuote } = useQuote()

  return (
    <>
      <Helmet>
        <title>{brandConfig.seo.title}</title>
        <meta name="description" content={brandConfig.seo.description} />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <main className="bg-white">
        <section className="bg-[#e71c5e] text-white">
          <div className="container mx-auto px-4 py-20 md:py-28 text-center">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Flexible Website Template for Service Businesses
            </h1>

            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-2xl text-white/90 leading-relaxed">
              This clone is being rebuilt as a reusable location-and-service platform for multiple
              industries, including transport, training and estate agency.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={openQuote}
                className="bg-white text-[#e71c5e] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Open Quote Form
              </button>

              <a
                href="/locations/"
                className="border border-white/40 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Browse Locations
              </a>
            </div>
          </div>
        </section>

        <section className="bg-[#07142c] text-white">
          <div className="container mx-auto px-4 py-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-2xl font-bold">Reusable Structure</h2>
                <p className="mt-3 text-white/80 leading-relaxed">
                  Built around scalable locations, services, content blocks and FAQs.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-2xl font-bold">Static Rendering</h2>
                <p className="mt-3 text-white/80 leading-relaxed">
                  Optimised for fast page delivery and structured SEO deployment.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-2xl font-bold">Multi-Industry Ready</h2>
                <p className="mt-3 text-white/80 leading-relaxed">
                  Designed to support new brands without hardcoded removals-specific assumptions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
