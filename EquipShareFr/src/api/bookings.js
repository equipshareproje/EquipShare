import client from './client';

const bookingsApi = {
  // POST /api/bookings — returns { bookingId, clientSecret }
  createBooking: (listingId, startDate, endDate) =>
    client.post('/api/bookings', { listingId, startDate, endDate }),

  // GET /api/bookings/my/renting
  getMyRenting: () => client.get('/api/bookings/my/renting'),

  // GET /api/bookings/my/lending
  getMyLending: () => client.get('/api/bookings/my/lending'),

  // GET /api/bookings/:id
  getBooking: (id) => client.get(`/api/bookings/${id}`),

  // POST /api/bookings/:id/approve
  approveBooking: (id) => client.post(`/api/bookings/${id}/approve`),

  // POST /api/bookings/:id/reject
  rejectBooking: (id, reason) =>
    client.post(`/api/bookings/${id}/reject`, { reason }),

  // POST /api/bookings/:id/handover/pre-rental  (multipart, field: photos)
  uploadPreRentalPhotos: (id, files) => {
    const form = new FormData();
    files.forEach((f) => form.append('photos', f));
    return client.post(`/api/bookings/${id}/handover/pre-rental`, form);
  },

  // POST /api/bookings/:id/handover/received  (multipart, field: photos)
  uploadReceivedPhotos: (id, files) => {
    const form = new FormData();
    files.forEach((f) => form.append('photos', f));
    return client.post(`/api/bookings/${id}/handover/received`, form);
  },
};

export default bookingsApi;
