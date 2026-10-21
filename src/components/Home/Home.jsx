/**
 * Home / Landing Page
 * Introduces the Placement Tracker platform and provides entry points
 * for User Registration, Login, and Protected Route testing.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Key, ArrowRight, CheckCircle2, LayoutDashboard, Terminal } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-container" id="home-view">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-badge">
          <ShieldCheck size={16} />
          <span>Full-Stack Authentication Integration (Week 6 - Task 2)</span>
        </div>
        <h1 className="home-title">
          Connect Frontend to <span className="gradient-text">Backend Authentication</span>
        </h1>
        <p className="home-lead">
          A modern, secure React client seamlessly integrated with Express JWT authentication.
          Experience controlled registration & login forms, safe localStorage token persistence,
          automated Axios Authorization Bearer interceptors, and guarded Protected Routes.
        </p>

        <div className="home-cta-group">
          {isAuthenticated ? (
            <Link to="/dashboard" className="cta-btn primary-cta" id="cta-go-dashboard">
              <LayoutDashboard size={18} />
              <span>Go to Placement Dashboard ({user?.name})</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="cta-btn primary-cta" id="cta-go-login">
                <Lock size={18} />
                <span>Sign In to Your Account</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="cta-btn secondary-cta" id="cta-go-register">
                <span>Create New Account</span>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Architecture Cards */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon icon-cyan">
            <Lock size={24} />
          </div>
          <h3>Controlled Auth Forms</h3>
          <p>
            Validation rules for name, email regex format, password length & strength scoring,
            and password confirmation matching with clear feedback alerts.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon icon-indigo">
            <Key size={24} />
          </div>
          <h3>JWT Bearer Interceptor</h3>
          <p>
            Centralized Axios client in <code>src/services/api.js</code> injecting the Bearer
            token into request headers and handling 401 token expirations gracefully.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon icon-emerald">
            <ShieldCheck size={24} />
          </div>
          <h3>Protected Routing</h3>
          <p>
            Custom <code>&lt;ProtectedRoute&gt;</code> wrapper inspecting session validity and
            redirecting unauthenticated users to <code>/login</code> with preserved destination state.
          </p>
        </div>
      </section>

      {/* Technical Workflow Section */}
      <section className="workflow-section">
        <div className="workflow-card">
          <div className="workflow-header">
            <Terminal size={20} />
            <h2>Authentication Flow Architecture</h2>
          </div>
          <div className="steps-flow">
            <div className="flow-step">
              <div className="step-num">1</div>
              <div className="step-content">
                <strong>User Input & Client Validation</strong>
                <p>Forms validate credentials prior to dispatching network requests.</p>
              </div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="step-num">2</div>
              <div className="step-content">
                <strong>Axios POST Request</strong>
                <p>Sends credentials to backend <code>/api/users/login</code> or <code>/register</code>.</p>
              </div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="step-num">3</div>
              <div className="step-content">
                <strong>Token Storage & State Update</strong>
                <p>JWT saved in browser <code>localStorage</code>; AuthContext updates <code>user</code> state.</p>
              </div>
            </div>
            <div className="flow-arrow">→</div>
            <div className="flow-step">
              <div className="step-num">4</div>
              <div className="step-content">
                <strong>Protected Route Access</strong>
                <p>Access granted to <code>/dashboard</code> with token inspection and verified endpoints.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
