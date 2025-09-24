import React from 'react';
import { usePremium } from '@/lib/premium-context';
import { Button } from './ui/button';

interface DataSyncProps {
  userEmail?: string;
  className?: string;
}

export const DataSync: React.FC<DataSyncProps> = ({ userEmail, className = '' }) => {
  const { isPremium, isLoading, refreshPremiumStatus } = usePremium();

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm text-zinc-400">
        <p>✅ Profile data syncs automatically on login</p>
        <p className="text-xs text-zinc-500">
          Premium Status: {isLoading ? 'Checking...' : (isPremium ? '👑 Premium' : '⭐ Standard')}
        </p>
      </div>
      
      <Button
        onClick={refreshPremiumStatus}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        {isLoading ? 'Checking...' : 'Refresh Status'}
      </Button>
    </div>
  );
};