import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function EditListing() {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    dailyRate: '',
    description: '',
    photos: [],
    availableToCircles: [],
    availabilityStartDate: '',
    availabilityEndDate: '',
    blockedDates: [],
  });

  const [photoPreview, setPhotoPreview] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

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

  // Load listing data
  useEffect(() => {
    const allListings = JSON.parse(localStorage.getItem('myListings') || '[]');
    const foundListing = allListings.find(l => l.id === parseInt(listingId));

    if (foundListing) {
      setListing(foundListing);
      setFormData({
        title: foundListing.title || '',
        category: foundListing.category || '',
        dailyRate: foundListing.dailyRate || '',
        description: foundListing.description || '',
        photos: foundListing.photos || [],
        availableToCircles: foundListing.availableToCircles || [],
        availabilityStartDate: foundListing.availabilityStartDate || '',
        availabilityEndDate: foundListing.availabilityEndDate || '',
        blockedDates: foundListing.blockedDates || [],
      });

      // Set photo previews
      if (foundListing.photos && foundListing.photos.length > 0) {
        const previews = foundListing.photos.map((photo, index) => ({
          url: typeof photo === 'string' ? photo : URL.createObjectURL(photo),
          name: `Photo ${index + 1}`,
        }));
        setPhotoPreview(previews);
      }
    }

    setLoading(false);
  }, [listingId]);

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarMonth);

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i));
    }

    return days;
  };

  const formatDateForStorage = (date) => {
    return date.toISOString().split('T')[0];
  };

  const toggleBlockedDate = (dateString) => {
    const newBlockedDates = formData.blockedDates.includes(dateString)
      ? formData.blockedDates.filter(d => d !== dateString)
      : [...formData.blockedDates, dateString];
    setFormData({ ...formData, blockedDates: newBlockedDates });
  };

  const isDateBlocked = (date) => {
    return formData.blockedDates.includes(formatDateForStorage(date));
  };

  const isDateInRange = (date) => {
    if (!formData.availabilityStartDate || !formData.availabilityEndDate) return false;
    const start = new Date(formData.availabilityStartDate);
    const end = new Date(formData.availabilityEndDate);
    return date >= start && date <= end;
  };

  // Form handlers
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

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

    if (!formData.availabilityStartDate) {
      newErrors.availabilityStartDate = 'Please set when equipment becomes available';
    }

    if (!formData.availabilityEndDate) {
      newErrors.availabilityEndDate = 'Please set when availability ends';
    }

    if (formData.availabilityStartDate && formData.availabilityEndDate) {
      const start = new Date(formData.availabilityStartDate);
      const end = new Date(formData.availabilityEndDate);
      if (start > end) {
        newErrors.availabilityEndDate = 'End date must be after start date';
      }
    }

    return newErrors;
  };

  const handleUpdateListing = () => {
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const allListings = JSON.parse(localStorage.getItem('myListings') || '[]');
    const updatedListings = allListings.map(l =>
      l.id === parseInt(listingId)
        ? {
            ...l,
            ...formData,
            updatedAt: new Date().toISOString(),
          }
        : l
    );

    localStorage.setItem('myListings', JSON.stringify(updatedListings));
    setSuccessMessage('✅ Listing updated successfully!');
    setTimeout(() => {
      navigate('/my-listings');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <p className="text-lg text-[#4A6572]">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-lg text-[#4A6572] mb-4">Listing not found</p>
          <Button onClick={() => navigate('/my-listings')} variant="primary">
            Back to My Listings
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
            onClick={() => navigate('/my-listings')}
            className="text-[#00879E] hover:text-[#003E51] font-medium text-sm"
          >
            ← Back to My Listings
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-[#003E51] mb-2">Edit Listing</h1>
          <p className="text-[#4A6572] mb-8">Update your equipment listing details</p>

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
              <p className="text-[#00879E] font-semibold">Add more photos or edit</p>
              <p className="text-xs text-[#4A6572]">Click to select images or drag and drop</p>
            </div>

            {errors.photos && (
              <p className="text-red-600 text-sm mb-3">{errors.photos}</p>
            )}

            {photoPreview.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photoPreview.map((photo, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden shadow-md">
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
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
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
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
                if (errors.category) setErrors({ ...errors, category: '' });
              }}
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

          {/* Daily Rate */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#003E51] mb-2">
              Daily Rate <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[#4A6572] font-semibold">SAR</span>
              <input
                type="number"
                value={formData.dailyRate}
                onChange={(e) => {
                  setFormData({ ...formData, dailyRate: e.target.value });
                  if (errors.dailyRate) setErrors({ ...errors, dailyRate: '' });
                }}
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="5"
              className="w-full px-4 py-3 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
            />
          </div>

          {/* Availability Calendar */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#003E51] mb-3">
              Availability Schedule <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-[#4A6572] mb-3">Set when your equipment is available for rent and mark any blocked dates</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A6572] mb-2">Available From</label>
                <input
                  type="date"
                  value={formData.availabilityStartDate}
                  onChange={(e) => {
                    setFormData({ ...formData, availabilityStartDate: e.target.value });
                    if (errors.availabilityStartDate) setErrors({ ...errors, availabilityStartDate: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${
                    errors.availabilityStartDate ? 'border-red-600' : 'border-[#D0DDE2]'
                  }`}
                />
                {errors.availabilityStartDate && (
                  <p className="text-red-600 text-xs mt-1">{errors.availabilityStartDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A6572] mb-2">Available Until</label>
                <input
                  type="date"
                  value={formData.availabilityEndDate}
                  onChange={(e) => {
                    setFormData({ ...formData, availabilityEndDate: e.target.value });
                    if (errors.availabilityEndDate) setErrors({ ...errors, availabilityEndDate: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${
                    errors.availabilityEndDate ? 'border-red-600' : 'border-[#D0DDE2]'
                  }`}
                />
                {errors.availabilityEndDate && (
                  <p className="text-red-600 text-xs mt-1">{errors.availabilityEndDate}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCalendarModal(true)}
              className="w-full px-4 py-3 border-2 border-[#003E51] text-[#003E51] font-semibold rounded-lg hover:bg-[#F4F7F8] transition"
            >
              📅 Mark Blocked Dates
            </button>

            {formData.blockedDates.length > 0 && (
              <div className="mt-4 p-3 bg-[#F4F7F8] rounded-lg border border-[#D0DDE2]">
                <p className="text-xs font-semibold text-[#0A1F29] mb-2">🚫 Blocked Dates ({formData.blockedDates.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {formData.blockedDates.sort().map(date => (
                    <span key={date} className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full text-xs border border-[#D0DDE2]">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      <button
                        type="button"
                        onClick={() => toggleBlockedDate(date)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/my-listings')}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateListing}
              variant="primary"
              className="flex-1"
            >
              Update Listing
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#003E51]">📅 Mark Blocked Dates</h2>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="text-[#4A6572] hover:text-[#0A1F29] text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                className="px-4 py-2 bg-[#F4F7F8] rounded-lg hover:bg-[#D0DDE2] transition font-semibold text-[#003E51]"
              >
                ← Prev
              </button>
              <h3 className="text-lg font-bold text-[#0A1F29]">
                {calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                className="px-4 py-2 bg-[#F4F7F8] rounded-lg hover:bg-[#D0DDE2] transition font-semibold text-[#003E51]"
              >
                Next →
              </button>
            </div>

            <div className="">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-[#4A6572] text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {generateCalendarDays().map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const dateString = formatDateForStorage(date);
                  const isBlocked = isDateBlocked(date);
                  const inRange = isDateInRange(date);
                  const isToday = new Date().toDateString() === date.toDateString();

                  return (
                    <button
                      key={dateString}
                      onClick={() => toggleBlockedDate(dateString)}
                      className={`
                        aspect-square rounded-lg font-semibold text-sm flex items-center justify-center transition
                        ${isBlocked
                          ? 'bg-red-600 text-white border-2 border-red-700'
                          : inRange
                          ? 'bg-[#00879E] text-white border-2 border-[#00879E]'
                          : isToday
                          ? 'bg-yellow-100 text-[#0A1F29] border-2 border-yellow-400'
                          : 'bg-[#F4F7F8] text-[#0A1F29] border-2 border-[#D0DDE2] hover:bg-[#D0DDE2]'
                        }
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#F4F7F8] rounded-lg">
              <p className="text-xs font-semibold text-[#0A1F29] mb-3">Legend:</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#00879E] rounded border-2 border-[#00879E]" />
                  <span className="text-[#4A6572]">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded border-2 border-red-700" />
                  <span className="text-[#4A6572]">Blocked</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setFormData({ ...formData, blockedDates: [] })}
                className="flex-1 px-4 py-3 bg-[#F4F7F8] text-[#0A1F29] font-semibold rounded-lg hover:bg-[#D0DDE2] transition"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="flex-1 px-4 py-3 bg-[#003E51] text-white font-semibold rounded-lg hover:bg-[#002A38] transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
