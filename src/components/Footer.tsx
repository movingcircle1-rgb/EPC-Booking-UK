import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  Youtube
} from 'lucide-react'
import { brandConfig } from '../config/branding'

export default function Footer() {
  const linkClass =
    'text-gray-400 hover:text-[#e71c5e] text-sm flex items-center gap-2 transition-colors'

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          <div>
            <img
              src={brandConfig.logo.footer}
              alt={brandConfig.logo.alt}
              className="h-36 w-auto mb-4"
            />

            <p className="text-gray-400 text-sm mb-4">
              {brandConfig.description}
            </p>

            <div className="flex flex-wrap gap-3">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-[#e71c5e] flex items-center justify-center">
                  <Icon size={18} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Our Services</h3>
            <ul className="space-y-2">
              <li><a href="/services/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />All Services</a></li>
              <li><a href="/services/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />Explore Services</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />Home</a></li>
              <li><a href="/articles/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />Articles</a></li>
              <li><a href="/about/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />About Us</a></li>
              <li><a href="/locations/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />All Locations</a></li>
              <li><a href="/contact/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="/careers/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />Careers</a></li>
              <li><a href="/apprenticeships/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />Apprenticeships</a></li>
              <li><a href="/youth-unemployment/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />Youth Unemployment</a></li>
              <li><a href="/nearest-office/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />Your Nearest Office</a></li>
              <li><a href="/terms-and-conditions/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />Terms</a></li>
              <li><a href="/privacy-policy/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />Privacy</a></li>
              <li><a href="/corporate-social-responsibility/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />CSR</a></li>
              <li><a href="/environmental-policy/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />Environmental</a></li>
              <li><a href="/we-donate/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />We Donate</a></li>
              <li><a href="/we-recycle/" className={linkClass}><ArrowRight size={14} className="text-[#e71c5e]" />We Recycle</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Get in Touch</h3>
            <ul className="space-y-3">
              {brandConfig.contact.phone && (
                <li className="flex gap-3">
                  <Phone size={18} className="text-[#e71c5e]" />
                  <span className="text-gray-400 text-sm">{brandConfig.contact.phone}</span>
                </li>
              )}
              {brandConfig.contact.email && (
                <li className="flex gap-3">
                  <Mail size={18} className="text-[#e71c5e]" />
                  <span className="text-gray-400 text-sm">{brandConfig.contact.email}</span>
                </li>
              )}
              {brandConfig.contact.address.street && (
                <li className="flex gap-3">
                  <MapPin size={18} className="text-[#e71c5e]" />
                  <span className="text-gray-400 text-sm">
                    {brandConfig.contact.address.street}
                  </span>
                </li>
              )}
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            {brandConfig.footer.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  )
}
