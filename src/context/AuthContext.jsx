/**
 * Authentication Context & Provider
 * Manages global user authentication state, session persistence in localStorage,
 * login/registration actions, token verification, and session teardown.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  authAPI,
  getStoredToken,
  getStoredUser,
  setAuthSession,
  clearAuthSession
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendConnected, setBackendConnected] = useState(null);

  // Check backend server connectivity
  const verifyBackendHealth = useCallback(async () => {
    try {
      const health = await authAPI.checkHealth();
      setBackendConnected(health.connected);
    } catch {
      setBackendConnected(false);
    }
  }, []);

  // Validate session on initial application mount
  useEffect(() => {
    const initializeAuth = async () => {
      await verifyBackendHealth();
      const storedToken = getStoredToken();

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const verifyRes = await authAPI.verifyToken();
        if (verifyRes.success && verifyRes.user) {
          setUser(verifyRes.user);
          setToken(storedToken);
          setAuthSession(storedToken, verifyRes.user);
        } else {
          // Token rejected
          clearAuthSession();
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('[AuthContext] Session token verification failed:', err.message);
        clearAuthSession();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for global auth expiration events from Axios interceptor
    const handleAuthExpired = (event) => {
      console.warn('[AuthContext] Session expired notification received');
      clearAuthSession();
      setUser(null);
      setToken(null);
      setError(event.detail?.message || 'Session expired. Please sign in again.');
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [verifyBackendHealth]);

  /**
   * Login user with credentials
   * @param {Object} credentials - { email, password }
   */
  const login = async (credentials) => {
    setError(null);
    try {
      const data = await authAPI.login(credentials);
      if (data.token && data.user) {
        setAuthSession(data.token, data.user);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user, token: data.token };
      }
      throw new Error(data.message || 'Login failed');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please verify your credentials.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  /**
   * Register new user account
   * @param {Object} userData - { name, email, password, role }
   */
  const register = async (userData) => {
    setError(null);
    try {
      const data = await authAPI.register(userData);
      if (data.token && data.user) {
        setAuthSession(data.token, data.user);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user, token: data.token };
      }
      throw new Error(data.message || 'Registration failed');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Registration could not be completed.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  /**
   * Logout user and revoke local session
   */
  const logout = () => {
    clearAuthSession();
    setUser(null);
    setToken(null);
    setError(null);
  };

  /**
   * Clear any active error banner
   */
  const clearError = () => setError(null);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    error,
    backendConnected,
    login,
    register,
    logout,
    clearError,
    checkBackend: verifyBackendHealth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook to consume AuthContext safely
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
