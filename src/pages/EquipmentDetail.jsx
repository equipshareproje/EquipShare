import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import DateRangeCalendar from '../components/DateRangeCalendar';
import listingsApi from '../api/listings';
import reviewsApi from '../api/reviews';
import bookingsApi from '../api/bookings';

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [equipment, setEquipment] = useState(null);
  const [listing_reviews, setListingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [listingRes, reviewsRes] = await Promise.all([
          listingsApi.getListing(id),
          reviewsApi.getListingReviews(id),
        ]);
        setEquipment(listingRes.data.data);
        setListingReviews(reviewsRes.data.data || []);
      } catch (err) {
        setError('Equipment not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-lg text-[#4A6572] mb-4">{error || 'Equipment not found'}</p>
          <Button onClick={() => navigate('/marketplace')} variant="primary">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  // ── Booking cost calc ─────────────────────────────────────────────────────
  let bookingDays = 1;
  if (startDate && endDate) {
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    const diff = new Date(ey, em - 1, ed) - new Date(sy, sm - 1, sd);
    bookingDays = Math.ceil(diff / 86400000) + 1;
  }
  const subtotal = equipment.dailyPrice * bookingDays;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  // Blocked dates from the listing
  const blockedDates = equipment.blockedDates || [];
  const today = new Date().toISOString().split('T')[0];

  const handleBooking = async () => {
    if (!user) { navigate('/signin'); return; }
    if (!startDate || !endDate) return;
    setBooking(true);
    setBookingError('');
    try {
      const res = await bookingsApi.createBooking(
        equipment._id,
        new Date(startDate + 'T00:00:00').toISOString(),
        new Date(endDate + 'T00:00:00').toISOString()
      );
      const { bookingId } = res.data.data;
      // Navigate to checkout with the bookingId
      navigate(`/checkout/${bookingId}`);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to create booking. Dates may be unavailable.';
      setBookingError(msg);
    } finally {
      setBooking(false);
    }
  };

  const isOwner = user && user.id === equipment.ownerId;

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      <div className="bg-white border-b border-[#D0DDE2]">
        <div className="container mx-auto px-4 max-w-7xl py-3">
          <button
            onClick={() => navigate('/marketplace')}
            className="text-[#00879E] hover:text-[#003E51] font-medium text-sm"
          >
            ← Back to Marketplace
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Photo gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {equipment.photos?.length > 0 ? (
                <img
                  src={equipment.photos[0]}
                  alt={equipment.title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No photo</span>
                </div>
              )}
              {equipment.photos?.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {equipment.photos.slice(1).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`${equipment.title} ${i + 2}`}
                      className="w-24 h-16 object-cover rounded flex-shrink-0"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Equipment info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-[#003E51] mb-2">{equipment.title}</h1>
              <p className="text-[#4A6572] mb-4">{equipment.category}</p>

              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#D0DDE2]">
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-[#003E51]">
                    {equipment.rating?.toFixed(1) || 'N/A'}
                  </span>
                  <span className="text-yellow-400">★</span>
                </div>
                <span className="text-[#4A6572]">({equipment.reviewCount} reviews)</span>
                {equipment.condition && (
                  <span className="ml-auto inline-block text-sm font-semibold text-[#1A7F5A] bg-green-100 px-3 py-1 rounded">
                    {equipment.condition}
                  </span>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#003E51] mb-2">Description</h3>
                <p className="text-[#4A6572] leading-relaxed">{equipment.description}</p>
              </div>

              {equipment.specifications && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-[#003E51] mb-2">Specifications</h3>
                  <p className="text-[#4A6572] leading-relaxed whitespace-pre-line">
                    {equipment.specifications}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-[#0A1F29] mb-1">Category</h4>
                  <p className="text-[#4A6572]">{equipment.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#0A1F29] mb-1">Condition</h4>
                  <p className="text-[#4A6572]">{equipment.condition}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#0A1F29] mb-1">Daily Rate</h4>
                  <p className="text-2xl font-bold text-[#003E51]">{equipment.dailyPrice} SAR</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#0A1F29] mb-1">Availability</h4>
                  <p className="text-[#4A6572]">{equipment.status === 'Active' ? 'Available' : 'Unavailable'}</p>
                </div>
              </div>
            </div>

            {/* Lender */}
            <div
              onClick={() => navigate(`/user/${equipment.ownerId}`)}
              className="bg-white rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:bg-[#F4F7F8] cursor-pointer transition-all"
            >
              <h3 className="text-lg font-bold text-[#003E51] mb-4">About the Lender</h3>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-[#003E51] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  L
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-[#00879E] hover:text-[#003E51] transition-colors">
                    View Lender Profile
                  </h4>
                  <p className="text-sm text-[#4A6572]">Click to see reviews and listings</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#D0DDE2]">
                <span className="text-[#00879E] text-sm font-semibold hover:underline">
                  View Profile & Reviews →
                </span>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-[#003E51] mb-4">
                Reviews ({listing_reviews.length})
              </h3>
              {listing_reviews.length === 0 ? (
                <p className="text-[#4A6572] text-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {listing_reviews.map((review) => (
                    <div key={review._id} className="pb-4 border-b border-[#D0DDE2] last:border-b-0">
                      <div className="flex items-start gap-3 mb-2">
                        {review.reviewerId?.avatar ? (
                          <img
                            src={review.reviewerId.avatar}
                            alt={review.reviewerId.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#003E51] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {(review.reviewerId?.name || 'U')[0]}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-[#003E51]">
                            {review.reviewerId?.name || 'Anonymous'}
                          </p>
                          <p className="text-sm text-[#4A6572]">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-yellow-400">{'★'.repeat(review.starRating)}</span>
                      </div>
                      {review.comment && (
                        <p className="text-[#4A6572]">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 mb-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-[#003E51] mb-4">Booking Summary</h3>

              <div className="bg-[#F4F7F8] rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#4A6572]">Equipment Rate</span>
                  <span className="font-semibold text-[#003E51]">
                    {equipment.dailyPrice} SAR/day
                  </span>
                </div>

                <DateRangeCalendar
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  minDate={today}
                  disabledDates={blockedDates}
                />

                <div className="space-y-2 pb-4 border-b border-[#D0DDE2]">
                  {startDate && endDate ? (
                    <>
                      <div className="flex justify-between text-[#4A6572]">
                        <span>Duration</span>
                        <span className="font-semibold">{bookingDays} day{bookingDays > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between text-[#4A6572]">
                        <span>Subtotal</span>
                        <span>{subtotal.toFixed(2)} SAR</span>
                      </div>
                      <div className="flex justify-between text-[#4A6572]">
                        <span>Service Fee (10%)</span>
                        <span>{serviceFee.toFixed(2)} SAR</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-[#4A6572] italic">Select dates to see pricing</p>
                  )}
                </div>

                {startDate && endDate && (
                  <div className="flex justify-between items-center mt-4 mb-2">
                    <span className="font-bold text-[#003E51]">Total</span>
                    <span className="text-2xl font-bold text-[#003E51]">{total.toFixed(2)} SAR</span>
                  </div>
                )}
              </div>

              {bookingError && (
                <p className="text-red-600 text-sm mb-3">{bookingError}</p>
              )}

              {isOwner ? (
                <p className="text-sm text-[#4A6572] text-center">You own this listing.</p>
              ) : (
                <Button
                  onClick={handleBooking}
                  variant="primary"
                  className="w-full"
                  disabled={
                    equipment.status !== 'Active' ||
                    !startDate ||
                    !endDate ||
                    booking
                  }
                >
                  {booking
                    ? 'Creating booking…'
                    : equipment.status !== 'Active'
                    ? 'Not Available'
                    : !startDate || !endDate
                    ? 'Select Dates to Book'
                    : 'Book Now'}
                </Button>
              )}

              <div className="mt-6 pt-6 border-t border-[#D0DDE2] text-sm text-[#4A6572]">
                <p>Secure payment with Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
