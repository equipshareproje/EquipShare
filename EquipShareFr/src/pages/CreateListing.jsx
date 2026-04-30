import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import listingsApi from '../api/listings';

const API_CATEGORIES = [
  'Power Tools',
  'Hand Tools',
  'Cameras & Photography',
  'Audio & Video',
  'Vehicles',
  'Construction',
  'Outdoor & Sports',
  'Electronics',
  'Other',
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    condition: '',
    dailyPrice: '',
    description: '',
    specifications: '',
    blockedDates: [],
  });

  const [photoFiles, setPhotoFiles] = useState([]);     // File objects
  const [photoPreviews, setPhotoPreviews] = useState([]); // blob URLs

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-lg text-[#4A6572] mb-4">Please sign in to create a listing</p>
          <Button onClick={() => navigate('/signin')} variant="primary">Sign In</Button>
        </div>
      </div>
    );
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPhotoFiles((prev) => [...prev, ...files]);
    setPhotoPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    if (errors.photos) setErrors((prev) => ({ ...prev, photos: '' }));
  };

  const removePhoto = (i) => {
    URL.revokeObjectURL(photoPreviews[i]);
    setPhotoFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPhotoPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const toggleBlockedDate = (dateStr) => {
    setFormData((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.includes(dateStr)
        ? prev.blockedDates.filter((d) => d !== dateStr)
        : [...prev.blockedDates, dateStr],
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.category) errs.category = 'Category is required';
    if (!formData.condition) errs.condition = 'Condition is required';
    if (!formData.dailyPrice || parseFloat(formData.dailyPrice) <= 0)
      errs.dailyPrice = 'Daily price must be greater than 0';
    if (!formData.description.trim() || formData.description.length < 10)
      errs.description = 'Description must be at least 10 characters';
    if (photoFiles.length === 0) errs.photos = 'Upload at least one photo';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setStatusMsg('Uploading photos…');
    try {
      // 1. Upload each photo and collect URLs
      const photoUrls = await Promise.all(
        photoFiles.map((file) =>
          listingsApi.uploadPhoto(file).then((res) => res.data.data.url)
        )
      );

      setStatusMsg('Creating listing…');

      // 2. Create listing with the returned URLs
      await listingsApi.createListing({
        title: formData.title.trim(),
        category: formData.category,
        condition: formData.condition,
        dailyPrice: parseFloat(formData.dailyPrice),
        description: formData.description.trim(),
        specifications: formData.specifications.trim() || undefined,
        photos: photoUrls,
        blockedDates: formData.blockedDates.map((d) => new Date(d).toISOString()),
      });

      setStatusMsg('Listing published!');
      setTimeout(() => navigate('/my-listings'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to publish listing.';
      setErrors({ submit: msg });
      setStatusMsg('');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Calendar helpers ──────────────────────────────────────────────────────
  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDay = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  const calendarDays = () => {
    const days = [];
    for (let i = 0; i < getFirstDay(calendarMonth); i++) days.push(null);
    for (let i = 1; i <= getDaysInMonth(calendarMonth); i++) {
      days.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i));
    }
    return days;
  };

  const fmtDate = (d) => d.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      <div className="bg-white border-b border-[#D0DDE2]">
        <div className="container mx-auto px-4 max-w-4xl py-3">
          <button onClick={() => navigate('/dashboard')} className="text-[#00879E] hover:text-[#003E51] font-medium text-sm">
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-[#003E51] mb-2">List Your Equipment</h1>
          <p className="text-[#4A6572] mb-8">Fill in the details below to create a new listing</p>

          {statusMsg && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6">
              {statusMsg}
            </div>
          )}
          {errors.submit && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.submit}
            </div>
          )}

          {/* Photos */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#003E51] mb-2">
              Photos <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-[#4A6572] mb-3">First photo will be the cover image</p>
            <div
              className="border-2 border-dashed border-[#D0DDE2] rounded-lg p-8 text-center mb-4 hover:bg-[#F4F7F8] cursor-pointer"
              onClick={() => document.getElementById('photoInput').click()}
            >
              <input id="photoInput" type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <p className="text-[#00879E] font-semibold">Upload equipment photos</p>
              <p className="text-xs text-[#4A6572]">Click to select (max 10 MB each)</p>
            </div>
            {errors.photos && <p className="text-red-600 text-sm mb-3">{errors.photos}</p>}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photoPreviews.map((url, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden shadow-md">
                    <img src={url} alt={`Preview ${i + 1}`} className="w-full h-24 object-cover" />
                    {i === 0 && (
                      <div className="absolute top-1 left-1 bg-[#003E51] text-white text-xs px-2 py-1 rounded">Cover</div>
                    )}
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#003E51] mb-2">Title <span className="text-red-600">*</span></label>
            <input
              type="text"
              placeholder="e.g. Nikon D7500 DSLR Camera"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${errors.title ? 'border-red-500' : 'border-[#D0DDE2]'}`}
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#003E51] mb-2">Category <span className="text-red-600">*</span></label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${errors.category ? 'border-red-500' : 'border-[#D0DDE2]'}`}
            >
              <option value="">Select category…</option>
              {API_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
          </div>

          {/* Condition */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#003E51] mb-2">Condition <span className="text-red-600">*</span></label>
            <select
              value={formData.condition}
              onChange={(e) => handleChange('condition', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${errors.condition ? 'border-red-500' : 'border-[#D0DDE2]'}`}
            >
              <option value="">Select condition…</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.condition && <p className="text-red-600 text-sm mt-1">{errors.condition}</p>}
          </div>

          {/* Daily Price */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#003E51] mb-2">Daily Price (SAR) <span className="text-red-600">*</span></label>
            <div className="flex items-center gap-2">
              <span className="text-[#4A6572] font-semibold">SAR</span>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={formData.dailyPrice}
                onChange={(e) => handleChange('dailyPrice', e.target.value)}
                className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${errors.dailyPrice ? 'border-red-500' : 'border-[#D0DDE2]'}`}
              />
            </div>
            {errors.dailyPrice && <p className="text-red-600 text-sm mt-1">{errors.dailyPrice}</p>}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#003E51] mb-2">Description <span className="text-red-600">*</span></label>
            <textarea
              placeholder="Describe your equipment, condition, accessories included…"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows="5"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${errors.description ? 'border-red-500' : 'border-[#D0DDE2]'}`}
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Specifications */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#003E51] mb-2">Specifications (optional)</label>
            <textarea
              placeholder="Technical specs, model number, included accessories…"
              value={formData.specifications}
              onChange={(e) => handleChange('specifications', e.target.value)}
              rows="3"
              className="w-full px-4 py-3 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
            />
          </div>

          {/* Blocked dates */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#003E51] mb-2">Blocked Dates (optional)</label>
            <p className="text-xs text-[#4A6572] mb-3">Mark dates when your equipment is not available</p>
            <button
              type="button"
              onClick={() => setShowCalendarModal(true)}
              className="w-full px-4 py-3 border-2 border-[#003E51] text-[#003E51] font-semibold rounded-lg hover:bg-[#F4F7F8] transition"
            >
              Mark Blocked Dates {formData.blockedDates.length > 0 ? `(${formData.blockedDates.length} selected)` : ''}
            </button>
            {formData.blockedDates.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.blockedDates.sort().map((d) => (
                  <span key={d} className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-xs border border-[#D0DDE2]">
                    {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    <button onClick={() => toggleBlockedDate(d)} className="text-red-600 font-bold">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button onClick={handlePublish} variant="primary" className="w-full" disabled={submitting}>
            {submitting ? statusMsg || 'Publishing…' : 'Publish Listing'}
          </Button>
        </div>
      </div>

      {/* Blocked Dates Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#003E51]">Mark Blocked Dates</h2>
              <button onClick={() => setShowCalendarModal(false)} className="text-[#4A6572] text-2xl">✕</button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                className="px-3 py-1 bg-[#F4F7F8] rounded hover:bg-[#D0DDE2]">←</button>
              <span className="font-bold text-[#0A1F29]">
                {calendarMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                className="px-3 py-1 bg-[#F4F7F8] rounded hover:bg-[#D0DDE2]">→</button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-[#4A6572] py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays().map((date, i) => {
                if (!date) return <div key={`e-${i}`} />;
                const ds = fmtDate(date);
                const isBlocked = formData.blockedDates.includes(ds);
                return (
                  <button
                    key={ds}
                    onClick={() => toggleBlockedDate(ds)}
                    className={`aspect-square rounded text-sm font-medium flex items-center justify-center transition ${
                      isBlocked ? 'bg-red-500 text-white' : 'bg-[#F4F7F8] text-[#0A1F29] hover:bg-[#D0DDE2]'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setFormData((p) => ({ ...p, blockedDates: [] }))}
                className="flex-1 px-4 py-2 bg-[#F4F7F8] text-[#0A1F29] font-medium rounded-lg hover:bg-[#D0DDE2]">
                Clear All
              </button>
              <button onClick={() => setShowCalendarModal(false)}
                className="flex-1 px-4 py-2 bg-[#003E51] text-white font-medium rounded-lg hover:bg-[#002A38]">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
