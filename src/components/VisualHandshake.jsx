import React, { useState } from 'react';
import Button from './Button';

export default function VisualHandshake({ booking, onClose, onComplete, handshakeType = 'pre-rental' }) {
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [fileInput, setFileInput] = useState(null);
  const [currentCaption, setCurrentCaption] = useState('');
  const [showCaptionInput, setShowCaptionInput] = useState(false);

  const minPhotos = 3;
  const isComplete = uploadedPhotos.length >= minPhotos;
  
  const handshakeTitleMap = {
    'pre-rental': 'Pre-Rental Handover',
    'post-rental': 'Post-Rental Return',
    'renter-receipt': 'Receipt Confirmation'
  };
  
  const handshakeDescriptionMap = {
    'pre-rental': 'Document the equipment condition before pickup',
    'post-rental': 'Confirm equipment return condition',
    'renter-receipt': 'Confirm you received the equipment in good condition'
  };
  
  const handshakeTitle = handshakeTitleMap[handshakeType] || 'Equipment Handover';
  const handshakeDescription = handshakeDescriptionMap[handshakeType] || 'Document equipment condition';

  // Mock file input handler - simulates camera/photo upload
  const handleAddPhoto = () => {
    // Simulate image upload - create a mock URL
    const mockPhoto = {
      id: uploadedPhotos.length + 1,
      url: `https://via.placeholder.com/400x300?text=Photo+${uploadedPhotos.length + 1}`,
      timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }),
      caption: currentCaption || `Photo ${uploadedPhotos.length + 1}`,
    };
    setUploadedPhotos([...uploadedPhotos, mockPhoto]);
    setCurrentCaption('');
    setShowCaptionInput(false);
  };

  const handleRemovePhoto = (photoId) => {
    setUploadedPhotos(uploadedPhotos.filter(p => p.id !== photoId));
  };

  const handleSubmitHandshake = () => {
    if (isComplete) {
      onComplete({
        bookingId: booking.id,
        type: handshakeType,
        photos: uploadedPhotos,
        submittedAt: new Date().toLocaleString(),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003E51] to-[#002A38] text-white p-6 sticky top-0">
          <h2 className="text-2xl font-bold mb-2">{handshakeTitle}</h2>
          <p className="text-gray-200">{handshakeDescription}</p>
          <p className="text-sm mt-2">Equipment: <strong>{booking.equipmentName}</strong></p>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>Please upload a minimum of 3 photos</strong> showing all sides and angles of the equipment. 
              {handshakeType === 'renter-receipt' 
                ? ' This confirms you received it in good condition.' 
                : ' Date and time will be automatically recorded with each photo.'}
            </p>
          </div>

          {/* Photo Upload Area */}
          <div className="mb-6">
            <h3 className="font-bold text-[#003E51] mb-3">Add Photos</h3>
            <div className="border-2 border-dashed border-[#D0DDE2] rounded-lg p-8 text-center mb-4 bg-[#F4F7F8]">
              <p className="text-[#4A6572] mb-4">Click below to add a photo</p>
              <button
                onClick={() => {
                  setShowCaptionInput(true);
                }}
                className="bg-[#003E51] hover:bg-[#002A38] text-white font-medium py-2 px-6 rounded-lg transition"
              >
                + Add Photo
              </button>
              <p className="text-xs text-[#4A6572] mt-3">
                Photos automatically timestamped
              </p>
            </div>

            {/* Caption Input */}
            {showCaptionInput && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-[#D0DDE2]">
                <label className="block text-sm font-medium text-[#0A1F29] mb-2">
                  Photo Description (Optional)
                </label>
                <input
                  type="text"
                  value={currentCaption}
                  onChange={(e) => setCurrentCaption(e.target.value)}
                  placeholder="e.g., Front view, Scratch on corner, Screen protector..."
                  className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] mb-3 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCaptionInput(false);
                      setCurrentCaption('');
                    }}
                    className="flex-1 px-3 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-100 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPhoto}
                    className="flex-1 px-3 py-2 bg-[#003E51] text-white rounded-lg font-medium hover:bg-[#002A38] transition text-sm"
                  >
                    Confirm & Upload
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Photos Grid */}
          {uploadedPhotos.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-[#003E51] mb-3">
                Uploaded Photos ({uploadedPhotos.length}/{minPhotos})
              </h3>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {uploadedPhotos.map((photo) => (
                  <div key={photo.id} className="border border-[#D0DDE2] rounded-lg overflow-hidden bg-white hover:shadow-md transition">
                    <div className="relative">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold transition"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-2 bg-[#F4F7F8]">
                      <p className="text-xs font-medium text-[#0A1F29] truncate mb-1">
                        {photo.caption}
                      </p>
                      <p className="text-xs text-[#4A6572] flex items-center gap-1">
                        <span>TIME</span>
                        {photo.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-2 bg-[#D0DDE2] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isComplete ? 'bg-green-500' : 'bg-[#00879E]'
                  }`}
                  style={{ width: `${Math.min((uploadedPhotos.length / minPhotos) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-[#0A1F29]">
                {uploadedPhotos.length}/{minPhotos}
              </span>
            </div>
            {!isComplete && (
              <p className="text-sm text-[#4A6572]">
                ⚠️ Need {minPhotos - uploadedPhotos.length} more photo(s) to proceed
              </p>
            )}
            {isComplete && (
              <p className="text-sm text-green-600 font-medium">
                ✅ Ready to submit!
              </p>
            )}
          </div>

          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-[#D0DDE2]">
            <p className="text-sm text-[#0A1F29] mb-1">
              <span className="font-medium">Equipment:</span> {booking.equipmentName}
            </p>
            <p className="text-sm text-[#0A1F29] mb-1">
              <span className="font-medium">Booking Ref:</span> {booking.bookingRef}
            </p>
            <p className="text-sm text-[#0A1F29]">
              <span className="font-medium">Dates:</span> {booking.startDate} to {booking.endDate}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-[#D0DDE2] pt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitHandshake}
              disabled={!isComplete}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                isComplete
                  ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {handshakeType === 'renter-receipt' 
                ? `✓ Confirm Receipt${uploadedPhotos.length >= minPhotos ? '' : ' Photos'}` 
                : `✓ Submit${uploadedPhotos.length >= minPhotos ? ' Photos' : ' Handover'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
