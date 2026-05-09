import React, { createContext, useContext, useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

// Funkcja służy do przechowywania i udostępniania stanu autoryzacji aplikacji.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const s = localStorage.getItem('user');
    return s ? JSON.parse(s) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  // Funkcja służy do logowania użytkownika i zapisywania tokenu w localStorage.
  const login = async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    const { access_token, user: u } = res.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(access_token);
    setUser(u);
  };

  // Funkcja służy do rejestrowania użytkownika i zapisywania tokenu w localStorage.
  const register = async (email: string, name: string, password: string) => {
    const res = await apiRegister({ email, name, password });
    const { access_token, user: u } = res.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(access_token);
    setUser(u);
  };

  // Funkcja służy do wylogowania użytkownika i wyczyszczenia danych sesji.
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, login, register, logout,
      isAdmin: user?.role === 'ADMIN',
      isGuest: !user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Funkcja służy do pobierania kontekstu autoryzacji w komponentach.
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
