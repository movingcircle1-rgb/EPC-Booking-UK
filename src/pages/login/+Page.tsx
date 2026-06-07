import React, { useEffect } from 'react'

export default function Page() {
  useEffect(() => {
    window.location.replace('/portal/login')
  }, [])

  return null
}
