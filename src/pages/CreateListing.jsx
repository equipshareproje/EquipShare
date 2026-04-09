import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    dailyRate: '',
    description: '',
    photos: [],
    availableToCircles: [],
    availableForRent: true,
  });

  const [photoPreview, setPhotoPreview] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const categories = [
    'Photography',
    'Electronics',
    'Tools',
    'Sports & Outdoors',
    'Audio & Video',
    'Computers',
    'Gaming',
    'Music Instruments',
    'Home & Garden',
    'Other',
  ];

  const circles = ['Tech Hub', 'University', 'Neighborhood'];

  const handleTitleChange = (e) => {
    setFormData({ ...formData, title: e.target.value });
    if (errors.title) setErrors({ ...errors, title: '' });
  };

  const handleCategoryChange = (e) => {
    setFormData({ ...formData, category: e.target.value });
    if (errors.category) setErrors({ ...errors, category: '' });
  };

  const handleDailyRateChange = (e) => {
    setFormData({ ...formData, dailyRate: e.target.value });
    if (errors.dailyRate) setErrors({ ...errors, dailyRate: '' });
  };

  const handleDescriptionChange = (e) => {
    setFormData({ ...formData, description: e.target.value });
  };

  const handleCircleChange = (e) => {
    const circle = e.target.value;
    setFormData({
      ...formData,
      availableToCircles: formData.availableToCircles.includes(circle)
        ? formData.availableToCircles.filter(c => c !== circle)
        : [...formData.availableToCircles, circle],
    });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Create preview URLs
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setPhotoPreview([...photoPreview, ...newPreviews]);
    setFormData({
      ...formData,
      photos: [...formData.photos, ...files],
    });

    if (errors.photos) setErrors({ ...errors, photos: '' });
  };

  const removePhoto = (index) => {
    const newPreviews = photoPreview.filter((_, i) => i !== index);
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setPhotoPreview(newPreviews);
    setFormData({ ...formData, photos: newPhotos });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Equipment title is required';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.dailyRate || parseFloat(formData.dailyRate) <= 0) {
      newErrors.dailyRate = 'Daily rate must be greater than 0';
    }

    if (photoPreview.length === 0) {
      newErrors.photos = 'Please upload at least one photo';
    }

    return newErrors;
  };

  const handleSaveDraft = () => {
    // Save to localStorage as draft
    const drafts = JSON.parse(localStorage.getItem('listingDrafts') || '[]');
    const draft = {
      id: Date.now(),
      ...formData,
      savedAt: new Date().toLocaleString(),
      status: 'draft',
    };
    drafts.push(draft);
    localStorage.setItem('listingDrafts', JSON.stringify(drafts));
    setSuccessMessage('✅ Listing saved as draft!');
    setTimeout(() => {
      setSuccessMessage('');
      navigate('/dashboard');
    }, 2000);
  };

  const handlePublishListing = () => {
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Save to localStorage (mock backend)
    const listings = JSON.parse(localStorage.getItem('myListings') || '[]');
    const newListing = {
      id: Date.now(),
      ...formData,
      lenderId: user?.id || 1,
      createdAt: new Date().toISOString(),
      status: 'active',
      viewCount: 0,
      bookingCount: 0,
    };
    listings.push(newListing);
    localStorage.setItem('myListings', JSON.stringify(listings));

    setSuccessMessage('✅ Listing published successfully!');
    setTimeout(() => {
      setSuccessMessage('');
      navigate('/dashboard');
    }, 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-lg text-[#4A6572] mb-4">Please sign in to create a listing</p>
          <Button onClick={() => navigate('/signin')} variant="primary">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#D0DDE2]">
        <div className="container mx-auto px-4 max-w-4xl py-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[#00879E] hover:text-[#003E51] font-medium text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-[#003E51] mb-2">List Your Equipment</h1>
          <p className="text-[#4A6572] mb-8">Fill in the details below to create a new listing</p>

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

          {/* Photos Section */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#003E51] mb-2">
              Photos <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-[#4A6572] mb-3">First photo will be the cover image</p>

            {/* Photo Upload Area */}
            <div className="border-2 border-dashed border-[#D0DDE2] rounded-lg p-8 text-center mb-4 hover:bg-[#F4F7F8] transition-colors cursor-pointer"
              onClick={() => document.getElementById('photoInput').click()}
            >
              <input
                id="photoInput"
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <p className="text-[#00879E] font-semibold">Upload equipment photos</p>
              <p className="text-xs text-[#4A6572]">Click to select images or drag and drop</p>
            </div>

            {errors.photos && (
              <p className="text-red-600 text-sm mb-3">{errors.photos}</p>
            )}

            {/* Photo Preview Grid */}
            {photoPreview.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photoPreview.map((photo, index) => (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden shadow-md"
                  >
                    <img
                      src={photo.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute top-1 left-1 bg-[#003E51] text-white text-xs px-2 py-1 rounded">
                        Cover
                      </div>
                    )}
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#003E51] mb-2">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Professional Power Drill"
              value={formData.title}
              onChange={handleTitleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${
                errors.title ? 'border-red-600' : 'border-[#D0DDE2]'
              }`}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#003E51] mb-2">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.category}
              onChange={handleCategoryChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${
                errors.category ? 'border-red-600' : 'border-[#D0DDE2]'
              }`}
            >
              <option value="">Select category...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-600 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Available to Circles */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#003E51] mb-3">
              Available to Circles <span className="text-red-600">*</span>
            </label>
            <div className="space-y-2">
              {circles.map(circle => (
                <label key={circle} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    value={circle}
                    checked={formData.availableToCircles.includes(circle)}
                    onChange={handleCircleChange}
                    className="w-5 h-5 accent-[#003E51] cursor-pointer"
                  />
                  <span className="text-[#4A6572]">{circle}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Daily Rate */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#003E51] mb-2">
              Daily Rate <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[#4A6572] font-semibold">SAR</span>
              <input
                type="number"
                placeholder="0"
                value={formData.dailyRate}
                onChange={handleDailyRateChange}
                className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${
                  errors.dailyRate ? 'border-red-600' : 'border-[#D0DDE2]'
                }`}
              />
            </div>
            {errors.dailyRate && (
              <p className="text-red-600 text-sm mt-1">{errors.dailyRate}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#003E51] mb-2">
              Description
            </label>
            <textarea
              placeholder="Describe your equipment, condition, included accessories..."
              value={formData.description}
              onChange={handleDescriptionChange}
              rows="5"
              className="w-full px-4 py-3 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
            />
          </div>

          {/* Available for Rent Checkbox */}
          <div className="mb-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.availableForRent}
                onChange={(e) => setFormData({ ...formData, availableForRent: e.target.checked })}
                className="w-5 h-5 accent-[#003E51] cursor-pointer"
              />
              <span className="text-[#003E51] font-semibold">Available for rent</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleSaveDraft}
              variant="secondary"
              className="flex-1"
            >
              Save Draft
            </Button>
            <Button
              onClick={handlePublishListing}
              variant="primary"
              className="flex-1"
            >
              Publish Listing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
