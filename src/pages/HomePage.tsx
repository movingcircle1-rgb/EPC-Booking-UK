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
        <section className="bg-[#1F3447] text-white">
          <div className="container mx-auto px-4 py-20 md:py-28 text-center">
            <p className="mb-5 text-sm md:text-base font-semibold uppercase tracking-[0.25em] text-white/70">
              EPC Booking UK
            </p>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Book Your EPC Certificate Online
            </h1>

            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-2xl text-white/90 leading-relaxed">
              Fast local EPC appointments with qualified energy assessors, clear pricing and digital certificate delivery for landlords, sellers, homeowners and agents.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={openQuote}
                className="bg-[#C73532] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#A92C2A] transition-colors shadow-lg"
              >
                Book EPC Appointment
              </button>

              <a
                href="/locations/"
                className="border border-white/40 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Check Local Availability
              </a>
            </div>
          </div>
        </section>

        <section className="bg-[#F4F6F7] text-[#17212B]">
          <div className="container mx-auto px-4 py-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-[#D9E0E4] bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#1F3447]">Qualified Assessors</h2>
                <p className="mt-3 text-[#5E6B73] leading-relaxed">
                  Arrange EPC appointments with qualified local energy assessors for domestic, landlord and commercial properties.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D9E0E4] bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#1F3447]">Simple Online Booking</h2>
                <p className="mt-3 text-[#5E6B73] leading-relaxed">
                  Enter the property details, choose your preferred appointment window and receive clear confirmation.
                </p>
              </div>

              <div className="rounded-2xl border border-[#D9E0E4] bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#1F3447]">Digital Certificate Delivery</h2>
                <p className="mt-3 text-[#5E6B73] leading-relaxed">
                  Once the assessment is complete, your EPC certificate can be delivered digitally for sales, lettings or compliance.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
