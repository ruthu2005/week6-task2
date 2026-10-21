/**
 * Protected Route Component
 * Guards private routes by verifying active JWT session token and authentication status.
 * Unauthenticated visitors are automatically redirected to the login view with state preservation.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show animated loader while session verification is in-flight
  if (loading) {
    return (
      <div className="auth-loading-screen" id="protected-route-loader">
        <div className="spinner-glow"></div>
        <p className="loading-text">Verifying secure authentication session...</p>
      </div>
    );
  }

  // If not authenticated, redirect to /login and preserve destination in location state
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optional role enforcement check
  if (allowedRoles && allowedRoles.length > 0 && user) {
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="access-denied-container" id="access-denied-view">
          <div className="access-denied-card">
            <span className="denied-icon">🚫</span>
            <h2>Access Restricted</h2>
            <p>
              Your current role (<strong>{user.role}</strong>) does not possess clearance to view this resource.
            </p>
          </div>
        </div>
      );
    }
  }

  // Render children when authorized
  return children;
};

export default ProtectedRoute;
