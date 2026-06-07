import { useState } from 'react'

export default function ComprehensiveSEOManagement({ services = [] }: any) {
  const [selectedServiceType, setSelectedServiceType] = useState<string>('')

  return (
    <div>
      <h2>SEO Management</h2>

      <select
        value={selectedServiceType}
        onChange={(e) => setSelectedServiceType(e.target.value)}
      >
        <option value="">Select service</option>

        {services.map((s: any) => (
          <option key={s.service_slug} value={s.service_slug}>
            {s.service_slug}
          </option>
        ))}
      </select>
    </div>
  )
}
