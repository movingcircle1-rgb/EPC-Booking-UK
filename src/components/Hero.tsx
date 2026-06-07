import { ArrowRight, Award, Users, Clock } from 'lucide-react';
import { brandConfig } from '../config/branding';

interface HeroProps {
  onGetQuote: () => void;
  /**
   * SEO: choose heading level to avoid multiple H1s on a page.
   * - default: 'h1' (homepage)
   * - use 'h2' on pages that already have their own H1
   */
  headingLevel?: 'h1' | 'h2';
}

export default function Hero({ onGetQuote, headingLevel = 'h1' }: HeroProps) {
  const HeadingTag = headingLevel;

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7464230/pexels-photo-7464230.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-20"></div>

      <div className="absolute inset-0 bg-gradient-to-r from-[#e71c5e]/30 via-gray-900/80 to-gray-900/90"></div>

      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="max-w-3xl">
          <HeadingTag className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Professional Moving &amp;
            <span className="text-[#e71c5e]"> Storage Solutions</span>
          </HeadingTag>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            {brandConfig.tagline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onGetQuote}
              className="bg-[#e71c5e] hover:bg-[#c91852] text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg"
              aria-label="Get a free quote"
            >
              Get Free Quote
              <ArrowRight size={20} />
            </button>

            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all border border-white/20">
              Learn More
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#e71c5e] flex items-center justify-center flex-shrink-0">
                <Award size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Award Winning</h3>
                <p className="text-gray-300 text-sm">Industry-leading service quality</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#e71c5e] flex items-center justify-center flex-shrink-0">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">50,000+ Moves</h3>
                <p className="text-gray-300 text-sm">Trusted by thousands annually</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#e71c5e] flex items-center justify-center flex-shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">24/7 Support</h3>
                <p className="text-gray-300 text-sm">Always here when you need us</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
}
