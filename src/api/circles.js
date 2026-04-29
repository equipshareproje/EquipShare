import client from './client';

const circlesApi = {
  // GET /api/circles
  getCircles: () => client.get('/api/circles'),

  // GET /api/circles/:id
  getCircle: (id) => client.get(`/api/circles/${id}`),

  // POST /api/circles  (Admin only)
  createCircle: (data) => client.post('/api/circles', data),

  // POST /api/circles/:id/join
  joinCircle: (id) => client.post(`/api/circles/${id}/join`),

  // POST /api/circles/:id/leave
  leaveCircle: (id) => client.post(`/api/circles/${id}/leave`),

  // GET /api/circles/:id/members  (Admin only)
  getMembers: (id) => client.get(`/api/circles/${id}/members`),
};

export default circlesApi;
