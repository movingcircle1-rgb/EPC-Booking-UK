import { useState, useEffect, useRef } from 'react'
import { Menu, X, Phone, Mail, ChevronDown, ChevronRight } from 'lucide-react'
import { brandConfig } from '../config/branding'
import { useAuth } from '../contexts/AuthContext'
import { useQuote } from '../contexts/QuoteContext'
import UserMenu from './UserMenu'
import { supabase } from '../lib/supabase'
import { buildServiceTree, type ServiceMenuItem, type ServiceRow } from '../lib/serviceMenu'
import { buildLocationGroups, type GroupedLocation, type LocationRow } from '../lib/locationMenu'

export default function Navbar() {
  const { user } = useAuth()
  const { openQuote } = useQuote()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [activeServiceParentSlug, setActiveServiceParentSlug] = useState<string | null>(null)
  const [showPortalsDropdown, setShowPortalsDropdown] = useState(false)
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false)
  const [activeLocationRegion, setActiveLocationRegion] = useState<string | null>(null)
  const [activeMobileLocationRegion, setActiveMobileLocationRegion] = useState<string | null>(null)
  const [activeMobileServiceParentSlug, setActiveMobileServiceParentSlug] = useState<string | null>(null)

  const [serviceMenu, setServiceMenu] = useState<ServiceMenuItem[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [groupedLocations, setGroupedLocations] = useState<GroupedLocation[]>([])
  const [locationsLoading, setLocationsLoading] = useState(true)

  const portalsDropdownRef = useRef<HTMLDivElement>(null)
  const phoneDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (portalsDropdownRef.current && !portalsDropdownRef.current.contains(event.target as Node)) {
        setShowPortalsDropdown(false)
      }
      if (phoneDropdownRef.current && !phoneDropdownRef.current.contains(event.target as Node)) {
        setShowPhoneDropdown(false)
      }
    }

    if (showPortalsDropdown || showPhoneDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPortalsDropdown, showPhoneDropdown])

  useEffect(() => {
    let isMounted = true

    async function loadServices() {
      setServicesLoading(true)

      const { data, error } = await supabase
        .from('services')
        .select('name, slug, parent_slug, sort_order, menu_label, marketing_path')
        .eq('is_active', true)
        .eq('show_in_menu', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (!isMounted) return

      if (error) {
        console.error('Failed to load services menu:', error)
        setServiceMenu([])
        setActiveServiceParentSlug(null)
        setServicesLoading(false)
        return
      }

      const rows = (data ?? []) as ServiceRow[]
      const tree = buildServiceTree(rows)
      const firstParentWithChildren = tree.find((item) => item.children.length > 0)

      setServiceMenu(tree)
      setActiveServiceParentSlug(firstParentWithChildren?.slug ?? null)
      setServicesLoading(false)
    }

    void loadServices()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadLocations() {
      setLocationsLoading(true)

      const { data, error } = await supabase
        .from('cities')
        .select('slug, name, menu_region, county')
        .order('menu_region', { ascending: true })
        .order('county', { ascending: true })
        .order('name', { ascending: true })

      if (!isMounted) return

      if (error) {
        console.error('Failed to load locations menu:', error)
        setGroupedLocations([])
        setLocationsLoading(false)
        return
      }

      const rows = (data ?? []) as LocationRow[]
      const groups = buildLocationGroups(rows)

      setGroupedLocations(groups)
      setLocationsLoading(false)
    }

    void loadLocations()

    return () => {
      isMounted = false
    }
  }, [])

  const portalItems = [
    { id: 'login', label: 'Login', isSpecial: true },
    { id: 'client-portal', label: 'Client Portal' },
    { id: 'partner-portal', label: 'Partner Portal' },
    { id: 'staff-portal', label: 'Staff Portal' },
    { id: 'trade-portal', label: 'Trade Portal' }
  ] as const

  const phoneNumbers = [
    { number: brandConfig.contact.phone, href: brandConfig.contact.phoneHref, label: 'Main Line' },
    { number: brandConfig.contact.phoneSecondary, href: brandConfig.contact.phoneSecondaryHref, label: 'Mobile' }
  ].filter((item) => item.number && item.href)

  const toSeoPath = (id: string) => {
    if (id === 'login') return '/portal/login'
    if (id === 'client-portal') return '/client-portal'
    if (id === 'partner-portal') return '/partner-portal/'
    if (id === 'staff-portal') return '/staff-portal'
    if (id === 'trade-portal') return '/trade-portal/'

    return `/${id}/`
  }

  const toServicePath = (item: Pick<ServiceMenuItem, 'slug' | 'marketing_path'>) =>
    item.marketing_path || `/services/${item.slug}/`

  const getServiceLabel = (item: Pick<ServiceMenuItem, 'menu_label' | 'name'>) =>
    item.menu_label || item.name

  const handleMouseLeave = () => {
    setActiveDropdown(null)
    setActiveLocationRegion(null)
    setActiveServiceParentSlug(null)
  }

  const closeMobile = () => {
    setIsMobileMenuOpen(false)
    setActiveMobileLocationRegion(null)
    setActiveMobileServiceParentSlug(null)
  }

  const toggleMobileRegion = (region: string) => {
    setActiveMobileLocationRegion((current) => (current === region ? null : region))
  }

  const toggleMobileServiceParent = (slug: string) => {
    setActiveMobileServiceParentSlug((current) => (current === slug ? null : slug))
  }

  const activeServiceParent =
    serviceMenu.find((item) => item.slug === activeServiceParentSlug) ?? null

  return (
    <>
      <div className="bg-[#be0e0c]/90 backdrop-blur-md text-white py-2 px-2 sm:px-4 relative z-50">
        <div className="container mx-auto flex justify-between items-center text-xs sm:text-sm">
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {phoneNumbers.length > 0 ? (
              <div ref={phoneDropdownRef} className="relative">
                <button
                  onClick={() => setShowPhoneDropdown(!showPhoneDropdown)}
                  className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity min-w-[44px] min-h-[44px] justify-center sm:justify-start"
                  aria-label="Phone numbers"
                  aria-expanded={showPhoneDropdown}
                  type="button"
                >
                  <Phone size={16} className="flex-shrink-0" />
                  <span className="hidden lg:inline">{brandConfig.contact.phone}</span>
                  <ChevronDown
                    size={12}
                    className={`hidden sm:inline transition-transform ${showPhoneDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {showPhoneDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white shadow-xl border border-gray-200 rounded-lg py-2 min-w-[200px] z-[60]">
                    {phoneNumbers.map((phone, index) => (
                      <a
                        key={index}
                        href={phone.href}
                        onClick={() => setShowPhoneDropdown(false)}
                        className="block w-full text-left px-4 py-2 text-sm text-[#293132] hover:text-[#be0e0c] hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-semibold">{phone.label}</div>
                        <div className="text-xs text-gray-600">{phone.number}</div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {brandConfig.contact.email ? (
              <a
                href={brandConfig.contact.emailHref}
                className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity min-w-[44px] min-h-[44px] justify-center sm:justify-start"
                aria-label="Email us"
              >
                <Mail size={16} className="flex-shrink-0" />
                <span className="hidden md:inline truncate">{brandConfig.contact.email}</span>
              </a>
            ) : null}
          </div>

          <div className="flex gap-2 sm:gap-3 items-center">
            <button
              onClick={openQuote}
              className="bg-white text-[#949494] px-2 sm:px-4 py-1 sm:py-1.5 rounded font-semibold text-xs sm:text-sm hover:bg-gray-100 transition-colors whitespace-nowrap min-h-[36px] sm:min-h-auto"
              aria-label="Get a quote"
              type="button"
            >
              <span className="hidden sm:inline">Get a Quote</span>
              <span className="sm:hidden">Quote</span>
            </button>

            {user ? (
              <UserMenu />
            ) : (
              <div ref={portalsDropdownRef} className="relative">
                <button
                  onClick={() => setShowPortalsDropdown(!showPortalsDropdown)}
                  className="bg-white text-[#949494] px-2 sm:px-4 py-1 sm:py-1.5 rounded font-semibold text-xs sm:text-sm hover:bg-gray-100 transition-colors flex items-center gap-1 whitespace-nowrap min-h-[36px] sm:min-h-auto"
                  aria-label="Access portals"
                  aria-expanded={showPortalsDropdown}
                  type="button"
                >
                  Portals
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showPortalsDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {showPortalsDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white shadow-xl border border-gray-200 rounded-lg py-2 min-w-[180px] z-[60]">
                    {portalItems.map((item) => (
                      <a
                        key={item.id}
                        href={toSeoPath(item.id)}
                        onClick={() => setShowPortalsDropdown(false)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          item.isSpecial
                            ? 'text-[#be0e0c] font-semibold border-b border-gray-200 hover:text-[#9f0b0a]'
                            : 'text-[#293132] hover:text-[#be0e0c]'
                        }`}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <nav
        className="sticky top-0 z-40 transition-all duration-300 bg-white/95 backdrop-blur-md"
        style={{
          boxShadow: isScrolled
            ? '0 8px 32px 0 rgba(0, 0, 0, 0.2), 0 2px 8px 0 rgba(0, 0, 0, 0.1)'
            : '0 4px 24px 0 rgba(0, 0, 0, 0.15)'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24 sm:h-28 md:h-32">
            <a href="/" className="flex items-center hover:opacity-90 transition-opacity" aria-label="Go to homepage">
              <img src={brandConfig.logo.primary} alt={brandConfig.logo.alt} className="h-14 sm:h-16 md:h-20 w-auto" />
            </a>

            <div className="hidden lg:flex items-center space-x-1">
              <div
                className="relative"
                onMouseEnter={() => {
                  setActiveDropdown('services')
                  if (!activeServiceParentSlug && serviceMenu.length > 0) {
                    const firstParentWithChildren = serviceMenu.find((item) => item.children.length > 0)
                    setActiveServiceParentSlug(firstParentWithChildren?.slug ?? null)
                  }
                }}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-[#293132] hover:text-[#be0e0c] transition-colors"
                  aria-label="Services menu"
                  aria-expanded={activeDropdown === 'services'}
                  type="button"
                >
                  Services
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${activeDropdown === 'services' ? 'rotate-180' : ''}`}
                  />
                </button>

                {activeDropdown === 'services' && !servicesLoading && serviceMenu.length > 0 && (
                  <div className="absolute top-full left-0 mt-0 z-50 flex">
                    <div className="bg-white shadow-xl border border-gray-200 rounded-l-lg py-2 min-w-[320px] max-h-[70vh] overflow-y-auto">
                      {serviceMenu.map((item) => {
                        const hasChildren = item.children.length > 0
                        const isActive = activeServiceParentSlug === item.slug
                        const path = toServicePath(item)

                        if (hasChildren) {
                          return (
                            <button
                              key={item.slug}
                              type="button"
                              onMouseEnter={() => setActiveServiceParentSlug(item.slug)}
                              onFocus={() => setActiveServiceParentSlug(item.slug)}
                              className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition-colors ${
                                isActive
                                  ? 'bg-gray-50 text-[#be0e0c]'
                                  : 'text-[#293132] hover:bg-gray-50 hover:text-[#be0e0c]'
                              }`}
                            >
                              <span>{getServiceLabel(item)}</span>
                              <ChevronRight size={16} className="flex-shrink-0" />
                            </button>
                          )
                        }

                        return (
                          <a
                            key={item.slug}
                            href={path}
                            onClick={() => setActiveDropdown(null)}
                            className="block w-full text-left px-4 py-3 text-sm font-semibold text-[#293132] hover:text-[#be0e0c] hover:bg-gray-50 transition-colors"
                          >
                            {getServiceLabel(item)}
                          </a>
                        )
                      })}
                    </div>

                    {activeServiceParent && activeServiceParent.children.length > 0 && (
                      <div className="bg-white shadow-xl border border-l-0 border-gray-200 rounded-r-lg py-2 min-w-[320px] max-h-[70vh] overflow-y-auto">
                        <div className="block w-full text-left px-4 py-3 text-sm font-bold text-[#293132] border-b border-gray-100">
                          {getServiceLabel(activeServiceParent)}
                        </div>

                        {activeServiceParent.children.map((child) => (
                          <a
                            key={child.slug}
                            href={toServicePath(child)}
                            onClick={() => setActiveDropdown(null)}
                            className="block w-full text-left px-4 py-3 text-sm text-[#293132] hover:text-[#be0e0c] hover:bg-gray-50 transition-colors"
                          >
                            {getServiceLabel(child)}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div
                className="relative"
                onMouseEnter={() => {
                  setActiveDropdown('locations')
                  if (!activeLocationRegion && groupedLocations.length > 0) {
                    const preferredRegion =
                      groupedLocations.find((group) => group.region === 'Staffordshire')?.region ??
                      groupedLocations[0].region

                    setActiveLocationRegion(preferredRegion)
                  }
                }}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-[#293132] hover:text-[#be0e0c] transition-colors"
                  aria-label="Locations menu"
                  aria-expanded={activeDropdown === 'locations'}
                  type="button"
                >
                  Locations
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${activeDropdown === 'locations' ? 'rotate-180' : ''}`}
                  />
                </button>

                {activeDropdown === 'locations' && !locationsLoading && groupedLocations.length > 0 && (
                  <div className="absolute top-full right-0 mt-0 z-50 flex flex-row-reverse">
                    <div className="bg-white shadow-xl border border-gray-200 rounded-l-lg py-3 min-w-[280px]">
                      <a
                        href="/locations/"
                        onClick={() => {
                          setActiveDropdown(null)
                          setActiveLocationRegion(null)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm font-semibold text-[#293132] hover:text-[#be0e0c] hover:bg-gray-50 transition-colors"
                      >
                        View all locations
                      </a>

                      <div className="my-2 border-t border-gray-200" />

                      {groupedLocations.map((group) => (
                        <button
                          key={group.region}
                          type="button"
                          onMouseEnter={() => setActiveLocationRegion(group.region)}
                          onFocus={() => setActiveLocationRegion(group.region)}
                          className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition-colors ${
                            activeLocationRegion === group.region
                              ? 'bg-gray-50 text-[#be0e0c]'
                              : 'text-[#293132] hover:bg-gray-50 hover:text-[#be0e0c]'
                          }`}
                        >
                          <span>{group.region}</span>
                          <ChevronRight size={16} className="flex-shrink-0" />
                        </button>
                      ))}
                    </div>

                    {activeLocationRegion && (
                      <div className="bg-white shadow-xl border border-r-0 border-gray-200 rounded-l-lg py-3 min-w-[260px] max-h-[70vh] overflow-y-auto">
                        {groupedLocations
                          .find((group) => group.region === activeLocationRegion)
                          ?.locations.map((loc) => (
                            <a
                              key={loc.slug}
                              href={`/locations/${loc.slug}/`}
                              onClick={() => {
                                setActiveDropdown(null)
                                setActiveLocationRegion(null)
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-[#293132] hover:text-[#be0e0c] hover:bg-gray-50 transition-colors"
                            >
                              {loc.label}
                            </a>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <a
                href="/articles/"
                className="px-4 py-2 text-sm font-semibold text-[#293132] hover:text-[#be0e0c] transition-colors"
              >
                Articles
              </a>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-[#293132] hover:text-[#be0e0c] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              type="button"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 max-h-[calc(100vh-140px)] overflow-y-auto">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <div className="border-t border-gray-200 pt-2 mt-2">
                <button
                  type="button"
                  onClick={() => setActiveMobileServiceParentSlug((current) => (current ? null : serviceMenu[0]?.slug ?? null))}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span>Services</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${activeMobileServiceParentSlug ? 'rotate-180' : ''}`}
                  />
                </button>

                {serviceMenu.length > 0 && (
                  <div className="mt-1">
                    {serviceMenu.map((item) =>
                      item.children.length > 0 ? (
                        <div key={item.slug}>
                          <button
                            type="button"
                            onClick={() => toggleMobileServiceParent(item.slug)}
                            className="flex w-full items-center justify-between px-6 py-2 text-sm font-semibold text-[#293132] hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <span>{getServiceLabel(item)}</span>
                            <ChevronDown
                              size={14}
                              className={`transition-transform ${activeMobileServiceParentSlug === item.slug ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {activeMobileServiceParentSlug === item.slug && (
                            <div className="mt-1">
                              {item.children.map((child) => (
                                <a
                                  key={child.slug}
                                  href={toServicePath(child)}
                                  onClick={closeMobile}
                                  className="block w-full text-left px-8 py-2 text-sm text-[#293132] hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  {getServiceLabel(child)}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <a
                          key={item.slug}
                          href={toServicePath(item)}
                          onClick={closeMobile}
                          className="block w-full text-left px-6 py-2 text-sm font-semibold text-[#293132] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          {getServiceLabel(item)}
                        </a>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-2 mt-2">
                <a
                  href="/locations/"
                  onClick={closeMobile}
                  className="block w-full text-left px-4 py-3 text-sm font-semibold text-[#293132] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Locations
                </a>

                <a
                  href="/locations/"
                  onClick={closeMobile}
                  className="block w-full text-left px-6 py-2 text-sm text-[#293132] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  View all locations
                </a>

                {!locationsLoading && groupedLocations.length > 0 && (
                  <div className="px-2 pb-2">
                    {groupedLocations.map((group) => (
                      <div key={group.region} className="mt-2">
                        <button
                          type="button"
                          onClick={() => toggleMobileRegion(group.region)}
                          className="flex w-full items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wide text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <span>{group.region}</span>
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${activeMobileLocationRegion === group.region ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {activeMobileLocationRegion === group.region && (
                          <div className="mt-1">
                            {group.locations.map((loc) => (
                              <a
                                key={loc.slug}
                                href={`/locations/${loc.slug}/`}
                                onClick={closeMobile}
                                className="block w-full text-left px-6 py-2 text-sm text-[#293132] hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                {loc.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <a
                href="/articles/"
                onClick={closeMobile}
                className="block w-full text-left px-4 py-3 text-sm font-semibold text-[#293132] hover:bg-gray-100 rounded-lg transition-colors border-t border-gray-200 pt-4 mt-2"
              >
                Articles
              </a>

              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-4 py-2 text-sm font-bold text-gray-900">Portals</div>
                {portalItems.map((item) => (
                  <a
                    key={item.id}
                    href={toSeoPath(item.id)}
                    onClick={closeMobile}
                    className={`block w-full text-left px-6 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] flex items-center ${
                      item.isSpecial ? 'text-[#be0e0c] font-semibold' : 'text-[#293132]'
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
