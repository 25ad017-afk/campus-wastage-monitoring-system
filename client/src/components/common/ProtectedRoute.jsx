import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

/**
 * Route guard component protecting private views and enforcing Role-Based Access Control
 * @param {Array} allowedRoles List of roles permitted: ['STUDENT', 'STAFF', 'CLEANING_STAFF', 'ADMIN']
 */
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullScreen message="Verifying session security..." />;
  }

  // Not logged in -> Redirect to login and preserve intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalize role aliases (Treat 'STAFF' and 'CLEANING_STAFF' as identical)
  const normalizeRole = (r) => (r === 'CLEANING_STAFF' ? 'STAFF' : r);
  const currentRole = normalizeRole(role);

  if (allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map(normalizeRole);
    if (!normalizedAllowed.includes(currentRole)) {
      // Role mismatch -> Redirect to 403 Forbidden screen
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
