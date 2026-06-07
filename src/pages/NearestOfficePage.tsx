import SEO from '../components/SEO'
import { useSEO } from '../hooks/useSEO'

export default function NearestOfficePage() {
  const { seoData } = useSEO('/nearest-office')

  return (
    <div>
      <SEO
        title={seoData?.meta_title || 'Your Nearest Office | National Removals and Storage'}
        description={
          seoData?.meta_description ||
          'Find your nearest National Removals and Storage operating location and learn how our regional removals network supports moves across the UK.'
        }
        keywords={
          seoData?.meta_keywords ||
          'nearest office National Removals, removals office locations, Willenhall removals, Bilston removals, Lichfield removals'
        }
      />

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Your Nearest Office</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We support moves across the UK through a regional coverage network,
            helping customers connect with the most suitable removals team for their area.
          </p>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center lg:text-left">
                How Our Coverage Works
              </h2>

              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                National Removals and Storage provides removals and storage services
                through a structured regional coverage model. This allows us to support
                household moves, office relocations, packing services and storage solutions
                in towns and cities across the UK.
              </p>

              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Our website helps customers find the most relevant service area while also
                showing our operating locations across the region. This makes it easier to
                understand the areas we serve and the services available in each location.
              </p>

              <p className="text-lg text-gray-700 leading-relaxed">
                If you are planning a move, the best place to start is by viewing our
                locations directory and selecting the town or city closest to you.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Find Your Area
              </h3>

              <p className="text-gray-700 mb-6 leading-relaxed text-center">
                Browse our locations to see coverage for your town or city and explore
                available moving services.
              </p>

              <div className="text-center">
                <a
                  href="/locations/"
                  className="inline-flex items-center justify-center rounded-lg bg-[#C73532] px-6 py-3 text-white font-semibold hover:bg-[#A92C2A] transition-colors"
                >
                  View All Locations
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Operating Locations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We support moves across the region from our office, depot and yard locations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-2xl font-bold mb-3">Willenhall Office</h3>
              <p className="text-gray-700 leading-relaxed">
                Unit J, Fernside Road
                <br />
                Willenhall, Wolverhampton, UK
                <br />
                WV13 3YA
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-2xl font-bold mb-3">Bilston Office</h3>
              <p className="text-gray-700 leading-relaxed">
                Unit 2 Hare Street
                <br />
                Bilston
                <br />
                WV14 7DX
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-2xl font-bold mb-3">Lichfield Yard</h3>
              <p className="text-gray-700 leading-relaxed">
                Yard 2, Thatchmoor Farm
                <br />
                Broad Lane, Huddlesford
                <br />
                Lichfield
                <br />
                WS13 8QH
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Services Available Across Our Coverage Areas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our coverage model supports a range of professional removals and storage services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-bold mb-3">House Removals</h3>
              <p className="text-gray-600">
                Home moving services for flats, houses and larger residential properties.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-bold mb-3">Office Removals</h3>
              <p className="text-gray-600">
                Business and commercial relocation support planned around your schedule.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-bold mb-3">Packing Services</h3>
              <p className="text-gray-600">
                Professional packing support to protect furniture, valuables and fragile items.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-bold mb-3">Storage Solutions</h3>
              <p className="text-gray-600">
                Flexible storage options to support moves where timing or access is a factor.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            Moving Outside Your Immediate Area
          </h2>

          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Even if your nearest listed location is not in your exact postcode area,
            our team may still be able to help. We regularly support both local and
            long-distance moves, including relocations between counties, regions and
            major cities.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            If you are unsure which location page is most relevant to your move, you can
            contact our team directly and we will help point you to the right service area.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Start With Your Closest Location
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Explore our location pages to find regional coverage and service information.
          </p>

          <a
            href="/locations/"
            className="inline-flex items-center justify-center rounded-lg bg-[#C73532] px-8 py-4 text-white font-semibold hover:bg-[#A92C2A] transition-colors"
          >
            Browse Locations
          </a>
        </div>
      </section>
    </div>
  )
}

