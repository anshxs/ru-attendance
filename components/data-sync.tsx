import React, { useState } from 'react';
import { Button } from './ui/button';
import { getUserProfile } from '@/lib/auth';
import { saveUserData } from '@/lib/supabase';

interface DataSyncProps {
  userEmail?: string;
  className?: string;
}

export const DataSync: React.FC<DataSyncProps> = ({ userEmail, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm text-zinc-400">
        <p>✅ Profile data syncs automatically on login</p>
        <p className="text-xs text-zinc-500">No manual sync needed</p>
      </div>
    </div>
  );
};