import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import listings from '../data/listings.json';

export default function Marketplace() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'All',
    priceRange: [20, 1000],
    trustedCircles: false,
    sort: 'Newest',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Get unique categories from listings
  const categories = ['All', ...new Set(listings.map(item => item.category))];

  // Filter listings based on search and filters
  const filteredListings = useMemo(() => {
    let result = listings.filter(item => {
      // Search term filter
      const searchMatch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const categoryMatch = filters.category === 'All' || item.category === filters.category;

      // Price range filter
      const priceMatch = item.dailyRate >= filters.priceRange[0] && 
        item.dailyRate <= filters.priceRange[1];

      // Trusted Circles filter
      const trustedCirclesMatch = !filters.trustedCircles || item.trustedCircles;

      return searchMatch && categoryMatch && priceMatch && trustedCirclesMatch;
    });

    // Sort results
    if (filters.sort === 'Price: Low to High') {
      result.sort((a, b) => a.dailyRate - b.dailyRate);
    } else if (filters.sort === 'Price: High to Low') {
      result.sort((a, b) => b.dailyRate - a.dailyRate);
    } else if (filters.sort === 'Newest') {
      result.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }

    return result;
  }, [searchTerm, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredListings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      category: 'All',
      priceRange: [20, 1000],
      trustedCircles: false,
      sort: 'Newest',
    });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      {/* Header */}
      <div className="bg-[#003E51] text-white py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-gray-200">Find and rent equipment from KFUPM community</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name, category, or description..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="flex-1 px-4 py-3 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
            />
            <Button 
              onClick={resetFilters}
              variant="secondary"
              className="px-6"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h3 className="text-lg font-bold text-[#003E51] mb-4">Filters</h3>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0A1F29] mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0A1F29] mb-2">
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
              >
                <option value="Newest">Newest</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0A1F29] mb-2">
                Price Range
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.priceRange[0]}
                  onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                  className="w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-[#4A6572] bg-[#F4F7F8] p-2 rounded">
                  <span>{filters.priceRange[0]} SAR</span>
                  <span>-</span>
                  <span>{filters.priceRange[1]} SAR</span>
                </div>
              </div>
            </div>

            {/* Trusted Circles Filter */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.trustedCircles}
                  onChange={(e) => handleFilterChange('trustedCircles', e.target.checked)}
                  className="w-4 h-4 rounded border-[#D0DDE2]"
                />
                <span className="text-sm font-medium text-[#0A1F29]">🤝 Trusted Circles Only</span>
              </label>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {/* Results Count */}
            <div className="mb-4 text-[#4A6572]">
              <p>
                Showing <span className="font-semibold text-[#003E51]">{currentItems.length}</span> of{' '}
                <span className="font-semibold text-[#003E51]">{filteredListings.length}</span> results
              </p>
            </div>

            {/* Listings Grid */}
            {currentItems.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentItems.map(item => (
                    <Card
                      key={item.id}
                      onClick={() => navigate(`/equipment/${item.id}`)}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <div className="p-4">
                        <h3 className="font-bold text-[#003E51] truncate">{item.name}</h3>
                        <p className="text-sm text-[#4A6572] mb-2">{item.category}</p>

                        {/* Verified Badge */}
                        {item.verified && (
                          <span className="inline-block text-xs font-semibold text-[#1A7F5A] bg-green-100 px-2 py-1 rounded mb-2">
                            ✅ Verified
                          </span>
                        )}

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3 text-sm">
                          <span>⭐ {item.rating}</span>
                          <span className="text-[#4A6572]">({item.reviews})</span>
                        </div>

                        {/* Price & Location */}
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-2xl font-bold text-[#003E51]">
                              {item.dailyRate} <span className="text-sm text-[#4A6572]">SAR</span>
                            </p>
                            <p className="text-xs text-[#4A6572]">per day</p>
                          </div>
                          <p className="text-xs text-[#4A6572]">LOCATION: {item.location}</p>
                        </div>

                        {/* Availability Status */}
                        <div className="mt-3 pt-3 border-t border-[#D0DDE2]">
                          {item.available ? (
                            <span className="text-xs text-[#1A7F5A] font-semibold">✓ Available</span>
                          ) : (
                            <span className="text-xs text-[#DC2626] font-semibold">✗ Not Available</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#003E51] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F4F7F8]"
                    >
                      ← Previous
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg font-medium transition ${
                            currentPage === page
                              ? 'bg-[#003E51] text-white'
                              : 'border border-[#D0DDE2] text-[#003E51] hover:bg-[#F4F7F8]'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#003E51] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F4F7F8]"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-lg text-[#4A6572] mb-2">No equipment found</p>
                <p className="text-sm text-[#4A6572] mb-4">Try adjusting your filters or search terms</p>
                <Button onClick={resetFilters} variant="primary">
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
