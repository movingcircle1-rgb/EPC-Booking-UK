import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { brandConfig } from '../config/branding';
import SEO from '../components/SEO';
import { useSEO } from '../hooks/useSEO';

interface ContactPageProps {
  onGetQuote: () => void;
}

export default function ContactPage({ onGetQuote }: ContactPageProps) {
  // IMPORTANT: NO trailing slash – must match Supabase page_path + useSEO normalisation
  const { seoData } = useSEO('/contact');

  const fallbackTitle =
    'Contact Us | Get a Free Quote | National Removals and Storage';
  const fallbackDescription =
    'Contact National Removals and Storage for a free, no-obligation quote. Call 0800 047 2607 or fill out our online form. Based in Willenhall, serving nationwide.';
  const fallbackKeywords =
    'contact removals company, moving quote, free removal quote, removals enquiry, get moving quote';
  const fallbackCanonical =
    'https://nationalremovalsandstorage.co.uk/contact/';

  return (
    <div>
      <SEO
        title={seoData?.meta_title || fallbackTitle}
        description={seoData?.meta_description || fallbackDescription}
        keywords={seoData?.meta_keywords || fallbackKeywords}
        canonicalUrl={seoData?.canonical_url || fallbackCanonical}
      />

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Get in touch with our friendly team for a free quote or to discuss
            your requirements
          </p>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Get In Touch
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#C73532] rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Phone</h3>
                    <p className="text-gray-600 mb-1">
                      Main:{' '}
                      <a
                        href={brandConfig.contact.phoneHref}
                        className="text-[#C73532] hover:underline"
                      >
                        {brandConfig.contact.phone}
                      </a>
                    </p>
                    <p className="text-gray-600">
                      Mobile:{' '}
                      <a
                        href={brandConfig.contact.phoneSecondaryHref}
                        className="text-[#C73532] hover:underline"
                      >
                        {brandConfig.contact.phoneSecondary}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#C73532] rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Email</h3>
                    <p className="text-gray-600 mb-1">
                      Sales:{' '}
                      <a
                        href="mailto:sales@nationalremovalsandstorage.co.uk"
                        className="text-[#C73532] hover:underline"
                      >
                        sales@nationalremovalsandstorage.co.uk
                      </a>
                    </p>
                    <p className="text-gray-600">
                      Support:{' '}
                      <a
                        href="mailto:support@nationalremovalsandstorage.co.uk"
                        className="text-[#C73532] hover:underline"
                      >
                        support@nationalremovalsandstorage.co.uk
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#C73532] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Address</h3>
                    <p className="text-gray-600">
                      {brandConfig.contact.address.street}
                      <br />
                      {brandConfig.contact.address.city}
                      <br />
                      {brandConfig.contact.address.postcode}
                      <br />
                      {brandConfig.contact.address.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#C73532] rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Opening Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 7:00 AM - 8:00 PM
                      <br />
                      Saturday: 8:00 AM - 6:00 PM
                      <br />
                      Sunday: 9:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-[#C73532]/10 rounded-xl p-6 border border-[#C73532]/20">
                <h3 className="font-bold text-lg mb-3 text-[#C73532]">
                  24/7 Emergency Support
                </h3>
                <p className="text-gray-700 mb-2">
                  Need urgent assistance? Our emergency hotline is available
                  around the clock.
                </p>
                <a
                  href={brandConfig.contact.phoneSecondaryHref}
                  className="text-[#C73532] font-semibold hover:underline"
                >
                  {brandConfig.contact.phoneSecondary}
                </a>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Quick Quote Request
                </h2>
                <p className="text-gray-600 mb-6">
                  Fill out this form for a detailed quote, or click below for
                  our full quote form
                </p>

                <button
                  onClick={onGetQuote}
                  className="w-full bg-[#C73532] hover:bg-[#A92C2A] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg mb-6"
                >
                  Open Full Quote Form
                </button>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-lg mb-4">Or Call Us Directly</h3>
                  <a
                    href={brandConfig.contact.phoneHref}
                    className="block w-full bg-white hover:bg-gray-100 text-[#C73532] border-2 border-[#C73532] px-8 py-4 rounded-lg font-semibold text-lg transition-all text-center"
                  >
                    {brandConfig.contact.phone}
                  </a>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      How quickly can you provide a quote?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      We typically provide quotes within 24 hours, often much
                      sooner.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Do you offer weekend moves?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Yes, we offer flexible scheduling including evenings and
                      weekends.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Are your quotes free?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Absolutely! All quotes and surveys are completely free
                      with no obligation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Find Us on the Map
            </h2>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="aspect-video rounded-lg mb-4 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2423.123456789!2d-2.064!3d52.583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDM0JzU4LjgiTiAywrAwMycxMC40Ilc!5e0!3m2!1sen!2suk!4v1234567890123!5m2!1sen!2suk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="National Removals and Storage Location"
                  className="rounded-lg"
                />
              </div>
              <div className="text-center">
                <p className="text-gray-700 mb-4">
                  <strong>National Removals and Storage</strong>
                  <br />
                  {brandConfig.contact.address.street}
                  <br />
                  {brandConfig.contact.address.city},{' '}
                  {brandConfig.contact.address.postcode}
                </p>
                <p className="text-gray-600">
                  We serve customers across the entire United Kingdom with
                  regional offices in major cities.
                </p>
                <a
                  href="https://www.google.com/maps/dir//Unit+J,+Fernside+Road,+Willenhall+WV13+3YA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-[#C73532] hover:text-[#A92C2A] font-semibold"
                >
                  <MapPin size={20} />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
