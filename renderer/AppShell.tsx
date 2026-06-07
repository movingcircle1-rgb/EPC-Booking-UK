import React from 'react'
import { HelmetProvider } from '../src/lib/helmetAsync'
import { AuthProvider } from '../src/contexts/AuthContext'
import { QuoteProvider } from '../src/contexts/QuoteContext'
import Navbar from '../src/components/Navbar'
import Footer from '../src/components/Footer'

type Props = {
  children: React.ReactNode
  helmetContext?: any
  isSsr?: boolean
}

export default function AppShell({ children, helmetContext, isSsr }: Props) {
  const helmetProvider = isSsr ? (
    <HelmetProvider context={helmetContext ?? {}}>{children}</HelmetProvider>
  ) : (
    <HelmetProvider>{children}</HelmetProvider>
  )

  return (
    <AuthProvider>
      <QuoteProvider>
        <Navbar />
        <main>{helmetProvider}</main>
        <Footer />
      </QuoteProvider>
    </AuthProvider>
  )
}
