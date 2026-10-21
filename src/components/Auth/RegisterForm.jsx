/**
 * Register Form Component
 * Controlled React component managing user registration, input validation,
 * password strength evaluation, role selection, and API integration with JWT storage.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, Shield, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterForm = () => {
  const { register, backendConnected } = useAuth();
  const navigate = useNavigate();

  // Controlled form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Compute password strength score (0 to 4)
  const computePasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = computePasswordStrength(formData.password);

  const getStrengthLabel = (score) => {
    switch (score) {
      case 0: return { label: 'Too short', color: '#94a3b8' };
      case 1: return { label: 'Weak', color: '#ef4444' };
      case 2: return { label: 'Fair', color: '#f59e0b' };
      case 3: return { label: 'Good', color: '#3b82f6' };
      case 4: return { label: 'Strong', color: '#10b981' };
      default: return { label: '', color: '#94a3b8' };
    }
  };

  // Validation routine
  const validate = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Full name must contain at least 2 characters.';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email format (e.g. name@domain.com).';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });

      if (result.success) {
        setSuccessMessage('Registration successful! Account and session created.');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 700);
      } else {
        setApiError(result.error || 'Failed to complete registration.');
      }
    } catch (err) {
      setApiError(err.message || 'An unexpected connection error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card-wrapper" id="register-form-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <UserPlus className="icon" size={28} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Join the Placement Tracking Platform to unlock drives, tests, and career opportunities.
          </p>

          {backendConnected === false && (
            <div className="mock-mode-pill" id="backend-status-indicator-reg">
              <span className="pulsing-dot yellow"></span>
              <span>Standalone Demo Mode (Mock Auth Active)</span>
            </div>
          )}
          {backendConnected === true && (
            <div className="mock-mode-pill connected" id="backend-status-indicator-reg">
              <span className="pulsing-dot green"></span>
              <span>Backend Connected (Port 5000 API)</span>
            </div>
          )}
        </div>

        {/* Alerts */}
        {apiError && (
          <div className="alert-banner alert-error" id="register-error-alert" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <div className="alert-content">
              <strong>Registration Error</strong>
              <span>{apiError}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="alert-banner alert-success" id="register-success-alert" role="alert">
            <CheckCircle size={18} className="alert-icon" />
            <div className="alert-content">
              <strong>Account Created</strong>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="auth-form" id="register-form">
          {/* Full Name */}
          <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="register-name" className="form-label">
              Full Name
            </label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Alex Morgan"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                disabled={isSubmitting}
                required
              />
            </div>
            {errors.name && <span className="field-error" id="register-name-error">{errors.name}</span>}
          </div>

          {/* Email Address */}
          <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
            <label htmlFor="register-email" className="form-label">
              Institution or Personal Email
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="alex.morgan@campus.edu"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                disabled={isSubmitting}
                required
              />
            </div>
            {errors.email && <span className="field-error" id="register-email-error">{errors.email}</span>}
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="register-role" className="form-label">
              Account Role
            </label>
            <div className="input-wrapper">
              <Shield className="input-icon" size={18} />
              <select
                id="register-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input form-select"
                disabled={isSubmitting}
              >
                <option value="student">Student / Job Aspirant</option>
                <option value="recruiter">Corporate Recruiter</option>
                <option value="admin">Placement Officer / Admin</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div className={`form-group ${errors.password ? 'has-error' : ''}`}>
            <label htmlFor="register-password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="register-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                id="toggle-register-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {formData.password && (
              <div className="password-meter-container" id="password-meter">
                <div className="meter-bar-track">
                  <div
                    className="meter-bar-fill"
                    style={{
                      width: `${(passwordStrength / 4) * 100}%`,
                      backgroundColor: getStrengthLabel(passwordStrength).color
                    }}
                  ></div>
                </div>
                <div className="meter-label-row">
                  <span className="meter-caption">Password Strength:</span>
                  <span
                    className="meter-value"
                    style={{ color: getStrengthLabel(passwordStrength).color }}
                  >
                    {getStrengthLabel(passwordStrength).label}
                  </span>
                </div>
              </div>
            )}

            {errors.password && <span className="field-error" id="register-password-error">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className={`form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
            <label htmlFor="register-confirm-password" className="form-label">
              Confirm Password
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                disabled={isSubmitting}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                id="toggle-register-confirm-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="field-error" id="register-confirm-error">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            id="register-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-spinner-wrapper">
                <span className="mini-spinner"></span>
                <span>Creating Account...</span>
              </span>
            ) : (
              <span className="btn-inner">
                <span>Complete Registration</span>
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link" id="switch-to-login">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
