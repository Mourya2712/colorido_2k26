import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { adminLogin } from '../lib/api';

interface AdminUser { id: string; email: string; name: string; role: string; }

interface AuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try {
      const stored = localStorage.getItem('colorido_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('colorido_admin_token')
  );

  const login = useCallback(async (email: string, password: string) => {
    const res = await adminLogin(email, password);
    const { token: newToken, admin: adminData } = res.data;
    setToken(newToken);
    setAdmin(adminData);
    localStorage.setItem('colorido_admin_token', newToken);
    localStorage.setItem('colorido_admin_user', JSON.stringify(adminData));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('colorido_admin_token');
    localStorage.removeItem('colorido_admin_user');
  }, []);

  return (
    <AuthContext.Provider value={{ admin, token, isAuthenticated: !!token && !!admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
