import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import listings from '../data/listings.json';

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const equipment = listings.find(item => item.id === parseInt(id));
  const [selectedDate, setSelectedDate] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDays, setBookingDays] = useState(1);

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

  // Calculate cost
  const totalCost = equipment.dailyRate * bookingDays;
  const serviceFee = totalCost * 0.1;
  const finalCost = totalCost + serviceFee;

  // Mock lender data
  const lender = {
    id: equipment.lenderId,
    name: `Lender ${equipment.lenderId}`,
    avatar: `https://via.placeholder.com/60?text=L${equipment.lenderId}`,
    verified: equipment.verified,
    rating: 4.8,
    reviewCount: 42,
    responseTime: '2 hours',
    memberSince: 'Jan 2025',
  };

  // Mock reviews
  const reviews = [
    {
      id: 1,
      author: 'Ahmed Al-Mansouri',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Excellent equipment, well-maintained and fast delivery. Highly recommend!',
      avatar: 'https://via.placeholder.com/40?text=AM',
    },
    {
      id: 2,
      author: 'Sarah Al-Otaibi',
      rating: 4,
      date: '1 month ago',
      comment: 'Good quality but pickup was slightly delayed. Still a great experience.',
      avatar: 'https://via.placeholder.com/40?text=SO',
    },
    {
      id: 3,
      author: 'Yasir Al-Muqbel',
      rating: 5,
      date: '1 month ago',
      comment: 'Perfect! Exactly as described. Will rent again.',
      avatar: 'https://via.placeholder.com/40?text=YM',
    },
  ];

  const handleBooking = () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    setShowBookingForm(true);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      {/* Breadcrumb */}
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
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <img
                src={equipment.image}
                alt={equipment.name}
                className="w-full h-96 object-cover"
              />
              <div className="p-4 bg-gray-100">
                <p className="text-sm text-[#4A6572]">📷 Photo gallery with additional images coming soon</p>
              </div>
            </div>

            {/* Equipment Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-[#003E51] mb-2">{equipment.name}</h1>
              <p className="text-[#4A6572] mb-4">{equipment.category}</p>

              {/* Rating & Verification */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[#D0DDE2]">
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-[#003E51]">{equipment.rating}</span>
                  <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
                </div>
                <span className="text-[#4A6572]">({equipment.reviews} reviews)</span>
                {equipment.verified && (
                  <span className="ml-auto inline-block text-sm font-semibold text-[#1A7F5A] bg-green-100 px-3 py-1 rounded">
                    ✅ Verified Equipment
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#003E51] mb-2">📝 Description</h3>
                <p className="text-[#4A6572] leading-relaxed">{equipment.description}</p>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-[#0A1F29] mb-1">Category</h4>
                  <p className="text-[#4A6572]">{equipment.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#0A1F29] mb-1">Location</h4>
                  <p className="text-[#4A6572]">📍 {equipment.location}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#0A1F29] mb-1">Daily Rate</h4>
                  <p className="text-2xl font-bold text-[#003E51]">{equipment.dailyRate} SAR</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#0A1F29] mb-1">Availability</h4>
                  <p className="text-[#4A6572]">
                    {equipment.available ? '✓ Available' : '✗ Not Available'}
                  </p>
                </div>
              </div>

              {/* Availability Dates */}
              <div>
                <h4 className="text-sm font-semibold text-[#0A1F29] mb-2">📅 Rental Period</h4>
                <p className="text-[#4A6572]">
                  From {new Date(equipment.availability.startDate).toLocaleDateString()} to{' '}
                  {new Date(equipment.availability.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Lender Profile */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold text-[#003E51] mb-4">👤 About the Lender</h3>
              <div className="flex items-start gap-4">
                <img
                  src={lender.avatar}
                  alt={lender.name}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-[#003E51]">{lender.name}</h4>
                  <div className="text-sm text-[#4A6572] mb-3">
                    <p>⭐ {lender.rating} rating • {lender.reviewCount} reviews</p>
                    <p>⏱️ Responds ~{lender.responseTime}</p>
                    <p>📅 Member since {lender.memberSince}</p>
                  </div>
                  {lender.verified && (
                    <span className="inline-block text-xs font-semibold text-[#1A7F5A] bg-green-100 px-2 py-1 rounded">
                      ✅ Verified Lender
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-[#003E51] mb-4">⭐ Reviews</h3>
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="pb-4 border-b border-[#D0DDE2] last:border-b-0">
                    <div className="flex items-start gap-3 mb-2">
                      <img
                        src={review.avatar}
                        alt={review.author}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-[#003E51]">{review.author}</p>
                        <p className="text-sm text-[#4A6572]">{review.date}</p>
                      </div>
                      <span className="text-yellow-400">
                        {'⭐'.repeat(review.rating)}
                      </span>
                    </div>
                    <p className="text-[#4A6572]">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 mb-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-[#003E51] mb-4">💰 Booking Summary</h3>

              <div className="bg-[#F4F7F8] rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#4A6572]">Equipment Rate</span>
                  <span className="font-semibold text-[#003E51]">
                    {equipment.dailyRate} SAR/day
                  </span>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#0A1F29] mb-2">
                    Number of Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bookingDays}
                    onChange={(e) => setBookingDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                  />
                </div>

                <div className="space-y-2 pb-4 border-b border-[#D0DDE2]">
                  <div className="flex justify-between text-[#4A6572]">
                    <span>Subtotal ({bookingDays} day{bookingDays > 1 ? 's' : ''})</span>
                    <span>{totalCost} SAR</span>
                  </div>
                  <div className="flex justify-between text-[#4A6572]">
                    <span>Service Fee (10%)</span>
                    <span>{serviceFee.toFixed(2)} SAR</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 mb-6">
                  <span className="font-bold text-[#003E51]">Total</span>
                  <span className="text-2xl font-bold text-[#003E51]">
                    {finalCost.toFixed(2)} SAR
                  </span>
                </div>
              </div>

              {!showBookingForm ? (
                <Button
                  onClick={handleBooking}
                  variant="primary"
                  className="w-full"
                  disabled={!equipment.available}
                >
                  {equipment.available ? '📅 Book Now' : '❌ Not Available'}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0A1F29] mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      min={equipment.availability.startDate}
                      max={equipment.availability.endDate}
                      className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0A1F29] mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      min={equipment.availability.startDate}
                      max={equipment.availability.endDate}
                      className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                    />
                  </div>
                  <Button variant="primary" className="w-full">
                    Continue to Payment
                  </Button>
                  <Button
                    onClick={() => setShowBookingForm(false)}
                    variant="secondary"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-[#D0DDE2] text-sm text-[#4A6572]">
                <p className="mb-2">✅ Free cancellation up to 48 hours before</p>
                <p>💳 Secure payment with Stripe</p>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-bold text-[#003E51] mb-3">🛡️ Why Book With Confidence</h4>
              <ul className="space-y-2 text-sm text-[#4A6572]">
                <li>✓ Verified lender and equipment</li>
                <li>✓ Money-back guarantee</li>
                <li>✓ Damage protection included</li>
                <li>✓ 24/7 customer support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
