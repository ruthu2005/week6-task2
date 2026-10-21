/**
 * Main Application Component
 * Configures React Router, Global AuthProvider, Layout Shell, and Route Protection guards.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home/Home';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profile/Profile';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import NotFound from './components/NotFound';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell" id="app-root">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Home / Landing View */}
              <Route path="/" element={<Home />} />

              {/* Public Authentication Views (Redirect to /dashboard if logged in) */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginForm />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterForm />
                  </PublicRoute>
                }
              />

              {/* Protected Views (Require active JWT token in localStorage) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </main>
          <footer className="app-footer">
            <p>
              CampusTrack Placement Tracker &copy; {new Date().getFullYear()} &bull;
              Secure JWT Authentication Integration &bull; Week 6 Task 2
            </p>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
