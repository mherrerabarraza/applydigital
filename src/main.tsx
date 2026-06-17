/**
 * @fileoverview Main entry point for the React application.
 * It initializes the React root, sets up the BrowserRouter for client-side routing,
 * and renders the main App component.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import './App.css'; // Keep App.css for existing styles if it contains global app-specific layout

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
