'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  // Since we can't check premium status from the app anymore,
  // this will always be false. Premium status should be managed
  // directly in the database and features controlled server-side.
  const [isPremium] = useState(false);
  const [isLoading] = useState(false);

  const value: PremiumContextType = {
    isPremium,
    isLoading,
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}