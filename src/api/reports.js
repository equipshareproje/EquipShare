import client from './client';

const reportsApi = {
  // POST /api/reports
  fileReport: (data) => client.post('/api/reports', data),

  // GET /api/reports  (Admin only, optional ?status=)
  getReports: (status) =>
    client.get('/api/reports', { params: status ? { status } : {} }),

  // GET /api/reports/my
  getMyReports: () => client.get('/api/reports/my'),

  // GET /api/reports/:id
  getReport: (id) => client.get(`/api/reports/${id}`),

  // PUT /api/reports/:id/status  (Admin only — mark as UnderReview)
  markUnderReview: (id) => client.put(`/api/reports/${id}/status`),

  // PUT /api/reports/:id/resolve  (Admin only)
  resolveReport: (id, data) => client.put(`/api/reports/${id}/resolve`, data),
};

export default reportsApi;
