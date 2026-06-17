import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

/**
 * AppLayout component provides the overall layout structure for the application.
 * It includes a Header and renders child routes via `Outlet`.
 */
const AppLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="app-main-content">
        <Outlet /> {/* This is where nested routes will render */}
      </main>
      {/* Footer or other global elements can go here */}
    </div>
  );
};

export default AppLayout;
