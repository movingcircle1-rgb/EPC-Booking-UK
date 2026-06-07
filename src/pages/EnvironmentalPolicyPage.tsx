import SEO from '../components/SEO'
import { useSEO } from '../hooks/useSEO'

export default function EnvironmentalPolicyPage() {
  const { seoData } = useSEO('/environmental-policy')

  return (
    <div>
      <SEO
        title={seoData?.meta_title || 'Environmental Policy | National Removals and Storage'}
        description={
          seoData?.meta_description ||
          'Read the Environmental Policy of National Removals and Storage, including our approach to efficiency, waste reduction and responsible operations.'
        }
        keywords={
          seoData?.meta_keywords ||
          'environmental policy removals company, sustainable removals, responsible logistics, waste reduction removals'
        }
      />

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Environmental Policy</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We recognise the importance of reducing environmental impact and improving efficiency across our removals and storage operations.
          </p>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Our Environmental Approach
          </h2>

          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            National Removals and Storage understands that removals, transport and storage
            operations can have an environmental impact through vehicle use, fuel consumption,
            materials handling and waste generation. We are committed to operating responsibly
            and looking for practical ways to improve efficiency across our services.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            Our environmental approach focuses on reducing unnecessary waste, improving planning
            and supporting more efficient day-to-day operations wherever reasonably possible.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Key Areas of Focus
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We aim to make practical improvements across the areas of our business that can influence environmental performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-bold mb-3">Route Efficiency</h3>
              <p className="text-gray-600">
                We aim to plan transport and scheduling efficiently to reduce unnecessary mileage and avoid avoidable delays.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-bold mb-3">Waste Reduction</h3>
              <p className="text-gray-600">
                We seek to reduce unnecessary waste in materials, packaging and operational processes where practical.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-bold mb-3">Material Use</h3>
              <p className="text-gray-600">
                We review how packing materials and supplies are used to encourage responsible handling and reduced excess.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-bold mb-3">Operational Improvement</h3>
              <p className="text-gray-600">
                We continue to assess our processes to identify realistic opportunities for more efficient working practices.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Transport and Planning
          </h2>

          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Transport is a central part of the removals industry, so route planning and scheduling
            play an important role in environmental performance. By organising jobs carefully and
            managing logistics efficiently, we aim to reduce unnecessary journeys and improve the
            overall use of time, fuel and vehicle capacity.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            Effective planning also helps us reduce operational disruption, improve service delivery
            and support a more efficient experience for customers.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Materials and Waste
          </h2>

          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Packing materials are a necessary part of many moves, particularly where fragile,
            valuable or business-critical items are involved. We recognise the importance of
            using these materials responsibly and reducing unnecessary waste wherever practical.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            This includes paying attention to how materials are prepared, used and handled across
            removals, packing and storage activity, while still maintaining appropriate protection
            for customer belongings.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Continuous Review
          </h2>

          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Environmental responsibility requires continuous review. As our business develops, we
            aim to keep assessing how we operate and where practical improvements can be made in
            relation to efficiency, planning and responsible resource use.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            National Removals and Storage is committed to maintaining a responsible approach that
            supports long-term service quality while recognising the importance of environmental awareness.
          </p>
        </div>
      </section>
    </div>
  )
}

