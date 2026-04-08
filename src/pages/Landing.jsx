import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../components/Button';
import Card from '../components/Card';
import listingsData from '../data/listings.json';

const Landing = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (id) => {
    navigate(`/listing/${id}`);
  };

  const handleGetStarted = () => {
    navigate('/auth/signup');
  };

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Rent Equipment. Save Money. Build Community.
              </h1>
              <p className="text-xl text-primary-light leading-relaxed max-w-lg">
                EquipShare is the easiest way for KFUPM students and freelancers to rent premium equipment without breaking the bank.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-primary-light hover:text-white"
                  onClick={handleGetStarted}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  Learn More
                </Button>
              </div>
              <div className="flex items-center space-x-8 pt-4 text-sm">
                <div>
                  <p className="font-bold text-2xl">1,200+</p>
                  <p className="text-primary-light">Items Available</p>
                </div>
                <div>
                  <p className="font-bold text-2xl">500+</p>
                  <p className="text-primary-light">Active Members</p>
                </div>
                <div>
                  <p className="font-bold text-2xl">4.7/5</p>
                  <p className="text-primary-light">Community Rating</p>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="hidden md:flex justify-center">
              <div className="relative w-full h-96 bg-primary-light rounded-2xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
                    <rect width="400" height="400" fill="currentColor" />
                  </svg>
                </div>
                <div className="relative text-center">
                  <div className="w-32 h-32 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl text-4xl">
                    📈
                  </div>
                  <p className="text-white text-lg font-semibold">Join the Community</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              How EquipShare Works
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Three simple steps to rent or share equipment with your community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border border-border">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary text-center mb-3">
                Browse & Search
              </h3>
              <p className="text-text-secondary text-center">
                Explore thousands of verified equipment listings. Filter by category, price, location, and availability.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border border-border">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-white font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary text-center mb-3">
                Book & Pay
              </h3>
              <p className="text-text-secondary text-center">
                Select your dates, review the cost, and complete a secure payment. No hidden fees!
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border border-border">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary text-center mb-3">
                Use & Return
              </h3>
              <p className="text-text-secondary text-center">
                Meet the lender, use the equipment, and return it in the agreed condition. Leave a review!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                Featured Equipment
              </h2>
              <p className="text-text-secondary text-lg">
                Recently listed and highly rated items
              </p>
            </div>
            <Button
              variant="text"
              className="hidden md:flex items-center space-x-2 text-primary hover:text-primary-dark"
              onClick={() => navigate('/marketplace')}
            >
              View All →
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {listingsData.slice(0, 6).map((listing) => (
              <Card
                key={listing.id}
                {...listing}
                onClick={() => handleCardClick(listing.id)}
              />
            ))}
          </div>

          <div className="md:hidden flex justify-center">
            <Button
              onClick={() => navigate('/marketplace')}
              className="flex items-center space-x-2"
            >
              View All Equipment →
            </Button>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-20 md:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Trust & Safety
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Your safety is our priority. Here's how we protect our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg p-6 border border-border text-center">
              <div className="text-4xl mx-auto mb-4">🛡️</div>
              <h3 className="font-bold text-text-primary mb-2">Verified Members</h3>
              <p className="text-text-secondary text-sm">
                All members are verified through KFUPM email and identity verification.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg p-6 border border-border text-center">
              <div className="text-4xl mx-auto mb-4">⭐</div>
              <h3 className="font-bold text-text-primary mb-2">Star Ratings</h3>
              <p className="text-text-secondary text-sm">
                Transparent ratings and reviews from real users. Quality assured.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg p-6 border border-border text-center">
              <div className="text-4xl mx-auto mb-4">👥</div>
              <h3 className="font-bold text-text-primary mb-2">Trusted Circle</h3>
              <p className="text-text-secondary text-sm">
                Rent from friends and vetted community members with priority pricing.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg p-6 border border-border text-center">
              <div className="text-4xl mx-auto mb-4">✅</div>
              <h3 className="font-bold text-text-primary mb-2">Photo Handshake</h3>
              <p className="text-text-secondary text-sm">
                Before & after equipment photos ensure accountability and trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Loved by the Community
            </h2>
            <p className="text-text-secondary text-lg">
              See what users are saying about EquipShare
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-center mb-4">
                ⭐⭐⭐⭐⭐
              </div>
              <p className="text-text-primary font-semibold mb-2">
                "Saved me 500 SAR on camera rental!"
              </p>
              <p className="text-text-secondary text-sm mb-4">
                I needed a professional camera for a project and found an amazing deal here instead of renting from expensive companies.
              </p>
              <p className="text-text-primary text-sm font-semibold">Fatima Al-Qahtani</p>
              <p className="text-text-secondary text-xs">KFUPM Student</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-center mb-4">
                ⭐⭐⭐⭐⭐
              </div>
              <p className="text-text-primary font-semibold mb-2">
                "Great way to help the community!"
              </p>
              <p className="text-text-secondary text-sm mb-4">
                I have extra equipment sitting at home. EquipShare lets me earn money while helping others. Win-win!
              </p>
              <p className="text-text-primary text-sm font-semibold">Ahmed Al-Dosari</p>
              <p className="text-text-secondary text-xs">Lender</p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-center mb-4">
                ⭐⭐⭐⭐⭐
              </div>
              <p className="text-text-primary font-semibold mb-2">
                "Very responsive and trustworthy lenders"
              </p>
              <p className="text-text-secondary text-sm mb-4">
                The Trusted Circle feature made me feel secure renting from verified community members. Highly recommended!
              </p>
              <p className="text-text-primary text-sm font-semibold">Sarah Al-Ali</p>
              <p className="text-text-secondary text-xs">Regular Renter</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-primary text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Sharing?
          </h2>
          <p className="text-xl text-primary-light mb-8 max-w-2xl mx-auto">
            Join thousands of students and freelancers renting and sharing equipment in the KFUPM community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-primary-light hover:text-white"
              onClick={handleGetStarted}
            >
              Sign Up Free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary"
              onClick={() => navigate('/marketplace')}
            >
              Browse Equipment
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
