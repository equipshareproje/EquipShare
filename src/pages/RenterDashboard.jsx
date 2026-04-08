import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

export default function RenterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('history');
  const [reviewingRental, setReviewingRental] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });

  // Mock rental history
  const rentalHistory = [
    {
      id: 1,
      equipmentId: 1,
      equipmentName: 'Canon EOS 5D Mark IV',
      category: 'Photography',
      lenderName: 'Lender 1',
      lenderRating: 4.8,
      startDate: '2026-03-20',
      endDate: '2026-03-25',
      dailyRate: 150,
      days: 5,
      totalCost: 825,
      status: 'completed',
      reviewed: false,
      image: 'https://via.placeholder.com/80?text=Canon+EOS',
    },
    {
      id: 2,
      equipmentId: 4,
      equipmentName: 'Drone DJI Mini 3',
      category: 'Drones',
      lenderName: 'Lender 4',
      lenderRating: 4.9,
      startDate: '2026-04-05',
      endDate: '2026-04-08',
      dailyRate: 200,
      days: 3,
      totalCost: 660,
      status: 'completed',
      reviewed: false,
      image: 'https://via.placeholder.com/80?text=Drone+DJI',
    },
    {
      id: 3,
      equipmentId: 7,
      equipmentName: 'iPad Pro 12.9"',
      category: 'Computers',
      lenderName: 'Lender 7',
      lenderRating: 4.7,
      startDate: '2026-04-15',
      endDate: '2026-04-20',
      dailyRate: 95,
      days: 5,
      totalCost: 522.50,
      status: 'active',
      reviewed: false,
      image: 'https://via.placeholder.com/80?text=iPad+Pro',
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-lg text-[#4A6572] mb-4">Please sign in to view your dashboard</p>
          <Button onClick={() => navigate('/signin')} variant="primary">
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    // Mock: update rental history
    const updated = rentalHistory.map(r => 
      r.id === reviewingRental.id 
        ? { ...r, reviewed: true, review: reviewForm }
        : r
    );
    setReviewingRental(null);
    setReviewForm({ rating: 5, comment: '' });
    alert('Review submitted! 🎉');
  };

  const completedRentals = rentalHistory.filter(r => r.status === 'completed');
  const activeRentals = rentalHistory.filter(r => r.status === 'active');

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      {/* Header */}
      <div className="bg-[#003E51] text-white py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold mb-2">👤 Renter Dashboard</h1>
          <p className="text-gray-200">Manage your rentals and reviews</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[#4A6572] text-sm">Member Since</p>
              <p className="font-bold text-[#003E51]">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[#4A6572] text-sm">Total Rentals</p>
              <p className="font-bold text-[#003E51]">{rentalHistory.length}</p>
            </div>
            <div>
              <p className="text-[#4A6572] text-sm">Active Rentals</p>
              <p className="font-bold text-[#003E51]">{activeRentals.length}</p>
            </div>
            <div>
              <p className="text-[#4A6572] text-sm">Rating</p>
              <p className="font-bold text-[#003E51]">⭐ {user.rating || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#D0DDE2]">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 font-semibold transition ${
              activeTab === 'history'
                ? 'border-b-2 border-[#003E51] text-[#003E51]'
                : 'text-[#4A6572] hover:text-[#003E51]'
            }`}
          >
            📋 Rental History
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-3 font-semibold transition ${
              activeTab === 'reviews'
                ? 'border-b-2 border-[#003E51] text-[#003E51]'
                : 'text-[#4A6572] hover:text-[#003E51]'
            }`}
          >
            ⭐ My Reviews
          </button>
        </div>

        {/* Rental History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Active Rentals Section */}
            {activeRentals.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#003E51] mb-4">🔄 Active Rentals</h3>
                <div className="space-y-4">
                  {activeRentals.map(rental => (
                    <div key={rental.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex gap-6">
                        <img
                          src={rental.image}
                          alt={rental.equipmentName}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-[#003E51] text-lg">{rental.equipmentName}</h4>
                              <p className="text-[#4A6572] text-sm">{rental.category}</p>
                            </div>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                              Active
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <p className="text-[#4A6572]">📅 Check-out</p>
                              <p className="font-semibold text-[#003E51]">{new Date(rental.endDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-[#4A6572]">💰 Total Cost</p>
                              <p className="font-semibold text-[#003E51]">{rental.totalCost.toFixed(2)} SAR</p>
                            </div>
                            <div>
                              <p className="text-[#4A6572]">Lender</p>
                              <p className="font-semibold text-[#003E51]">{rental.lenderName}</p>
                            </div>
                            <div>
                              <p className="text-[#4A6572]">Duration</p>
                              <p className="font-semibold text-[#003E51]">{rental.days} days</p>
                            </div>
                          </div>

                          <div className="bg-blue-50 border-l-4 border-[#00879E] p-3 rounded text-sm">
                            <p>Remember to check out on {new Date(rental.endDate).toLocaleDateString()}!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Rentals Section */}
            <div>
              <h3 className="text-xl font-bold text-[#003E51] mb-4">✅ Completed Rentals</h3>
              {completedRentals.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-[#4A6572]">No completed rentals yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedRentals.map(rental => (
                    <div key={rental.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex gap-6">
                        <img
                          src={rental.image}
                          alt={rental.equipmentName}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-[#003E51] text-lg">{rental.equipmentName}</h4>
                              <p className="text-[#4A6572] text-sm">{rental.category}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                                Completed
                              </span>
                              {rental.reviewed && (
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                                  ⭐ Reviewed
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <p className="text-[#4A6572]">📅 Dates</p>
                              <p className="font-semibold text-[#003E51]">
                                {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#4A6572]">💰 Total Cost</p>
                              <p className="font-semibold text-[#003E51]">{rental.totalCost.toFixed(2)} SAR</p>
                            </div>
                            <div>
                              <p className="text-[#4A6572]">Lender</p>
                              <p className="font-semibold text-[#003E51]">{rental.lenderName}</p>
                            </div>
                            <div>
                              <p className="text-[#4A6572]">Lender Rating</p>
                              <p className="font-semibold text-[#003E51]">⭐ {rental.lenderRating}</p>
                            </div>
                          </div>

                          {!rental.reviewed && (
                            <Button
                              onClick={() => setReviewingRental(rental)}
                              variant="secondary"
                              className="text-sm"
                            >
                              Leave a Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <h3 className="text-xl font-bold text-[#003E51] mb-4">Your Reviews</h3>
            {rentalHistory.filter(r => r.reviewed).length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-[#4A6572]">You haven't left any reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rentalHistory
                  .filter(r => r.reviewed)
                  .map(rental => (
                    <div key={rental.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex gap-4 mb-3">
                        <img
                          src={rental.image}
                          alt={rental.equipmentName}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-[#003E51]">{rental.equipmentName}</h4>
                          <p className="text-[#4A6572] text-sm">{rental.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span key={i}>{i < rental.review?.rating ? '⭐' : '☆'}</span>
                          ))}
                        </span>
                        <span className="text-[#4A6572] text-sm">({rental.review?.rating}/5)</span>
                      </div>
                      <p className="text-[#0A1F29]">{rental.review?.comment}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Review Modal */}
        {reviewingRental && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-[#003E51] mb-4">⭐ Review Your Rental</h2>

              <div className="mb-6">
                <p className="font-semibold text-[#003E51] mb-2">{reviewingRental.equipmentName}</p>
                <p className="text-[#4A6572] text-sm">Category: {reviewingRental.category}</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A1F29] mb-3">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="text-3xl transition hover:scale-110"
                      >
                        {star <= reviewForm.rating ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-[#0A1F29] mb-2">Your Comment</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Share your experience..."
                    rows="4"
                    className="w-full px-4 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewingRental(null)}
                    className="flex-1 px-4 py-2 border-2 border-[#003E51] text-[#003E51] font-semibold rounded-lg hover:bg-[#F4F7F8] transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#003E51] text-white font-semibold rounded-lg hover:bg-[#002A38] transition"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
