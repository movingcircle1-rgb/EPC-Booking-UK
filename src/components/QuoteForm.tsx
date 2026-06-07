// src/components/QuoteForm.tsx
import { useMemo, useState } from 'react'
import { X, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface QuoteFormProps {
  onClose: () => void
}

type SubmitStatus = 'idle' | 'success' | 'error'

export default function QuoteForm({ onClose }: QuoteFormProps) {
  const isBrowser = typeof window !== 'undefined'

  const todayIso = useMemo(() => {
    if (!isBrowser) return ''
    return new Date().toISOString().split('T')[0]
  }, [isBrowser])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    property_postcode: '',
    property_address: '',
    property_type: 'house',
    bedrooms: '',
    reason_for_epc: 'selling',
    preferred_date: '',
    preferred_time_window: '',
    access_notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const sourcePage = isBrowser ? window.location.pathname : ''

      const submissionData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        property_postcode: formData.property_postcode || null,
        property_address: formData.property_address || null,
        property_type: formData.property_type || null,
        bedrooms: formData.bedrooms || null,
        reason_for_epc: formData.reason_for_epc || null,
        preferred_date: formData.preferred_date || null,
        preferred_time_window: formData.preferred_time_window || null,
        access_notes: formData.access_notes || null,
        status: 'new',
        source_page: sourcePage
      }

      const { error } = await supabase
        .from('epc_booking_requests')
        .insert([submissionData])

      if (error) throw error

      setSubmitStatus('success')

      setTimeout(() => {
        onClose()
      }, 2500)
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Error submitting EPC booking request:', error)
      setSubmitStatus('error')
      setErrorMessage(error?.message || 'Failed to submit EPC booking request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-[#1F3447] p-6 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm font-semibold uppercase tracking-[0.2em]">
              EPC Booking UK
            </p>
            <h2 className="text-2xl font-bold text-white mt-1">Book Your EPC Appointment</h2>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close EPC booking form"
            type="button"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Enter the property details below and we’ll contact you to confirm the EPC appointment.
          </p>

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
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#be0e0c] focus:ring-2 focus:ring-[#be0e0c]/20 outline-none transition-all"
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
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#be0e0c] focus:ring-2 focus:ring-[#be0e0c]/20 outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#be0e0c] focus:ring-2 focus:ring-[#be0e0c]/20 outline-none transition-all"
              placeholder="07123 456789"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="property_postcode" className="block text-sm font-semibold text-gray-700 mb-2">
                Property Postcode *
              </label>
              <input
                id="property_postcode"
                type="text"
                required
                value={formData.property_postcode}
                onChange={(e) => updateField('property_postcode', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#be0e0c] focus:ring-2 focus:ring-[#be0e0c]/20 outline-none transition-all uppercase"
                placeholder="ST16 2AA"
              />
            </div>

            <div>
              <label htmlFor="property_type" className="block text-sm font-semibold text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                id="property_type"
                required
                value={formData.property_type}
                onChange={(e) => updateField('property_type', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#be0e0c] focus:ring-2 focus:ring-[#be0e0c]/20 outline-none transition-all"
              >
                <option value="house">House</option>
                <option value="flat">Flat / Apartment</option>
                <option value="maisonette">Maisonette</option>
                <option value="bungalow">Bungalow</option>
                <option value="commercial">Commercial Premises</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="property_address" className="block text-sm font-semibold text-gray-700 mb-2">
              Property Address
            </label>
            <input
              id="property_address"
              type="text"
              value={formData.property_address}
              onChange={(e) => updateField('property_address', e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#be0e0c] focus:ring-2 focus:ring-[#be0e0c]/20 outline-none transition-all"
              placeholder="First line of address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-semibold text-gray-700 mb-2">
                Bedrooms / Size
              </label>
              <select
                id="bedrooms"
                value={formData.bedrooms}
                onChange={(e) => updateField('bedrooms', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#be0e0c] focus:ring-2 focus:ring-[#be0e0c]/20 outline-none transition-all"
              >
                <option value="">Select size</option>
                <option value="studio">Studio</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4 Bedrooms</option>
                <option value="5-plus">5+ Bedrooms</option>
                <option value="commercial-small">Small Commercial</option>
                <option value="commercial-large">Large Commercial</option>
              </select>
            </div>

            <div>
              <label htmlFor="reason_for_epc" className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for EPC *
              </label>
              <select
                id="reason_for_epc"
                required
                value={formData.reason_for_epc}
                onChange={(e) => updateField('reason_for_epc', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#be0e0c] focus:ring-2 focus:ring-[#be0e0c]/20 outline-none transition-all"
              >
                <option value="selling">Selling a property</option>
                <option value="letting">Letting / landlord requirement</option>
                <option value="renewal">Renewing an existing EPC</option>
                <option value="commercial">Commercial property requirement</option>
                <option value="compliance">Compliance check</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="preferred_date" className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Appointment Date
              </label>
              <input
                id="preferred_date"
                type="date"
                value={formData.preferred_date}
                onChange={(e) => updateField('preferred_date', e.target.value)}
                min={todayIso || undefined}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#be0e0c] focus:ring-2 focus:ring-[#be0e0c]/20 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="preferred_time_window" className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Time Window
              </label>
              <select
                id="preferred_time_window"
                value={formData.preferred_time_window}
                onChange={(e) => updateField('preferred_time_window', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#be0e0c] focus:ring-2 focus:ring-[#be0e0c]/20 outline-none transition-all"
              >
                <option value="">Select time window</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="access_notes" className="block text-sm font-semibold text-gray-700 mb-2">
              Access Notes
            </label>
            <textarea
              id="access_notes"
              value={formData.access_notes}
              onChange={(e) => updateField('access_notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#be0e0c] focus:ring-2 focus:ring-[#be0e0c]/20 outline-none transition-all resize-none"
              placeholder="Tenant access, key safe, parking, estate agent access, preferred contact method..."
            />
          </div>

          {submitStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              <p className="font-semibold mb-1">✓ EPC booking request submitted</p>
              <p className="text-sm">
                Thank you. We’ll contact you shortly to confirm the appointment details.
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="font-semibold mb-1">Submission failed</p>
              <p className="text-sm">{errorMessage || 'Something went wrong. Please try again.'}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#be0e0c] hover:bg-[#9f0b0a] text-white px-6 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Submit EPC booking request"
          >
            {isSubmitting ? 'Submitting...' : 'Submit EPC Booking Request'}
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
