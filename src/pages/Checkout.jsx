import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import listings from '../data/listings.json';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const equipment = listings.find(item => item.id === parseInt(id));

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    billingAddress: '',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [errors, setErrors] = useState({});

  if (!equipment) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-lg text-[#4A6572] mb-4">😕 Equipment not found</p>
          <Button onClick={() => navigate('/marketplace')} variant="primary">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-lg text-[#4A6572] mb-4">Please sign in to continue</p>
          <Button onClick={() => navigate('/signin')} variant="primary">
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Calculate cost
  const startDate = new Date(formData.startDate);
  const endDate = new Date(formData.endDate);
  const days = formData.startDate && formData.endDate 
    ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) 
    : 0;

  const subtotal = equipment.dailyRate * days;
  const serviceFee = subtotal * 0.1;
  const total = subtotal + serviceFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
    if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Format: MM/YY';
    }
    if (!formData.cvc.trim()) newErrors.cvc = 'CVC is required';
    if (!/^\d{3,4}$/.test(formData.cvc)) newErrors.cvc = 'CVC must be 3-4 digits';
    if (!formData.billingAddress.trim()) newErrors.billingAddress = 'Billing address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Mock payment processing
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#F4F7F8]">
        {/* Header */}
        <div className="bg-[#003E51] text-white py-8">
          <div className="container mx-auto px-4 max-w-7xl">
            <h1 className="text-3xl font-bold mb-2">✅ Order Confirmed</h1>
            <p className="text-gray-200">Thank you for your booking!</p>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-3xl py-12">
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-[#003E51] mb-2">Booking Confirmed!</h2>
              <p className="text-[#4A6572]">Order #ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>

            <div className="bg-[#F4F7F8] rounded-lg p-6 mb-6">
              <h3 className="font-bold text-[#003E51] mb-4">📦 Booking Details</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-[#4A6572]">Equipment</p>
                  <p className="font-semibold text-[#003E51]">{equipment.name}</p>
                </div>
                <div>
                  <p className="text-sm text-[#4A6572]">Category</p>
                  <p className="font-semibold text-[#003E51]">{equipment.category}</p>
                </div>
                <div>
                  <p className="text-sm text-[#4A6572]">Check-in</p>
                  <p className="font-semibold text-[#003E51]">
                    {new Date(formData.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#4A6572]">Check-out</p>
                  <p className="font-semibold text-[#003E51]">
                    {new Date(formData.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#4A6572]">Number of Days</p>
                  <p className="font-semibold text-[#003E51]">{days} day{days !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-sm text-[#4A6572]">Location</p>
                  <p className="font-semibold text-[#003E51]">📍 {equipment.location}</p>
                </div>
              </div>

              <div className="border-t border-[#D0DDE2] pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-[#4A6572]">Subtotal ({days} days × {equipment.dailyRate} SAR)</span>
                  <span className="font-semibold text-[#003E51]">{subtotal} SAR</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-[#4A6572]">Service Fee (10%)</span>
                  <span className="font-semibold text-[#003E51]">{serviceFee.toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-[#003E51]">Total</span>
                  <span className="font-bold text-[#003E51]">{total.toFixed(2)} SAR</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-[#00879E] p-4 rounded mb-6">
              <p className="text-sm text-[#0A1F29]">
                <span className="font-semibold">Next Steps:</span> You'll receive a confirmation email with pickup details and the lender's contact information. Please arrive on time for pickup on {new Date(formData.startDate).toLocaleDateString()}.
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/marketplace')}
                variant="secondary"
                className="flex-1"
              >
                Continue Shopping
              </Button>
              <Button 
                onClick={() => navigate('/renter-dashboard')}
                variant="primary"
                className="flex-1"
              >
                View My Bookings
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-[#003E51] mb-4">📞 Need Help?</h3>
            <p className="text-[#4A6572] mb-4">
              If you have any questions about your booking, please contact our support team.
            </p>
            <p className="text-[#4A6572]">
              📧 <span className="font-semibold">support@equipshare.sa</span>
            </p>
            <p className="text-[#4A6572]">
              📱 <span className="font-semibold">+966 13 860 8000</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      {/* Header */}
      <div className="bg-[#003E51] text-white py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold mb-2">💳 Checkout</h1>
          <p className="text-gray-200">Complete your booking</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rental Dates */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-[#003E51] mb-4">📅 Rental Dates</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A1F29] mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      min={equipment.availability.startDate}
                      max={equipment.availability.endDate}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${
                        errors.startDate ? 'border-red-500' : 'border-[#D0DDE2]'
                      }`}
                    />
                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1F29] mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={equipment.availability.startDate}
                      max={equipment.availability.endDate}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${
                        errors.endDate ? 'border-red-500' : 'border-[#D0DDE2]'
                      }`}
                    />
                    {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                  </div>
                </div>

                <p className="text-sm text-[#4A6572]">
                  Available: {new Date(equipment.availability.startDate).toLocaleDateString()} to {new Date(equipment.availability.endDate).toLocaleDateString()}
                </p>
              </div>

              {/* Personal Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-[#003E51] mb-4">👤 Personal Information</h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A1F29] mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${
                        errors.fullName ? 'border-red-500' : 'border-[#D0DDE2]'
                      }`}
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1F29] mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${
                        errors.phone ? 'border-red-500' : 'border-[#D0DDE2]'
                      }`}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1F29] mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${
                      errors.email ? 'border-red-500' : 'border-[#D0DDE2]'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-[#003E51] mb-4">📍 Billing Address</h3>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1F29] mb-2">Address</label>
                  <textarea
                    name="billingAddress"
                    value={formData.billingAddress}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Street address, city, postal code"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${
                      errors.billingAddress ? 'border-red-500' : 'border-[#D0DDE2]'
                    }`}
                  />
                  {errors.billingAddress && <p className="text-red-500 text-sm mt-1">{errors.billingAddress}</p>}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-[#003E51] mb-4">💳 Payment Information</h3>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#0A1F29] mb-2">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${
                      errors.cardNumber ? 'border-red-500' : 'border-[#D0DDE2]'
                    }`}
                  />
                  {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A1F29] mb-2">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${
                        errors.expiryDate ? 'border-red-500' : 'border-[#D0DDE2]'
                      }`}
                    />
                    {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1F29] mb-2">CVC</label>
                    <input
                      type="text"
                      name="cvc"
                      value={formData.cvc}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength="4"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51] ${
                        errors.cvc ? 'border-red-500' : 'border-[#D0DDE2]'
                      }`}
                    />
                    {errors.cvc && <p className="text-red-500 text-sm mt-1">{errors.cvc}</p>}
                  </div>
                </div>

                <p className="text-xs text-[#4A6572]">💳 This is a mock payment form for demo purposes</p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                variant="primary"
                className="w-full py-3 text-lg"
              >
                Complete Booking
              </Button>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-[#003E51] mb-4">📦 Order Summary</h3>

              {/* Equipment Card */}
              <div className="mb-6 pb-6 border-b border-[#D0DDE2]">
                <img
                  src={equipment.image}
                  alt={equipment.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <p className="font-semibold text-[#003E51]">{equipment.name}</p>
                <p className="text-sm text-[#4A6572]">{equipment.category}</p>
                <p className="text-sm text-[#4A6572]">📍 {equipment.location}</p>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 mb-6 pb-6 border-b border-[#D0DDE2]">
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A6572]">Daily Rate</span>
                  <span className="font-semibold text-[#003E51]">{equipment.dailyRate} SAR</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A6572]">Number of Days</span>
                  <span className="font-semibold text-[#003E51]">{days}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A6572]">Subtotal</span>
                  <span className="font-semibold text-[#003E51]">{subtotal.toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A6572]">Service Fee (10%)</span>
                  <span className="font-semibold text-[#003E51]">{serviceFee.toFixed(2)} SAR</span>
                </div>
              </div>

              {/* Total */}
              <div className="bg-[#F4F7F8] rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#003E51]">Total Amount</span>
                  <span className="text-2xl font-bold text-[#003E51]">
                    {total.toFixed(2)} SAR
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border-l-4 border-[#00879E] p-3 rounded text-xs text-[#4A6572]">
                <p className="mb-2">✓ Secure checkout with SSL encryption</p>
                <p>✓ Confirmation email will be sent immediately</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
