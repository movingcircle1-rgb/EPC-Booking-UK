import { Leaf, Truck, Target, TrendingDown } from 'lucide-react'
import SEO from '../components/SEO'
import { useSEO } from '../hooks/useSEO'

export default function LowEmissionPromisePage() {
  // IMPORTANT: NO trailing slash – must match Supabase page_path + useSEO normalisation
  const { seoData } = useSEO('/low-emission-promise')

  const fallbackTitle =
    'Low Emission Promise - Carbon Neutral by 2028 | National'
  const fallbackDescription =
    'Leading the way to low-emission operations. Committed to reducing environmental impact through fleet modernisation and sustainable operational practices.'
  const fallbackKeywords =
    'low emission, carbon reduction, eco-friendly operations, sustainability, green business'
  const fallbackCanonical =
    '/low-emission-promise/'

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={seoData?.meta_title || fallbackTitle}
        description={seoData?.meta_description || fallbackDescription}
        keywords={seoData?.meta_keywords || fallbackKeywords}
        canonicalUrl={seoData?.canonical_url || fallbackCanonical}
      />

      {/* HERO */}
      <div className="relative bg-gradient-to-r from-teal-600 to-teal-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/Carbon Neutral.webp"
            alt="Carbon Neutral by 2028"
            className="w-full h-full object-cover opacity-30"
            loading="eager"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Low Emission Promise
            </h1>
            <p className="text-xl text-teal-100">
              Leading the way to carbon-neutral moving services
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Commitment Box */}
          <div className="bg-teal-50 border-l-4 border-teal-600 p-6 rounded-lg mb-12">
            <h2 className="text-2xl font-bold text-teal-900 mb-2">
              Carbon Neutral by 2028
            </h2>
            <p className="text-teal-800">
              We’re committed to reducing our carbon footprint and achieving
              carbon neutrality through fleet modernisation and sustainable
              operational practices.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              {
                icon: Truck,
                title: 'Modern Fleet',
                description:
                  'A growing percentage of our fleet meets Euro 6 emission standards, with full compliance planned.',
              },
              {
                icon: Leaf,
                title: 'Electric Vehicles',
                description:
                  'Investment in electric and hybrid vehicles for cleaner local and regional moves.',
              },
              {
                icon: Target,
                title: 'Route Optimisation',
                description:
                  'Advanced GPS planning reduces mileage, fuel consumption, and overall emissions.',
              },
              {
                icon: TrendingDown,
                title: 'Carbon Offsetting',
                description:
                  'Remaining emissions are offset through certified carbon reduction initiatives.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                  <item.icon className="text-teal-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Progress Bars */}
          <div className="bg-gray-50 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Our Progress So Far
            </h2>

            {[
              { label: 'Euro 6 Compliant Vehicles', value: 60 },
              { label: 'Electric & Hybrid Vehicles', value: 25 },
              { label: 'CO2 Reduction vs 2020', value: 45 },
            ].map((item, idx) => (
              <div key={idx} className="mb-6 last:mb-0">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-900">
                    {item.label}
                  </span>
                  <span className="text-teal-600 font-bold">
                    {item.value}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-teal-600 h-4 rounded-full"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Roadmap */}
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Roadmap to Carbon Neutrality
            </h2>

            {[
              {
                year: '2025',
                title: 'Major Fleet Upgrade',
                text: 'Continued investment in low-emission and hybrid vehicles.',
              },
              {
                year: '2026',
                title: 'Full Euro 6 Compliance',
                text: 'Complete transition to modern emission standards.',
              },
              {
                year: '2027',
                title: 'Expanded Electric Fleet',
                text: 'Significant increase in electric vehicle deployment.',
              },
              {
                year: '2028',
                title: 'Carbon Neutral Operations',
                text: 'Achieving carbon neutrality through reduction and certified offsetting.',
              },
            ].map((step, idx) => (
              <div key={idx} className="flex gap-4 mb-6 last:mb-0">
                <div className="w-24 text-center flex-shrink-0">
                  <span className="text-2xl font-bold text-teal-600">
                    {step.year}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
