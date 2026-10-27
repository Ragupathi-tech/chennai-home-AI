import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../services/types';
import { authApi } from '../services/api';
import i18n from '../i18n/i18n';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  register: (name: string, email: string, pass: string, lang?: string) => Promise<void>;
  logout: () => void;
  updateUserLanguage: (lang: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_EMAIL = 'karthik.chennai@example.com';
const DEMO_PASS = 'SecurePassword123!';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('chennaihome_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and check current token
  const loadUser = useCallback(async () => {
    const savedToken = localStorage.getItem('chennaihome_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await authApi.getMe();
      setUser(me);
      if (me.preferred_language && me.preferred_language !== i18n.language) {
        i18n.changeLanguage(me.preferred_language);
      }
    } catch {
      // Invalid/expired token
      localStorage.removeItem('chennaihome_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, pass: string) => {
    const data = await authApi.login(email, pass);
    localStorage.setItem('chennaihome_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    if (data.user.preferred_language) {
      i18n.changeLanguage(data.user.preferred_language);
    }
  };

  const loginAsDemo = async () => {
    try {
      await login(DEMO_EMAIL, DEMO_PASS);
    } catch {
      // If demo user wasn't registered yet, register first
      try {
        const reg = await authApi.register('Karthik Subramanian', DEMO_EMAIL, DEMO_PASS, 'en');
        localStorage.setItem('chennaihome_token', reg.access_token);
        setToken(reg.access_token);
        setUser(reg.user);
      } catch (regErr) {
        console.error('Demo registration failed:', regErr);
      }
    }
  };

  const register = async (name: string, email: string, pass: string, lang = 'en') => {
    const data = await authApi.register(name, email, pass, lang);
    localStorage.setItem('chennaihome_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    i18n.changeLanguage(lang);
  };

  const logout = () => {
    localStorage.removeItem('chennaihome_token');
    setToken(null);
    setUser(null);
  };

  const updateUserLanguage = async (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('chennaihome_lang', lang);
    if (user && token) {
      try {
        const updated = await authApi.updateLanguage(lang);
        setUser(updated);
      } catch (e) {
        console.warn('Failed to update language on backend:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
        updateUserLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
