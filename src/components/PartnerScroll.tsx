import { useEffect, useRef } from 'react';

interface Partner {
  name: string;
  logo?: string;
}

export default function PartnerScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const partners: Partner[] = [
    { name: 'British Association of Removers' },
    { name: 'BAR Overseas' },
    { name: 'Trading Standards Approved' },
    { name: 'Checkatrade' },
    { name: 'Trust Mark' },
    { name: 'FIDI' },
    { name: 'IAM' },
    { name: 'RHA' },
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
            We're proud members and accredited by leading industry organizations
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
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 flex items-center justify-center h-24 w-48 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-[#C73532] hover:shadow-lg transition-all"
              >
                <div className="text-center px-4">
                  <p className="font-semibold text-gray-700 text-sm">{partner.name}</p>
                </div>
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
