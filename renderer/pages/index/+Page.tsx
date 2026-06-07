// renderer/pages/index/+Page.tsx
import React from 'react'
import HomePage from '../../../src/pages/HomePage'
import { useQuote } from '../../../src/contexts/QuoteContext'

export { Page }

function Page() {
  const { openQuote } = useQuote()

  return (
    <HomePage
      onNavigate={(page: string) => {
        window.location.href = page
      }}
      onGetQuote={openQuote}
    />
  )
}
