import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bio: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (formData.bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Profile update API endpoint is not yet available on the backend.
    setErrors({ submit: 'Profile editing is not yet supported. Please contact support to update your details.' });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">My Profile</h1>
            <p className="text-text-secondary">Manage your account information</p>
          </div>

          {/* User Info Display */}
          <div className="mb-8 p-4 bg-surface rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary">Email</p>
                <p className="text-lg font-medium text-text-primary">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Role</p>
                <p className="text-lg font-medium text-text-primary capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Account Status</p>
                <p className="text-lg font-medium">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user.verified ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                  }`}>
                    {user.verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Joined</p>
                <p className="text-lg font-medium text-text-primary">{new Date(user.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg">
              <p className="text-error font-medium">{errors.submit}</p>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-text-primary mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors.fullName ? 'border-error' : 'border-border'
                }`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-error">{errors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors.phone ? 'border-error' : 'border-border'
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-error">{errors.phone}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-text-primary mb-2">
                Bio <span className="text-text-secondary text-xs">({formData.bio.length}/500)</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none ${
                  errors.bio ? 'border-error' : 'border-border'
                }`}
                placeholder="Tell us about yourself (max 500 characters)"
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-error">{errors.bio}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-6 border-t border-border">
              <Button type="submit">
                Save Changes
              </Button>
              <Link
                to="/dashboard"
                className="px-6 py-2 border border-border text-text-primary rounded-lg hover:bg-surface transition-colors inline-flex items-center"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-surface rounded-lg">
            <p className="text-sm text-text-secondary mb-3">
              <strong>Rating:</strong> {user.rating ? `${user.rating} (${user.reviews} reviews)` : 'No reviews yet'}
            </p>
            {user.role === 'lender' && (
              <p className="text-sm text-text-secondary">
                <strong>Listings:</strong> {user.listings || 0} active equipment listings
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
