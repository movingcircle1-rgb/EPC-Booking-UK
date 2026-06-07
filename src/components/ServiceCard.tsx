import { LucideIcon, ArrowRight } from 'lucide-react'
import SafeLink from './SafeLink'

interface ServiceCardProps {
  icon: LucideIcon
  title: string
  description: string
  features: string[]
  onLearnMore?: () => void
  link?: string
  imageUrl?: string
}

export default function ServiceCard({
  icon: Icon,
  title,
  description,
  features,
  onLearnMore,
  link,
  imageUrl
}: ServiceCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border-2 border-gray-100 hover:border-[#e71c5e]/30">
      <div className="bg-gradient-to-br from-[#e71c5e] via-[#d4194e] to-[#c91852] p-10 relative overflow-hidden">
        {imageUrl && (
          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Icon size={36} className="text-[#e71c5e]" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
          <p className="text-white/95 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="p-8">
        <ul className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-[#e71c5e] to-[#c91852] mt-2 flex-shrink-0 shadow-sm"></span>
              <span className="text-gray-700 leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>

        {link ? (
          <SafeLink
            to={link}
            className="w-full bg-gradient-to-r from-gray-100 to-gray-50 hover:from-[#e71c5e] hover:to-[#c91852] text-gray-700 hover:text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 border-2 border-gray-200 hover:border-transparent shadow-sm hover:shadow-lg"
            aria-label={`Learn more about ${title}`}
          >
            Learn More
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
          </SafeLink>
        ) : (
          <button
            onClick={onLearnMore}
            className="w-full bg-gradient-to-r from-gray-100 to-gray-50 hover:from-[#e71c5e] hover:to-[#c91852] text-gray-700 hover:text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 border-2 border-gray-200 hover:border-transparent shadow-sm hover:shadow-lg"
            aria-label={`Learn more about ${title}`}
          >
            Learn More
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
          </button>
        )}
      </div>
    </div>
  )
}
