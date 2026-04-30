import client from './client';

const listingsApi = {
  // Upload one photo; returns { url }
  uploadPhoto: (file) => {
    const form = new FormData();
    form.append('photo', file);
    return client.post('/api/listings/upload-photo', form);
  },

  // GET /api/listings — all query params optional
  getListings: (params = {}) =>
    client.get('/api/listings', { params }),

  // GET /api/listings/my
  getMyListings: () => client.get('/api/listings/my'),

  // GET /api/listings/:id
  getListing: (id) => client.get(`/api/listings/${id}`),

  // POST /api/listings — photos must already be uploaded URLs
  createListing: (data) => client.post('/api/listings', data),

  // PUT /api/listings/:id
  updateListing: (id, data) => client.put(`/api/listings/${id}`, data),

  // DELETE /api/listings/:id
  deleteListing: (id) => client.delete(`/api/listings/${id}`),
};

export default listingsApi;
