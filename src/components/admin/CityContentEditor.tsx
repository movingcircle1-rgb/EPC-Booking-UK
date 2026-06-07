import { useState } from 'react'

type Props = {
  cityName: string
}

export default function CityContentEditor({ cityName }: Props) {
  const [selectedService, setSelectedService] = useState<string>('')

  const getDefaultContent = (service: string) => ({
    heading: `${service} in ${cityName}`,
    content: `Write content for ${service} services in ${cityName}...`
  })

  const current = selectedService
    ? getDefaultContent(selectedService)
    : { heading: '', content: '' }

  return (
    <div>
      <h2>City Content Editor</h2>

      <select
        value={selectedService}
        onChange={(e) => setSelectedService(e.target.value)}
      >
        <option value="">Select service</option>
      </select>

      {selectedService && (
        <div>
          <h3>{current.heading}</h3>
          <textarea defaultValue={current.content} />
        </div>
      )}
    </div>
  )
}
