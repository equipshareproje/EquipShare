import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import listingsApi from '../api/listings';

export default function MyListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listingsApi.getMyListings();
      setListings(res.data.data || []);
    } catch (err) {
      setError('Failed to load your listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []); // eslint-disable-line

  const confirmDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await listingsApi.deleteListing(deleteModal._id);
      setDeleteModal(null);
      await fetchListings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-lg text-[#4A6572] mb-4">Please sign in to view your listings</p>
          <button onClick={() => navigate('/signin')} className="bg-[#003E51] text-white px-6 py-2 rounded-lg">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      <div className="bg-[#003E51] text-white py-8">
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Listings</h1>
            <p className="text-gray-200">Manage your equipment listings</p>
          </div>
          <button
            onClick={() => navigate('/create-listing')}
            className="bg-white text-[#003E51] font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            + New Listing
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-lg text-[#4A6572] mb-4">You don't have any listings yet</p>
            <button onClick={() => navigate('/create-listing')} className="bg-[#003E51] text-white px-6 py-2 rounded-lg hover:bg-[#002A38]">
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  {listing.photos?.[0] ? (
                    <img src={listing.photos[0]} alt={listing.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">No photo</div>
                  )}
                  <span className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded ${
                    listing.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {listing.status}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-[#003E51] text-lg mb-1 truncate">{listing.title}</h3>
                  <p className="text-sm text-[#4A6572] mb-1">{listing.category}</p>
                  <p className="text-sm font-semibold text-[#003E51] mb-3">{listing.dailyPrice} SAR/day</p>

                  <div className="flex items-center gap-1 text-sm text-[#4A6572] mb-4">
                    <span>★ {listing.rating?.toFixed(1) || 'N/A'}</span>
                    <span>({listing.reviewCount} reviews)</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/equipment/${listing._id}`)}
                      className="flex-1 px-3 py-2 border border-[#003E51] text-[#003E51] text-sm font-medium rounded-lg hover:bg-[#F4F7F8] transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/edit-listing/${listing._id}`)}
                      className="flex-1 px-3 py-2 bg-[#003E51] text-white text-sm font-medium rounded-lg hover:bg-[#002A38] transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteModal(listing)}
                      className="px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition"
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

      {/* Delete confirm modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-[#0A1F29] mb-3">Delete Listing?</h2>
            <p className="text-[#4A6572] mb-6">
              Are you sure you want to delete <strong>{deleteModal.title}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
