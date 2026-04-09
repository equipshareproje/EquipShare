import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [userType, setUserType] = useState('renter'); // 'renter' or 'admin'

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signin } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const user = signin(formData.email, formData.password);

      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('equipshare_remember_email', formData.email);
      } else {
        localStorage.removeItem('equipshare_remember_email');
      }

      // Redirect based on user type and actual role
      if (userType === 'admin') {
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          setErrors({
            submit: 'This account does not have admin privileges.'
          });
          return;
        }
      } else {
        navigate('/marketplace');
      }
    } catch (error) {
      setErrors({
        submit: error.message || 'Failed to sign in. Please check your credentials.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">Sign In</h1>
          <p className="text-text-secondary">Welcome back to EquipShare</p>
        </div>

        {/* User Type Selection */}
        <div className="mb-6 flex gap-3">
          <label className="flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition"
            style={{
              borderColor: userType === 'renter' ? '#003E51' : '#D0DDE2',
              backgroundColor: userType === 'renter' ? '#F4F7F8' : '#FFFFFF'
            }}>
            <input
              type="radio"
              name="userType"
              value="renter"
              checked={userType === 'renter'}
              onChange={(e) => setUserType(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-text-primary">Renter</span>
          </label>
          <label className="flex-1 flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition"
            style={{
              borderColor: userType === 'admin' ? '#003E51' : '#D0DDE2',
              backgroundColor: userType === 'admin' ? '#F4F7F8' : '#FFFFFF'
            }}>
            <input
              type="radio"
              name="userType"
              value="admin"
              checked={userType === 'admin'}
              onChange={(e) => setUserType(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm font-medium text-text-primary">🔐 Admin</span>
          </label>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="mb-6 p-4 rounded-lg bg-error bg-opacity-10 border border-error">
            <p className="text-error text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.email ? 'border-error' : 'border-border'
              }`}
            />
            {errors.email && (
              <p className="text-error text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.password ? 'border-error' : 'border-border'
              }`}
            />
            {errors.password && (
              <p className="text-error text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-text-secondary cursor-pointer">
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-6"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-text-secondary text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent hover:text-primary font-medium">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-surface rounded-lg border border-border">
          <p className="text-xs text-text-secondary font-medium mb-3">💡 Demo Credentials</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold text-text-primary mb-1">Renter Account:</p>
              <p className="text-xs text-text-secondary">
                Email: <span className="font-mono">demo@example.com</span><br />
                Password: <span className="font-mono">TestPass123</span>
              </p>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold text-text-primary mb-1">🔐 Admin Account:</p>
              <p className="text-xs text-text-secondary">
                Email: <span className="font-mono">admin@equipshare.com</span><br />
                Password: <span className="font-mono">AdminPass123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
