import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user, fetchMe } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && !user) fetchMe();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
