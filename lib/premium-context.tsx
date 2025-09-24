'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { checkUserPremiumStatus } from './supabase';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  refreshPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const refreshPremiumStatus = async () => {
    if (!user?.email) {
      setIsPremium(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Checking premium status for:', user.email);
      const premiumStatus = await checkUserPremiumStatus(user.email);
      console.log('Premium status result:', premiumStatus);
      setIsPremium(premiumStatus);
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPremiumStatus();
  }, [user?.email]);

  const value: PremiumContextType = {
    isPremium,
    isLoading,
    refreshPremiumStatus,
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