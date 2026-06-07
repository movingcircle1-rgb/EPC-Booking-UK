import { Award, Users, TrendingUp, Shield } from 'lucide-react';
import SEO from '../components/SEO';
import { useSEO } from '../hooks/useSEO';

export default function AboutPage() {
  const { seoData } = useSEO('/about');

  return (
    <div>
      <SEO
        title={
          seoData?.meta_title ||
          'About Us | 25+ Years Experience | National Removals and Storage'
        }
        description={
          seoData?.meta_description ||
          'Trusted removal and storage company with over 25 years experience. 50,000+ successful moves, fully insured, award-winning service. Based in Willenhall, serving UK-wide.'
        }
        keywords={
          seoData?.meta_keywords ||
          'about National Removals, removal company history, professional movers UK, trusted removals company'
        }
      />

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">About Us</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Your trusted partner in moving and storage solutions across the UK
          </p>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Founded in 1995, National Removals and Storage has grown from a small family business to one of the UK's most trusted moving companies. With over 25 years of experience, we've helped more than 50,000 families and businesses relocate successfully.
              </p>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Our commitment to excellence, attention to detail, and customer-first approach has earned us numerous industry awards and a reputation for reliability that speaks for itself.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Today, we operate a fleet of modern vehicles and secure storage facilities across the country, employing a team of dedicated professionals who share our passion for making every move a success.
              </p>
            </div>

            <div className="bg-gray-100 rounded-2xl p-8">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070"
                alt="Moving team"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're more than just a moving company
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-[#C73532] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Award Winning</h3>
              <p className="text-gray-600">
                Recognized for excellence in customer service and industry innovation
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-[#C73532] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Expert Team</h3>
              <p className="text-gray-600">
                Fully trained, vetted professionals dedicated to your satisfaction
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-[#C73532] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Best Value</h3>
              <p className="text-gray-600">
                Competitive pricing without compromising on quality or service
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-[#C73532] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fully Insured</h3>
              <p className="text-gray-600">
                Comprehensive insurance coverage for complete peace of mind
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>

            <div className="space-y-8">
              <div className="border-l-4 border-[#C73532] pl-6">
                <h3 className="text-2xl font-bold mb-3">Customer First</h3>
                <p className="text-gray-700 leading-relaxed">
                  Every decision we make is guided by what's best for our customers. Your satisfaction is our success.
                </p>
              </div>

              <div className="border-l-4 border-[#C73532] pl-6">
                <h3 className="text-2xl font-bold mb-3">Integrity</h3>
                <p className="text-gray-700 leading-relaxed">
                  We believe in honest, transparent communication. No hidden fees, no surprises, just straightforward service.
                </p>
              </div>

              <div className="border-l-4 border-[#C73532] pl-6">
                <h3 className="text-2xl font-bold mb-3">Excellence</h3>
                <p className="text-gray-700 leading-relaxed">
                  We strive for perfection in everything we do, from the first phone call to the final box delivered.
                </p>
              </div>

              <div className="border-l-4 border-[#C73532] pl-6">
                <h3 className="text-2xl font-bold mb-3">Innovation</h3>
                <p className="text-gray-700 leading-relaxed">
                  We continuously invest in the latest technology and training to provide you with the best possible service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">By The Numbers</h2>
            <p className="text-xl text-gray-600 mb-12">Our track record speaks for itself</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="text-5xl font-bold text-[#C73532] mb-2">25+</div>
                <div className="text-gray-600">Years of Experience</div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="text-5xl font-bold text-[#C73532] mb-2">50K+</div>
                <div className="text-gray-600">Successful Moves</div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="text-5xl font-bold text-[#C73532] mb-2">100+</div>
                <div className="text-gray-600">Professional Staff</div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="text-5xl font-bold text-[#C73532] mb-2">98%</div>
                <div className="text-gray-600">Customer Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
