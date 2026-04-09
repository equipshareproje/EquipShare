import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../components/Button';
import Card from '../components/Card';
import listingsData from '../data/listings.json';

const Landing = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (id) => {
    navigate(`/equipment/${id}`);
  };

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleBrowseMarketplace = () => {
    navigate('/marketplace');
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
              <p className="text-xl text-white leading-relaxed max-w-lg">
                EquipShare is the easiest way for KFUPM students and freelancers to rent premium equipment without breaking the bank.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="xl"
                  className="font-semibold"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
                <Button
                  size="xl"
                  className="font-semibold"
                  onClick={handleBrowseMarketplace}
                >
                  Browse Marketplace
                </Button>
              </div>
              <div className="flex items-center space-x-8 pt-4 text-sm">
                <div>
                  <p className="font-bold text-2xl">1,200+</p>
                  <p className="text-white">Items Available</p>
                </div>
                <div>
                  <p className="font-bold text-2xl">500+</p>
                  <p className="text-white">Active Members</p>
                </div>
                <div>
                  <p className="font-bold text-2xl">4.7/5</p>
                  <p className="text-white">Community Rating</p>
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
    </div>
  );
};

export default Landing;
