import client from './client';

const disputesApi = {
  // POST /api/disputes
  fileDispute: (data) => client.post('/api/disputes', data),

  // GET /api/disputes  (Admin only, optional ?status=)
  getDisputes: (status) =>
    client.get('/api/disputes', { params: status ? { status } : {} }),

  // GET /api/disputes/my
  getMyDisputes: () => client.get('/api/disputes/my'),

  // GET /api/disputes/:id
  getDispute: (id) => client.get(`/api/disputes/${id}`),

  // POST /api/disputes/:id/resolve  (Admin only)
  resolveDispute: (id, data) => client.post(`/api/disputes/${id}/resolve`, data),
};

export default disputesApi;
