import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import reviewsApi from '../api/reviews';

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await reviewsApi.getUserReviews(userId);
        const data = res.data.data;
        setReviews(Array.isArray(data) ? data : data?.reviews || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  // Derive display name from the first review's reviewee info if available
  const revieweeInfo = reviews[0]?.revieweeId || reviews[0]?.reviewee || null;
  const displayName = revieweeInfo?.name || `User`;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.starRating || r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#003E51] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F8]">
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
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* User Card */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="flex items-start gap-6 pb-6 border-b border-[#D0DDE2]">
                <div className="w-24 h-24 rounded-full bg-[#003E51] flex items-center justify-center text-white text-3xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-[#003E51] mb-1">{displayName}</h1>
                  {revieweeInfo?.isVerified && (
                    <span className="inline-block text-xs font-semibold text-[#1A7F5A] bg-green-100 px-3 py-1 rounded mb-2">
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-[#F4F7F8] rounded-lg p-4 text-center">
                  <p className="text-[#4A6572] text-sm mb-1">Rating</p>
                  <p className="text-2xl font-bold text-[#003E51]">
                    {avgRating ? `${avgRating} ★` : 'N/A'}
                  </p>
                </div>
                <div className="bg-[#F4F7F8] rounded-lg p-4 text-center">
                  <p className="text-[#4A6572] text-sm mb-1">Reviews</p>
                  <p className="text-2xl font-bold text-[#003E51]">{reviews.length}</p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#D0DDE2]">
                <h2 className="text-2xl font-bold text-[#003E51]">Reviews</h2>
                <span className="text-[#4A6572] text-sm">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="pb-6 border-b border-[#D0DDE2] last:border-b-0">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-[#003E51]">
                              {review.reviewerId?.name || review.reviewer?.name || 'Anonymous'}
                            </p>
                          </div>
                          <p className="text-sm text-[#4A6572]">{formatDate(review.createdAt)}</p>
                        </div>
                        <span className="text-lg font-bold text-[#003E51]">
                          {'★'.repeat(review.starRating || review.rating || 0)}
                          <span className="text-[#D0DDE2]">
                            {'★'.repeat(5 - (review.starRating || review.rating || 0))}
                          </span>
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-[#4A6572] leading-relaxed">{review.comment}</p>
                      )}
                      {review.listingId?.title && (
                        <p className="text-xs text-[#00879E] mt-2">Equipment: {review.listingId.title}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-[#4A6572] mb-2">No reviews yet</p>
                  <p className="text-sm text-[#4A6572]">This user hasn't received any reviews yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#F4F7F8] rounded-lg p-6">
              <h4 className="font-bold text-[#003E51] mb-4">Trust Indicators</h4>
              <div className="space-y-3">
                {revieweeInfo?.isVerified && (
                  <div className="flex items-start gap-2">
                    <span className="text-[#1A7F5A] mt-1">✓</span>
                    <div>
                      <p className="font-semibold text-sm text-[#003E51]">Verified User</p>
                      <p className="text-xs text-[#4A6572]">Identity confirmed</p>
                    </div>
                  </div>
                )}
                {avgRating && (
                  <div className="flex items-start gap-2">
                    <span className="text-[#00879E]">★</span>
                    <div>
                      <p className="font-semibold text-sm text-[#003E51]">Rated {avgRating}/5</p>
                      <p className="text-xs text-[#4A6572]">
                        Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
