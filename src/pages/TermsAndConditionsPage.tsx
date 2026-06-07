import SEO from '../components/SEO'
import { useSEO } from '../hooks/useSEO'

export default function TermsAndConditionsPage() {
  const { seoData } = useSEO('/terms-and-conditions')

  return (
    <div>
      <SEO
        title={seoData?.meta_title || 'Terms and Conditions | National Removals and Storage'}
        description={
          seoData?.meta_description ||
          'Read the terms and conditions for National Removals and Storage, including bookings, payments, cancellations, liability and service terms.'
        }
        keywords={
          seoData?.meta_keywords ||
          'terms and conditions removals, moving company terms, removals booking terms, storage terms'
        }
      />

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Terms and Conditions</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Please read these terms carefully before booking removals, packing or storage services with National Removals and Storage.
          </p>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="space-y-10">

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                These terms and conditions apply to the services provided by National Removals and Storage,
                including house removals, office removals, packing services and storage solutions. By requesting
                a booking, accepting a quotation or using our services, you agree to be bound by these terms.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Quotations and Bookings</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                All quotations are subject to the information provided by the customer at the time of enquiry.
                Quotations may be revised if the details of the move change, including property size, access,
                collection or delivery addresses, timings, volume of goods or any additional service requirements.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                A booking is only confirmed once it has been accepted by National Removals and Storage and any
                required deposit or advance payment has been received.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Customer Responsibilities</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Customers are responsible for ensuring that all information relating to the move is accurate,
                including addresses, contact details, access arrangements, parking restrictions and the nature
                of the items to be moved or stored.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                The customer must ensure that all goods are properly prepared for moving unless a packing service
                has been agreed. Customers must also notify us in advance of any unusually heavy, fragile,
                valuable or restricted items.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Access and Delays</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                It is the customer’s responsibility to ensure suitable access is available at both collection and
                delivery addresses. This includes stairs, lifts, loading space, parking and any permissions needed
                for access to the property.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Additional charges may apply where delays occur due to restricted access, waiting time, inaccurate
                move details, changes to the agreed service or circumstances beyond our control.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Packing Services</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Where packing services are included, our team will use reasonable care and skill in packing goods
                for transport or storage. If the customer packs some or all goods themselves, National Removals and
                Storage cannot accept responsibility for loss or damage resulting from inadequate packing by the customer.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Storage Services</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Storage services are subject to availability and agreement of the relevant storage period.
                Customers must ensure that stored items are lawful, safe and suitable for storage.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                No dangerous, illegal, perishable or prohibited goods may be placed into storage. We reserve the
                right to refuse or remove items that are not suitable for storage or that present a health, safety
                or legal risk.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Payment Terms</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Payment terms will be stated in the quotation or booking confirmation. Deposits may be required to
                secure a booking. Final balances must be paid in accordance with the agreed payment schedule.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Where payment is not made on time, we reserve the right to suspend or withhold services until the
                outstanding balance has been paid.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Cancellations and Changes</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                If you need to cancel or change your booking, you should notify us as soon as possible. Cancellation
                charges may apply depending on the notice given, the stage of the booking and any costs already incurred.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We will always try to accommodate reasonable booking changes, but amended dates and services are subject
                to availability.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Liability</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                National Removals and Storage will provide services with reasonable care and skill. Liability for loss
                or damage is subject to the terms agreed in the booking and any applicable insurance arrangements.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We will not be responsible for loss or delay caused by events outside our reasonable control, including
                severe weather, road closures, traffic incidents, strikes, access restrictions, force majeure events
                or inaccurate information supplied by the customer.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Complaints</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                If you are dissatisfied with any aspect of our service, please contact us as soon as possible so that
                we can investigate and respond appropriately. Complaints should be submitted with sufficient detail to
                allow us to review the matter properly.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">11. Changes to These Terms</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We may update these terms and conditions from time to time. The version in force at the time of booking
                will normally apply unless otherwise stated.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                For questions about these terms and conditions, please contact National Removals and Storage using the
                contact details provided on our website.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

