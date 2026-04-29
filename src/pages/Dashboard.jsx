import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import VisualHandshake from '../components/VisualHandshake';
import bookingsApi from '../api/bookings';
import reviewsApi from '../api/reviews';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('renter');
  const [renterBookings, setRenterBookings] = useState([]);
  const [lenderBookings, setLenderBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [expandedDetails, setExpandedDetails] = useState(null);
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({ starRating: 5, equipmentCondition: 4, lenderReliability: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [rejectingBooking, setRejectingBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [visualHandshakeBooking, setVisualHandshakeBooking] = useState(null);
  const [handshakeType, setHandshakeType] = useState('pre-rental');

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [rentingRes, lendingRes] = await Promise.all([
        bookingsApi.getMyRenting(),
        bookingsApi.getMyLending(),
      ]);
      setRenterBookings(rentingRes.data.data || []);
      setLenderBookings(lendingRes.data.data || []);
    } catch (err) {
      setError('Failed to load bookings. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-lg text-[#4A6572] mb-4">Please sign in to view your dashboard</p>
          <Button onClick={() => navigate('/signin')} variant="primary">Go to Sign In</Button>
        </div>
      </div>
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const statusBadge = (status) => {
    const map = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-blue-100 text-blue-800',
      Active: 'bg-green-100 text-green-800',
      Completed: 'bg-gray-100 text-gray-700',
      Rejected: 'bg-red-100 text-red-700',
      Cancelled: 'bg-red-100 text-red-700',
    };
    return `${map[status] || 'bg-gray-100 text-gray-700'} px-3 py-1 rounded text-sm font-medium`;
  };

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async (bookingId) => {
    setActionLoading(true);
    try {
      await bookingsApi.approveBooking(bookingId);
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve booking.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectingBooking) return;
    setActionLoading(true);
    try {
      await bookingsApi.rejectBooking(rejectingBooking._id, rejectionReason);
      setRejectingBooking(null);
      setRejectionReason('');
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject booking.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Review submit ─────────────────────────────────────────────────────────
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingBooking) return;
    setReviewSubmitting(true);
    try {
      await reviewsApi.submitReview({
        bookingId: reviewingBooking._id,
        starRating: reviewForm.starRating,
        equipmentCondition: reviewForm.equipmentCondition,
        lenderReliability: reviewForm.lenderReliability,
        comment: reviewForm.comment,
      });
      setReviewingBooking(null);
      setReviewForm({ starRating: 5, equipmentCondition: 4, lenderReliability: 5, comment: '' });
      alert('Review submitted!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ── Handshake complete (uploads real files) ───────────────────────────────
  const handleCompleteHandshake = async (handshakeData) => {
    if (!visualHandshakeBooking) return;
    try {
      const files = handshakeData.files || [];
      if (handshakeType === 'pre-rental') {
        await bookingsApi.uploadPreRentalPhotos(visualHandshakeBooking._id, files);
      } else {
        await bookingsApi.uploadReceivedPhotos(visualHandshakeBooking._id, files);
      }
      setVisualHandshakeBooking(null);
      await fetchBookings();
      alert('Handover photos submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload photos. Please try again.');
    }
  };

  // ── Render booking rows ───────────────────────────────────────────────────
  const renderRenterRow = (b) => {
    const listingTitle = b.listingId?.title || b.listingId || 'Equipment';
    const lenderId = b.ownerId;
    return (
      <React.Fragment key={b._id}>
        <tr className="border-b border-[#D0DDE2] hover:bg-gray-50 transition">
          <td className="px-6 py-4 text-[#0A1F29]">
            <p className="font-medium">{listingTitle}</p>
          </td>
          <td className="px-6 py-4 text-[#0A1F29]">
            <button
              onClick={() => navigate(`/user/${lenderId}`)}
              className="text-[#00879E] hover:text-[#003E51] hover:underline font-medium"
            >
              View Lender
            </button>
          </td>
          <td className="px-6 py-4 text-[#0A1F29]">
            <p>{formatDate(b.startDate)} – {formatDate(b.endDate)}</p>
            <p className="text-xs text-[#4A6572]">{b.totalDays} day{b.totalDays !== 1 ? 's' : ''}</p>
          </td>
          <td className="px-6 py-4">
            <span className={statusBadge(b.status)}>{b.status}</span>
          </td>
          <td className="px-6 py-4 text-sm">
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setExpandedDetails(expandedDetails === b._id ? null : b._id)}
                className="text-[#00879E] hover:underline font-medium"
              >
                {expandedDetails === b._id ? 'Hide' : 'Details'}
              </button>
              {b.status === 'Approved' && (
                <button
                  onClick={() => { setVisualHandshakeBooking(b); setHandshakeType('pre-rental'); }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Confirm Receipt
                </button>
              )}
              {b.status === 'Completed' && (
                <button
                  onClick={() => setReviewingBooking(b)}
                  className="text-[#00879E] hover:underline font-medium"
                >
                  Review
                </button>
              )}
            </div>
          </td>
        </tr>
        {expandedDetails === b._id && (
          <tr className="bg-gray-50 border-b border-[#D0DDE2]">
            <td colSpan="5" className="px-6 py-4">
              <div className="space-y-1 text-sm text-[#0A1F29]">
                <p><span className="font-medium">Booking ID:</span> {b._id}</p>
                <p><span className="font-medium">Total Paid:</span> {b.totalAmount?.toFixed(2)} SAR</p>
                <p><span className="font-medium">Daily Price:</span> {b.dailyPrice} SAR</p>
                <p><span className="font-medium">Service Fee:</span> {b.serviceFee?.toFixed(2)} SAR</p>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  const renderLenderRow = (b) => {
    const listingTitle = b.listingId?.title || b.listingId || 'Equipment';
    const renterId = b.renterId;
    const handoverStatus = b.handover?.status;
    return (
      <React.Fragment key={b._id}>
        <tr className="border-b border-[#D0DDE2] hover:bg-gray-50 transition">
          <td className="px-6 py-4 text-[#0A1F29]">
            <p className="font-medium">{listingTitle}</p>
          </td>
          <td className="px-6 py-4 text-[#0A1F29]">
            <button
              onClick={() => navigate(`/user/${renterId}`)}
              className="text-[#00879E] hover:text-[#003E51] hover:underline font-medium"
            >
              View Renter
            </button>
          </td>
          <td className="px-6 py-4 text-[#0A1F29]">
            <p>{formatDate(b.startDate)} – {formatDate(b.endDate)}</p>
          </td>
          <td className="px-6 py-4">
            <span className={statusBadge(b.status)}>{b.status}</span>
          </td>
          <td className="px-6 py-4 text-sm">
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setExpandedDetails(expandedDetails === b._id ? null : b._id)}
                className="text-[#00879E] hover:underline font-medium"
              >
                {expandedDetails === b._id ? 'Hide' : 'Details'}
              </button>

              {b.status === 'Pending' && (
                <>
                  <button
                    onClick={() => handleApprove(b._id)}
                    disabled={actionLoading}
                    className="text-green-600 hover:underline font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectingBooking(b)}
                    disabled={actionLoading}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Reject
                  </button>
                </>
              )}

              {b.status === 'Approved' && (
                <>
                  {handoverStatus === 'pending' && (
                    <button
                      onClick={() => { setVisualHandshakeBooking(b); setHandshakeType('pre-rental'); }}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Start Handover
                    </button>
                  )}
                  {handoverStatus === 'lender_done' && (
                    <span className="text-orange-600 font-medium text-xs">Waiting for renter receipt</span>
                  )}
                  {handoverStatus === 'completed' && (
                    <span className="text-green-600 font-medium text-xs">Handshake complete</span>
                  )}
                </>
              )}

              {b.status === 'Active' && (
                <button
                  onClick={() => { setVisualHandshakeBooking(b); setHandshakeType('post-rental'); }}
                  className="text-orange-600 hover:underline font-medium"
                >
                  Return Handover
                </button>
              )}
            </div>
          </td>
        </tr>
        {expandedDetails === b._id && (
          <tr className="bg-gray-50 border-b border-[#D0DDE2]">
            <td colSpan="5" className="px-6 py-4">
              <div className="space-y-1 text-sm text-[#0A1F29]">
                <p><span className="font-medium">Booking ID:</span> {b._id}</p>
                <p><span className="font-medium">Total:</span> {b.totalAmount?.toFixed(2)} SAR</p>
                {b.rejectionReason && (
                  <p><span className="font-medium">Rejection Reason:</span> {b.rejectionReason}</p>
                )}
                {b.handover?.preRentalPhotos?.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium mb-1">Pre-rental photos:</p>
                    <div className="flex gap-2 flex-wrap">
                      {b.handover.preRentalPhotos.map((url, i) => (
                        <img key={i} src={url} alt={`pre-rental ${i + 1}`} className="w-20 h-14 object-cover rounded border" />
                      ))}
                    </div>
                  </div>
                )}
                {b.handover?.receivedPhotos?.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium mb-1">Received photos:</p>
                    <div className="flex gap-2 flex-wrap">
                      {b.handover.receivedPhotos.map((url, i) => (
                        <img key={i} src={url} alt={`received ${i + 1}`} className="w-20 h-14 object-cover rounded border" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      <div className="bg-[#003E51] text-white py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold mb-2">My Rentals</h1>
          <p className="text-gray-200">Manage your rentals and bookings</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="flex gap-4 mb-6 border-b border-[#D0DDE2]">
          {['renter', 'lender'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 font-medium transition capitalize ${
                activeTab === tab
                  ? 'text-[#003E51] border-b-2 border-[#003E51]'
                  : 'text-[#4A6572] hover:text-[#003E51]'
              }`}
            >
              As {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── As Renter ── */}
            {activeTab === 'renter' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {renterBookings.length === 0 ? (
                  <div className="p-12 text-center text-[#4A6572]">
                    <p className="text-lg mb-4">No rentals yet</p>
                    <Button onClick={() => navigate('/marketplace')} variant="primary">Browse Equipment</Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-[#D0DDE2]">
                        <tr>
                          {['Item', 'Owner', 'Dates', 'Status', 'Options'].map((h) => (
                            <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-[#0A1F29]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>{renterBookings.map(renderRenterRow)}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── As Lender ── */}
            {activeTab === 'lender' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-[#D0DDE2] p-6 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[#003E51]">My Listings</h3>
                    <p className="text-sm text-[#4A6572]">Manage your equipment listings and bookings</p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={() => navigate('/create-listing')} className="bg-[#003E51] hover:bg-[#002A38] text-white font-medium py-2 px-6 rounded-lg transition">+ Add Listing</button>
                    <button onClick={() => navigate('/my-listings')} className="bg-[#003E51] hover:bg-[#002A38] text-white font-medium py-2 px-6 rounded-lg transition">View All Listings</button>
                    <button onClick={() => navigate('/earnings')} className="bg-[#003E51] hover:bg-[#002A38] text-white font-medium py-2 px-6 rounded-lg transition">Earnings</button>
                  </div>
                </div>

                {lenderBookings.length === 0 ? (
                  <div className="p-12 text-center text-[#4A6572]">
                    <p className="text-lg mb-4">No incoming bookings yet</p>
                    <Button onClick={() => navigate('/create-listing')} variant="primary">List Equipment</Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b border-[#D0DDE2]">
                        <tr>
                          {['Item', 'Renter', 'Dates', 'Status', 'Options'].map((h) => (
                            <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-[#0A1F29]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>{lenderBookings.map(renderLenderRow)}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Review Modal ── */}
      {reviewingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-[#0A1F29] mb-4">Leave a Review</h2>
            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#0A1F29] mb-2">Overall Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setReviewForm((p) => ({ ...p, starRating: s }))}
                      className={`text-2xl transition ${s <= reviewForm.starRating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A1F29] mb-2">Equipment Condition (1–5)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setReviewForm((p) => ({ ...p, equipmentCondition: s }))}
                      className={`text-2xl transition ${s <= reviewForm.equipmentCondition ? 'text-blue-400' : 'text-gray-300'}`}>★</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A1F29] mb-2">Lender Reliability (1–5)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button" onClick={() => setReviewForm((p) => ({ ...p, lenderReliability: s }))}
                      className={`text-2xl transition ${s <= reviewForm.lenderReliability ? 'text-green-400' : 'text-gray-300'}`}>★</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A1F29] mb-2">Comment (optional)</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setReviewingBooking(null)}
                  className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={reviewSubmitting}
                  className="flex-1 px-4 py-2 bg-[#003E51] text-white rounded-lg font-medium hover:bg-[#002A38] disabled:opacity-50">
                  {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Reject Booking</h2>
            <div className="bg-gray-100 rounded p-3 mb-4 text-sm">
              <p className="font-medium text-[#0A1F29]">Booking ID: {rejectingBooking._id}</p>
              <p className="text-[#4A6572]">{formatDate(rejectingBooking.startDate)} – {formatDate(rejectingBooking.endDate)}</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#0A1F29] mb-2">Reason (optional)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="3"
                placeholder="E.g., Equipment not available on those dates…"
                className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setRejectingBooking(null); setRejectionReason(''); }}
                className="flex-1 px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#0A1F29] font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleReject} disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50">
                {actionLoading ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Visual Handshake ── */}
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
