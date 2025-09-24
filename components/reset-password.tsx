'use client';

import React, { useState } from 'react';
import { resetPasswordRequest } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';

interface ResetPasswordPageProps {
  onBack: () => void;
}

export default function ResetPasswordPage({ onBack }: ResetPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPasswordRequest({ email });
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Reset password request failed:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to send reset password email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="bg-[#171717] backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-400 text-sm">
                We've sent a password reset link to <strong className="text-white">{email}</strong>
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Please check your inbox and follow the instructions to reset your password.
              </p>
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#171717] backdrop-blur-sm shadow-xl">
      <CardHeader className="space-y-2">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-gray-400 hover:text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl text-white">
            Reset Password
          </CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Enter your email address and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-800 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="reset-email" className="text-sm font-medium text-white/50">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="reset-email"
                name="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-[#171717] text-white placeholder:text-gray-400 pl-10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Reset Link
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}