/**
 * Login Form Component
 * Controlled React component managing user login, input validation,
 * error presentation, password visibility toggle, demo credentials, and API integration.
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginForm = () => {
  const { login, backendConnected } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Target destination after successful login
  const from = location.state?.from?.pathname || '/dashboard';

  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Validate form fields
  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!value.trim()) {
        error = 'Email address is required.';
      } else if (!EMAIL_REGEX.test(value.trim())) {
        error = 'Please enter a valid email format (e.g. name@domain.com).';
      }
    }
    if (name === 'password') {
      if (!value) {
        error = 'Password is required.';
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters.';
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: val }));
    
    // Clear field-level error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    if (fieldError) {
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    // Validate all fields
    const emailErr = validateField('email', formData.email);
    const passErr = validateField('password', formData.password);

    if (emailErr || passErr) {
      setErrors({
        email: emailErr,
        password: passErr
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login({
        email: formData.email.trim(),
        password: formData.password
      });

      if (result.success) {
        setSuccessMessage('Authentication successful! Directing to dashboard...');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 600);
      } else {
        setApiError(result.error || 'Invalid email or password.');
      }
    } catch (err) {
      setApiError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper for evaluator convenience
  const handleQuickFill = (email, password) => {
    setFormData((prev) => ({ ...prev, email, password }));
    setErrors({});
    setApiError(null);
  };

  return (
    <div className="auth-card-wrapper" id="login-form-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <LogIn className="icon" size={28} />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in with your registered credentials to access your placement dashboard.
          </p>
          
          {backendConnected === false && (
            <div className="mock-mode-pill" id="backend-status-indicator">
              <span className="pulsing-dot yellow"></span>
              <span>Standalone Demo Mode (Mock Auth Active)</span>
            </div>
          )}
          {backendConnected === true && (
            <div className="mock-mode-pill connected" id="backend-status-indicator">
              <span className="pulsing-dot green"></span>
              <span>Backend Connected (Port 5000 API)</span>
            </div>
          )}
        </div>

        {/* Feedback Alerts */}
        {apiError && (
          <div className="alert-banner alert-error" id="login-error-alert" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <div className="alert-content">
              <strong>Authentication Error</strong>
              <span>{apiError}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="alert-banner alert-success" id="login-success-alert" role="alert">
            <CheckCircle size={18} className="alert-icon" />
            <div className="alert-content">
              <strong>Success</strong>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="auth-form" id="login-form">
          {/* Email Field */}
          <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="login-email" className="form-label">
              Email Address
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className="form-input"
                disabled={isSubmitting}
                required
              />
            </div>
            {errors.email && <span className="field-error" id="login-email-error">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
            <div className="label-row">
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <button
                type="button"
                className="text-link-btn"
                onClick={() => alert('Password reset is managed through your institution placement administrator.')}
              >
                Forgot password?
              </button>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className="form-input"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                id="toggle-password-visibility"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="field-error" id="login-password-error">{errors.password}</span>}
          </div>

          {/* Remember Me Checkbox */}
          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="rememberMe"
                id="login-remember-me"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">Keep me signed in</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            id="login-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-spinner-wrapper">
                <span className="mini-spinner"></span>
                <span>Authenticating...</span>
              </span>
            ) : (
              <span className="btn-inner">
                <ShieldCheck size={18} />
                <span>Sign In Securely</span>
              </span>
            )}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Section for Mentors / Reviewers */}
        <div className="demo-credentials-box" id="demo-credentials-helper">
          <p className="demo-label">🧪 Quick Test Accounts (Click to Autofill):</p>
          <div className="demo-chips">
            <button
              type="button"
              className="demo-chip"
              id="autofill-student"
              onClick={() => handleQuickFill('student@example.com', 'Password123!')}
            >
              👨‍🎓 Student: student@example.com
            </button>
            <button
              type="button"
              className="demo-chip"
              id="autofill-admin"
              onClick={() => handleQuickFill('admin@example.com', 'Password123!')}
            >
              🛡️ Admin: admin@example.com
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link" id="switch-to-register">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
