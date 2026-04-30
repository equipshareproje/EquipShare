import client from './client';

const earningsApi = {
  // GET /api/earnings/summary
  getSummary: () => client.get('/api/earnings/summary'),

  // GET /api/earnings/transactions  (optional ?page=&limit=)
  getTransactions: (params = {}) =>
    client.get('/api/earnings/transactions', { params }),

  // POST /api/earnings/payout
  requestPayout: () => client.post('/api/earnings/payout'),

  // GET /api/earnings/payouts
  getPayouts: () => client.get('/api/earnings/payouts'),
};

export default earningsApi;
