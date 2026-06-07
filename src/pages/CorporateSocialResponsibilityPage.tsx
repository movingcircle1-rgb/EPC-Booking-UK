import SEO from '../components/SEO'
import { useSEO } from '../hooks/useSEO'

export default function CorporateSocialResponsibilityPage() {
  const { seoData } = useSEO('/corporate-social-responsibility')

  return (
    <div>
      <SEO
        title={seoData?.meta_title || 'Corporate Social Responsibility | National Removals and Storage'}
        description={
          seoData?.meta_description ||
          'Learn about the Corporate Social Responsibility commitments of National Removals and Storage, including responsible employment, community support and ethical service standards.'
        }
        keywords={
          seoData?.meta_keywords ||
          'corporate social responsibility removals company, CSR removals, ethical removals company, responsible business practices'
        }
      />

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Corporate Social Responsibility</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We believe responsible business means supporting customers, employees,
            communities and high service standards across every part of our operations.
          </p>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Our Approach to Responsible Business
          </h2>

          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            At National Removals and Storage, corporate social responsibility means
            operating in a way that reflects professionalism, fairness and long-term
            accountability. We recognise that removals and storage services affect
            not only our customers, but also our staff, suppliers and the communities
            in which we work.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            Our aim is to maintain a business culture that values reliability,
            ethical behaviour, responsible employment and practical service
            improvements that benefit both customers and the wider public.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Key Commitments
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We focus on practical responsibilities that support sustainable business growth and better customer outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-bold mb-3">Responsible Employment</h3>
              <p className="text-gray-600">
                We value fair treatment, professional standards, teamwork and opportunities for development across our workforce.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-bold mb-3">Customer Care</h3>
              <p className="text-gray-600">
                We aim to deliver clear communication, dependable service and a professional experience for every move.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-bold mb-3">Community Awareness</h3>
              <p className="text-gray-600">
                We recognise our role in the local areas where we operate and aim to work responsibly within those communities.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <h3 className="text-xl font-bold mb-3">Ethical Standards</h3>
              <p className="text-gray-600">
                We support transparent business practices, honest communication and responsible operational decision-making.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Supporting Employees
          </h2>

          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Our employees play a central role in delivering high standards of service.
            We believe staff should be supported through clear expectations, safe
            working practices, professional respect and opportunities to build practical skills.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            By encouraging reliability, teamwork and personal development, we help
            create a stronger organisation that benefits both our workforce and our customers.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Supporting Customers and Communities
          </h2>

          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Moving home or relocating a business can be a major transition. We aim
            to reduce stress for customers by providing organised support, clear
            information and dependable service from enquiry through to completion.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            We also recognise that our operations take place within local communities.
            This means working with consideration for access, timing, disruption and
            the practical realities of serving residential and commercial areas responsibly.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ongoing Improvement
          </h2>

          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Corporate social responsibility is not a one-time statement. It is an
            ongoing commitment to reviewing how we operate, where we can improve and
            how we can continue to strengthen our service standards over time.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            As National Removals and Storage continues to grow, we remain committed
            to responsible business practices that support customers, staff and the
            wider reputation of the removals industry.
          </p>
        </div>
      </section>
    </div>
  )
}

