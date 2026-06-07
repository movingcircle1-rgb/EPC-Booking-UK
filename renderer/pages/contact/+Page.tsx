// renderer/pages/contact/+Page.tsx
import React from 'react'
import ContactPage from '../../../src/pages/ContactPage'
import { useQuote } from '../../../src/contexts/QuoteContext'

export { Page }

function Page() {
  const { openQuote } = useQuote()

  return <ContactPage onGetQuote={openQuote} />
}
