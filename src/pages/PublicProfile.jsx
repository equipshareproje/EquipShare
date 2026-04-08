import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  // Mock users database with reviews
  const usersDatabase = {
    '1': {
      id: '1',
      name: 'Lender 1 (Ahmed Al-Otaibi)',
      avatar: 'https://via.placeholder.com/120?text=Ahmed',
      role: 'lender',
      verified: true,
      joinDate: 'January 2025',
      location: 'KFUPM, Building A',
      rating: 4.8,
      responseTime: '2 hours',
      bio: 'Photography enthusiast and equipment rental expert. Specialized in camera equipment and electronics.',
      listings: 12,
      rentals: 45,
      reviews: [
        {
          id: 1,
          author: 'Sarah Al-Mansouri',
          isRenter: true,
          rating: 5,
          date: '2 weeks ago',
          comment: 'Excellent lender! Equipment was in perfect condition and delivered on time. Very professional.',
          reviewType: 'As Lender',
        },
        {
          id: 2,
          author: 'Omar Al-Shehri',
          isRenter: true,
          rating: 5,
          date: '3 weeks ago',
          comment: 'Highly recommend. Great communication and well-maintained equipment. Will rent again!',
          reviewType: 'As Lender',
        },
        {
          id: 3,
          author: 'Fatima Al-Kwari',
          isRenter: true,
          rating: 4,
          date: '1 month ago',
          comment: 'Good experience overall. Minor issue with pickup scheduling but resolved quickly.',
          reviewType: 'As Lender',
        },
        {
          id: 4,
          author: 'Mohammed Al-Dosari',
          isRenter: true,
          rating: 5,
          date: '1 month ago',
          comment: 'Perfect! Exactly as described. Fast delivery and great customer service.',
          reviewType: 'As Lender',
        },
        {
          id: 5,
          author: 'Noor Al-Harbi',
          isRenter: true,
          rating: 4,
          date: '6 weeks ago',
          comment: 'Very satisfied with this lender. Professional and reliable.',
          reviewType: 'As Lender',
        },
      ],
    },
    '2': {
      id: '2',
      name: 'Lender 2 (Sarah Al-Otaibi)',
      avatar: 'https://via.placeholder.com/120?text=Sarah',
      role: 'lender',
      verified: true,
      joinDate: 'December 2024',
      location: 'KFUPM, Building B',
      rating: 4.9,
      responseTime: '1 hour',
      bio: 'Tech lover and equipment sharing advocate. Love helping student projects come to life.',
      listings: 18,
      rentals: 62,
      reviews: [
        {
          id: 1,
          author: 'Ahmed Hassan',
          isRenter: true,
          rating: 5,
          date: '1 week ago',
          comment: 'Outstanding! Sarah is extremely responsive and helpful. Equipment was pristine.',
          reviewType: 'As Lender',
        },
        {
          id: 2,
          author: 'Layla Al-Mansouri',
          isRenter: true,
          rating: 5,
          date: '2 weeks ago',
          comment: 'Best rental experience yet. Sarah went above and beyond to help.',
          reviewType: 'As Lender',
        },
        {
          id: 3,
          author: 'Hassan Al-Motairi',
          isRenter: true,
          rating: 5,
          date: '1 month ago',
          comment: 'Perfect service. Very professional and trustworthy lender.',
          reviewType: 'As Lender',
        },
      ],
    },
    '3': {
      id: '3',
      name: 'John Smith',
      avatar: 'https://via.placeholder.com/120?text=John',
      role: 'lender',
      verified: true,
      joinDate: 'February 2025',
      location: 'KFUPM, Dorm 3',
      rating: 4.6,
      responseTime: '3 hours',
      bio: 'Outdoor and camping gear specialist. Always happy to help fellow students.',
      listings: 8,
      rentals: 28,
      reviews: [
        {
          id: 1,
          author: 'Yasir Al-Mutairi',
          isRenter: true,
          rating: 5,
          date: '1 week ago',
          comment: 'Great camping setup! Everything worked perfectly.',
          reviewType: 'As Lender',
        },
        {
          id: 2,
          author: 'Amira Al-Dosari',
          isRenter: true,
          rating: 4,
          date: '2 weeks ago',
          comment: 'Good lender. Equipment in good condition. Delivery was on time.',
          reviewType: 'As Lender',
        },
      ],
    },
    'renter-1': {
      id: 'renter-1',
      name: 'Ahmed Al-Mansouri',
      avatar: 'https://via.placeholder.com/120?text=Ahmed',
      role: 'renter',
      verified: true,
      joinDate: 'March 2025',
      location: 'KFUPM, Building C',
      rating: 4.7,
      completedRentals: 12,
      bio: 'Student photographer and filmmaker. Appreciate quality equipment and reliability.',
      reviews: [
        {
          id: 1,
          author: 'Lender 1 (Ahmed Al-Otaibi)',
          isLender: true,
          rating: 5,
          date: '1 week ago',
          comment: 'Excellent renter! Very careful with equipment and returned everything in perfect condition.',
          reviewType: 'As Renter',
        },
        {
          id: 2,
          author: 'Sarah Al-Otaibi',
          isLender: true,
          rating: 5,
          date: '2 weeks ago',
          comment: 'Professional and punctual. Took great care of the equipment. Highly recommended!',
          reviewType: 'As Renter',
        },
      ],
    },
    'renter-101': {
      id: 'renter-101',
      name: 'John Smith',
      avatar: 'https://via.placeholder.com/120?text=John',
      role: 'renter',
      verified: true,
      joinDate: 'February 2025',
      location: 'KFUPM, Dorm 5',
      rating: 4.6,
      completedRentals: 8,
      bio: 'Engineering student passionate about DIY projects and outdoor activities.',
      reviews: [
        {
          id: 1,
          author: 'Lender 1 (Ahmed Al-Otaibi)',
          isLender: true,
          rating: 5,
          date: '2 days ago',
          comment: 'Great renter! Very responsible and returned equipment in perfect condition.',
          reviewType: 'As Renter',
        },
        {
          id: 2,
          author: 'John Smith (Self)',
          isLender: true,
          rating: 4,
          date: '1 week ago',
          comment: 'Took good care of the pressure washer. Would rent again!',
          reviewType: 'As Renter',
        },
      ],
    },
    'renter-102': {
      id: 'renter-102',
      name: 'Jane Doe',
      avatar: 'https://via.placeholder.com/120?text=Jane',
      role: 'renter',
      verified: true,
      joinDate: 'January 2025',
      location: 'KFUPM, Building E',
      rating: 4.9,
      completedRentals: 15,
      bio: 'Filmmaker and content creator. Always looking for quality equipment for projects.',
      reviews: [
        {
          id: 1,
          author: 'Sarah Al-Otaibi',
          isLender: true,
          rating: 5,
          date: '5 days ago',
          comment: 'Exceptional renter! Very professional and meticulous about equipment care.',
          reviewType: 'As Renter',
        },
        {
          id: 2,
          author: 'Lender 4',
          isLender: true,
          rating: 5,
          date: '2 weeks ago',
          comment: 'Excellent experience. Would definitely lend to Jane again!',
          reviewType: 'As Renter',
        },
        {
          id: 3,
          author: 'Lender 2',
          isLender: true,
          rating: 4,
          date: '1 month ago',
          comment: 'Good renter, very responsible with equipment.',
          reviewType: 'As Renter',
        },
      ],
    },
    'renter-103': {
      id: 'renter-103',
      name: 'Ahmed Hassan',
      avatar: 'https://via.placeholder.com/120?text=Ahmed',
      role: 'renter',
      verified: true,
      joinDate: 'April 2025',
      location: 'KFUPM, Building A',
      rating: 4.3,
      completedRentals: 5,
      bio: 'Business student and event organizer. Renting equipment for projects and events.',
      reviews: [
        {
          id: 1,
          author: 'John Smith',
          isLender: true,
          rating: 4,
          date: '1 week ago',
          comment: 'Decent renter. Took reasonable care of the camping gear.',
          reviewType: 'As Renter',
        },
      ],
    },
  };

  const userProfile = usersDatabase[userId] || usersDatabase['1'];

  const getReviewTypeLabel = (review) => {
    if (userProfile.role === 'lender') {
      return 'Review as Lender';
    }
    return 'Review as Renter';
  };

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#D0DDE2]">
        <div className="container mx-auto px-4 max-w-6xl py-3">
          <button
            onClick={() => navigate(-1)}
            className="text-[#00879E] hover:text-[#003E51] font-medium text-sm"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* User Card */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="flex items-start gap-6 pb-6 border-b border-[#D0DDE2]">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-24 h-24 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-[#003E51]">
                      {userProfile.name}
                    </h1>
                    {userProfile.verified && (
                      <span className="inline-block text-xs font-semibold text-[#1A7F5A] bg-green-100 px-3 py-1 rounded">
                        ✅ Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[#4A6572] mb-4">{userProfile.bio}</p>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-[#4A6572]">Member Since</p>
                      <p className="font-semibold text-[#003E51]">{userProfile.joinDate}</p>
                    </div>
                    <div>
                      <p className="text-[#4A6572]">Location</p>
                      <p className="font-semibold text-[#003E51]">📍 {userProfile.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-[#F4F7F8] rounded-lg p-4 text-center">
                  <p className="text-[#4A6572] text-sm mb-1">Rating</p>
                  <p className="text-2xl font-bold text-[#003E51]">
                    {userProfile.rating}⭐
                  </p>
                </div>
                <div className="bg-[#F4F7F8] rounded-lg p-4 text-center">
                  <p className="text-[#4A6572] text-sm mb-1">
                    {userProfile.role === 'lender' ? 'Active Listings' : 'Completed Rentals'}
                  </p>
                  <p className="text-2xl font-bold text-[#003E51]">
                    {userProfile.role === 'lender'
                      ? userProfile.listings
                      : userProfile.completedRentals}
                  </p>
                </div>
                <div className="bg-[#F4F7F8] rounded-lg p-4 text-center">
                  <p className="text-[#4A6572] text-sm mb-1">
                    {userProfile.role === 'lender' ? 'Response Time' : 'Reviews'}
                  </p>
                  <p className="text-2xl font-bold text-[#003E51]">
                    {userProfile.role === 'lender'
                      ? userProfile.responseTime
                      : userProfile.reviews.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D0DDE2]">
                <h2 className="text-2xl font-bold text-[#003E51]">⭐ Reviews</h2>
                <span className="text-[#4A6572] text-sm">
                  {userProfile.reviews.length} review
                  {userProfile.reviews.length !== 1 ? 's' : ''}
                </span>
              </div>

              {userProfile.reviews.length > 0 ? (
                <div className="space-y-6">
                  {userProfile.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="pb-6 border-b border-[#D0DDE2] last:border-b-0"
                    >
                      <div className="flex items-start gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-[#003E51]">
                              {review.author}
                            </p>
                            <span className="text-xs bg-[#F4F7F8] text-[#4A6572] px-2 py-1 rounded">
                              {getReviewTypeLabel(review)}
                            </span>
                          </div>
                          <p className="text-sm text-[#4A6572]">{review.date}</p>
                        </div>
                        <span className="text-lg text-yellow-400">
                          {'⭐'.repeat(review.rating)}
                        </span>
                      </div>
                      <p className="text-[#4A6572] leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-[#4A6572] mb-2">😌 No reviews yet</p>
                  <p className="text-sm text-[#4A6572]">
                    This user hasn't received any reviews. Be the first!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Trust Indicators */}
            <div className="bg-[#F4F7F8] rounded-lg p-6">
              <h4 className="font-bold text-[#003E51] mb-4">🛡️ Trust Indicators</h4>
              <div className="space-y-3">
                {userProfile.verified && (
                  <div className="flex items-start gap-2">
                    <span className="text-[#1A7F5A] mt-1">✅</span>
                    <div>
                      <p className="font-semibold text-sm text-[#003E51]">
                        Verified User
                      </p>
                      <p className="text-xs text-[#4A6572]">
                        Identity confirmed
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <span className="text-[#00879E]">⭐</span>
                  <div>
                    <p className="font-semibold text-sm text-[#003E51]">
                      High Rating
                    </p>
                    <p className="text-xs text-[#4A6572]">
                      {userProfile.rating}/5 from {userProfile.reviews.length} review
                      {userProfile.reviews.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#1A7F5A]">📋</span>
                  <div>
                    <p className="font-semibold text-sm text-[#003E51]">
                      Active Member
                    </p>
                    <p className="text-xs text-[#4A6572]">
                      Member since {userProfile.joinDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
