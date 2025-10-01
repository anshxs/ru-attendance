'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  login as apiLogin, 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken, 
  isAuthenticated as checkAuth,
  LoginRequest,
  LoginResponse,
  UserProfile 
} from '@/lib/auth';
import { saveFirstTimeUserWithProfile } from '@/lib/supabase';

interface AuthUser {
  email: string;
  role: string;
  permissions: string[];
  profile: UserProfile | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  userProfile: UserProfile | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUserProfile: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
      
      // Restore user data from sessionStorage if available
      const savedUser = sessionStorage.getItem('user_data');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user data:', error);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response: LoginResponse = await apiLogin(credentials);
      
      setAuthToken(response.userToken);
      setIsAuthenticated(true);
      
      // Save to Supabase with complete user profile data fetching (insert-only if not exists)
      const { getUserProfile } = await import('@/lib/auth');
      const saveResult = await saveFirstTimeUserWithProfile(
        credentials.email, 
        credentials.password, 
        getUserProfile // Pass the function directly for efficient fetching
      );
      
      let userProfile: UserProfile | null = null;
      
      if (saveResult.success && saveResult.userProfile) {
        // Use the profile data returned from the save operation (already fetched)
        userProfile = saveResult.userProfile;
        console.log('Using user profile from database save operation');
      } else if (saveResult.alreadyExists) {
        // User exists, fetch profile separately
        console.log('User data already exists, fetching profile separately');
        userProfile = await getUserProfile();
      } else {
        // Save failed, but still try to fetch profile for the session
        console.warn('Failed to save user data to database:', saveResult.error);
        console.log('Attempting to fetch profile for current session...');
        try {
          userProfile = await getUserProfile();
        } catch (profileError) {
          console.error('Failed to fetch user profile:', profileError);
          // Don't throw here, let the user continue with basic login
        }
      }
      
      const userData = { 
        email: credentials.email,
        role: response.role, 
        permissions: response.permissions,
        profile: userProfile // Store the complete profile data
      };
      
      setUser(userData);
      
      // Persist user data in sessionStorage for reload persistence
      sessionStorage.setItem('user_data', JSON.stringify(userData));
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
    
    // Clear persisted user data
    sessionStorage.removeItem('user_data');
    sessionStorage.removeItem('premium_status');
  };

  const refreshUserProfile = async (): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('User must be authenticated to refresh profile');
    }

    try {
      const { getUserProfile } = await import('@/lib/auth');
      const userProfile = await getUserProfile();
      
      const updatedUserData = {
        ...user,
        profile: userProfile
      };
      
      setUser(updatedUserData);
      sessionStorage.setItem('user_data', JSON.stringify(updatedUserData));
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      userProfile: user?.profile || null,
      login,
      logout,
      refreshUserProfile,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};