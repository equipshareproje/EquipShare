import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bookingsApi from '../api/bookings';
import Button from '../components/Button';

export default function Checkout() {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [formError, setFormError] = useState('');

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!paymentForm.cardName.trim()) return 'Cardholder name is required';
    if (!paymentForm.cardNumber.replace(/\s/g, '').match(/^\d{13,19}$/)) return 'Valid card number is required';
    if (!paymentForm.expiryDate.match(/^\d{2}\/\d{2}$/)) return 'Expiry date must be MM/YY';
    if (!paymentForm.cvv.match(/^\d{3,4}$/)) return 'Valid CVV is required';
    return null;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError('');
    setIsProcessing(true);
    // Stripe integration would go here; for now simulate a 2s delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setPaymentSuccess(true);
  };

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

  const equipment = booking.listingId || {};
  const equipmentTitle = equipment.title || booking.equipmentName || 'Equipment';
  const dailyPrice = equipment.dailyPrice || booking.dailyRate || 0;
  const startDate = booking.startDate;
  const endDate = booking.endDate;
  const days = booking.days || (startDate && endDate
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    : 0);
  const subtotal = booking.subtotal || dailyPrice * days;
  const serviceFee = booking.serviceFee || subtotal * 0.1;
  const totalCost = booking.totalPrice || booking.totalCost || subtotal + serviceFee;

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#F4F7F8]">
        <div className="container mx-auto px-4 max-w-2xl py-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-green-600">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-[#003E51] mb-2">Payment Successful!</h1>
            <p className="text-[#4A6572] mb-4">Your booking is confirmed and payment has been processed.</p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-[#003E51] mb-4">Booking Confirmation</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#4A6572]">Booking ID</span>
                  <span className="font-semibold text-[#003E51]">{booking._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A6572]">Equipment</span>
                  <span className="font-semibold text-[#003E51]">{equipmentTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A6572]">Rental Dates</span>
                  <span className="font-semibold text-[#003E51]">{formatDate(startDate)} – {formatDate(endDate)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-green-200">
                  <span className="font-semibold text-[#003E51]">Total Paid</span>
                  <span className="font-bold text-[#00879E] text-lg">SAR {totalCost.toFixed(2)}</span>
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
                  <p className="text-sm text-green-800">Complete payment to confirm your rental.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-[#003E51] mb-6">Payment Details</h2>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 font-medium">{formError}</p>
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-[#0A1F29] mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={paymentForm.cardName}
                    onChange={handleInputChange}
                    placeholder="Ahmed Al-Mansouri"
                    className="w-full px-4 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-[#0A1F29] mb-2">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                      setPaymentForm((prev) => ({ ...prev, cardNumber: value }));
                    }}
                    placeholder="4242 4242 4242 4242"
                    maxLength="19"
                    className="w-full px-4 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-[#4A6572] mt-1">Test card: 4242 4242 4242 4242</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-[#0A1F29] mb-2">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={paymentForm.expiryDate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          const formatted = value.length >= 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
                          setPaymentForm((prev) => ({ ...prev, expiryDate: formatted }));
                        }
                      }}
                      placeholder="MM/YY"
                      maxLength="5"
                      className="w-full px-4 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-[#0A1F29] mb-2">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={paymentForm.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPaymentForm((prev) => ({ ...prev, cvv: value }));
                      }}
                      placeholder="123"
                      maxLength="4"
                      className="w-full px-4 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                <div className="bg-[#F4F7F8] rounded-lg p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-[#D0DDE2]" disabled={isProcessing} />
                    <span className="text-sm text-[#0A1F29]">I agree to the EquipShare Terms of Service and Rental Agreement</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#003E51] hover:bg-[#002A38] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
                >
                  {isProcessing ? 'Processing…' : `Pay SAR ${totalCost.toFixed(2)}`}
                </button>
              </form>

              <p className="text-xs text-center text-[#4A6572] mt-4">
                Your payment is secure and encrypted with industry-standard SSL encryption.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-[#003E51] mb-6">Booking Summary</h3>

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

                <div className="border-t border-[#D0DDE2] pt-4 mt-4 space-y-2">
                  {dailyPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#4A6572]">Daily Rate</span>
                      <span className="font-semibold text-[#003E51]">SAR {dailyPrice}</span>
                    </div>
                  )}
                  {subtotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#4A6572]">Subtotal</span>
                      <span className="font-semibold text-[#003E51]">SAR {subtotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#4A6572]">Service Fee (10%)</span>
                    <span className="font-semibold text-[#003E51]">SAR {serviceFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-[#D0DDE2] pt-4 mt-4 flex justify-between items-center">
                  <span className="font-bold text-[#003E51]">Total</span>
                  <span className="text-2xl font-bold text-[#003E51]">SAR {totalCost.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-6 text-center">
                <p className="text-xs font-semibold text-green-900">Booking Created</p>
                <p className="text-xs text-green-800 mt-1">Ready for payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
