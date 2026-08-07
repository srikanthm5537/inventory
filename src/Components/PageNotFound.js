import React from 'react';
import { Link } from 'react-router-dom';
import './PageNotFound.css';

function PageNotFound() {
  return (
    <div className="page-not-found">
      <div className="page-not-found-card">
        <p className="page-not-found-code">404</p>
        <h1 className="page-not-found-title">Page Not Found</h1>
        <p className="page-not-found-text">
          The page you are looking for doesn’t exist or has been moved.
          Please check the URL or return to the main page.
        </p>
        <Link to="/" className="page-not-found-link">
          Back To Main Page
        </Link>
      </div>
    </div>
  );
}

export default PageNotFound;