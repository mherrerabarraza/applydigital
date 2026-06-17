import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as AuthService from '../services/AuthService';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login', { replace: true });
  };

  // In a real app, you might fetch user-specific data here
  return (
    <div className="page-container">
      <h1>Welcome to your Dashboard!</h1>
      <p>This is a protected page accessible only to authenticated users.</p>
      <p>You have successfully logged in.</p>
      <button className="login-button" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
};

export default DashboardPage;
