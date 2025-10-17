/**
 * Lovable Authentication Provider
 * Wraps the app with authentication context using Lovable Cloud
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import lovableAuthService, { User } from '../../services/lovable-auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const LovableAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        const currentUser = await lovableAuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const unsubscribe = lovableAuthService.onAuthStateChange((newUser) => {
      setUser(newUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await lovableAuthService.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signOut,
    isAuthenticated: user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useLovableAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useLovableAuth must be used within LovableAuthProvider');
  }
  return context;
};


