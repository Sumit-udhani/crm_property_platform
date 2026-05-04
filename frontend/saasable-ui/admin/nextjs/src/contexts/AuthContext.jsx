'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import authService from '@/services/auth.service';

const AuthContext = createContext({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const response = await authService.getMe();
      if (response.success) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    const isDashboardPath = pathname.startsWith('/dashboard');

    if (isDashboardPath) {
      fetchUser();
    } else {
      setLoading(false);
      setUser(null); 
    }
  }, [pathname]);

  const refreshUser = async () => {
    setLoading(true);
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
