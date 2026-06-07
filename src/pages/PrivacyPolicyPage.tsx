import SEO from '../components/SEO'
import { useSEO } from '../hooks/useSEO'

export default function PrivacyPolicyPage() {
  const { seoData } = useSEO('/privacy-policy')

  return (
    <div>
      <SEO
        title={seoData?.meta_title || 'Privacy Policy | National Removals and Storage'}
        description={
          seoData?.meta_description ||
          'Read the Privacy Policy for National Removals and Storage, including how we collect, use and protect personal information.'
        }
        keywords={
          seoData?.meta_keywords ||
          'privacy policy removals company, GDPR removals, personal data policy, National Removals privacy policy'
        }
      />

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            This policy explains how National Removals and Storage collects, uses and protects personal information.
          </p>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="space-y-10">

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                National Removals and Storage is committed to protecting your privacy and handling personal
                information responsibly. This Privacy Policy explains how we collect, use, store and protect
                information provided through our website, by email, by telephone and during the course of our services.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Information We May Collect</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We may collect personal information including your name, address, email address, telephone number,
                move details, collection and delivery addresses, service preferences and any other information you
                provide when requesting a quotation, making an enquiry or booking services.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We may also collect technical information through website usage, such as browser type, device
                information, IP address and pages visited, where permitted by applicable law and cookie settings.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. How We Use Personal Information</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We use personal information to respond to enquiries, provide quotations, arrange bookings,
                deliver removals, packing and storage services, communicate about your move and manage customer service.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We may also use information to improve our website, review service performance, maintain records,
                comply with legal obligations and protect our business against fraud, misuse or legal claims.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Lawful Basis for Processing</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Depending on the circumstances, we may process personal information because it is necessary to
                perform a contract, to take steps prior to entering into a contract, to comply with legal obligations,
                to pursue legitimate business interests or because you have given consent where required.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Sharing Information</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                We do not sell personal information. We may share information with trusted service providers,
                contractors, storage partners, payment processors, website providers or professional advisers where
                reasonably necessary to provide services or operate our business.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We may also disclose information where required by law, regulation, legal process or to protect
                our rights, customers, staff or business operations.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Cookies and Website Tracking</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Our website may use cookies and similar technologies to improve functionality, analyse website usage
                and support user experience. Cookies may remember preferences, help us understand how visitors use
                the site and allow certain features to work correctly.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                You can usually manage cookie settings through your browser. Restricting cookies may affect some
                website functionality.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Data Security</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We take reasonable technical and organisational measures to protect personal information against
                unauthorised access, loss, misuse, alteration or disclosure. However, no internet-based system can
                be guaranteed to be completely secure, and you provide information at your own risk.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We retain personal information only for as long as necessary for the purposes for which it was
                collected, including service delivery, record keeping, legal compliance, accounting and the resolution
                of complaints or disputes.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Your Rights</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Depending on applicable data protection law, you may have rights in relation to your personal
                information, including the right to request access, correction, deletion, restriction of processing,
                objection to certain processing and data portability where relevant.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                If processing is based on consent, you may also withdraw consent at any time, although this will
                not affect processing already carried out lawfully before withdrawal.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Third-Party Links</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our website may contain links to third-party websites or services. We are not responsible for the
                privacy practices, content or security of those third-party websites, and you should review their
                own privacy policies where relevant.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Updates to This Policy</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in legal requirements,
                business practices or website functionality. The latest version published on our website will apply.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy or about how National Removals and Storage
                handles personal information, please contact us using the contact details shown on our website.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

