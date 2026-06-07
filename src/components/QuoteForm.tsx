// src/components/QuoteForm.tsx
import { useState, useEffect, useMemo } from 'react'
import { X, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface QuoteFormProps {
  onClose: () => void
}

type SubmitStatus = 'idle' | 'success' | 'error'

export default function QuoteForm({ onClose }: QuoteFormProps) {
  const { user } = useAuth()

  const isBrowser = typeof window !== 'undefined'
  const todayIso = useMemo(() => {
    if (!isBrowser) return ''
    return new Date().toISOString().split('T')[0]
  }, [isBrowser])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: 'removals',
    location: '',
    from_postcode: '',
    to_postcode: '',
    property_size: '',
    preferred_date: '',
    flexible_dates: false,
    message: '',
    additional_requirements: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [quoteNumber, setQuoteNumber] = useState<string>('')

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || ''
      }))
    }
  }, [user])

  const redirectToClientPortal = () => {
    if (!isBrowser) return
    // Keep your trailing slash convention if you want it:
    window.location.assign('/client-portal')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      // Map service_type to database values
      let serviceType = 'other'
      switch (formData.service_type) {
        case 'removals':
          serviceType = 'house_removals'
          break
        case 'office':
          serviceType = 'office_removals'
          break
        case 'international':
          serviceType = 'international_moves'
          break
        case 'european':
          serviceType = 'european_moves'
          break
        case 'storage':
          serviceType = 'storage'
          break
        case 'packing':
          serviceType = 'packing_services'
          break
        default:
          serviceType = 'other'
      }

      // Map property_size to property_type values allowed by database
      let propertyType = 'house'
      if (formData.property_size.includes('office')) {
        propertyType = 'office'
      } else if (formData.property_size === 'studio' || formData.property_size.includes('bed')) {
        propertyType = formData.property_size === 'studio' ? 'flat' : 'house'
      } else if (formData.service_type === 'storage') {
        propertyType = 'storage'
      } else if (!formData.property_size) {
        propertyType = 'other'
      }

      // Estimate bedrooms
      let bedrooms: number | null = null
      if (formData.property_size === 'studio') bedrooms = 0
      else if (formData.property_size === '1-bed') bedrooms = 1
      else if (formData.property_size === '2-bed') bedrooms = 2
      else if (formData.property_size === '3-bed') bedrooms = 3
      else if (formData.property_size === '4-bed') bedrooms = 4

      const submissionData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        service_type: serviceType,
        move_from_postcode: formData.from_postcode,
        move_to_postcode: formData.to_postcode,
        property_type: propertyType,
        number_of_bedrooms: bedrooms,
        estimated_volume: formData.property_size || null,
        preferred_move_date: formData.preferred_date || null,
        flexible_dates: formData.flexible_dates,
        additional_notes: formData.message || formData.additional_requirements || null,
        status: 'new',
        marketing_consent: true
      }

      // eslint-disable-next-line no-console
      console.log('Submitting quote request:', submissionData)

      const { data, error } = await supabase
        .from('quote_requests')
        .insert([submissionData])
        .select('id, quote_reference')
        .single()

      if (error) {
        // eslint-disable-next-line no-console
        console.error('Submission error:', error)
        throw error
      }

      // eslint-disable-next-line no-console
      console.log('Quote submitted successfully:', data)
      setQuoteNumber(data?.quote_reference || 'Your quote request')

      // Send admin notification email (client-only)
      if (isBrowser) {
        try {
          const notificationResponse = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-quote-notification`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
              },
              body: JSON.stringify({
                quoteRequestId: data.id
              })
            }
          )

          if (notificationResponse.ok) {
            // eslint-disable-next-line no-console
            console.log('Admin notification emails sent successfully')
          } else {
            // eslint-disable-next-line no-console
            console.warn('Failed to send admin notification emails')
          }
        } catch (notificationError) {
          // eslint-disable-next-line no-console
          console.error('Error sending admin notifications:', notificationError)
        }
      }

      // Trigger auto-registration (client-only)
      let shouldAutoLogin = false
      let loginPassword = ''

      if (isBrowser) {
        try {
          const autoRegResponse = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-register-client`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
              },
              body: JSON.stringify({
                quoteRequestId: data.id || null
              })
            }
          )

          if (autoRegResponse.ok) {
            const autoRegData = await autoRegResponse.json()
            // eslint-disable-next-line no-console
            console.log('Auto-registration response:', autoRegData)

            if (autoRegData?.isNewUser && !user && autoRegData?.password) {
              shouldAutoLogin = true
              loginPassword = autoRegData.password
            }
          } else {
            // eslint-disable-next-line no-console
            console.warn('Auto-registration failed, but quote was submitted')
          }
        } catch (autoRegError) {
          // eslint-disable-next-line no-console
          console.error('Auto-registration error:', autoRegError)
        }
      }

      setSubmitStatus('success')

      // If user should auto-login, sign them in and redirect
      if (shouldAutoLogin && loginPassword && isBrowser) {
        // eslint-disable-next-line no-console
        console.log('Auto-logging in user...')

        setTimeout(async () => {
          try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: formData.email,
              password: loginPassword
            })

            if (signInError) {
              // eslint-disable-next-line no-console
              console.error('Auto-login failed:', signInError)
              setTimeout(() => onClose(), 2000)
            } else {
              // eslint-disable-next-line no-console
              console.log('Auto-login successful, redirecting to client portal...')
              onClose()
              setTimeout(() => {
                redirectToClientPortal()
              }, 300)
            }
          } catch (loginError) {
            // eslint-disable-next-line no-console
            console.error('Auto-login error:', loginError)
            setTimeout(() => onClose(), 2000)
          }
        }, 2000)
      } else {
        // Already logged in or existing user - close after delay
        setTimeout(() => {
          onClose()
          if (user && isBrowser) {
            window.location.reload()
          }
        }, 3000)
      }
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error submitting quote:', error)
      setSubmitStatus('error')
      setErrorMessage(error?.message || 'Failed to submit quote request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#e71c5e] to-[#c91852] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Get Your Free Quote</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close quote form"
            type="button"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e71c5e] focus:ring-2 focus:ring-[#e71c5e]/20 outline-none transition-all"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e71c5e] focus:ring-2 focus:ring-[#e71c5e]/20 outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e71c5e] focus:ring-2 focus:ring-[#e71c5e]/20 outline-none transition-all"
                placeholder="07123 456789"
              />
            </div>

            <div>
              <label htmlFor="service_type" className="block text-sm font-semibold text-gray-700 mb-2">
                Service Type *
              </label>
              <select
                id="service_type"
                required
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e71c5e] focus:ring-2 focus:ring-[#e71c5e]/20 outline-none transition-all"
              >
                <option value="removals">House Removals</option>
                <option value="office">Office Removals</option>
                <option value="storage">Storage</option>
                <option value="packing">Packing Services</option>
                <option value="european">European Moves</option>
                <option value="international">International Moves</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="from_postcode" className="block text-sm font-semibold text-gray-700 mb-2">
                From Postcode *
              </label>
              <input
                id="from_postcode"
                type="text"
                required
                value={formData.from_postcode}
                onChange={(e) => setFormData({ ...formData, from_postcode: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e71c5e] focus:ring-2 focus:ring-[#e71c5e]/20 outline-none transition-all"
                placeholder="SW1A 1AA"
              />
            </div>

            <div>
              <label htmlFor="to_postcode" className="block text-sm font-semibold text-gray-700 mb-2">
                To Postcode *
              </label>
              <input
                id="to_postcode"
                type="text"
                required
                value={formData.to_postcode}
                onChange={(e) => setFormData({ ...formData, to_postcode: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e71c5e] focus:ring-2 focus:ring-[#e71c5e]/20 outline-none transition-all"
                placeholder="M1 1AA"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="property_size" className="block text-sm font-semibold text-gray-700 mb-2">
                Property Size
              </label>
              <select
                id="property_size"
                value={formData.property_size}
                onChange={(e) => setFormData({ ...formData, property_size: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e71c5e] focus:ring-2 focus:ring-[#e71c5e]/20 outline-none transition-all"
              >
                <option value="">Select property size</option>
                <option value="studio">Studio</option>
                <option value="1-bed">1 Bedroom</option>
                <option value="2-bed">2 Bedrooms</option>
                <option value="3-bed">3 Bedrooms</option>
                <option value="4-bed">4+ Bedrooms</option>
                <option value="office-small">Small Office</option>
                <option value="office-large">Large Office</option>
              </select>
            </div>

            <div>
              <label htmlFor="preferred_date" className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Date
              </label>
              <input
                id="preferred_date"
                type="date"
                value={formData.preferred_date}
                onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                min={todayIso || undefined}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e71c5e] focus:ring-2 focus:ring-[#e71c5e]/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="flexible_dates"
              type="checkbox"
              checked={formData.flexible_dates}
              onChange={(e) => setFormData({ ...formData, flexible_dates: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-[#e71c5e] focus:ring-[#e71c5e] focus:ring-2"
            />
            <label htmlFor="flexible_dates" className="text-sm font-semibold text-gray-700">
              I'm flexible with dates
            </label>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Location Details
            </label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e71c5e] focus:ring-2 focus:ring-[#e71c5e]/20 outline-none transition-all"
              placeholder="e.g., London Bridge area to Manchester city centre"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
              Moving Details
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e71c5e] focus:ring-2 focus:ring-[#e71c5e]/20 outline-none transition-all resize-none"
              placeholder="Tell us about your moving requirements..."
            />
          </div>

          <div>
            <label htmlFor="additional_requirements" className="block text-sm font-semibold text-gray-700 mb-2">
              Special Requirements
            </label>
            <textarea
              id="additional_requirements"
              value={formData.additional_requirements}
              onChange={(e) => setFormData({ ...formData, additional_requirements: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#e71c5e] focus:ring-2 focus:ring-[#e71c5e]/20 outline-none transition-all resize-none"
              placeholder="e.g., fragile items, parking restrictions, storage needs..."
            />
          </div>

          {submitStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              <p className="font-semibold mb-1">✓ Quote Request Submitted Successfully!</p>
              <p className="text-sm">
                Your reference number is: <span className="font-bold">{quoteNumber}</span>
              </p>
              {!user ? (
                <>
                  <p className="text-sm mt-2 font-semibold">🚀 Redirecting to Your Client Portal...</p>
                  <p className="text-sm">You'll be automatically logged in to view your quote and manage your move.</p>
                </>
              ) : (
                <>
                  <p className="text-sm mt-2 font-semibold">✓ Your Dashboard is Being Updated...</p>
                  <p className="text-sm">You can view your new quote request in the Client Portal.</p>
                </>
              )}
              <p className="text-sm mt-2">Our team will prepare your personalized quote within 24 hours.</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="font-semibold mb-1">Submission Failed</p>
              <p className="text-sm">{errorMessage || 'Something went wrong. Please try again or call us directly.'}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#e71c5e] hover:bg-[#c91852] text-white px-6 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Submit quote request"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
