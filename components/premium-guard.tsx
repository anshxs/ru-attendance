'use client';

import React from 'react';
import { usePremium } from '@/lib/premium-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PremiumGuard({ children, fallback }: PremiumGuardProps) {
  const { isPremium, isLoading } = usePremium();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isPremium) {
    return fallback || <PremiumRequired />;
  }

  return <>{children}</>;
}

function PremiumRequired() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <Card className="max-w-md w-full bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Crown className="h-8 w-8 text-black" />
          </div>
          <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            Premium Feature
            <Sparkles className="h-6 w-6 text-yellow-400" />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-zinc-300">
            This feature is exclusive to premium users. Upgrade your account to unlock advanced features and enhanced functionality.
          </p>
          
          <div className="bg-black/50 rounded-lg p-4 border border-yellow-500/20">
            <h4 className="text-yellow-400 font-semibold mb-2">👑 Premium Benefits:</h4>
            <ul className="text-sm text-zinc-300 space-y-1 text-left">
              <li>• Advanced Calendar Features</li>
              <li>• Administrative Gatepass Management</li>
              <li>• Priority Support</li>
              <li>• Early Access to New Features</li>
            </ul>
          </div>

          <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Button>

          <p className="text-xs text-zinc-500">
            Contact admin to upgrade your account
          </p>
        </CardContent>
      </Card>
    </div>
  );
}