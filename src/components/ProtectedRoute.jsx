import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({component}) {
//   const isAuthenticated = /* Your authentication logic here */;
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they log in, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return component;
}