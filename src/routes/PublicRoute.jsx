/**
 * Public Route Component
 * For routes like /login and /register.
 * Redirects already authenticated users to the dashboard so they don't see login forms again.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="spinner-glow"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // If user was redirected here from a protected page, navigate back to it, else dashboard
    const destination = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
};

export default PublicRoute;
