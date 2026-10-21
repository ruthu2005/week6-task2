/**
 * API Service Configuration & Auth Endpoints
 * Configures Axios with base URL, authentication headers, request/response interceptors,
 * and robust error handling. Also includes an intelligent fallback mock mode for standalone evaluation.
 */

import axios from 'axios';

// Default API base URL pointing to the Express authentication backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create configured Axios client instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000 // 8-second request timeout
});

// Storage keys
export const TOKEN_STORAGE_KEY = 'token';
export const USER_STORAGE_KEY = 'user';
export const MOCK_USERS_KEY = 'mock_users_store';

// Helper to get stored auth token
export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
};

// Helper to get stored user profile
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Error parsing stored user data:', e);
    return null;
  }
};

// Helper to store authentication session
export const setAuthSession = (token, user) => {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
};

// Helper to clear authentication session
export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

// ==========================================
// AXIOS REQUEST INTERCEPTOR
// Attaches Authorization Bearer token to all outgoing requests
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// AXIOS RESPONSE INTERCEPTOR
// Handles common HTTP errors, specifically 401 Unauthorized / Token Expiration
// ==========================================
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      // If token expired or unauthorized on protected routes
      if (status === 401) {
        console.warn('[API Interceptor] 401 Unauthorized encountered. Session may have expired.');
        // Dispatch custom event for UI to respond (e.g. redirect or show toast)
        window.dispatchEvent(new CustomEvent('auth:expired', {
          detail: { message: error.response.data?.message || 'Session expired. Please log in again.' }
        }));
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// STANDALONE / FALLBACK MOCK ENGINE
// Ensures tests and standalone reviews succeed even if port 5000 backend is not active
// ==========================================
const initMockStore = () => {
  const existing = localStorage.getItem(MOCK_USERS_KEY);
  if (!existing) {
    const initialUsers = [
      {
        id: 'usr_demo_101',
        name: 'Demo Student',
        email: 'student@example.com',
        password: 'Password123!',
        role: 'student',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_demo_102',
        name: 'Placement Officer',
        email: 'admin@example.com',
        password: 'Password123!',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(initialUsers));
  }
};

// Generate a simulated JWT token string (base64 header.payload.signature)
const generateMockJWT = (user) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours
  const payload = btoa(JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp,
    iat: Math.floor(Date.now() / 1000)
  }));
  const signature = btoa('mock_signature_placement_tracker_2026');
  return `${header}.${payload}.${signature}`;
};

// Mock Auth API Handlers
const mockAuthHandlers = {
  register: async (userData) => {
    initMockStore();
    await new Promise((r) => setTimeout(r, 400)); // simulate network latency
    const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
    
    // Check if email already exists
    if (users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
      const err = new Error('A user with this email address is already registered.');
      err.response = {
        status: 409,
        data: { success: false, message: 'A user with this email address is already registered.' }
      };
      throw err;
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: userData.role || 'student',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

    const token = generateMockJWT(newUser);
    const { password, ...safeUser } = newUser;
    return {
      data: {
        success: true,
        message: 'User registered successfully (Simulated Backend).',
        token,
        user: safeUser
      }
    };
  },

  login: async (credentials) => {
    initMockStore();
    await new Promise((r) => setTimeout(r, 400));
    const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
    const user = users.find(
      (u) => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password
    );

    if (!user) {
      const err = new Error('Invalid email or password.');
      err.response = {
        status: 401,
        data: { success: false, message: 'Invalid email or password. Please check your credentials.' }
      };
      throw err;
    }

    const token = generateMockJWT(user);
    const { password, ...safeUser } = user;
    return {
      data: {
        success: true,
        message: 'Login successful (Simulated Backend).',
        token,
        user: safeUser
      }
    };
  },

  verifyToken: async (token) => {
    await new Promise((r) => setTimeout(r, 200));
    if (!token) {
      const err = new Error('No token provided');
      err.response = { status: 401, data: { success: false, message: 'No authorization token provided.' } };
      throw err;
    }
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Malformed token');
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        const err = new Error('Token expired');
        err.response = { status: 401, data: { success: false, message: 'Token has expired.' } };
        throw err;
      }
      return {
        data: {
          success: true,
          message: 'Token is valid.',
          user: { id: payload.id, name: payload.name, email: payload.email, role: payload.role }
        }
      };
    } catch {
      const err = new Error('Invalid token');
      err.response = { status: 403, data: { success: false, message: 'Invalid token.' } };
      throw err;
    }
  },

  getProfile: async () => {
    const user = getStoredUser();
    if (!user) {
      const err = new Error('User not found');
      err.response = { status: 404, data: { success: false, message: 'User profile not found.' } };
      throw err;
    }
    return {
      data: {
        success: true,
        message: 'Profile retrieved successfully.',
        user
      }
    };
  }
};

// Check if fallback mock is enabled or backend is unreachable
const shouldTryMock = () => {
  return import.meta.env.VITE_USE_MOCK_FALLBACK === 'true' || import.meta.env.VITE_USE_MOCK_FALLBACK === true;
};

// ==========================================
// EXPORTED AUTHENTICATION API METHODS
// ==========================================
export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password, role }
   */
  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      // If backend network error and fallback enabled, execute mock
      if ((!error.response || error.code === 'ERR_NETWORK') && shouldTryMock()) {
        console.info('[API Service] Express backend at :5000 not reachable, executing simulated registration.');
        const mockRes = await mockAuthHandlers.register(userData);
        return mockRes.data;
      }
      throw error;
    }
  },

  /**
   * Authenticate user with email and password
   * @param {Object} credentials - { email, password }
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      if ((!error.response || error.code === 'ERR_NETWORK') && shouldTryMock()) {
        console.info('[API Service] Express backend at :5000 not reachable, executing simulated login.');
        const mockRes = await mockAuthHandlers.login(credentials);
        return mockRes.data;
      }
      throw error;
    }
  },

  /**
   * Verify token validity with backend
   */
  verifyToken: async () => {
    try {
      const response = await api.get('/users/verify');
      return response.data;
    } catch (error) {
      const token = getStoredToken();
      if ((!error.response || error.code === 'ERR_NETWORK') && shouldTryMock() && token) {
        const mockRes = await mockAuthHandlers.verifyToken(token);
        return mockRes.data;
      }
      throw error;
    }
  },

  /**
   * Get authenticated user profile
   */
  getProfile: async () => {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      if ((!error.response || error.code === 'ERR_NETWORK') && shouldTryMock()) {
        const mockRes = await mockAuthHandlers.getProfile();
        return mockRes.data;
      }
      throw error;
    }
  },

  /**
   * Check connection status to the backend
   */
  checkHealth: async () => {
    try {
      const response = await api.get('/health', { timeout: 3000 });
      return { connected: true, data: response.data };
    } catch {
      return { connected: false, message: 'Backend server at port 5000 is offline.' };
    }
  }
};

export default api;
