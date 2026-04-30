import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import bookingsApi from '../api/bookings';
import Button from '../components/Button';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '');

// ── Inner form (must be rendered inside <Elements>) ────────────────────────
function PaymentForm({ booking, clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState('');

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const equipment = booking.listingId || {};
  const equipmentTitle = equipment.title || 'Equipment';
  const startDate = booking.startDate;
  const endDate = booking.endDate;
  const days = booking.totalDays || 0;
  const subtotal = booking.subtotal || 0;
  const serviceFee = booking.serviceFee || 0;
  const totalCost = booking.totalAmount || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setIsProcessing(true);
    setCardError('');

    const cardElement = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      setCardError(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'requires_capture') {
      // Card is held (manual capture) — booking is now Pending awaiting lender approval
      onSuccess();
    } else {
      setCardError('Unexpected payment state. Please contact support.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-[#003E51] mb-2">Payment Details</h2>
        <p className="text-sm text-[#4A6572] mb-6">
          Your card will be <strong>held, not charged</strong>, until the lender approves the booking.
        </p>

        {cardError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">{cardError}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-[#0A1F29] mb-2">Card Details</label>
          <div className="px-4 py-3 border border-[#D0DDE2] rounded-lg focus-within:ring-2 focus-within:ring-[#003E51]">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#0A1F29',
                    '::placeholder': { color: '#9CA3AF' },
                  },
                  invalid: { color: '#EF4444' },
                },
              }}
            />
          </div>
          <p className="text-xs text-[#4A6572] mt-2">
            Test card: 4242 4242 4242 4242 — any future expiry — any CVV
          </p>
        </div>

        <button
          type="submit"
          disabled={isProcessing || !stripe || !clientSecret}
          className="w-full bg-[#003E51] hover:bg-[#002A38] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
        >
          {isProcessing
            ? 'Processing…'
            : !clientSecret
            ? 'Payment unavailable'
            : `Authorise SAR ${totalCost.toFixed(2)}`}
        </button>

        <p className="text-xs text-center text-[#4A6572] mt-4">
          Your payment is secure and encrypted. The hold is released if the lender declines.
        </p>
      </div>

      {/* Order summary (mobile duplicate) */}
      <div className="lg:hidden bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-[#003E51] mb-4">Booking Summary</h3>
        <SummaryContent
          equipmentTitle={equipmentTitle}
          startDate={startDate}
          endDate={endDate}
          days={days}
          subtotal={subtotal}
          serviceFee={serviceFee}
          totalCost={totalCost}
          formatDate={formatDate}
          bookingId={booking._id}
        />
      </div>
    </form>
  );
}

function SummaryContent({ equipmentTitle, startDate, endDate, days, subtotal, serviceFee, totalCost, formatDate, bookingId }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-[#4A6572] mb-1">Equipment</p>
        <p className="font-semibold text-[#003E51]">{equipmentTitle}</p>
      </div>
      <div>
        <p className="text-sm text-[#4A6572] mb-1">Rental Dates</p>
        <p className="font-semibold text-[#003E51]">{formatDate(startDate)}</p>
        <p className="text-sm text-[#4A6572]">to {formatDate(endDate)}</p>
      </div>
      {days > 0 && (
        <div>
          <p className="text-sm text-[#4A6572]">Duration</p>
          <p className="font-semibold text-[#003E51]">{days} day{days > 1 ? 's' : ''}</p>
        </div>
      )}
      <div className="border-t border-[#D0DDE2] pt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-[#4A6572]">Subtotal</span>
          <span className="font-semibold text-[#003E51]">SAR {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4A6572]">Service Fee (10%)</span>
          <span className="font-semibold text-[#003E51]">SAR {serviceFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-[#D0DDE2]">
          <span className="font-bold text-[#003E51]">Total Hold</span>
          <span className="text-2xl font-bold text-[#003E51]">SAR {totalCost.toFixed(2)}</span>
        </div>
      </div>
      {bookingId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-xs font-semibold text-blue-900">Booking Created</p>
          <p className="text-xs text-blue-700 mt-1">ID: {bookingId}</p>
        </div>
      )}
    </div>
  );
}

// ── Main Checkout page ─────────────────────────────────────────────────────
export default function Checkout() {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // clientSecret comes from navigation state (passed by EquipmentDetail after createBooking)
  const clientSecret = location.state?.clientSecret || null;

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    const load = async () => {
      try {
        const res = await bookingsApi.getBooking(bookingId);
        setBooking(res.data.data || res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Booking not found.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId, user, navigate]);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#F4F7F8]">
        <div className="container mx-auto px-4 max-w-2xl py-8">
          <button onClick={() => navigate(-1)} className="text-[#00879E] hover:text-[#003E51] font-medium text-sm mb-8">← Back</button>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-3xl font-bold text-[#003E51] mb-2">Booking Not Found</h1>
            <p className="text-[#4A6572] mb-8">{error || 'Could not load booking details.'}</p>
            <Button onClick={() => navigate('/marketplace')} variant="primary">Browse Equipment</Button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    const equipment = booking.listingId || {};
    return (
      <div className="min-h-screen bg-[#F4F7F8]">
        <div className="container mx-auto px-4 max-w-2xl py-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-green-600">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-[#003E51] mb-2">Card Authorised!</h1>
            <p className="text-[#4A6572] mb-2">Your card has been held. Your booking is now <strong>Pending</strong> lender approval.</p>
            <p className="text-sm text-[#4A6572] mb-6">You will not be charged until the lender approves.</p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-[#003E51] mb-4">Booking Confirmation</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#4A6572]">Booking ID</span>
                  <span className="font-semibold text-[#003E51]">{booking._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A6572]">Equipment</span>
                  <span className="font-semibold text-[#003E51]">{equipment.title || 'Equipment'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A6572]">Rental Dates</span>
                  <span className="font-semibold text-[#003E51]">{formatDate(booking.startDate)} – {formatDate(booking.endDate)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-green-200">
                  <span className="font-semibold text-[#003E51]">Card Hold</span>
                  <span className="font-bold text-[#00879E] text-lg">SAR {(booking.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => navigate('/dashboard')} variant="primary" className="flex-1">
                View My Bookings
              </Button>
              <Button onClick={() => navigate('/marketplace')} variant="secondary" className="flex-1 border border-[#D0DDE2] text-[#003E51] bg-white hover:bg-[#F4F7F8]">
                Continue Browsing
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const equipment = booking.listingId || {};
  const subtotal = booking.subtotal || 0;
  const serviceFee = booking.serviceFee || 0;
  const totalCost = booking.totalAmount || 0;

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      <div className="bg-white border-b border-[#D0DDE2]">
        <div className="container mx-auto px-4 max-w-7xl py-3">
          <button onClick={() => navigate(-1)} className="text-[#00879E] hover:text-[#003E51] font-medium text-sm">← Back</button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-green-50 border border-green-200 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl text-green-600">✓</span>
                <div>
                  <h3 className="font-bold text-green-900">Booking Created!</h3>
                  <p className="text-sm text-green-800">
                    Authorise your card to confirm. You will only be charged if the lender approves.
                  </p>
                </div>
              </div>
            </div>

            {!clientSecret && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm font-medium">
                  Payment session not found. Please go back and try booking again from the listing page.
                </p>
                <button onClick={() => navigate(-1)} className="mt-2 text-sm text-yellow-700 underline">← Go back</button>
              </div>
            )}

            <Elements stripe={stripePromise} options={clientSecret ? { clientSecret } : undefined}>
              <PaymentForm
                booking={booking}
                clientSecret={clientSecret}
                onSuccess={() => setPaymentSuccess(true)}
              />
            </Elements>
          </div>

          {/* Order Summary (desktop) */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-[#003E51] mb-6">Booking Summary</h3>
              <SummaryContent
                equipmentTitle={equipment.title || 'Equipment'}
                startDate={booking.startDate}
                endDate={booking.endDate}
                days={booking.totalDays || 0}
                subtotal={subtotal}
                serviceFee={serviceFee}
                totalCost={totalCost}
                formatDate={formatDate}
                bookingId={booking._id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
