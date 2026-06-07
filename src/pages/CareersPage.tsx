import SEO from '../components/SEO'
import { useSEO } from '../hooks/useSEO'

export default function CareersPage() {
  const { seoData } = useSEO('/careers')

  return (
    <div>
      <SEO
        title={seoData?.meta_title || 'Careers | National Removals and Storage'}
        description={
          seoData?.meta_description ||
          'Explore careers with National Removals and Storage. Join our professional removals and logistics team serving customers across the UK.'
        }
      />

      {/* HERO */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Careers at National Removals and Storage
          </h1>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join a professional removals and logistics team helping households
            and businesses relocate across the UK.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">

          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Working in the Removals Industry
          </h2>

          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            The removals industry plays a vital role in helping families move
            home, businesses relocate offices, and organisations transport
            equipment safely across the country.
          </p>

          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            At National Removals and Storage, every successful move relies on a
            skilled and reliable team. From removal operatives and drivers to
            packing specialists and logistics coordinators, every member of the
            team contributes to delivering an organised and professional
            relocation service.
          </p>

          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Roles We Often Recruit
          </h2>

          <ul className="space-y-3 text-lg text-gray-700 mb-10">
            <li>Removal Operatives</li>
            <li>HGV Drivers</li>
            <li>Packing Specialists</li>
            <li>Operations Support Staff</li>
          </ul>

          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Training and Development
          </h2>

          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Professional removals require careful handling, organisation and
            strong teamwork. Our team members are trained in safe lifting,
            furniture protection and customer service to ensure every move runs
            smoothly.
          </p>

          <p className="text-lg text-gray-700 mb-10 leading-relaxed">
            As our company continues to expand its coverage across the UK,
            opportunities arise for career development in driving, logistics,
            operations and management roles.
          </p>

          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Interested in Joining Our Team?
          </h2>

          <p className="text-lg text-gray-700 mb-4">
            If you are interested in working in the removals and logistics
            industry, we would love to hear from you.
          </p>

          <p className="text-lg font-semibold">
            Send your CV to: careers@nationalremovalsandstorage.co.uk
          </p>

        </div>
      </section>
    </div>
  )
}
