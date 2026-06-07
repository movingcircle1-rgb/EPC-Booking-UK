import { useEffect, useRef } from 'react';

interface Logo {
  name: string;
  alt: string;
  imageUrl: string;
}

export default function TrustedLogos() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const logos: Logo[] = [
    {
      name: 'Andrew Downing Booth',
      alt: 'Andrew Downing Booth Estate Agents',
      imageUrl: '/logos/Andrew-Downing-Booth-Estate-Agent-scaled.png'
    },
    {
      name: 'Webbs Estate Agents',
      alt: 'Webbs Estate Agents',
      imageUrl: '/logos/Webbs-Estate-Agents-scaled copy.png'
    },
    {
      name: 'The Agency UK',
      alt: 'The Agency UK',
      imageUrl: '/logos/The-Agency-UK copy.jpg'
    },
    {
      name: 'Compare My Move',
      alt: 'Compare My Move',
      imageUrl: '/logos/compare-my-move-logo.png'
    },
    {
      name: 'Sirelo',
      alt: 'Sirelo Quality Mover Certificate',
      imageUrl: '/logos/Sirelo-Quality-certificate-300x263-1 copy.webp'
    },
    {
      name: 'Facebook Reviews',
      alt: 'Facebook Reviews',
      imageUrl: '/logos/Facebook-Reviews.jpg'
    },
    {
      name: 'Google Reviews',
      alt: 'Google 5 Star Reviews',
      imageUrl: '/logos/google-reviews-270x112-1-1.webp'
    },
    {
      name: 'Yell.com',
      alt: 'Yell.com Reviews',
      imageUrl: '/logos/Reviews-on-Yell-1024x352-1.jpg'
    },
  ];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const scroll = () => {
      scrollPosition += scrollSpeed;
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
    };

    const intervalId = setInterval(scroll, 20);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted & Accredited</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're proud to be trusted by leading estate agents and accredited by industry organizations
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10"></div>

          <div
            ref={scrollRef}
            className="flex gap-12 overflow-x-hidden"
            style={{ scrollBehavior: 'auto' }}
          >
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex-shrink-0 flex items-center justify-center h-28 w-56 bg-white rounded-lg border-2 border-gray-200 hover:border-[#be0e0c] hover:shadow-xl transition-all duration-300 p-6"
              >
                <img
                  src={logo.imageUrl}
                  alt={logo.alt}
                  className="max-h-full max-w-full object-contain transition-all duration-300"
                  loading="lazy"
                  style={{ mixBlendMode: 'multiply' }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Fully insured and accredited to give you complete peace of mind during your move
          </p>
        </div>
      </div>
    </section>
  );
}
