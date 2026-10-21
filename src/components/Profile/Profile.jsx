/**
 * User Profile & Session Security View
 * Protected route displaying detailed user account parameters, role badges,
 * active storage keys, and explicit token revocation triggers.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { User, Shield, Mail, Calendar, Key, CheckCircle2, RefreshCw } from 'lucide-react';

const Profile = () => {
  const { user, token, logout } = useAuth();
  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchFreshProfile = async () => {
      setLoading(true);
      try {
        const res = await authAPI.getProfile();
        if (res.user) {
          setProfileData(res.user);
        }
      } catch (e) {
        console.warn('Could not refresh profile:', e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFreshProfile();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await authAPI.getProfile();
      if (res.user) {
        setProfileData(res.user);
        setMessage('Profile data synced with backend server.');
      }
    } catch {
      setMessage('Failed to refresh profile from backend.');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="profile-container" id="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {profileData?.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-titles">
            <h1 className="profile-name" id="profile-full-name">{profileData?.name}</h1>
            <p className="profile-email">{profileData?.email}</p>
            <span className={`role-pill role-${profileData?.role || 'student'}`}>
              {profileData?.role ? profileData.role.toUpperCase() : 'STUDENT'}
            </span>
          </div>
          <button
            type="button"
            className="btn-refresh-profile"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {message && (
          <div className="profile-alert">
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        <div className="profile-details-grid">
          <div className="detail-item">
            <div className="detail-icon"><User size={18} /></div>
            <div className="detail-content">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{profileData?.name}</span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon"><Mail size={18} /></div>
            <div className="detail-content">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{profileData?.email}</span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon"><Shield size={18} /></div>
            <div className="detail-content">
              <span className="detail-label">Assigned Role</span>
              <span className="detail-value">{profileData?.role || 'Student'}</span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon"><Key size={18} /></div>
            <div className="detail-content">
              <span className="detail-label">User Identifier (ID)</span>
              <span className="detail-value mono">{profileData?.id || 'usr_auto'}</span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon"><Calendar size={18} /></div>
            <div className="detail-content">
              <span className="detail-label">Account Created</span>
              <span className="detail-value">
                {profileData?.createdAt
                  ? new Date(profileData.createdAt).toLocaleDateString()
                  : 'Active Session'}
              </span>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon"><Key size={18} /></div>
            <div className="detail-content">
              <span className="detail-label">Session Token Status</span>
              <span className="detail-value status-active">Valid & Protected</span>
            </div>
          </div>
        </div>

        <div className="profile-security-box">
          <h3>Session Security Details</h3>
          <p>
            Your authentication token is stored under key <code>'token'</code> in <code>localStorage</code>.
            Each request carries this token in the HTTP <code>Authorization: Bearer</code> header.
          </p>
          <div className="security-actions">
            <button
              type="button"
              className="btn-danger-logout"
              onClick={logout}
              id="profile-logout-btn"
            >
              Terminate Session & Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
