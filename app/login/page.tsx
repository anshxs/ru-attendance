'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ResetPasswordPage from '@/components/reset-password';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { MagicCard } from '@/components/ui/magic-card';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(formData);
      // Redirect will be handled by useEffect
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Login failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop Layout: Left Half - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black p-10">
        <img 
          src="/college.png" 
          alt="College Campus" 
          className="w-full h-full object-cover rounded-3xl shadow-lg"
        />
        <div className="absolute inset-10 bg-black/30 rounded-3xl"></div>
        {/* Bottom Left Overlay Text */}
        <div className="absolute bottom-32 left-20 z-20">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            Welcome to <br/><AnimatedGradientText>Rishiverse - V2</AnimatedGradientText>
          </h1>
          <p className='mt-3 text-white/50'>If dont know the password, just press reset password</p>
        </div>
      </div>

      {/* Mobile/Desktop Layout: Right Half or Full Width - Form */}
      <div className="flex-1 lg:w-1/2 relative flex items-center justify-center p-4 lg:p-12 lg:bg-black">
        {/* Mobile background image with spacing - only visible on small screens */}
        <div className="lg:hidden absolute inset-4">
          <img 
            src="/college.png" 
            alt="College Campus" 
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
        {/* Mobile gradient overlay - only visible on small screens */}
        <div className="lg:hidden absolute inset-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-2xl"></div>
        
        <div className="relative z-10 w-full max-w-md">
          {/* Mobile Header - only visible on small screens */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              RU Attendance
            </h1>
            <p className="text-white/80">
              {showResetPassword ? 'Reset your password' : 'Sign in to your account'}
            </p>
          </div>

          {/* Desktop Header - only visible on large screens */}
          <div className="hidden lg:block text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Sign In
            </h1>
            <p className="text-white/50">
              {showResetPassword ? 'Reset your password' : 'Welcome back! Please enter your details.'}
            </p>
          </div>

          {showResetPassword ? (
            <div className="lg:bg-transparent">
              <ResetPasswordPage onBack={() => setShowResetPassword(false)} />
            </div>
          ) : (
            <MagicCard className="p-1 rounded-2xl border-gray-200 border">
            <Card className="bg-[#101010] backdrop-blur-sm">
              <CardHeader className="space-y-2 lg:hidden">
                <CardTitle className="text-2xl text-center text-white">
                  Login
                </CardTitle>
                <CardDescription className="text-center text-white">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              
              <CardContent className="lg:pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="text-sm text-white p-2 bg-red-500 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-white/50">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="bg-[#171717] text-white placeholder:text-white/50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-white/50">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="bg-[#171717] text-white placeholder:text-white/50"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </form>

                <div className="mt-3 text-center">
                  <button
                    type="button"
                    className="text-sm text-blue-500 underline font-medium"
                    onClick={() => setShowResetPassword(true)}
                  >
                    Forgot your password?
                  </button>
                </div>
              </CardContent>
            </Card>
            </MagicCard>
          )}
        </div>
      </div>
    </div>
  );
}