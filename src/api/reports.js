import client from './client';

const reportsApi = {
  // POST /api/reports
  fileReport: (data) => client.post('/api/reports', data),

  // GET /api/reports  (Admin only, optional ?status=)
  getReports: (status) =>
    client.get('/api/reports', { params: status ? { status } : {} }),

  // GET /api/reports/:id
  getReport: (id) => client.get(`/api/reports/${id}`),

  // POST /api/reports/:id/resolve  (Admin only)
  resolveReport: (id, data) => client.post(`/api/reports/${id}/resolve`, data),
};

export default reportsApi;
