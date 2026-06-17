import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="page-container">
      <h1>Welcome to the Home Page!</h1>
      <p>This is a public page accessible to all users.</p>
      <p>
        To access protected content, please <Link to="/login">Log In</Link>.
      </p>
    </div>
  );
};

export default HomePage;
