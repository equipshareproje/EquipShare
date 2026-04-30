import React, { useState, useRef } from 'react';

export default function VisualHandshake({ booking, onClose, onComplete, handshakeType = 'pre-rental' }) {
  const [uploadedPhotos, setUploadedPhotos] = useState([]); // { id, file, url, caption, timestamp }
  const fileInputRef = useRef(null);
  const minPhotos = 3;
  const isComplete = uploadedPhotos.length >= minPhotos;

  const titles = {
    'pre-rental': 'Pre-Rental Handover',
    'post-rental': 'Post-Rental Return',
    'renter-receipt': 'Receipt Confirmation',
  };
  const descs = {
    'pre-rental': 'Document the equipment condition before pickup',
    'post-rental': 'Confirm equipment return condition',
    'renter-receipt': 'Confirm you received the equipment in good condition',
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map((file, i) => ({
      id: Date.now() + i,
      file,
      url: URL.createObjectURL(file),
      caption: file.name,
      timestamp: new Date().toLocaleString(),
    }));
    setUploadedPhotos((prev) => [...prev, ...newPhotos]);
    // reset so same file can be selected again
    e.target.value = '';
  };

  const handleRemove = (id) => {
    setUploadedPhotos((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed?.url?.startsWith('blob:')) URL.revokeObjectURL(removed.url);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleSubmit = () => {
    if (!isComplete) return;
    onComplete({
      bookingId: booking._id || booking.id,
      type: handshakeType,
      files: uploadedPhotos.map((p) => p.file),
      photos: uploadedPhotos,
      submittedAt: new Date().toLocaleString(),
    });
  };

  const listingTitle =
    booking.listingId?.title || booking.equipmentName || booking.listingId || 'Equipment';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003E51] to-[#002A38] text-white p-6 sticky top-0">
          <h2 className="text-2xl font-bold mb-1">{titles[handshakeType]}</h2>
          <p className="text-gray-200 text-sm">{descs[handshakeType]}</p>
          <p className="text-sm mt-2">Equipment: <strong>{listingTitle}</strong></p>
        </div>

        <div className="p-6">
          {/* Instruction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>Upload at least 3 photos</strong> showing all sides of the equipment.
              {handshakeType === 'renter-receipt'
                ? ' This confirms you received it in good condition.'
                : ' Each photo is timestamped automatically.'}
            </p>
          </div>

          {/* Upload trigger */}
          <div className="border-2 border-dashed border-[#D0DDE2] rounded-lg p-8 text-center mb-6 bg-[#F4F7F8]">
            <p className="text-[#4A6572] mb-4">Click to select photos from your device</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#003E51] hover:bg-[#002A38] text-white font-medium py-2 px-6 rounded-lg transition"
            >
              + Add Photos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-[#4A6572] mt-3">JPEG / PNG / WEBP — max 10 MB each</p>
          </div>

          {/* Photo grid */}
          {uploadedPhotos.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-[#003E51] mb-3">
                Uploaded Photos ({uploadedPhotos.length}/{minPhotos} minimum)
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedPhotos.map((photo) => (
                  <div key={photo.id} className="border border-[#D0DDE2] rounded-lg overflow-hidden bg-white hover:shadow-md transition">
                    <div className="relative">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        onClick={() => handleRemove(photo.id)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-2 bg-[#F4F7F8]">
                      <p className="text-xs font-medium text-[#0A1F29] truncate">{photo.caption}</p>
                      <p className="text-xs text-[#4A6572]">{photo.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-2 bg-[#D0DDE2] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-[#00879E]'}`}
                  style={{ width: `${Math.min((uploadedPhotos.length / minPhotos) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-[#0A1F29]">{uploadedPhotos.length}/{minPhotos}</span>
            </div>
            {!isComplete ? (
              <p className="text-sm text-[#4A6572]">Need {minPhotos - uploadedPhotos.length} more photo(s)</p>
            ) : (
              <p className="text-sm text-green-600 font-medium">Ready to submit!</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-[#D0DDE2] pt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isComplete}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                isComplete
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Photos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
