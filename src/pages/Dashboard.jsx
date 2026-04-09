import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import VisualHandshake from '../components/VisualHandshake';

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
  const [approvingBooking, setApprovingBooking] = useState(null); // For approval modal
  const [rejectingBooking, setRejectingBooking] = useState(null); // For rejection modal
  const [rejectionReason, setRejectionReason] = useState(''); // For rejection reason
  const [visualHandshakeBooking, setVisualHandshakeBooking] = useState(null); // For visual handshake modal
  const [handshakeType, setHandshakeType] = useState('pre-rental'); // 'pre-rental' or 'post-rental'
  const [lenderBookingsWithHandshakes, setLenderBookingsWithHandshakes] = useState([]);
  const [viewingRenterProfile, setViewingRenterProfile] = useState(null); // For renter profile modal
  const [selectedPendingRequest, setSelectedPendingRequest] = useState(null); // For pending request details

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
      renterId: 5,
      renterRating: 4.6,
      renterAvatar: 'https://via.placeholder.com/60?text=JSM',
      renterVerified: true,
      renterMemberSince: 'Nov 2024',
      renterTrustedCircle: 'KFUPM Students',
      startDate: '2026-03-05',
      endDate: '2026-03-08',
      status: 'completed',
      bookingRef: 'BOOK-2026-0301-1782',
      pickupLocation: '123 Main St, Downtown',
      totalCost: 155.25,
      renterPreviousRentals: 8,
      renterReviewCount: 8,
    },
    {
      id: 102,
      equipmentId: 11,
      equipmentName: 'Camera Kit',
      renterName: 'Jane Doe',
      renterId: 6,
      renterRating: 4.9,
      renterAvatar: 'https://via.placeholder.com/60?text=JDoe',
      renterVerified: true,
      renterMemberSince: 'Jan 2025',
      renterTrustedCircle: 'KFUPM Students',
      startDate: '2026-03-01',
      endDate: '2026-03-03',
      status: 'active',
      bookingRef: 'BOOK-2026-0201-5521',
      pickupLocation: '456 Tech Ave, Campus',
      totalCost: 299.90,
      renterPreviousRentals: 15,
      renterReviewCount: 15,
      preRentalHandshake: {
        photos: [
          { id: 1, caption: 'Front view', timestamp: '03/01/2026, 09:15:32 AM' },
          { id: 2, caption: 'Screen intact', timestamp: '03/01/2026, 09:16:02 AM' },
          { id: 3, caption: 'Lens cap on', timestamp: '03/01/2026, 09:16:45 AM' },
        ],
        submittedAt: '03/01/2026, 09:17:00 AM',
      },
      postRentalHandshake: null,
    },
    {
      id: 103,
      equipmentId: 12,
      equipmentName: 'Tent & Camping Gear',
      renterName: 'Ahmed Hassan',
      renterId: 7,
      renterRating: 4.3,
      renterAvatar: 'https://via.placeholder.com/60?text=AHasan',
      renterVerified: false,
      renterMemberSince: 'Mar 2026',
      renterTrustedCircle: null,
      startDate: '2026-04-10',
      endDate: '2026-04-15',
      status: 'pending',
      bookingRef: 'BOOK-2026-0410-3394',
      pickupLocation: '789 Student Center, Building A',
      totalCost: 440.00,
      renterPreviousRentals: 2,
      renterReviewCount: 2,
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
    alert('Review submitted!');
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
    alert('Renter review submitted!');
  };

  const handleApproveBooking = () => {
    if (selectedPendingRequest) {
      const bookingRequests = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
      const requestIndex = bookingRequests.findIndex(r => r.id === selectedPendingRequest.id);
      
      if (requestIndex !== -1) {
        bookingRequests[requestIndex].status = 'approved';
        bookingRequests[requestIndex].approvedAt = new Date().toISOString().split('T')[0];
        bookingRequests[requestIndex].approvedByLenderId = user.id;
        localStorage.setItem('bookingRequests', JSON.stringify(bookingRequests));
        
        setSelectedPendingRequest(null);
        alert('✅ Booking request approved! Payment hold initiated. Renter will be notified and can proceed to checkout.');
      }
    }
  };

  const handleRejectBooking = () => {
    if (selectedPendingRequest) {
      const bookingRequests = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
      const requestIndex = bookingRequests.findIndex(r => r.id === selectedPendingRequest.id);
      
      if (requestIndex !== -1) {
        bookingRequests[requestIndex].status = 'rejected';
        bookingRequests[requestIndex].rejectionReason = rejectionReason;
        bookingRequests[requestIndex].rejectedAt = new Date().toISOString().split('T')[0];
        localStorage.setItem('bookingRequests', JSON.stringify(bookingRequests));
        
        setSelectedPendingRequest(null);
        setRejectionReason('');
        alert('❌ Booking request rejected. Payment hold released. Renter has been notified.');
      }
    }
  };

  const handleStartHandover = (booking, type = 'pre-rental') => {
    setVisualHandshakeBooking(booking);
    setHandshakeType(type);
  };

  const handleCompleteHandshake = (handshakeData) => {
    // Find the booking in the appropriate list
    let booking = null;
    let isRenterReceipt = handshakeData.type === 'renter-receipt';
    
    if (isRenterReceipt) {
      // Find in rental history (renter's bookings)
      booking = rentalHistory.find(b => b.id === handshakeData.bookingId);
    } else {
      // Find in lender bookings
      const bookingIndex = lenderBookings.findIndex(b => b.id === handshakeData.bookingId);
      if (bookingIndex !== -1) {
        if (handshakeData.type === 'pre-rental') {
          lenderBookings[bookingIndex].preRentalHandshake = {
            photos: handshakeData.photos,
            submittedAt: handshakeData.submittedAt,
          };
        } else {
          lenderBookings[bookingIndex].postRentalHandshake = {
            photos: handshakeData.photos,
            submittedAt: handshakeData.submittedAt,
          };
        }
      }
    }
    
    // Store renter receipt confirmation if applicable
    if (isRenterReceipt && booking) {
      booking.renterReceiptConfirmation = {
        photos: handshakeData.photos,
        submittedAt: handshakeData.submittedAt,
      };
    }
    
    setVisualHandshakeBooking(null);
    
    const typeMessages = {
      'pre-rental': 'Pre-rental',
      'post-rental': 'Post-rental',
      'renter-receipt': 'Receipt confirmation'
    };
    
    alert(`✅ ${typeMessages[handshakeData.type]} handover photos submitted successfully!`);
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
          <h1 className="text-3xl font-bold mb-2">My Rentals</h1>
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
                            {rental.status === 'active' && (
                              <button
                                onClick={() => {
                                  setVisualHandshakeBooking(rental);
                                  setHandshakeType('renter-receipt');
                                }}
                                className="text-[#00879E] hover:underline font-medium"
                              >
                                Confirm Receipt
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
            <div className="border-b border-[#D0DDE2] p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#003E51]">My Listings</h3>
                <p className="text-sm text-[#4A6572]">Manage your equipment listings and bookings</p>
                <button
                  onClick={() => navigate('/my-listings')}
                  className="text-[#00879E] hover:text-[#003E51] text-sm font-medium mt-2 underline"
                >
                  → View all your listings
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/earnings')}
                  className="bg-[#00879E] hover:bg-[#005570] text-white font-medium py-2 px-6 rounded-lg transition"
                >
                  Earnings Dashboard
                </button>
                <button
                  onClick={() => navigate('/create-listing')}
                  className="bg-[#003E51] hover:bg-[#002A38] text-white font-medium py-2 px-6 rounded-lg transition"
                >
                  + Add New Listing
                </button>
              </div>
            </div>

            {/* Pending Booking Requests Section */}
            {(() => {
              const bookingRequests = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
              const pendingRequests = bookingRequests.filter(
                req => req.lenderId == user.id && req.status === 'pending'
              );

              return pendingRequests.length > 0 ? (
                <div className="border-b border-[#D0DDE2] p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-[#003E51] mb-1">⏳ Pending Booking Requests</h3>
                    <p className="text-sm text-[#4A6572]">
                      {pendingRequests.length} booking request{pendingRequests.length > 1 ? 's' : ''} awaiting your approval
                    </p>
                  </div>

                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="border border-[#D0DDE2] rounded-lg p-4 bg-[#F4F7F8] hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <img
                                src={`https://via.placeholder.com/40?text=${(request.renterName || 'U').charAt(0)}`}
                                alt={request.renterName || 'Renter'}
                                className="w-10 h-10 rounded-full"
                              />
                              <div>
                                <h4 className="font-semibold text-[#003E51]">{request.renterName || 'Renter'}</h4>
                                <p className="text-xs text-[#4A6572]">Booking ID: {request.id}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-3 text-sm">
                              <div>
                                <p className="text-[#4A6572]">Equipment</p>
                                <p className="font-medium text-[#003E51]">{request.equipmentName}</p>
                              </div>
                              <div>
                                <p className="text-[#4A6572]">Dates</p>
                                <p className="font-medium text-[#003E51]">
                                  {new Date(request.startDate).toLocaleDateString()} -{' '}
                                  {new Date(request.endDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-[#4A6572]">Duration</p>
                                <p className="font-medium text-[#003E51]">{request.days} day{request.days > 1 ? 's' : ''}</p>
                              </div>
                              <div>
                                <p className="text-[#4A6572]">Total Cost</p>
                                <p className="font-medium text-[#003E51]">{request.totalCost.toFixed(2)} SAR</p>
                              </div>
                            </div>

                            <div className="border-t border-[#D0DDE2] pt-3 mt-3">
                              <button
                                onClick={() => setViewingRenterProfile(request.renterName)}
                                className="text-[#00879E] hover:text-[#003E51] text-sm font-medium"
                              >
                                View Renter Profile & Details →
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedPendingRequest(request)}
                              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPendingRequest(request);
                                setRejectingBooking(true);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

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
                            {booking.status === 'active' && (
                              <>
                                {!booking.preRentalHandshake && (
                                  <button
                                    onClick={() => handleStartHandover(booking, 'pre-rental')}
                                    className="text-blue-600 hover:underline font-medium"
                                  >
                                    Start Handover
                                  </button>
                                )}
                                {booking.preRentalHandshake && !booking.postRentalHandshake && (
                                  <button
                                    onClick={() => handleStartHandover(booking, 'post-rental')}
                                    className="text-orange-600 hover:underline font-medium"
                                  >
                                    Return Handover
                                  </button>
                                )}
                                {booking.preRentalHandshake && booking.postRentalHandshake && (
                                  <span className="text-green-600 font-medium">✅ Handshakes Complete</span>
                                )}
                              </>
                            )}
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => setApprovingBooking(booking)}
                                  className="text-green-600 hover:underline font-medium"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setRejectingBooking(booking)}
                                  className="text-red-600 hover:underline font-medium"
                                >
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
                            <div className="space-y-4">
                              <div>
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

                              {/* Pre-rental Handshake */}
                              {booking.preRentalHandshake && (
                                <div className="border-t pt-4">
                                  <p className="text-sm font-medium text-[#003E51] mb-2">
                                    Pre-Rental Handover Photos
                                  </p>
                                  <p className="text-xs text-[#4A6572] mb-3">
                                    Submitted: {booking.preRentalHandshake.submittedAt}
                                  </p>
                                  <div className="grid grid-cols-3 gap-2">
                                    {booking.preRentalHandshake.photos.map((photo) => (
                                      <div key={photo.id} className="border border-[#D0DDE2] rounded p-2 bg-white text-center">
                                        <p className="text-xs font-medium text-[#0A1F29] truncate mb-1">
                                          {photo.caption}
                                        </p>
                                        <p className="text-xs text-[#4A6572]">{photo.timestamp}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Post-rental Handshake */}
                              {booking.postRentalHandshake && (
                                <div className="border-t pt-4">
                                  <p className="text-sm font-medium text-[#003E51] mb-2">
                                    Post-Rental Return Photos
                                  </p>
                                  <p className="text-xs text-[#4A6572] mb-3">
                                    Submitted: {booking.postRentalHandshake.submittedAt}
                                  </p>
                                  <div className="grid grid-cols-3 gap-2">
                                    {booking.postRentalHandshake.photos.map((photo) => (
                                      <div key={photo.id} className="border border-[#D0DDE2] rounded p-2 bg-white text-center">
                                        <p className="text-xs font-medium text-[#0A1F29] truncate mb-1">
                                          {photo.caption}
                                        </p>
                                        <p className="text-xs text-[#4A6572]">{photo.timestamp}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
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

      {/* Approval Modal - Show Renter Profile & Booking Details */}
      {approvingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-[#003E51] mb-6">Approve Booking Request</h2>

            {/* Renter Profile Card */}
            <div className="bg-gradient-to-r from-[#003E51] to-[#002A38] rounded-lg p-4 text-white mb-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={approvingBooking.renterAvatar}
                  alt={approvingBooking.renterName}
                  className="w-16 h-16 rounded-full border-2 border-white"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{approvingBooking.renterName}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-300">⭐ {approvingBooking.renterRating}</span>
                    <span className="text-sm opacity-90">({approvingBooking.renterReviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {approvingBooking.renterVerified ? (
                    <>
                      <span className="text-green-300">✅</span>
                      <span>Verified User</span>
                    </>
                  ) : (
                    <>
                      <span className="text-yellow-300">⚠️</span>
                      <span>Unverified</span>
                    </>
                  )}
                </div>
                <p>Member since {approvingBooking.renterMemberSince}</p>
                {approvingBooking.renterTrustedCircle && (
                  <p>🤝 {approvingBooking.renterTrustedCircle}</p>
                )}
              </div>
            </div>

            {/* Rental History Summary */}
            <div className="bg-[#F4F7F8] rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-[#003E51] mb-3">Rental History</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#003E51]">{approvingBooking.renterPreviousRentals}</p>
                  <p className="text-sm text-[#4A6572]">Previous Rentals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">✅</p>
                  <p className="text-sm text-[#4A6572]">All Completed</p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="border border-[#D0DDE2] rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-[#003E51] mb-3">Booking Details</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-[#0A1F29]">Equipment:</span> {approvingBooking.equipmentName}</p>
                <p><span className="font-medium text-[#0A1F29]">Dates:</span> {approvingBooking.startDate} to {approvingBooking.endDate}</p>
                <p><span className="font-medium text-[#0A1F29]">Total Cost:</span> ${approvingBooking.totalCost.toFixed(2)}</p>
                <p><span className="font-medium text-[#0A1F29]">Reference:</span> {approvingBooking.bookingRef}</p>
              </div>
            </div>

            {/* Trust Indicator */}
            {approvingBooking.renterRating >= 4.7 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm text-green-700"><strong>High Trust Renter:</strong> Excellent track record</span>
              </div>
            )}

            {!approvingBooking.renterVerified && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 flex items-center gap-2">
                <span className="text-yellow-600">⚠️</span>
                <span className="text-sm text-yellow-700"><strong>Note:</strong> Renter account not yet verified</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-[#D0DDE2]">
              <button
                onClick={() => setApprovingBooking(null)}
                className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveBooking}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                ✓ Approve Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal - Optional Reason */}
      {rejectingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Reject Booking Request</h2>

            {/* Quick Info */}
            <div className="bg-gray-100 rounded p-3 mb-4 text-sm">
              <p className="font-medium text-[#0A1F29]">Renter: {rejectingBooking.renterName}</p>
              <p className="text-[#4A6572]">{rejectingBooking.equipmentName} • {rejectingBooking.startDate} to {rejectingBooking.endDate}</p>
            </div>

            <p className="text-[#4A6572] mb-4 text-sm">
              The payment hold of <strong>${rejectingBooking.totalCost.toFixed(2)}</strong> will be released, and the renter will be notified.
            </p>

            {/* Rejection Reason */}
            <div className="mb-6">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-[#0A1F29] mb-2">
                Reason for Rejection (Optional)
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., Equipment not available on those dates, prefer verified renters, etc."
                className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="4"
              />
            </div>

            {/* Predefined Reasons */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-[#4A6572] mb-2">Quick reasons:</p>
              <div className="space-y-2">
                <button
                  onClick={() => setRejectionReason('Equipment not available on these dates')}
                  className="w-full text-left px-3 py-2 border border-[#D0DDE2] rounded text-sm hover:bg-gray-50 transition"
                >
                  Equipment not available on these dates
                </button>
                <button
                  onClick={() => setRejectionReason('Prefer verified renters only')}
                  className="w-full text-left px-3 py-2 border border-[#D0DDE2] rounded text-sm hover:bg-gray-50 transition"
                >
                  Prefer verified renters only
                </button>
                <button
                  onClick={() => setRejectionReason('Other commitment')}
                  className="w-full text-left px-3 py-2 border border-[#D0DDE2] rounded text-sm hover:bg-gray-50 transition"
                >
                  Other commitment
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectingBooking(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectBooking}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                ✕ Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Pending Request Modal */}
      {selectedPendingRequest && !rejectingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#003E51] mb-4">Approve Booking Request?</h2>
            <div className="bg-[#F4F7F8] rounded-lg p-4 mb-6 space-y-3">
              <div>
                <p className="text-sm text-[#4A6572]">Renter</p>
                <p className="font-semibold text-[#003E51]">{selectedPendingRequest.renterName}</p>
              </div>
              <div>
                <p className="text-sm text-[#4A6572]">Equipment</p>
                <p className="font-semibold text-[#003E51]">{selectedPendingRequest.equipmentName}</p>
              </div>
              <div>
                <p className="text-sm text-[#4A6572]">Rental Dates</p>
                <p className="font-semibold text-[#003E51]">
                  {new Date(selectedPendingRequest.startDate).toLocaleDateString()} - {new Date(selectedPendingRequest.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#4A6572]">Total Amount</p>
                <p className="font-semibold text-[#00879E] text-lg">{selectedPendingRequest.totalCost.toFixed(2)} SAR</p>
              </div>
            </div>

            <p className="text-[#4A6572] mb-6">
              By approving, EquipShare will lock the dates and initiate payment hold. The renter will be notified and can proceed to checkout.
            </p>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setSelectedPendingRequest(null)}
                className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveBooking}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
              >
                ✅ Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Pending Request Modal */}
      {rejectingBooking && selectedPendingRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#003E51] mb-4">Reject Booking Request</h2>
            <div className="bg-[#F4F7F8] rounded-lg p-4 mb-6">
              <div>
                <p className="text-sm text-[#4A6572]">Renter</p>
                <p className="font-semibold text-[#003E51]">{selectedPendingRequest.renterName}</p>
              </div>
              <div className="mt-3">
                <p className="text-sm text-[#4A6572]">Equipment</p>
                <p className="font-semibold text-[#003E51]">{selectedPendingRequest.equipmentName}</p>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-[#0A1F29] mb-2">
                Rejection Reason (Optional)
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why you're rejecting this booking request..."
                className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                rows="4"
              />
              <p className="text-xs text-[#4A6572] mt-2">The renter will be notified of the rejection and payment hold will be released.</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setRejectingBooking(false);
                  setSelectedPendingRequest(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectBooking}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Renter Profile Modal */}
      {viewingRenterProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#003E51]">Renter Profile</h2>
              <button
                onClick={() => setViewingRenterProfile(null)}
                className="text-2xl text-[#4A6572] hover:text-[#0A1F29]"
              >
                ×
              </button>
            </div>

            {/* Mock Renter Data */}
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-[#D0DDE2]">
                <img
                  src={`https://via.placeholder.com/60?text=${viewingRenterProfile.charAt(0)}`}
                  alt={viewingRenterProfile}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold text-[#003E51]">{viewingRenterProfile}</h3>
                  <p className="text-sm text-[#4A6572]">Member since Jan 2024</p>
                  <p className="text-[#00879E] font-semibold">⭐ 4.7 rating (23 reviews)</p>
                </div>
              </div>

              {/* Trust Rating */}
              <div>
                <h4 className="font-semibold text-[#003E51] mb-2">Trust Rating</h4>
                <div className="bg-[#F4F7F8] rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#4A6572]">Communication</span>
                    <span className="font-semibold text-[#003E51]">Excellent</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#4A6572]">Reliability</span>
                    <span className="font-semibold text-[#003E51]">Very Reliable</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#4A6572]">Payment Timeliness</span>
                    <span className="font-semibold text-[#003E51]">Always On Time</span>
                  </div>
                </div>
              </div>

              {/* Rental History Summary */}
              <div>
                <h4 className="font-semibold text-[#003E51] mb-2">Rental History</h4>
                <div className="bg-[#F4F7F8] rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#4A6572]">Total Rentals</span>
                    <span className="font-semibold text-[#003E51]">12 items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A6572]">Completed Successfully</span>
                    <span className="font-semibold text-green-600">11 (92%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A6572]">Disputes</span>
                    <span className="font-semibold text-[#003E51]">0</span>
                  </div>
                </div>
              </div>

              {/* Trusted Circle Status */}
              <div>
                <h4 className="font-semibold text-[#003E51] mb-2">Trusted Circle Status</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-green-700">✅ Member of 2 Circles</p>
                  <ul className="text-xs text-green-600 mt-2 space-y-1">
                    <li>• Tech Hub 245</li>
                    <li>• University Circle 1863</li>
                  </ul>
                </div>
              </div>

              {/* Recent Reviews */}
              <div>
                <h4 className="font-semibold text-[#003E51] mb-2">⭐ Recent Reviews</h4>
                <div className="space-y-2">
                  <div className="text-sm border-b border-[#D0DDE2] pb-2">
                    <p className="font-medium text-[#0A1F29]">Great renter! Very responsible.</p>
                    <p className="text-xs text-[#4A6572]">From: Lender Sarah • 2 weeks ago</p>
                  </div>
                  <div className="text-sm pb-2">
                    <p className="font-medium text-[#0A1F29]">Excellent communication and punctual return.</p>
                    <p className="text-xs text-[#4A6572]">From: Lender Ahmed • 1 month ago</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setViewingRenterProfile(null)}
              className="w-full mt-6 px-4 py-2 bg-[#003E51] hover:bg-[#002A38] text-white rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Visual Handshake Modal */}
      {visualHandshakeBooking && (
        <VisualHandshake
          booking={visualHandshakeBooking}
          handshakeType={handshakeType}
          onClose={() => setVisualHandshakeBooking(null)}
          onComplete={handleCompleteHandshake}
        />
      )}
    </div>
  );
}
