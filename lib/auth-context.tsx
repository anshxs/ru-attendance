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
      // You could fetch user details here if needed
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response: LoginResponse = await apiLogin(credentials);
      
      setAuthToken(response.userToken);
      setIsAuthenticated(true);
      setUser({ role: response.role, permissions: response.permissions });
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