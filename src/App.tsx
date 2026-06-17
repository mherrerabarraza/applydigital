/**
 * @fileoverview Main application component setting up client-side routing.
 * This component defines the top-level routes and their corresponding components,
 * including lazy loading for performance.
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import * as AuthService from './services/AuthService'; // Import AuthService for route protection

// Lazy load components for better performance (NFR-001, PT-001)
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// A simple wrapper for protected routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!AuthService.isAuthenticated()) {
    return <LoginPage />; // Or redirect to login page
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          {/* Protected route example */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          {/* Add more routes here */}
          <Route path="*" element={<div className="page-container"><h2>404: Page Not Found</h2></div>} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
