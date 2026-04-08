import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('renter'); // 'renter' or 'lender'
  const [reviewingRental, setReviewingRental] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    condition: '',
    reliability: '',
    comment: '',
  });
  const [reviewingLenderBooking, setReviewingLenderBooking] = useState(null);
  const [lenderReviewForm, setLenderReviewForm] = useState({
    rating: 5,
    renterBehavior: '',
    itemCare: '',
    comment: '',
  });
  const [expandedDetails, setExpandedDetails] = useState(null); // Track which row's details are expanded

  // Mock rental history (as renter - items user has rented)
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
      bookingRef: 'BOOK-2026-0301-1782',
      pickupLocation: '123 Main St, Downtown',
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
      bookingRef: 'BOOK-2026-0305-2847',
      pickupLocation: '456 Tech Ave, Campus',
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
      bookingRef: 'BOOK-2026-0401-5123',
      pickupLocation: '789 Student Center, Building A',
    },
  ];

  // Mock lender bookings (as lender - items user has listed that renters booked)
  const lenderBookings = [
    {
      id: 101,
      equipmentId: 10,
      equipmentName: 'Pressure Washer',
      renterName: 'John Smith',
      renterRating: 4.6,
      startDate: '2026-03-05',
      endDate: '2026-03-08',
      status: 'completed',
      bookingRef: 'BOOK-2026-0301-1782',
      pickupLocation: '123 Main St, Downtown',
      totalCost: 155.25,
    },
    {
      id: 102,
      equipmentId: 11,
      equipmentName: 'Camera Kit',
      renterName: 'Jane Doe',
      renterRating: 4.9,
      startDate: '2026-03-01',
      endDate: '2026-03-03',
      status: 'active',
      bookingRef: 'BOOK-2026-0201-5521',
      pickupLocation: '456 Tech Ave, Campus',
      totalCost: 299.90,
    },
    {
      id: 103,
      equipmentId: 12,
      equipmentName: 'Tent & Camping Gear',
      renterName: 'Ahmed Hassan',
      renterRating: 4.3,
      startDate: '2026-04-10',
      endDate: '2026-04-15',
      status: 'pending',
      bookingRef: 'BOOK-2026-0410-3394',
      pickupLocation: '789 Student Center, Building A',
      totalCost: 440.00,
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
    if (!reviewForm.rating) {
      alert('Please select a rating');
      return;
    }
    // Mock: mark rental as reviewed
    const rental = rentalHistory.find(r => r.id === reviewingRental.id);
    if (rental) {
      rental.reviewed = true;
      rental.review = reviewForm;
    }
    setReviewingRental(null);
    setReviewForm({ rating: 5, condition: '', reliability: '', comment: '' });
    alert('Review submitted! 🎉');
  };

  const handleLenderReviewSubmit = (e) => {
    e.preventDefault();
    if (!lenderReviewForm.rating) {
      alert('Please select a rating');
      return;
    }
    // Mock: mark booking as reviewed by lender
    const booking = lenderBookings.find(b => b.id === reviewingLenderBooking.id);
    if (booking) {
      booking.reviewedByLender = true;
      booking.lenderReview = lenderReviewForm;
    }
    setReviewingLenderBooking(null);
    setLenderReviewForm({ rating: 5, renterBehavior: '', itemCare: '', comment: '' });
    alert('Renter review submitted! 🎉');
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-medium',
      active: 'bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium',
      pending: 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-medium',
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      {/* Header */}
      <div className="bg-[#003E51] text-white py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold mb-2">📋 My Rentals</h1>
          <p className="text-gray-200">Manage your rentals and bookings</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[#D0DDE2]">
          <button
            onClick={() => setActiveTab('renter')}
            className={`pb-4 px-4 font-medium transition ${
              activeTab === 'renter'
                ? 'text-[#003E51] border-b-2 border-[#003E51]'
                : 'text-[#4A6572] hover:text-[#003E51]'
            }`}
          >
            As Renter
          </button>
          <button
            onClick={() => setActiveTab('lender')}
            className={`pb-4 px-4 font-medium transition ${
              activeTab === 'lender'
                ? 'text-[#003E51] border-b-2 border-[#003E51]'
                : 'text-[#4A6572] hover:text-[#003E51]'
            }`}
          >
            As Lender
          </button>
        </div>

        {/* As Renter Tab */}
        {activeTab === 'renter' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-[#D0DDE2]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A1F29]">
                      Item
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A1F29]">
                      Owner
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A1F29]">
                      Dates
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A1F29]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A1F29]">
                      Options
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rentalHistory.map((rental, index) => (
                    <React.Fragment key={rental.id}>
                      <tr
                        className={`border-b border-[#D0DDE2] hover:bg-gray-50 transition ${
                          index === rentalHistory.length - 1 ? 'border-b-0' : ''
                        }`}
                      >
                        <td className="px-6 py-4 text-[#0A1F29]">
                          <div className="flex items-center gap-3">
                            <img
                              src={rental.image}
                              alt={rental.equipmentName}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <div>
                              <p className="font-medium">{rental.equipmentName}</p>
                              <p className="text-xs text-[#4A6572]">{rental.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#0A1F29]">
                          <div>
                            <button
                              onClick={() => navigate(`/user/${rental.lenderId || rental.id}`)}
                              className="font-medium text-[#00879E] hover:text-[#003E51] hover:underline transition-colors"
                            >
                              {rental.lenderName}
                            </button>
                            <p className="text-xs text-[#4A6572]">⭐ {rental.lenderRating}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#0A1F29]">
                          <p>
                            {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                          </p>
                          <p className="text-xs text-[#4A6572]">{rental.days} days</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={getStatusBadge(rental.status)}>
                            {rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-3">
                            {expandedDetails === rental.id ? (
                              <button
                                onClick={() => setExpandedDetails(null)}
                                className="text-[#00879E] hover:underline font-medium"
                              >
                                Hide
                              </button>
                            ) : (
                              <button
                                onClick={() => setExpandedDetails(rental.id)}
                                className="text-[#00879E] hover:underline font-medium"
                              >
                                Details
                              </button>
                            )}
                            {rental.status === 'completed' && (
                              <button
                                onClick={() => setReviewingRental(rental)}
                                className="text-[#00879E] hover:underline font-medium"
                              >
                                Review
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedDetails === rental.id && (
                        <tr className="bg-gray-50 border-b border-[#D0DDE2]">
                          <td colSpan="5" className="px-6 py-4">
                            <div className="space-y-2">
                              <p className="text-sm text-[#0A1F29]">
                                <span className="font-medium">Booking Reference:</span> {rental.bookingRef}
                              </p>
                              <p className="text-sm text-[#0A1F29]">
                                <span className="font-medium">Total Paid:</span> ${rental.totalCost.toFixed(2)}
                              </p>
                              <p className="text-sm text-[#0A1F29]">
                                <span className="font-medium">Pickup Location:</span> {rental.pickupLocation}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* As Lender Tab */}
        {activeTab === 'lender' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-[#D0DDE2]">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A1F29]">
                      Item
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A1F29]">
                      Renter
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A1F29]">
                      Dates
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A1F29]">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#0A1F29]">
                      Options
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lenderBookings.map((booking, index) => (
                    <React.Fragment key={booking.id}>
                      <tr
                        className={`border-b border-[#D0DDE2] hover:bg-gray-50 transition ${
                          index === lenderBookings.length - 1 ? 'border-b-0' : ''
                        }`}
                      >
                        <td className="px-6 py-4 text-[#0A1F29]">
                          <div>
                            <p className="font-medium">{booking.equipmentName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#0A1F29]">
                          <div>
                            <button
                              onClick={() => navigate(`/user/renter-${booking.id}`)}
                              className="font-medium text-[#00879E] hover:text-[#003E51] hover:underline transition-colors"
                            >
                              {booking.renterName}
                            </button>
                            <p className="text-xs text-[#4A6572]">⭐ {booking.renterRating}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#0A1F29]">
                          <p>
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={getStatusBadge(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-3">
                            {expandedDetails === booking.id ? (
                              <button
                                onClick={() => setExpandedDetails(null)}
                                className="text-[#00879E] hover:underline font-medium"
                              >
                                Hide
                              </button>
                            ) : (
                              <button
                                onClick={() => setExpandedDetails(booking.id)}
                                className="text-[#00879E] hover:underline font-medium"
                              >
                                Details
                              </button>
                            )}
                            {booking.status === 'completed' && (
                              <button
                                onClick={() => setReviewingLenderBooking(booking)}
                                className="text-[#00879E] hover:underline font-medium"
                              >
                                Review
                              </button>
                            )}
                            {booking.status === 'pending' && (
                              <>
                                <button className="text-green-600 hover:underline font-medium">
                                  Approve
                                </button>
                                <button className="text-red-600 hover:underline font-medium">
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedDetails === booking.id && (
                        <tr className="bg-gray-50 border-b border-[#D0DDE2]">
                          <td colSpan="5" className="px-6 py-4">
                            <div className="space-y-2">
                              <p className="text-sm text-[#0A1F29]">
                                <span className="font-medium">Booking Reference:</span> {booking.bookingRef}
                              </p>
                              <p className="text-sm text-[#0A1F29]">
                                <span className="font-medium">Total Paid:</span> ${booking.totalCost.toFixed(2)}
                              </p>
                              <p className="text-sm text-[#0A1F29]">
                                <span className="font-medium">Pickup Location:</span> {booking.pickupLocation}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingRental && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#0A1F29] mb-4">Leave a Review</h2>
            <p className="text-[#4A6572] mb-6">
              Review: <strong>{reviewingRental.equipmentName}</strong> from{' '}
              <strong>{reviewingRental.lenderName}</strong>
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-[#0A1F29] mb-2">
                  Equipment Condition Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className={`text-2xl transition ${
                        star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Field */}
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-[#0A1F29] mb-2">
                  Equipment Condition
                </label>
                <select
                  id="condition"
                  value={reviewForm.condition}
                  onChange={(e) =>
                    setReviewForm(prev => ({ ...prev, condition: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                >
                  <option value="">Select condition</option>
                  <option value="excellent">Excellent - Like new</option>
                  <option value="good">Good - Minor wear</option>
                  <option value="fair">Fair - Visible wear</option>
                  <option value="poor">Poor - Damaged</option>
                </select>
              </div>

              {/* Reliability Field */}
              <div>
                <label htmlFor="reliability" className="block text-sm font-medium text-[#0A1F29] mb-2">
                  Lender Reliability
                </label>
                <select
                  id="reliability"
                  value={reviewForm.reliability}
                  onChange={(e) =>
                    setReviewForm(prev => ({ ...prev, reliability: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                >
                  <option value="">Select reliability</option>
                  <option value="very-reliable">Very Reliable - Excellent service</option>
                  <option value="reliable">Reliable - Good service</option>
                  <option value="somewhat">Somewhat Reliable - Acceptable</option>
                  <option value="unreliable">Unreliable - Issues</option>
                </select>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-[#0A1F29] mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm(prev => ({ ...prev, comment: e.target.value }))
                  }
                  placeholder="Share your experience..."
                  className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                  rows="4"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setReviewingRental(null);
                    setReviewForm({ rating: 5, condition: '', reliability: '', comment: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#003E51] text-white rounded-lg font-medium hover:bg-[#002A38]"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lender Review Modal */}
      {reviewingLenderBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#0A1F29] mb-4">Review Renter</h2>
            <p className="text-[#4A6572] mb-6">
              Review for: <strong>{reviewingLenderBooking.renterName}</strong> for{' '}
              <strong>{reviewingLenderBooking.equipmentName}</strong>
            </p>

            <form onSubmit={handleLenderReviewSubmit} className="space-y-5">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-[#0A1F29] mb-2">
                  Renter Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setLenderReviewForm(prev => ({ ...prev, rating: star }))}
                      className={`text-2xl transition ${
                        star <= lenderReviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              {/* Renter Behavior Field */}
              <div>
                <label htmlFor="renterBehavior" className="block text-sm font-medium text-[#0A1F29] mb-2">
                  Renter Behavior
                </label>
                <select
                  id="renterBehavior"
                  value={lenderReviewForm.renterBehavior}
                  onChange={(e) =>
                    setLenderReviewForm(prev => ({ ...prev, renterBehavior: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                >
                  <option value="">Select behavior</option>
                  <option value="excellent">Excellent - Very professional</option>
                  <option value="good">Good - Professional</option>
                  <option value="fair">Fair - Acceptable</option>
                  <option value="poor">Poor - Issues encountered</option>
                </select>
              </div>

              {/* Item Care Field */}
              <div>
                <label htmlFor="itemCare" className="block text-sm font-medium text-[#0A1F29] mb-2">
                  Item Care
                </label>
                <select
                  id="itemCare"
                  value={lenderReviewForm.itemCare}
                  onChange={(e) =>
                    setLenderReviewForm(prev => ({ ...prev, itemCare: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                >
                  <option value="">Select item care</option>
                  <option value="excellent">Excellent - Perfect condition returned</option>
                  <option value="good">Good - Minimal wear</option>
                  <option value="fair">Fair - Some wear and tear</option>
                  <option value="poor">Poor - Damaged or not returned on time</option>
                </select>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-[#0A1F29] mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  id="comment"
                  value={lenderReviewForm.comment}
                  onChange={(e) =>
                    setLenderReviewForm(prev => ({ ...prev, comment: e.target.value }))
                  }
                  placeholder="Share your experience..."
                  className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                  rows="4"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setReviewingLenderBooking(null);
                    setLenderReviewForm({ rating: 5, renterBehavior: '', itemCare: '', comment: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#003E51] text-white rounded-lg font-medium hover:bg-[#002A38]"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
