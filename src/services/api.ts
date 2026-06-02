import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          if (!refreshPromise) {
            refreshPromise = (async () => {
              const baseURL = api.defaults.baseURL;
              const res = await axios.post(`${baseURL}/auth/token/refresh/`, {
                refresh: refreshToken,
              });
              const newToken = res.data.access;
              localStorage.setItem('accessToken', newToken);
              return newToken;
            })();
          }
          const newToken = await refreshPromise;
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('medica_session_userId');
          window.location.href = '/login';
        } finally {
          refreshPromise = null;
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
