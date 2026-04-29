import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import listingsApi from '../api/listings';

const API_CATEGORIES = [
  'All',
  'Power Tools',
  'Hand Tools',
  'Cameras & Photography',
  'Audio & Video',
  'Vehicles',
  'Construction',
  'Outdoor & Sports',
  'Electronics',
  'Other',
];

export default function Marketplace() {
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loadingListings, setLoadingListings] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'All',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    trustedCircleOnly: false,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchListings = useCallback(async (page = 1) => {
    setLoadingListings(true);
    setError('');
    try {
      const params = { page, limit: 12 };
      if (searchTerm) params.search = searchTerm;
      if (filters.category !== 'All') params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.trustedCircleOnly) params.trustedCircleOnly = 'true';

      const res = await listingsApi.getListings(params);
      let items = res.data.data.listings;

      // Client-side sort (API doesn't expose sort param in spec)
      if (filters.sort === 'price_asc') {
        items = [...items].sort((a, b) => a.dailyPrice - b.dailyPrice);
      } else if (filters.sort === 'price_desc') {
        items = [...items].sort((a, b) => b.dailyPrice - a.dailyPrice);
      }

      setListings(items);
      setMeta(res.data.data.meta);
    } catch (err) {
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoadingListings(false);
    }
  }, [searchTerm, filters]);

  // Debounce search + re-fetch when filters/page change
  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      fetchListings(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm, filters]); // eslint-disable-line

  useEffect(() => {
    fetchListings(currentPage);
  }, [currentPage]); // eslint-disable-line

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({ category: 'All', minPrice: '', maxPrice: '', sort: 'newest', trustedCircleOnly: false });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      <div className="bg-[#003E51] text-white py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-gray-200">Find and rent equipment from KFUPM community</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name, category, or description…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
            />
            <Button onClick={resetFilters} variant="secondary" className="px-6">
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h3 className="text-lg font-bold text-[#003E51] mb-4">Filters</h3>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0A1F29] mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
              >
                {API_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0A1F29] mb-2">Sort By</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0A1F29] mb-2">Price Range (SAR/day)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-1/2 px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-1/2 px-3 py-2 border border-[#D0DDE2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003E51]"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.trustedCircleOnly}
                  onChange={(e) => handleFilterChange('trustedCircleOnly', e.target.checked)}
                  className="w-4 h-4 rounded border-[#D0DDE2]"
                />
                <span className="text-sm font-medium text-[#0A1F29]">Trusted Circles Only</span>
              </label>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4 text-[#4A6572]">
              {loadingListings ? (
                <p>Loading listings…</p>
              ) : (
                <p>
                  Showing <span className="font-semibold text-[#003E51]">{listings.length}</span> of{' '}
                  <span className="font-semibold text-[#003E51]">{meta.total}</span> results
                </p>
              )}
            </div>

            {loadingListings ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : listings.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {listings.map((item) => (
                    <Card
                      key={item._id}
                      id={item._id}
                      name={item.title}
                      image={item.photos?.[0] || ''}
                      dailyRate={item.dailyPrice}
                      rating={item.rating}
                      reviews={item.reviewCount}
                      verified={false}
                      location=""
                      available={item.status === 'Active'}
                      onClick={() => navigate(`/equipment/${item._id}`)}
                    />
                  ))}
                </div>

                {meta.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#003E51] font-medium disabled:opacity-50 hover:bg-[#F4F7F8]"
                    >
                      ← Previous
                    </button>
                    {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
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
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, meta.totalPages))}
                      disabled={currentPage === meta.totalPages}
                      className="px-4 py-2 border border-[#D0DDE2] rounded-lg text-[#003E51] font-medium disabled:opacity-50 hover:bg-[#F4F7F8]"
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
                <Button onClick={resetFilters} variant="primary">Reset Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
