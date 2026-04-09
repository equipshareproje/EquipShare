import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import DateRangeCalendar from '../components/DateRangeCalendar';
import listings from '../data/listings.json';

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const equipment = listings.find(item => item.id === parseInt(id));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

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

  // Calculate number of days based on selected dates
  let bookingDays = 1;
  if (startDate && endDate) {
    // Parse dates in local timezone to avoid UTC offset issues
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    const diffTime = Math.abs(end - start);
    bookingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  }

  // Calculate cost
  const totalCost = equipment.dailyRate * bookingDays;
  const serviceFee = totalCost * 0.1;
  const finalCost = totalCost + serviceFee;

  // Get availability dates
  const availStart = new Date(equipment.availability.startDate);
  const availEnd = new Date(equipment.availability.endDate);
  const today = new Date().toISOString().split('T')[0];
  const minDate = new Date(Math.max(availStart, new Date())).toISOString().split('T')[0];
  const maxDate = availEnd.toISOString().split('T')[0];

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

    // Create a booking request
    const bookingRequest = {
      id: `BR-${Date.now()}`, // Unique booking request ID
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      equipmentImage: equipment.image,
      equipmentCategory: equipment.category,
      renterId: user.id,
      renterName: user.name || `User ${user.id}`,
      renterEmail: user.email,
      lenderId: equipment.lenderId,
      startDate,
      endDate,
      days: bookingDays,
      dailyRate: equipment.dailyRate,
      subtotal: totalCost,
      serviceFee,
      totalCost: finalCost,
      status: 'pending', // 'pending' | 'approved' | 'rejected' | 'completed'
      createdAt: new Date().toISOString(),
      requestedAt: new Date().toISOString().split('T')[0],
    };

    // Store booking request in localStorage
    const bookingRequests = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
    bookingRequests.push(bookingRequest);
    localStorage.setItem('bookingRequests', JSON.stringify(bookingRequests));

    alert(`Booking request submitted!\n\nRequest ID: ${bookingRequest.id}\n\nThe lender will review your request shortly. Check your dashboard for updates.`);
    navigate('/dashboard');
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
                <p className="text-sm text-[#4A6572]">Photo gallery with additional images coming soon</p>
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
                  <div className="text-yellow-400">★★★★★</div>
                </div>
                <span className="text-[#4A6572]">({equipment.reviews} reviews)</span>
                {equipment.verified && (
                  <span className="ml-auto inline-block text-sm font-semibold text-[#1A7F5A] bg-green-100 px-3 py-1 rounded">
                    VERIFIED EQUIPMENT
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#003E51] mb-2">Description</h3>
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
                  <p className="text-[#4A6572]">LOCATION: {equipment.location}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#0A1F29] mb-1">Daily Rate</h4>
                  <p className="text-2xl font-bold text-[#003E51]">{equipment.dailyRate} SAR</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#0A1F29] mb-1">Availability</h4>
                  <p className="text-[#4A6572]">
                    {equipment.available ? 'Available' : 'Not Available'}
                  </p>
                </div>
              </div>

              {/* Availability Dates */}
              <div>
                <h4 className="text-sm font-semibold text-[#0A1F29] mb-2">Rental Period</h4>
                <p className="text-[#4A6572]">
                  From {new Date(equipment.availability.startDate).toLocaleDateString()} to{' '}
                  {new Date(equipment.availability.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Lender Profile */}
            <div
              onClick={() => navigate(`/user/${lender.id}`)}
              className="bg-white rounded-lg shadow-md p-6 mb-6 hover:shadow-lg hover:bg-[#F4F7F8] cursor-pointer transition-all"
            >
              <h3 className="text-lg font-bold text-[#003E51] mb-4">About the Lender</h3>
              <div className="flex items-start gap-4">
                <img
                  src={lender.avatar}
                  alt={lender.name}
                  className="w-16 h-16 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-[#00879E] hover:text-[#003E51] transition-colors">
                    {lender.name}
                  </h4>
                  <div className="text-sm text-[#4A6572] mb-3">
                    <p>{lender.rating} rating • {lender.reviewCount} reviews</p>
                    <p>Responds ~{lender.responseTime}</p>
                    <p>Member since {lender.memberSince}</p>
                  </div>
                  {lender.verified && (
                    <span className="inline-block text-xs font-semibold text-[#1A7F5A] bg-green-100 px-2 py-1 rounded">
                      VERIFIED LENDER
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#D0DDE2]">
                <span className="text-[#00879E] text-sm font-semibold hover:underline">
                  View Profile & Reviews →
                </span>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-[#003E51] mb-4">Reviews</h3>
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
                        {'★'.repeat(review.rating)}
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
              <h3 className="text-lg font-bold text-[#003E51] mb-4">Booking Summary</h3>

              <div className="bg-[#F4F7F8] rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[#4A6572]">Equipment Rate</span>
                  <span className="font-semibold text-[#003E51]">
                    {equipment.dailyRate} SAR/day
                  </span>
                </div>

                {/* Calendar with Available Dates */}
                <DateRangeCalendar
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  minDate={minDate}
                  maxDate={maxDate}
                />

                <div className="space-y-2 pb-4 border-b border-[#D0DDE2]">
                  {startDate && endDate && (
                    <>
                      <div className="flex justify-between text-[#4A6572]">
                        <span>Selected Dates</span>
                        <span className="font-semibold">{new Date(startDate + 'T00:00:00').toLocaleDateString()} - {new Date(endDate + 'T00:00:00').toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-[#4A6572]">
                        <span>Duration</span>
                        <span className="font-semibold">{bookingDays} day{bookingDays > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between text-[#4A6572]">
                        <span>Subtotal ({bookingDays} day{bookingDays > 1 ? 's' : ''})</span>
                        <span>{totalCost} SAR</span>
                      </div>
                      <div className="flex justify-between text-[#4A6572]">
                        <span>Service Fee (10%)</span>
                        <span>{serviceFee.toFixed(2)} SAR</span>
                      </div>
                    </>
                  )}
                  {(!startDate || !endDate) && (
                    <p className="text-sm text-[#4A6572] italic">Select dates to see pricing</p>
                  )}
                </div>

                {startDate && endDate && (
                  <div className="flex justify-between items-center mt-4 mb-6">
                    <span className="font-bold text-[#003E51]">Total</span>
                    <span className="text-2xl font-bold text-[#003E51]">
                      {finalCost.toFixed(2)} SAR
                    </span>
                  </div>
                )}
              </div>

              {!showBookingForm ? (
                <Button
                  onClick={handleBooking}
                  variant="primary"
                  className="w-full"
                  disabled={!equipment.available || !startDate || !endDate}
                >
                  {!equipment.available && 'Not Available'}
                  {equipment.available && (!startDate || !endDate) && 'Select Dates to Book'}
                  {equipment.available && startDate && endDate && 'Book Now'}
                </Button>
              ) : null}

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
