/**
 * Protected Dashboard Component
 * Rendered exclusively when a valid JWT token exists and the user is authenticated.
 * Displays user identity, token inspector, live endpoint verification tests,
 * and placement drive statistics.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI, getStoredToken } from '../../services/api';
import {
  ShieldCheck,
  Key,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Building2,
  Briefcase,
  Award,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [decodedToken, setDecodedToken] = useState(null);

  // Decode JWT payload on token change
  useEffect(() => {
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          setDecodedToken({ header, payload });
        }
      } catch (e) {
        console.error('Error decoding JWT token:', e);
      }
    }
  }, [token]);

  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Test GET /api/users/verify
  const handleTestVerify = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const data = await authAPI.verifyToken();
      setTestResult({
        endpoint: 'GET /api/users/verify',
        status: 200,
        success: true,
        data
      });
    } catch (err) {
      setTestResult({
        endpoint: 'GET /api/users/verify',
        status: err.response?.status || 500,
        success: false,
        data: err.response?.data || { error: err.message }
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Test GET /api/users/profile
  const handleTestProfile = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const data = await authAPI.getProfile();
      setTestResult({
        endpoint: 'GET /api/users/profile',
        status: 200,
        success: true,
        data
      });
    } catch (err) {
      setTestResult({
        endpoint: 'GET /api/users/profile',
        status: err.response?.status || 500,
        success: false,
        data: err.response?.data || { error: err.message }
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Test Token Expiry / Invalidation Simulation
  const handleSimulateInvalidToken = () => {
    if (window.confirm('This will corrupt your current session token to simulate an invalid/expired token. You will be redirected to Login. Proceed?')) {
      localStorage.setItem('token', 'invalid_expired_tampered_token_string');
      // Trigger verify which will fail with 401/403
      authAPI.verifyToken().catch(() => {
        logout();
      });
    }
  };

  return (
    <div className="dashboard-container" id="dashboard-page">
      {/* Welcome Banner */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-tag">
            <Sparkles size={16} />
            <span>Authenticated Session Active</span>
          </div>
          <h1 className="hero-title" id="dashboard-welcome-heading">
            Welcome back, {user?.name || 'Student'}! 👋
          </h1>
          <p className="hero-description">
            Your placement tracking dashboard is protected by JSON Web Token (JWT) session security.
            All API requests securely include your Bearer authentication header.
          </p>
        </div>
        <div className="hero-badge-card">
          <div className="badge-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="badge-meta">
            <span className="badge-name">{user?.name}</span>
            <span className="badge-email">{user?.email}</span>
            <span className={`badge-role role-${user?.role || 'student'}`}>
              Role: {user?.role?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Placement Statistics Overview */}
      <div className="metrics-grid">
        <div className="metric-card" id="metric-applied">
          <div className="metric-icon icon-blue">
            <Briefcase size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-value">12</span>
            <span className="metric-label">Applications Submitted</span>
          </div>
        </div>

        <div className="metric-card" id="metric-shortlisted">
          <div className="metric-icon icon-purple">
            <Users size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-value">4</span>
            <span className="metric-label">Shortlisted for Rounds</span>
          </div>
        </div>

        <div className="metric-card" id="metric-interviews">
          <div className="metric-icon icon-amber">
            <Clock size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-value">2</span>
            <span className="metric-label">Interviews Scheduled</span>
          </div>
        </div>

        <div className="metric-card" id="metric-offers">
          <div className="metric-icon icon-emerald">
            <Award size={22} />
          </div>
          <div className="metric-info">
            <span className="metric-value">1</span>
            <span className="metric-label">Placement Offer Received</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Token Inspector & Test Actions */}
      <div className="dashboard-grid">
        {/* JWT Session & Token Inspector Card */}
        <div className="panel-card" id="jwt-inspector-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <Key className="panel-icon" size={20} />
              <h2 className="panel-title">Session Token Inspector</h2>
            </div>
            <button
              type="button"
              className="btn-copy-token"
              id="copy-token-btn"
              onClick={copyToClipboard}
              title="Copy Bearer Token"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Token</span>
                </>
              )}
            </button>
          </div>

          <p className="panel-text">
            Below is the signed JWT stored safely in your browser’s <code>localStorage</code>.
            This token is injected into the <code>Authorization: Bearer &lt;token&gt;</code> header on protected requests.
          </p>

          <div className="token-display-box" id="raw-jwt-display">
            <code>{token ? `${token.substring(0, 36)}...${token.substring(token.length - 20)}` : 'No token found'}</code>
          </div>

          {decodedToken && (
            <div className="decoded-payload-section">
              <h3 className="section-subtitle">Decoded Token Payload:</h3>
              <div className="code-block-wrapper">
                <pre>{JSON.stringify(decodedToken.payload, null, 2)}</pre>
              </div>
              <div className="token-meta-chips">
                <span className="token-chip">
                  Issued At: {new Date(decodedToken.payload.iat * 1000).toLocaleTimeString()}
                </span>
                <span className="token-chip">
                  Expires: {new Date(decodedToken.payload.exp * 1000).toLocaleDateString()} {new Date(decodedToken.payload.exp * 1000).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Authentication Endpoint Sandbox Card */}
        <div className="panel-card" id="api-sandbox-card">
          <div className="panel-header">
            <div className="panel-title-group">
              <ShieldCheck className="panel-icon" size={20} />
              <h2 className="panel-title">Protected API Route Testing</h2>
            </div>
          </div>

          <p className="panel-text">
            Verify real-time communication between React and the backend auth endpoints:
          </p>

          <div className="sandbox-actions">
            <button
              type="button"
              className="action-btn action-verify"
              id="test-verify-btn"
              onClick={handleTestVerify}
              disabled={testLoading}
            >
              <RefreshCw size={16} className={testLoading ? 'spin' : ''} />
              <span>Test GET /api/users/verify</span>
            </button>

            <button
              type="button"
              className="action-btn action-profile"
              id="test-profile-btn"
              onClick={handleTestProfile}
              disabled={testLoading}
            >
              <Building2 size={16} />
              <span>Test GET /api/users/profile</span>
            </button>

            <button
              type="button"
              className="action-btn action-invalidate"
              id="test-invalidate-btn"
              onClick={handleSimulateInvalidToken}
            >
              <AlertTriangle size={16} />
              <span>Simulate Token Invalidation</span>
            </button>
          </div>

          {/* Test Execution Output */}
          {testResult && (
            <div className={`sandbox-result-box ${testResult.success ? 'success' : 'error'}`} id="sandbox-output">
              <div className="result-header">
                <span className="result-endpoint">{testResult.endpoint}</span>
                <span className={`result-status-tag ${testResult.success ? 'ok' : 'fail'}`}>
                  HTTP {testResult.status}
                </span>
              </div>
              <pre className="result-json">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Campus Placement Drives Table */}
      <div className="panel-card table-panel" id="campus-drives-card">
        <div className="panel-header">
          <div className="panel-title-group">
            <Building2 className="panel-icon" size={20} />
            <h2 className="panel-title">Upcoming & Active Placement Drives</h2>
          </div>
          <span className="badge-counter">4 Active Companies</span>
        </div>

        <div className="table-responsive">
          <table className="drives-table" id="placement-drives-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role Offered</th>
                <th>Package (CTC)</th>
                <th>Drive Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="company-cell">
                    <span className="company-icon">🏢</span>
                    <strong>Microsoft</strong>
                  </div>
                </td>
                <td>Software Development Engineer (SDE-1)</td>
                <td>₹ 24 LPA</td>
                <td>Nov 15, 2026</td>
                <td><span className="table-badge badge-shortlisted">Shortlisted</span></td>
                <td><button className="table-action-btn">View Details</button></td>
              </tr>
              <tr>
                <td>
                  <div className="company-cell">
                    <span className="company-icon">🌐</span>
                    <strong>Google</strong>
                  </div>
                </td>
                <td>Associate Cloud Engineer</td>
                <td>₹ 28 LPA</td>
                <td>Nov 22, 2026</td>
                <td><span className="table-badge badge-applied">Applied</span></td>
                <td><button className="table-action-btn">View Details</button></td>
              </tr>
              <tr>
                <td>
                  <div className="company-cell">
                    <span className="company-icon">📦</span>
                    <strong>Amazon</strong>
                  </div>
                </td>
                <td>Graduate Software Developer</td>
                <td>₹ 22 LPA</td>
                <td>Nov 28, 2026</td>
                <td><span className="table-badge badge-interview">Interview Round 2</span></td>
                <td><button className="table-action-btn">Join Meet</button></td>
              </tr>
              <tr>
                <td>
                  <div className="company-cell">
                    <span className="company-icon">🔒</span>
                    <strong>Cisco Systems</strong>
                  </div>
                </td>
                <td>Network & Security Engineer</td>
                <td>₹ 18 LPA</td>
                <td>Dec 05, 2026</td>
                <td><span className="table-badge badge-offered">Offered 🎉</span></td>
                <td><button className="table-action-btn btn-success-action">Accept Offer</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
