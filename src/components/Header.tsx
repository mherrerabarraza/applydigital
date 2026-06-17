import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as AuthService from '../services/AuthService';

/**
 * Header component for the application.
 * Contains the main navigation and the login/logout icon.
 */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = AuthService.isAuthenticated();

  const handleLoginClick = () => {
    if (isLoggedIn) {
      // If already logged in, clicking the icon could go to dashboard or profile
      // For this spec, we'll assume it doesn't do anything specific, or perhaps logs out
      // As per spec, "Login to the icon mentioned. When clicking in the icon it will redirect to the new login"
      // So, if already logged in, the icon may serve a different purpose (e.g., profile)
      // or simply not redirect to login. For now, if logged in, clicking the icon won't redirect to login.
      // A full logout flow would be a separate button.
      console.log('Already logged in. Login icon click ignored for now.');
      navigate('/dashboard'); // Example: redirect to dashboard if already logged in
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="app-header">
      <nav>
        <Link to="/" className="app-title">My App</Link>
        <div className="nav-actions">
          <button
            type="button"
            className="login-icon"
            aria-label={isLoggedIn ? "Dashboard" : "Login"}
            title={isLoggedIn ? "Dashboard" : "Login"}
            onClick={handleLoginClick}
          >
            {/* Existing SVG content for the login icon */}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"></path>
              <path d="M4.5 18.25a6.5 6.5 0 0 1 13 0v.25h-13v-.25Z"></path>
              <path d="M19.5 12.5h-4"></path>
              <path d="m17.75 10.75 1.75 1.75-1.75 1.75"></path>
            </svg>
          </button>
          {/* Add a separate logout button if needed for clarity alongside the login icon behavior */}
        </div>
      </nav>
    </header>
  );
};

export default Header;
