import React, {useContext, useEffect } from 'react';
import { useNavigate, Route, useLocation} from 'react-router-dom';
import { AuthContext } from './AuthContext';
/*
To use: <ProtectedRoute element={} path=""/>
*/


export default function RouteGuard({children}) {
  const {userInfo: {isAuthenticated}} = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to /login and save the intended location they were trying to access
      navigate("/login", { state: { from: location.pathname }, replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  // Only render children if authenticated
  return isAuthenticated ? children : null;
}