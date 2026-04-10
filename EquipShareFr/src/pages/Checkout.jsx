import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import listings from '../data/listings.json';

export default function Checkout() {
  const { id: equipmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const equipment = listings.find(item => item.id === parseInt(equipmentId));
  
  const [approvedBooking, setApprovedBooking] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load and validate approved booking on mount
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (!equipment) {
      setError('Equipment not found');
      return;
    }

    // Get booking requests from localStorage
    const bookingRequests = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
    
    // Find approved booking for this equipment and user
    const booking = bookingRequests.find(
      req => req.renterId == user.id && 
             req.equipmentId == equipment.id && 
             req.status === 'approved'
    );

    if (!booking) {
      setError('No approved booking found. Please submit a booking request first.');
      return;
    }

    setApprovedBooking(booking);
  }, [user, equipment, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm(prev => ({ ...prev, [name]: value }));
  };

  const validatePaymentForm = () => {
    if (!paymentForm.cardName.trim()) return 'Cardholder name is required';
    if (!paymentForm.cardNumber.replace(/\s/g, '').match(/^\d{13,19}$/)) return 'Valid card number is required';
    if (!paymentForm.expiryDate.match(/^\d{2}\/\d{2}$/)) return 'Expiry date must be MM/YY';
    if (!paymentForm.cvv.match(/^\d{3,4}$/)) return 'Valid CVV is required';
    return null;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validatePaymentForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Update booking status to 'completed' in localStorage
      const bookingRequests = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
      const bookingIndex = bookingRequests.findIndex(r => r.id === approvedBooking.id);
      
      if (bookingIndex !== -1) {
        bookingRequests[bookingIndex].status = 'completed';
        bookingRequests[bookingIndex].completedAt = new Date().toISOString().split('T')[0];
        bookingRequests[bookingIndex].paymentMethod = 'Card';
        bookingRequests[bookingIndex].cardLast4 = paymentForm.cardNumber.slice(-4);
        localStorage.setItem('bookingRequests', JSON.stringify(bookingRequests));
      }

      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-lg text-[#4A6572] mb-4">Please sign in to checkout</p>
          <Button onClick={() => navigate('/signin')} variant="primary">
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-lg text-[#4A6572] mb-4">Equipment not found</p>
          <Button onClick={() => navigate('/marketplace')} variant="primary">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  if (error && !approvedBooking) {
    return (
      <div className="min-h-screen bg-[#F4F7F8]">
        <div className="container mx-auto px-4 max-w-2xl py-8">
          <button
            onClick={() => navigate(-1)}
            className="text-[#00879E] hover:text-[#003E51] font-medium text-sm mb-8"
          >
            ← Back
          </button>

          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">ERROR</div>
            <h1 className="text-3xl font-bold text-[#003E51] mb-2">Booking Not Approved</h1>
            <p className="text-[#4A6572] mb-8 text-lg">{error}</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">How to proceed:</h3>
              <ol className="text-sm text-blue-800 space-y-1 text-left">
                <li>1. Navigate to the equipment detail page</li>
                <li>2. Select your rental dates</li>
                <li>3. Click "Book Now" to submit a booking request</li>
                <li>4. Wait for the lender to approve your request</li>
                <li>5. Once approved, you'll be able to complete checkout</li>
              </ol>
            </div>

            <Button onClick={() => navigate('/marketplace')} variant="primary">
              Browse Equipment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentSuccess && approvedBooking) {
    return (
      <div className="min-h-screen bg-[#F4F7F8]">
        <div className="container mx-auto px-4 max-w-2xl py-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">COMPLETE</div>
            <h1 className="text-3xl font-bold text-[#003E51] mb-2">Payment Successful!</h1>
            <p className="text-[#4A6572] mb-4">Your booking is confirmed and payment has been processed.</p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-[#003E51] mb-4">Booking Confirmation</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#4A6572]">Booking ID</span>
                  <span className="font-semibold text-[#003E51]">{approvedBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A6572]">Equipment</span>
                  <span className="font-semibold text-[#003E51]">{approvedBooking.equipmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A6572]">Rental Dates</span>
                  <span className="font-semibold text-[#003E51]">
                    {new Date(approvedBooking.startDate).toLocaleDateString()} - {new Date(approvedBooking.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4A6572]">Duration</span>
                  <span className="font-semibold text-[#003E51]">{approvedBooking.days} days</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-green-200">
                  <span className="font-semibold text-[#003E51]">Total Amount Paid</span>
                  <span className="font-bold text-[#00879E] text-lg">{approvedBooking.totalCost.toFixed(2)} SAR</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left text-sm">
              <p className="text-blue-900 font-semibold mb-2">Next Steps:</p>
              <ul className="text-blue-800 space-y-1 list-disc list-inside">
                <li>Check your email for booking confirmation</li>
                <li>Arrange pickup with the lender</li>
                <li>Take pre-rental photos during handover</li>
                <li>Enjoy your rental!</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="primary"
                className="flex-1"
              >
                View My Bookings
              </Button>
              <Button 
                onClick={() => navigate('/marketplace')} 
                variant="secondary"
                className="flex-1 border border-[#D0DDE2] text-[#003E51] bg-white hover:bg-[#F4F7F8]"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#D0DDE2]">
        <div className="container mx-auto px-4 max-w-7xl py-3">
          <button
            onClick={() => navigate(-1)}
            className="text-[#00879E] hover:text-[#003E51] font-medium text-sm"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Booking Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">SUCCESS</div>
                <div>
                  <h3 className="font-bold text-green-900">Booking Approved!</h3>
                  <p className="text-sm text-green-800">Your booking request has been approved by the lender. Complete payment to confirm.</p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-[#003E51] mb-6">Payment Details</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 font-medium">Error: {error}</p>
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                {/* Cardholder Name */}
                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-[#0A1F29] mb-2">
                    Cardholder Name
                  </label>
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

                {/* Card Number */}
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-[#0A1F29] mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                      setPaymentForm(prev => ({ ...prev, cardNumber: value }));
                    }}
                    placeholder="4242 4242 4242 4242"
                    maxLength="19"
                    className="w-full px-4 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-[#4A6572] mt-2">Test card: 4242 4242 4242 4242</p>
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-[#0A1F29] mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={paymentForm.expiryDate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          const formatted = value.length >= 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
                          setPaymentForm(prev => ({ ...prev, expiryDate: formatted }));
                        }
                      }}
                      placeholder="MM/YY"
                      maxLength="5"
                      className="w-full px-4 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-[#0A1F29] mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={paymentForm.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPaymentForm(prev => ({ ...prev, cvv: value }));
                      }}
                      placeholder="123"
                      maxLength="4"
                      className="w-full px-4 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-[#F4F7F8] rounded-lg p-4">
                  <p className="text-sm text-[#4A6572] mb-3">
                    By completing this payment, you agree to the EquipShare Terms of Service and Rental Agreement.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-[#D0DDE2]"
                      disabled={isProcessing}
                    />
                    <span className="text-sm text-[#0A1F29]">I agree to the terms and conditions</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#003E51] hover:bg-[#002A38] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
                >
                  {isProcessing ? 'Processing Payment...' : `Pay ${approvedBooking.totalCost.toFixed(2)} SAR`}
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
                {/* Equipment */}
                <div>
                  <p className="text-sm text-[#4A6572] mb-1">Equipment</p>
                  <p className="font-semibold text-[#003E51]">{approvedBooking.equipmentName}</p>
                </div>

                {/* Dates */}
                <div>
                  <p className="text-sm text-[#4A6572] mb-1">Rental Dates</p>
                  <p className="font-semibold text-[#003E51]">
                    {new Date(approvedBooking.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-[#4A6572]">
                    to {new Date(approvedBooking.endDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Duration */}
                <div>
                  <p className="text-sm text-[#4A6572]">Duration</p>
                  <p className="font-semibold text-[#003E51]">
                    {approvedBooking.days} day{approvedBooking.days > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t border-[#D0DDE2] pt-4 mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-[#4A6572]">Daily Rate</span>
                    <span className="font-semibold text-[#003E51]">{approvedBooking.dailyRate} SAR</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[#4A6572]">Subtotal ({approvedBooking.days} days)</span>
                    <span className="font-semibold text-[#003E51]">{approvedBooking.subtotal} SAR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#4A6572]">Service Fee (10%)</span>
                    <span className="font-semibold text-[#003E51]">{approvedBooking.serviceFee.toFixed(2)} SAR</span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-[#D0DDE2] pt-4 mt-4 flex justify-between items-center">
                  <span className="font-bold text-[#003E51]">Total</span>
                  <span className="text-2xl font-bold text-[#003E51]">
                    {approvedBooking.totalCost.toFixed(2)} SAR
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-6 text-center">
                <p className="text-xs font-semibold text-green-900">✅ BOOKING APPROVED</p>
                <p className="text-xs text-green-800 mt-1">Ready for payment</p>
              </div>

              <div className="mt-6 pt-6 border-t border-[#D0DDE2] text-sm text-[#4A6572]">
                <p className="mb-3">Accepted payment methods:</p>
                <div className="flex gap-2">
                  <span className="text-lg">CARD</span>
                  <span className="text-lg">BANK</span>
                  <span className="text-lg">MOBILE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
