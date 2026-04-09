import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MyListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    // Load listings from localStorage
    const allListings = JSON.parse(localStorage.getItem('myListings') || '[]');
    const userListings = allListings.filter(listing => listing.lenderId === user?.id || listing.lenderId === 1);
    setMyListings(userListings);
  }, [user]);

  const handleDeleteListing = (listing) => {
    setDeleteModal(listing);
  };

  const confirmDelete = () => {
    if (!deleteModal) return;

    const allListings = JSON.parse(localStorage.getItem('myListings') || '[]');
    const updatedListings = allListings.filter(listing => listing.id !== deleteModal.id);
    localStorage.setItem('myListings', JSON.stringify(updatedListings));
    setMyListings(updatedListings);
    setDeleteModal(null);
    alert('✅ Listing deleted successfully!');
  };

  const handleArchiveListing = (listingId) => {
    const allListings = JSON.parse(localStorage.getItem('myListings') || '[]');
    const updatedListings = allListings.map(listing => 
      listing.id === listingId 
        ? { ...listing, status: listing.status === 'active' ? 'archived' : 'active' }
        : listing
    );
    localStorage.setItem('myListings', JSON.stringify(updatedListings));
    setMyListings(updatedListings);
    alert(updatedListings.find(l => l.id === listingId).status === 'archived' 
      ? 'Listing archived' 
      : '✅ Listing reactivated');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-lg text-[#4A6572] mb-4">Please sign in to manage your listings</p>
          <button
            onClick={() => navigate('/signin')}
            className="bg-[#003E51] hover:bg-[#002A38] text-white font-medium py-2 px-6 rounded-lg transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F8] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-[#0A1F29] mb-2">My Listings</h1>
            <p className="text-[#4A6572] text-lg">Manage your equipment listings</p>
          </div>
          <button
            onClick={() => navigate('/create-listing')}
            className="bg-[#003E51] hover:bg-[#002A38] text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            + Add New Listing
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#003E51]">
            <p className="text-[#4A6572] text-sm mb-1">Active Listings</p>
            <p className="text-3xl font-bold text-[#003E51]">
              {myListings.filter(l => l.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#D97706]">
            <p className="text-[#4A6572] text-sm mb-1">Archived Listings</p>
            <p className="text-3xl font-bold text-[#D97706]">
              {myListings.filter(l => l.status === 'archived').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#00879E]">
            <p className="text-[#4A6572] text-sm mb-1">Total Views</p>
            <p className="text-3xl font-bold text-[#00879E]">
              {myListings.reduce((sum, l) => sum + (l.viewCount || 0), 0)}
            </p>
          </div>
        </div>

        {/* Listings Grid */}
        {myListings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-lg text-[#4A6572] mb-6">You haven't listed any equipment yet.</p>
            <button
              onClick={() => navigate('/create-listing')}
              className="bg-[#003E51] hover:bg-[#002A38] text-white font-medium py-2 px-6 rounded-lg transition"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map(listing => (
              <div
                key={listing.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition ${
                  listing.status === 'archived' ? 'opacity-60' : ''
                }`}
              >
                {/* Photo */}
                <div className="relative h-48 bg-[#F4F7F8]">
                  {listing.photos && listing.photos.length > 0 ? (
                    <img
                      src={typeof listing.photos[0] === 'string' 
                        ? listing.photos[0] 
                        : (listing.photos[0]?.url || 'https://via.placeholder.com/300?text=Equipment')}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300?text=Equipment'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#4A6572]">
                      No photo
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      listing.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.status === 'active' ? 'Active' : 'Archived'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#0A1F29] mb-2 line-clamp-2">
                    {listing.title}
                  </h3>

                  <div className="mb-4 space-y-2 text-sm text-[#4A6572]">
                    <p>{listing.category}</p>
                    <p>SAR {listing.dailyRate}/day</p>
                    <p>{listing.availabilityStartDate} to {listing.availabilityEndDate}</p>
                    <p>{listing.viewCount || 0} views • {listing.bookingCount || 0} bookings</p>
                  </div>

                  {/* Blocked Dates */}
                  {listing.blockedDates && listing.blockedDates.length > 0 && (
                    <div className="mb-4 p-3 bg-[#F4F7F8] rounded-lg">
                      <p className="text-xs font-semibold text-[#0A1F29] mb-2">
                        Blocked Dates ({listing.blockedDates.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {listing.blockedDates.slice(0, 3).map(date => (
                          <span key={date} className="text-xs bg-white px-2 py-1 rounded border border-[#D0DDE2]">
                            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        ))}
                        {listing.blockedDates.length > 3 && (
                          <span className="text-xs bg-white px-2 py-1 rounded border border-[#D0DDE2] font-semibold text-[#4A6572]">
                            +{listing.blockedDates.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/edit-listing/${listing.id}`)}
                      className="flex-1 bg-[#003E51] hover:bg-[#002A38] text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleArchiveListing(listing.id)}
                      className={`flex-1 font-semibold py-2 px-3 rounded-lg transition text-sm ${
                        listing.status === 'active'
                          ? 'bg-[#D97706] hover:bg-[#C17504] text-white'
                          : 'bg-[#1A7F5A] hover:bg-[#156A4A] text-white'
                      }`}
                    >
                      {listing.status === 'active' ? 'Archive' : 'Reactivate'}
                    </button>
                    <button
                      onClick={() => handleDeleteListing(listing)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#0A1F29] mb-4">Delete Listing?</h2>
            <p className="text-[#4A6572] mb-6">
              Are you sure you want to permanently delete <strong>"{deleteModal.title}"</strong>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 bg-[#D0DDE2] text-[#0A1F29] font-semibold py-3 px-4 rounded-lg hover:bg-[#C0CDD2] transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
