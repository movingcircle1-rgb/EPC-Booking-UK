import React, { createContext, useContext, useState } from 'react';
import QuoteForm from '../components/QuoteForm';

type QuoteContextType = {
  openQuote: () => void;
};

const QuoteContext = createContext<QuoteContextType | null>(null);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openQuote = () => setIsOpen(true);
  const closeQuote = () => setIsOpen(false);

  return (
    <QuoteContext.Provider value={{ openQuote }}>
      {children}
      {isOpen && <QuoteForm onClose={closeQuote} />}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) {
    throw new Error('useQuote must be used inside QuoteProvider');
  }
  return ctx;
}

