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

  // Show nothing while loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If requiredRole is specified, check if user has that role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  return element;
};

export default ProtectedRoute;
