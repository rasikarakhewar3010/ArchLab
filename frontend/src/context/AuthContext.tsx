/**
 * AuthContext — Global Authentication State
 * ============================================
 * Manages user authentication across the entire application.
 * Provides login/register/logout functions and current user state.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types';
import {
  loginUser as apiLogin,
  registerUser as apiRegister,
  getCurrentUser,
  setAuthToken,
  getAuthToken,
} from '../services/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, passwordConfirm: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, try to hydrate user from saved token
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      getCurrentUser()
        .then((u) => setUser(u))
        .catch(() => {
          // Token expired or invalid — clear it
          setAuthToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiLogin(username, password);
      setAuthToken(res.token);
      setUser(res.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      // Extract the actual error message from the API response
      if (message.includes('Invalid username or password')) {
        setError('Invalid username or password.');
      } else if (message.includes('Both username and password')) {
        setError('Both username and password are required.');
      } else {
        setError('Login failed. Please try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string, passwordConfirm: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiRegister({ username, email, password, password_confirm: passwordConfirm });
      setAuthToken(res.token);
      setUser(res.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      if (message.includes('username')) {
        setError('This username is already taken.');
      } else if (message.includes('password')) {
        setError('Password issue — check requirements and try again.');
      } else if (message.includes('email')) {
        setError('This email is already registered.');
      } else {
        setError('Registration failed. Please try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      error,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
