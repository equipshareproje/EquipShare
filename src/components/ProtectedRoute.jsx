import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component that restricts access based on user role
 * @param {React.ComponentType} element - The component to render
 * @param {string} requiredRole - The required role (e.g., 'admin', 'lender')
 * @param {string} fallbackPath - Path to redirect to if unauthorized (default: '/signin')
 */
const ProtectedRoute = ({ element, requiredRole, fallbackPath = '/signin' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary text-sm">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  const userRole = user?.role || '';

  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface px-4">
        <div className="bg-white border border-border rounded-xl shadow-md p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Access Restricted</h2>
          <p className="text-text-secondary mb-4">
            You do not have permission to view this page.
          </p>
          <p className="text-sm text-text-secondary">
            Required role: <span className="font-semibold text-text-primary">{requiredRole}</span>
          </p>
        </div>
      </div>
    );
  }

  return element;
};

export default ProtectedRoute;