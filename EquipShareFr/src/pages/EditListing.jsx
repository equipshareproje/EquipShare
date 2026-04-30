import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import listingsApi from '../api/listings';
import Button from '../components/Button';

const CATEGORIES = [
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

export default function EditListing() {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Existing photos already on the server (string URLs)
  const [existingPhotos, setExistingPhotos] = useState([]);
  // New files chosen by user, not yet uploaded
  const [newPhotoFiles, setNewPhotoFiles] = useState([]); // {id, file, previewUrl}

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    condition: '',
    dailyPrice: '',
    description: '',
    specifications: '',
    blockedDates: [],
    status: 'Active',
  });

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    const load = async () => {
      try {
        const res = await listingsApi.getListing(listingId);
        const l = res.data.data;
        setFormData({
          title: l.title || '',
          category: l.category || '',
          condition: l.condition || '',
          dailyPrice: l.dailyPrice ?? '',
          description: l.description || '',
          specifications: l.specifications || '',
          blockedDates: l.blockedDates || [],
          status: l.status || 'Active',
        });
        setExistingPhotos(l.photos || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load listing.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [listingId]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newEntries = files.map((file, i) => ({
      id: Date.now() + i,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewPhotoFiles((prev) => [...prev, ...newEntries]);
    e.target.value = '';
    if (fieldErrors.photos) setFieldErrors((prev) => ({ ...prev, photos: '' }));
  };

  const removeExistingPhoto = (idx) => {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNewPhoto = (id) => {
    setNewPhotoFiles((prev) => {
      const entry = prev.find((p) => p.id === id);
      if (entry) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const totalPhotos = existingPhotos.length + newPhotoFiles.length;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.category) errs.category = 'Please select a category';
    if (!formData.condition) errs.condition = 'Please select a condition';
    if (!formData.dailyPrice || parseFloat(formData.dailyPrice) <= 0)
      errs.dailyPrice = 'Daily price must be greater than 0';
    if (totalPhotos === 0) errs.photos = 'At least one photo is required';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setSaving(true);
    setError('');
    try {
      // Upload any new photos first
      const uploadedUrls = await Promise.all(
        newPhotoFiles.map((entry) => {
          const fd = new FormData();
          fd.append('photo', entry.file);
          return listingsApi.uploadPhoto(fd).then((r) => r.data.data.url);
        })
      );

      const photos = [...existingPhotos, ...uploadedUrls];

      await listingsApi.updateListing(listingId, {
        title: formData.title,
        category: formData.category,
        condition: formData.condition,
        dailyPrice: parseFloat(formData.dailyPrice),
        description: formData.description,
        specifications: formData.specifications,
        photos,
        blockedDates: formData.blockedDates,
        status: formData.status,
      });

      navigate('/my-listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setSaving(false);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  const generateCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarMonth);
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++)
      days.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i));
    return days;
  };

  const toDateStr = (d) => d.toISOString().split('T')[0];

  const toggleBlockedDate = (dateStr) => {
    setFormData((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.includes(dateStr)
        ? prev.blockedDates.filter((d) => d !== dateStr)
        : [...prev.blockedDates, dateStr],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/my-listings')} variant="primary">Back to My Listings</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          {/* Photos */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#003E51] mb-2">
              Photos <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-[#4A6572] mb-3">First photo will be the cover image</p>

            <div
              className="border-2 border-dashed border-[#D0DDE2] rounded-lg p-8 text-center mb-4 hover:bg-[#F4F7F8] transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-[#00879E] font-semibold">Add more photos</p>
              <p className="text-xs text-[#4A6572]">JPEG / PNG / WEBP — max 10 MB each</p>
            </div>

            {fieldErrors.photos && <p className="text-red-600 text-sm mb-3">{fieldErrors.photos}</p>}

            {totalPhotos > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingPhotos.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative group rounded-lg overflow-hidden shadow-md">
                    <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-24 object-cover" />
                    {idx === 0 && newPhotoFiles.length === 0 && (
                      <div className="absolute top-1 left-1 bg-[#003E51] text-white text-xs px-2 py-1 rounded">Cover</div>
                    )}
                    <button
                      onClick={() => removeExistingPhoto(idx)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {newPhotoFiles.map((entry, idx) => (
                  <div key={entry.id} className="relative group rounded-lg overflow-hidden shadow-md">
                    <img src={entry.previewUrl} alt={entry.file.name} className="w-full h-24 object-cover" />
                    {existingPhotos.length === 0 && idx === 0 && (
                      <div className="absolute top-1 left-1 bg-[#003E51] text-white text-xs px-2 py-1 rounded">Cover</div>
                    )}
                    <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded" style={{ display: existingPhotos.length === 0 && idx === 0 ? 'none' : 'block' }}>New</div>
                    <button
                      onClick={() => removeNewPhoto(entry.id)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#003E51] mb-2">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: '' }));
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${fieldErrors.title ? 'border-red-600' : 'border-[#D0DDE2]'}`}
            />
            {fieldErrors.title && <p className="text-red-600 text-sm mt-1">{fieldErrors.title}</p>}
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#003E51] mb-2">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
                if (fieldErrors.category) setFieldErrors((p) => ({ ...p, category: '' }));
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${fieldErrors.category ? 'border-red-600' : 'border-[#D0DDE2]'}`}
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {fieldErrors.category && <p className="text-red-600 text-sm mt-1">{fieldErrors.category}</p>}
          </div>

          {/* Condition */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#003E51] mb-2">
              Condition <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.condition}
              onChange={(e) => {
                setFormData({ ...formData, condition: e.target.value });
                if (fieldErrors.condition) setFieldErrors((p) => ({ ...p, condition: '' }));
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${fieldErrors.condition ? 'border-red-600' : 'border-[#D0DDE2]'}`}
            >
              <option value="">Select condition...</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {fieldErrors.condition && <p className="text-red-600 text-sm mt-1">{fieldErrors.condition}</p>}
          </div>

          {/* Daily Price */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#003E51] mb-2">
              Daily Price <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[#4A6572] font-semibold">SAR</span>
              <input
                type="number"
                min="0"
                value={formData.dailyPrice}
                onChange={(e) => {
                  setFormData({ ...formData, dailyPrice: e.target.value });
                  if (fieldErrors.dailyPrice) setFieldErrors((p) => ({ ...p, dailyPrice: '' }));
                }}
                className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${fieldErrors.dailyPrice ? 'border-red-600' : 'border-[#D0DDE2]'}`}
              />
            </div>
            {fieldErrors.dailyPrice && <p className="text-red-600 text-sm mt-1">{fieldErrors.dailyPrice}</p>}
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#003E51] mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-[#003E51] mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="5"
              className="w-full px-4 py-3 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
            />
          </div>

          {/* Specifications */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#003E51] mb-2">Specifications</label>
            <textarea
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              rows="3"
              placeholder="e.g. Brand, model, dimensions, power requirements..."
              className="w-full px-4 py-3 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
            />
          </div>

          {/* Blocked Dates */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#003E51] mb-3">Blocked Dates</label>
            <p className="text-xs text-[#4A6572] mb-3">Mark dates when this equipment is not available</p>

            <button
              type="button"
              onClick={() => setShowCalendarModal(true)}
              className="w-full px-4 py-3 border-2 border-[#003E51] text-[#003E51] font-semibold rounded-lg hover:bg-[#F4F7F8] transition"
            >
              Mark Blocked Dates
            </button>

            {formData.blockedDates.length > 0 && (
              <div className="mt-4 p-3 bg-[#F4F7F8] rounded-lg border border-[#D0DDE2]">
                <p className="text-xs font-semibold text-[#0A1F29] mb-2">Blocked Dates ({formData.blockedDates.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {formData.blockedDates.sort().map((date) => (
                    <span key={date} className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full text-xs border border-[#D0DDE2]">
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      <button type="button" onClick={() => toggleBlockedDate(date)} className="text-red-600 hover:text-red-800 font-bold">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={() => navigate('/my-listings')} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary" className="flex-1" disabled={saving}>
              {saving ? 'Saving…' : 'Update Listing'}
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#003E51]">Mark Blocked Dates</h2>
              <button onClick={() => setShowCalendarModal(false)} className="text-[#4A6572] hover:text-[#0A1F29] text-2xl">✕</button>
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

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-[#4A6572] text-sm py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {generateCalendarDays().map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} className="aspect-square" />;
                const dateStr = toDateStr(date);
                const isBlocked = formData.blockedDates.includes(dateStr);
                const isToday = new Date().toDateString() === date.toDateString();
                return (
                  <button
                    key={dateStr}
                    onClick={() => toggleBlockedDate(dateStr)}
                    className={`aspect-square rounded-lg font-semibold text-sm flex items-center justify-center transition ${
                      isBlocked
                        ? 'bg-red-600 text-white border-2 border-red-700'
                        : isToday
                        ? 'bg-yellow-100 text-[#0A1F29] border-2 border-yellow-400'
                        : 'bg-[#F4F7F8] text-[#0A1F29] border-2 border-[#D0DDE2] hover:bg-[#D0DDE2]'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setFormData((p) => ({ ...p, blockedDates: [] }))}
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
