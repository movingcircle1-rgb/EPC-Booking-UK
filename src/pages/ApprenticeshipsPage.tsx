import SEO from '../components/SEO'
import { useSEO } from '../hooks/useSEO'

const pathwayCards = [
  {
    title: 'Removals Operative Level 2',
    subtitle: 'Transport and logistics route',
    description:
      'A practical apprenticeship for people starting out in the removals industry, focused on packing, handling, loading, unloading, storage processes and customer service.',
    points: [
      'Typical roles include removals operative, porter, packer and furniture handling operative',
      'Typical duration of around 12 months to gateway, followed by end-point assessment',
      'Builds operational competence across household, commercial and specialist removals',
    ],
  },
  {
    title: 'Urban Driver',
    subtitle: 'Road transport and customer-facing delivery pathway',
    description:
      'A transport-focused apprenticeship for moving goods by road safely, efficiently and professionally in urban and operational environments, often involving multiple drops and customer interaction.',
    points: [
      'Focus on safe, accurate and timely transport of goods',
      'Includes vehicle checks, route awareness, customer service and on-site professionalism',
      'Supports progression into wider transport and logistics careers',
    ],
  },
  {
    title: 'Large Goods Vehicle (LGV) Driver C+E',
    subtitle: 'Professional heavy vehicle driving pathway',
    description:
      'A specialist pathway for apprentices progressing into professional LGV driving, with emphasis on safe and fuel-efficient driving, road compliance, documentation and load integrity.',
    points: [
      'Designed for articulated and drawbar vehicle roles over 7500kg gross combined weight',
      'Includes defect procedures, legal compliance, vehicle responsibility and customer service',
      'Creates progression into national and international transport and logistics roles',
    ],
  },
]

const complianceCards = [
  {
    title: 'Safeguarding',
    text: 'Apprentice welfare, safe working environments, appropriate supervision and learner support are central to responsible delivery.',
  },
  {
    title: 'Funding Rules',
    text: 'Delivery must align with apprenticeship funding rules, learner eligibility requirements, evidence standards and accurate reporting.',
  },
  {
    title: 'Progress Reviews',
    text: 'Regular review points help monitor development, support apprentice progress and prepare for gateway and completion.',
  },
  {
    title: 'End-Point Assessment',
    text: 'Apprentices are assessed independently against the occupational standard to confirm real workplace competence.',
  },
]

const faqs = [
  {
    question: 'Who can apply for an apprenticeship?',
    answer:
      'Apprenticeships are generally open to individuals aged 16 or over who live in England, are eligible to work in the UK and are not in full-time education. They may suit school leavers, career changers and people looking for a practical route into removals, logistics and transport.',
  },
  {
    question: 'Do apprentices get paid?',
    answer:
      'Yes. An apprenticeship is a paid job combined with structured training. Apprentices earn while they learn, gaining practical workplace experience alongside guided development.',
  },
  {
    question: 'What apprenticeship routes do you support?',
    answer:
      'Our apprenticeship approach includes Removals Operative Level 2, Urban Driver and Large Goods Vehicle (LGV) Driver C+E pathways, reflecting the full range of practical progression available across removals, storage, transport and logistics.',
  },
  {
    question: 'What is end-point assessment?',
    answer:
      'End-point assessment is the independent assessment completed at the end of the apprenticeship. It confirms whether the apprentice has achieved occupational competence against the approved standard through methods such as observation, questions and a professional interview supported by a portfolio of evidence.',
  },
]

const learningAreas = [
  'Packing items into boxes and crates safely and efficiently',
  'Protecting furniture, equipment and specialist items in transit',
  'Loading and unloading removals vehicles correctly',
  'Using handling equipment and safe lifting techniques',
  'Completing inventories and condition reports accurately',
  'Supporting storage check-in and check-out procedures',
  'Communicating professionally with customers and colleagues',
  'Working safely in homes, offices, public buildings and commercial settings',
]

const progressionRoutes = [
  'Senior removals operative',
  'Team leader or move supervisor',
  'Warehouse and storage roles',
  'Transport coordination roles',
  'Urban driving roles',
  'LGV driver progression routes',
  'Specialist logistics and freight roles',
]

export default function ApprenticeshipsPage() {
  const { seoData } = useSEO('/apprenticeships')

  return (
    <div className="bg-white">
      <SEO
        title={
          seoData?.meta_title ||
          'Apprenticeships | National Removals and Storage'
        }
        description={
          seoData?.meta_description ||
          'Discover apprenticeships at National Removals and Storage across removals, urban driving and LGV driving. Learn about apprenticeship standards, end-point assessment, safeguarding and career progression in removals, storage and logistics.'
        }
        keywords={
          seoData?.meta_keywords ||
          'apprenticeships removals, removals operative apprenticeship, urban driver apprenticeship, LGV driver C+E apprenticeship, logistics apprenticeship, transport apprenticeship, removals jobs UK'
        }
      />

      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-4xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium mb-6">
              Career Pathways in Removals, Storage and Logistics
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Apprenticeships at National Removals and Storage
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed mb-8">
              Earn while you learn through structured workplace training designed
              to build practical skills, professional standards and long-term
              career opportunities in removals, transport and logistics.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:careers@nationalremovalsandstorage.co.uk"
                className="inline-flex items-center rounded-xl bg-white text-gray-900 px-6 py-3 font-semibold hover:bg-gray-100 transition-colors"
              >
                Register Your Interest
              </a>
              <a
                href="#apprenticeship-overview"
                className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white hover:bg-white/15 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      <section className="-mt-8 md:-mt-10 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {complianceCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6"
              >
                <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold mb-4">
                  {card.title.charAt(0)}
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  {card.title}
                </h2>
                <p className="text-gray-700 leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="apprenticeship-overview" className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                A Practical Route Into the Industry
              </h2>

              <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
                <p>
                  At National Removals and Storage, we see apprenticeships as an
                  important way to develop the next generation of removals,
                  transport and logistics professionals. An apprenticeship is a
                  paid job with structured training, workplace development and
                  formal assessment built around real occupational competence.
                </p>

                <p>
                  The sector requires far more than manual handling alone. It
                  demands strong customer service, planning, professionalism,
                  health and safety awareness, care for customers&apos; belongings
                  and the ability to work across a wide variety of operational
                  environments.
                </p>

                <p>
                  Our apprenticeship approach is designed for both potential
                  apprentices exploring future career opportunities and public
                  stakeholders who want to see a clear understanding of the
                  wider government apprenticeship framework, including standards,
                  safeguarding, funding compliance and end-point assessment.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  At a Glance
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
                    <span className="font-semibold text-gray-900">Routes</span>
                    <span className="text-gray-700 text-right">
                      Removals, Urban Driving, LGV Driving
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
                    <span className="font-semibold text-gray-900">Approach</span>
                    <span className="text-gray-700 text-right">
                      Earn while you learn
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
                    <span className="font-semibold text-gray-900">Assessment</span>
                    <span className="text-gray-700 text-right">
                      Gateway and independent EPA
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
                    <span className="font-semibold text-gray-900">Focus</span>
                    <span className="text-gray-700 text-right">
                      Practical skills, safety and progression
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <span className="font-semibold text-gray-900">Outcome</span>
                    <span className="text-gray-700 text-right">
                      Occupational competence and career development
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Apprenticeship Pathways We Support
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed max-w-5xl mb-10">
            Our apprenticeship offer reflects the wider career structure of the
            industry. It includes entry-level operational development, transport
            delivery roles and professional heavy vehicle driving pathways, so
            apprentices can see clear progression opportunities from the outset.
          </p>

          <div className="space-y-8">
            {pathwayCards.map((pathway) => (
              <div
                key={pathway.title}
                className="rounded-3xl border border-gray-200 p-8 shadow-sm bg-white"
              >
                <div className="mb-4">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    {pathway.title}
                  </h3>
                  <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    {pathway.subtitle}
                  </p>
                </div>

                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {pathway.description}
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  {pathway.points.map((point) => (
                    <div
                      key={point}
                      className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-gray-700"
                    >
                      {point}
                    </div>
                  ))}
                </div>
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
                What Apprentices Will Learn
              </h2>

              <ul className="space-y-3">
                {learningAreas.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700 text-lg">
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
                Where Apprentices May Work
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'Residential properties',
                  'Offices and commercial premises',
                  'Schools and universities',
                  'Libraries and public buildings',
                  'Hospitals and specialist sites',
                  'Warehouses and storage facilities',
                  'Factories and industrial premises',
                  'Urban road and delivery environments',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-gray-700"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <p className="text-lg text-gray-700 leading-relaxed mt-6">
                This range of environments helps apprentices build confidence,
                adaptability and real-world experience across removals,
                transport and logistics operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            How the Apprenticeship Works
          </h2>

          <div className="space-y-5">
            {[
              {
                step: '01',
                title: 'Employment and induction',
                text: 'Apprentices join the business, receive an introduction to the role and begin learning the standards expected in removals, driving, customer service and safe working.',
              },
              {
                step: '02',
                title: 'Structured training and development',
                text: 'Training combines day-to-day workplace experience with guided learning, mentoring, evidence building and progress support linked to the relevant occupational standard.',
              },
              {
                step: '03',
                title: 'Progress reviews and preparation',
                text: 'Development is reviewed regularly so that apprentices, employers and training staff can track progress, address support needs and prepare for gateway.',
              },
              {
                step: '04',
                title: 'Gateway and end-point assessment',
                text: 'When the apprentice is ready and all requirements are met, they move into independent end-point assessment to confirm occupational competence.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-gray-200 p-6 shadow-sm bg-white"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white font-bold text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Our Understanding of the Government Apprenticeship Scheme
          </h2>

          <div className="space-y-5 text-lg text-gray-700 leading-relaxed">
            <p>
              We understand that apprenticeship delivery is a formal
              responsibility and not simply a recruitment route. High-quality
              provision requires clear alignment with apprenticeship standards,
              robust safeguarding, accurate data management, appropriate use of
              funding and a strong focus on learner outcomes.
            </p>

            <p>
              Providers involved in apprenticeship delivery are expected to
              understand their responsibilities in relation to government
              funding, compliance with apprenticeship funding rules, the quality
              of training, apprentice welfare and the systems used to manage and
              report delivery.
            </p>

            <p>
              We recognise the importance of accurate learner records, evidence
              of progress, gateway readiness, structured review points and
              cooperation with monitoring, quality assurance and external
              oversight where required.
            </p>

            <p>
              We also recognise that registration within the government
              apprenticeship system is accompanied by accountability. It requires
              continuous attention to quality, evidence, compliance and the
              successful development of apprentices who are ready for work.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Provider Responsibilities We Take Seriously
          </h2>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[
              {
                title: 'Funding compliance',
                text: 'Ensuring delivery aligns with apprenticeship funding rules, learner eligibility requirements and evidence expectations.',
              },
              {
                title: 'Training quality',
                text: 'Providing meaningful development that leads to occupational competence rather than a paper-based process alone.',
              },
              {
                title: 'Safeguarding and welfare',
                text: 'Supporting apprentices through safe environments, appropriate supervision and clear welfare arrangements.',
              },
              {
                title: 'Data and records',
                text: 'Maintaining accurate records of training, reviews, evidence, progression and required learner data.',
              },
              {
                title: 'Monitoring and oversight',
                text: 'Working within review, inspection and quality assurance expectations linked to apprenticeship delivery.',
              },
              {
                title: 'Outcome focus',
                text: 'Keeping completion, progression, professional standards and long-term apprentice success at the centre of delivery.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="rounded-3xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                Safeguarding, Support and Inclusion
              </h2>

              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  We understand that safeguarding is a core part of responsible
                  apprenticeship delivery. Apprentices should feel safe,
                  respected and supported throughout their programme.
                </p>

                <p>
                  We are committed to creating a professional environment that
                  promotes welfare, equality of opportunity, appropriate
                  supervision and access to support when needed.
                </p>

                <p>
                  We also recognise the importance of reasonable adjustments
                  where appropriate so that apprentices with disabilities, health
                  conditions or other support requirements can access training
                  and assessment fairly.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-5">
                Career Progression
              </h2>

              <p className="text-lg text-gray-700 leading-relaxed mb-5">
                Apprenticeships can provide the starting point for a long-term
                career in removals, storage, transport and logistics.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {progressionRoutes.map((route) => (
                  <div
                    key={route}
                    className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-gray-700"
                  >
                    {route}
                  </div>
                ))}
              </div>
            </div>
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
            Register Your Interest
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Interested in Future Apprenticeship Opportunities?
          </h2>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            If you are motivated, reliable and interested in building a career
            in removals, storage, transport or logistics, we would be pleased
            to hear from you.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <p className="text-lg text-gray-300 mb-3">
              Send your details and CV to:
            </p>

            <a
              href="mailto:careers@nationalremovalsandstorage.co.uk"
              className="text-2xl md:text-3xl font-semibold break-words hover:text-white transition-colors"
            >
              careers@nationalremovalsandstorage.co.uk
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
