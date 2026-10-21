import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="not-found-container" id="not-found-page">
      <div className="not-found-card">
        <h1 className="not-found-code">404</h1>
        <h2>Page Not Found</h2>
        <p>The page you requested could not be located on this platform.</p>
        <Link to="/" className="cta-btn primary-cta">
          <Home size={18} />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
