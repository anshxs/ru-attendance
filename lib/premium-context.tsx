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
      
      // Check cached status first
      const cachedStatus = sessionStorage.getItem('premium_status');
      const cachedTime = sessionStorage.getItem('premium_status_time');
      
      // If we have cached data less than 5 minutes old, use it
      if (cachedStatus && cachedTime) {
        const timeDiff = Date.now() - parseInt(cachedTime);
        if (timeDiff < 5 * 60 * 1000) { // 5 minutes
          console.log('Using cached premium status:', cachedStatus);
          setIsPremium(cachedStatus === 'true');
          setIsLoading(false);
          return;
        }
      }
      
      // Otherwise, fetch from database
      console.log('Checking premium status for:', user.email);
      const premiumStatus = await checkUserPremiumStatus(user.email);
      console.log('Premium status result:', premiumStatus);
      setIsPremium(premiumStatus);
      
      // Cache the result
      sessionStorage.setItem('premium_status', premiumStatus.toString());
      sessionStorage.setItem('premium_status_time', Date.now().toString());
      
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