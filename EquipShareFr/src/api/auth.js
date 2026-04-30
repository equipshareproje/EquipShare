import client from './client';

const authApi = {
  register: (data) =>
    client.post('/api/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
    }),

  login: (email, password) =>
    client.post('/api/auth/login', { email, password }),

  logout: () => client.post('/api/auth/logout'),

  refresh: () => client.post('/api/auth/refresh'),

  me: () => client.get('/api/auth/me'),

  resendVerification: (email) =>
    client.post('/api/auth/resend-verification', { email }),
};

export default authApi;
