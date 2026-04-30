import client from './client';

const reviewsApi = {
  // POST /api/reviews
  submitReview: (data) => client.post('/api/reviews', data),

  // GET /api/reviews/user/:userId
  getUserReviews: (userId) => client.get(`/api/reviews/user/${userId}`),

  // GET /api/reviews/listing/:listingId
  getListingReviews: (listingId) =>
    client.get(`/api/reviews/listing/${listingId}`),
};

export default reviewsApi;
