import { Calendar, TrendingDown, Clock } from 'lucide-react';
import SEO from '../components/SEO';
import { useSEO } from '../hooks/useSEO';

export default function MidWeekMovePage() {
  const { seoData } = useSEO('/mid-week-move');

  const fallbackTitle =
    'Mid Week Move Discount - Save Up to 15% | National';
  const fallbackDescription =
    'Save up to 15% by moving Monday to Wednesday. Enjoy better availability and reduced demand.';
  const fallbackKeywords =
    'mid week move discount, weekday discount, moving savings';
  const fallbackCanonical =
    '/mid-week-move/';

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={seoData?.meta_title || fallbackTitle}
        description={seoData?.meta_description || fallbackDescription}
        keywords={seoData?.meta_keywords || fallbackKeywords}
        canonicalUrl={seoData?.canonical_url || fallbackCanonical}
      />

      <div className="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/Mid Week Move Discount.webp"
            alt="Mid Week Move Discount"
            className="w-full h-full object-cover opacity-30"
            loading="eager"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Mid Week Move Discount
            </h1>
            <p className="text-xl text-green-100">
              Save money by moving Monday to Thursday
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg mb-12">
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              Save up to 15% on Weekday Moves
            </h2>
            <p className="text-green-800">
              Take advantage of our quieter mid-week schedule and save
              significantly on your move.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <TrendingDown className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Lower Prices
              </h3>
              <p className="text-gray-600">
                Mid-week moves are less in demand, allowing us to offer you
                better rates.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                More Availability
              </h3>
              <p className="text-gray-600">
                Greater flexibility in choosing your preferred moving date and
                time slot.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Less Traffic
              </h3>
              <p className="text-gray-600">
                Weekday moves often mean less traffic congestion and faster
                journey times.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Discount Structure
            </h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-900">
                    Monday - Wednesday
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    15% OFF
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Maximum savings on mid-week moves
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              * Discounts subject to availability. Cannot be combined with other
              promotional offers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
