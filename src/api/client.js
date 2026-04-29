import axios from 'axios';

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  'https://equipshare-api.ambitiousdune-c1462722.eastus.azurecontainerapps.io';

// ── In-memory token store (never persisted to localStorage) ──────────────────
let accessToken = null;
let isRefreshing = false;
let failedQueue = [];
let logoutHandler = null;

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;
export const setLogoutHandler = (fn) => { logoutHandler = fn; };

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
};

// ── Axios instance ────────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends the HttpOnly refresh-token cookie cross-origin
});

// Attach Bearer token to every request
client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// On 401: attempt one silent refresh, then retry; on second failure → logout
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // Queue concurrent 401s until refresh resolves
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await client.post('/api/auth/refresh');
        const newToken = res.data.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        if (logoutHandler) logoutHandler();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
