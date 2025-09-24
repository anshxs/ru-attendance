'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  login as apiLogin, 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken, 
  isAuthenticated as checkAuth,
  LoginRequest,
  LoginResponse 
} from '@/lib/auth';
import { saveUserData } from '@/lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
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
      
      const userData = { 
        email: credentials.email,
        role: response.role, 
        permissions: response.permissions 
      };
      
      setUser(userData);
      
      // Persist user data in sessionStorage for reload persistence
      sessionStorage.setItem('user_data', JSON.stringify(userData));
      
      // Also save to Supabase (insert-only if not exists)
      await saveUserData(credentials.email, credentials.password);
      
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

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout,
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