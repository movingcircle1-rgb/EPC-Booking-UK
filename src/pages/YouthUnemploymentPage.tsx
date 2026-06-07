import SEO from '../components/SEO'
import { useSEO } from '../hooks/useSEO'

const schemeCards = [
  {
    title: 'Youth Jobs Grant',
    amount: '£3,000',
    description:
      'A grant for employers hiring eligible young people aged 18 to 24 who have been on Universal Credit and looking for work for six months.',
  },
  {
    title: 'Apprenticeship Incentive',
    amount: '£2,000',
    description:
      'Support for SMEs taking on new apprentices aged 16 to 24, helping reduce the cost of recruitment, onboarding and training.',
  },
  {
    title: 'Jobs Guarantee',
    amount: 'Expanded',
    description:
      'The Jobs Guarantee is being widened to ages 18 to 24, creating more subsidised paid work opportunities for young people.',
  },
  {
    title: 'New Foundation Apprenticeships',
    amount: 'From 2026',
    description:
      'Foundation apprenticeships are being expanded to create more accessible entry routes into work and long-term career development.',
  },
]

const keyStats = [
  {
    value: '200,000+',
    label: 'new jobs and apprenticeship opportunities',
  },
  {
    value: '£1 billion',
    label: 'additional funding announced for youth employment support',
  },
  {
    value: '£2.5 billion',
    label: 'total investment over the next three years',
  },
  {
    value: '500,000',
    label: 'potential opportunities to earn and learn',
  },
]

const employerBenefits = [
  'Reduce the cost and risk of hiring young people',
  'Access grants and financial incentives linked to jobs and apprenticeships',
  'Build a reliable future workforce pipeline in logistics, storage and transport',
  'Support local young people into meaningful paid work',
  'Create entry routes into operational, warehouse and driving careers',
  'Strengthen long-term recruitment in a sector facing ongoing skills shortages',
]

const candidateRoutes = [
  'Removals operative roles',
  'Warehouse and storage positions',
  'Customer-facing logistics support roles',
  'Urban driving and transport pathways',
  'Large goods vehicle progression routes',
  'Long-term supervisory and specialist logistics careers',
]

const fundingBreakdown = [
  {
    title: 'Youth Jobs Grant',
    text: 'Businesses can receive £3,000 for every eligible young person they hire aged 18 to 24 who has been on Universal Credit and looking for work for six months.',
  },
  {
    title: 'Jobs Guarantee Expansion',
    text: 'The scheme is being expanded to support a wider age range, helping create more subsidised paid jobs for young people who need practical routes into employment.',
  },
  {
    title: 'Apprenticeship Incentive for SMEs',
    text: 'Smaller employers can receive £2,000 for each new apprentice aged 16 to 24, helping to improve access to entry-level work and industry training.',
  },
  {
    title: 'Growth and Skills Levy Reforms',
    text: 'Wider apprenticeship reforms are being introduced to prioritise younger apprentices and support routes into sectors critical to economic growth.',
  },
]

const supportCards = [
  {
    title: 'For Employers',
    text: 'We can help businesses understand how apprenticeships and workforce development can support recruitment, retention and operational growth.',
  },
  {
    title: 'For Young People',
    text: 'We want to help young people access practical entry routes into removals, logistics and transport through real work and structured progression.',
  },
  {
    title: 'For the Sector',
    text: 'The removals and logistics industry needs a strong future talent pipeline. These reforms create an opportunity to invest in the next generation.',
  },
]

const faqs = [
  {
    question: 'What is the Youth Jobs Grant?',
    answer:
      'The Youth Jobs Grant is a government-backed incentive designed to encourage employers to hire eligible young people aged 18 to 24. It provides financial support to businesses that create paid opportunities for young people who have been out of work and claiming Universal Credit.',
  },
  {
    question: 'What is the £2,000 apprenticeship incentive?',
    answer:
      'This incentive is aimed at SMEs taking on apprentices aged 16 to 24. It is designed to make it easier for smaller employers to create apprenticeship opportunities and invest in early careers.',
  },
  {
    question: 'How does this relate to National Removals and Storage?',
    answer:
      'As a business operating across removals, storage and transport, we recognise the importance of bringing new people into the sector. This page reflects our support for practical job pathways, apprenticeships and long-term workforce development.',
  },
  {
    question: 'Who could benefit from these changes?',
    answer:
      'Young people looking for paid work, apprenticeships and career progression can benefit, while employers may be able to reduce recruitment costs and strengthen their future workforce through funded opportunities.',
  },
]

export default function YouthUnemploymentPage() {
  const { seoData } = useSEO('/youth-unemployment')

  return (
    <div className="bg-white">
      <SEO
        title={
          seoData?.meta_title ||
          'Youth Unemployment Support | National Removals and Storage'
        }
        description={
          seoData?.meta_description ||
          'Learn about the UK government youth employment drive, new apprenticeship incentives, Jobs Guarantee expansion and support for employers creating opportunities for young people.'
        }
        keywords={
          seoData?.meta_keywords ||
          'youth unemployment support, youth jobs grant, apprenticeship incentive, jobs guarantee, youth employment uk, apprenticeships for young people, employer funding apprenticeships'
        }
      />

      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-4xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium mb-6">
              Government Support for Jobs, Apprenticeships and Early Careers
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Youth Unemployment Support and New Employer Incentives
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed mb-8">
              The latest government employment drive aims to create more paid
              opportunities for young people while helping employers unlock new
              jobs, apprenticeships and long-term career pathways.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="/apprenticeships/"
                className="inline-flex items-center rounded-xl bg-white text-gray-900 px-6 py-3 font-semibold hover:bg-gray-100 transition-colors"
              >
                View Apprenticeships
              </a>
              <a
                href="/careers/"
                className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/15 transition-colors"
              >
                Explore Careers
              </a>
            </div>
          </div>
        </div>
      </div>

      <section className="-mt-8 md:-mt-10 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {schemeCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
              >
                <div className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  {card.title}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-3">
                  {card.amount}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                A Major Push to Create More Jobs and Apprenticeships
              </h2>

              <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
                <p>
                  Youth unemployment and economic inactivity among young people
                  have become a major issue across the UK. In response, the
                  government has announced a large-scale package of support to
                  help create more opportunities for people aged 16 to 24.
                </p>

                <p>
                  The measures include new hiring incentives, wider access to
                  subsidised work, support for apprenticeships and broader
                  reforms designed to make the skills system work better for
                  young people and employers.
                </p>

                <p>
                  For businesses operating in practical sectors such as
                  removals, warehousing, transport and logistics, these changes
                  could create meaningful new ways to recruit, train and retain
                  the next generation of staff.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  At a Glance
                </h3>

                <div className="space-y-4">
                  {keyStats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className={`flex items-start justify-between gap-4 ${
                        index !== keyStats.length - 1
                          ? 'border-b border-gray-200 pb-4'
                          : ''
                      }`}
                    >
                      <span className="font-semibold text-gray-900">
                        {stat.value}
                      </span>
                      <span className="text-gray-700 text-right">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            What the New Support Includes
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed max-w-5xl mb-10">
            The latest package combines direct employer support with wider
            apprenticeship reform. The overall aim is to help more young people
            move into paid work while making it easier for employers to create
            genuine opportunities.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {fundingBreakdown.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-gray-200 p-8 shadow-sm bg-white"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why This Matters for Employers
              </h2>

              <ul className="space-y-3">
                {employerBenefits.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-gray-700 text-lg"
                  >
                    <span className="mt-1 inline-flex h-6 w-6 min-w-[1.5rem] items-center justify-center rounded-full bg-gray-900 text-white text-sm">
                      ✓
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Routes Young People Can Progress Into
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {candidateRoutes.map((route) => (
                  <div
                    key={route}
                    className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-gray-700"
                  >
                    {route}
                  </div>
                ))}
              </div>

              <p className="text-lg text-gray-700 leading-relaxed mt-6">
                In sectors like removals and logistics, a first role can lead to
                long-term career progression, practical qualifications and
                specialist development over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            How National Removals and Storage Fits Into This Picture
          </h2>

          <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
            <p>
              At National Removals and Storage, we understand how important
              practical entry routes are for young people who want to build a
              future in a hands-on, customer-facing and operational sector.
            </p>

            <p>
              The removals, storage and transport industry offers real career
              opportunities, but employers also need confidence, support and a
              clearer pipeline of people entering the workforce with the right
              attitude and long-term potential.
            </p>

            <p>
              That is why developments such as the Youth Jobs Grant,
              apprenticeship incentives and wider skills reform matter. They can
              help employers create paid opportunities while giving young people
              a genuine route into work, training and progression.
            </p>

            <p>
              Our wider focus on careers and apprenticeships reflects that
              commitment. We want to support practical routes into employment
              and help strengthen the future talent pipeline across removals,
              logistics and transport.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Why These Reforms Matter
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {supportCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {card.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {faq.question}
                  </h3>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white text-sm font-bold">
                    {index + 1}
                  </span>
                </summary>
                <p className="mt-4 text-lg text-gray-700 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium mb-6">
            Learn More About Opportunities
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Looking to Build Skills, Careers and Future Workforce Capacity?
          </h2>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Explore our apprenticeships and careers pages to learn more about
            opportunities in removals, storage, logistics and transport.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/apprenticeships/"
              className="inline-flex items-center rounded-xl bg-white text-gray-900 px-6 py-3 font-semibold hover:bg-gray-100 transition-colors"
            >
              Apprenticeships
            </a>
            <a
              href="/careers/"
              className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/15 transition-colors"
            >
              Careers
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
