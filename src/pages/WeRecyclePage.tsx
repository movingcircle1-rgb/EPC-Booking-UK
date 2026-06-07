import { Recycle, Leaf, Package, BarChart3 } from 'lucide-react'
import SEO from '../components/SEO'
import { useSEO } from '../hooks/useSEO'

export default function WeRecyclePage() {
  const { seoData } = useSEO('/we-recycle')

  const fallbackTitle = 'We Recycle - Sustainable Practices | National'
  const fallbackDescription =
    'Committed to responsible recycling and waste reduction across operations.'
  const fallbackKeywords =
    'recycling, sustainability, eco-friendly, waste reduction'
  const fallbackCanonical = '/we-recycle/'

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={seoData?.meta_title || fallbackTitle}
        description={seoData?.meta_description || fallbackDescription}
        keywords={seoData?.meta_keywords || fallbackKeywords}
        canonicalUrl={seoData?.canonical_url || fallbackCanonical}
      />

      <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/We Recycle.webp"
            alt="We Recycle"
            className="w-full h-full object-cover opacity-30"
            loading="eager"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">We Recycle</h1>
            <p className="text-xl text-emerald-100">
              Committed to sustainable practices and waste reduction
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-emerald-50 border-l-4 border-emerald-600 p-6 rounded-lg mb-12">
            <h2 className="text-2xl font-bold text-emerald-900 mb-2">
              Zero Waste to Landfill Goal
            </h2>
            <p className="text-emerald-800">
              We’re committed to recycling and repurposing materials, keeping waste out of landfills.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Package className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Materials</h3>
              <p className="text-gray-600">
                Materials used are recyclable or reusable wherever possible.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Recycle className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Recycling</h3>
              <p className="text-gray-600">
                Items are repurposed, donated, or recycled responsibly.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Leaf className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Eco Products</h3>
              <p className="text-gray-600">
                Environmentally friendly materials and processes are prioritised.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tracking</h3>
              <p className="text-gray-600">
                Continuous monitoring improves environmental performance over time.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What We Recycle
            </h2>

            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Cardboard &amp; Paper</h3>
                <p className="text-gray-600">Sorted and recycled responsibly.</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Plastics</h3>
                <p className="text-gray-600">Collected and processed correctly.</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Furniture</h3>
                <p className="text-gray-600">Reused, donated or recycled.</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Metal</h3>
                <p className="text-gray-600">Sent to appropriate recycling facilities.</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Electronics</h3>
                <p className="text-gray-600">Disposed of through certified channels.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Our Progress
            </h2>

            <div className="grid md:grid-cols-3 gap-6 text-center mb-6">
              <div>
                <p className="text-4xl font-bold text-emerald-600 mb-2">—</p>
                <p className="text-gray-700 font-semibold">Recycling Rate</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-emerald-600 mb-2">—</p>
                <p className="text-gray-700 font-semibold">Recycled Annually</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-emerald-600 mb-2">—</p>
                <p className="text-gray-700 font-semibold">Landfill Reduction</p>
              </div>
            </div>

            <p className="text-center text-gray-600">
              We continue to improve and evolve our environmental approach.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
