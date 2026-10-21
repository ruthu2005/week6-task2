/**
 * Navigation Bar Component
 * Displays brand logo, navigation links, authenticated user summary badge,
 * backend connection health badge, and logout trigger.
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, User, LayoutDashboard, Shield, Wifi, WifiOff } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, backendConnected } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-header" id="main-navigation">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" id="nav-brand-link">
          <div className="brand-logo-icon">
            <GraduationCap size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">CampusTrack</span>
            <span className="brand-subtitle">Placement Portal</span>
          </div>
        </Link>

        {/* Backend Connectivity Status Pill */}
        <div className="navbar-status-indicator" title={backendConnected ? 'Connected to Express port 5000' : 'Offline / Standalone mock mode'}>
          {backendConnected ? (
            <span className="status-pill status-online" id="nav-backend-online">
              <Wifi size={14} />
              <span>Backend Connected</span>
            </span>
          ) : (
            <span className="status-pill status-standalone" id="nav-backend-standalone">
              <WifiOff size={14} />
              <span>Standalone Mode</span>
            </span>
          )}
        </div>

        {/* Navigation Links & User Action */}
        <nav className="navbar-nav">
          {isAuthenticated ? (
            <div className="nav-authenticated-group">
              <Link to="/dashboard" className="nav-link" id="nav-dashboard-link">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <Link to="/profile" className="nav-link" id="nav-profile-link">
                <User size={18} />
                <span>Profile & Token</span>
              </Link>

              {/* User Identity Chip */}
              <div className="user-profile-chip" id="nav-user-chip">
                <div className="user-avatar-circle">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-chip-details">
                  <span className="user-chip-name">{user?.name || 'User'}</span>
                  <span className={`user-role-badge role-${user?.role || 'student'}`}>
                    {user?.role || 'student'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="btn-logout"
                id="nav-logout-btn"
                title="Sign out of account"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="nav-guest-group">
              <Link to="/login" className="nav-link nav-btn-outline" id="nav-login-link">
                Sign In
              </Link>
              <Link to="/register" className="nav-link nav-btn-primary" id="nav-register-link">
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
