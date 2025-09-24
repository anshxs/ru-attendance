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

  const syncUserData = async () => {
    if (!userEmail) {
      setStatus('No user email provided');
      return;
    }

    setIsLoading(true);
    setStatus('Starting profile sync...');

    try {
      // Get user profile
      setStatus('Fetching user profile...');
      const userProfile = await getUserProfile();

      // Save to Supabase (insert only - will not update if already exists)
      setStatus('Saving to database...');
      const result = await saveUserData(
        userEmail,
        'password_from_login', // This should be the actual password from login
        userProfile
      );

      if (result.success) {
        setStatus('✅ Profile synced successfully!');
      } else {
        setStatus(`❌ Sync failed: ${result.error}`);
      }
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
      console.error('Profile sync error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Button 
        onClick={syncUserData}
        disabled={isLoading || !userEmail}
        variant="outline"
        size="sm"
      >
        {isLoading ? 'Syncing...' : 'Sync Profile Data'}
      </Button>

      {status && (
        <p className={`text-sm ${
          status.includes('✅') ? 'text-green-600' : 
          status.includes('❌') ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {status}
        </p>
      )}
    </div>
  );
};