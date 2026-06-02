import api from './api';

const SESSION_KEY = 'medica_session_userId';

const authService = {
  login: async (data: { email: string; password: string }) => {
    const res = await api.post('/auth/token/', data);
    localStorage.setItem('accessToken', res.data.access);
    localStorage.setItem('refreshToken', res.data.refresh);
    localStorage.setItem(SESSION_KEY, String(res.data.user.id));
    return res.data;
  },

  register: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: 'patient' | 'doctor';
    specialty?: string;
  }) => {
    const res = await api.post('/auth/register/', data);
    localStorage.setItem('accessToken', res.data.access);
    localStorage.setItem('refreshToken', res.data.refresh);
    localStorage.setItem(SESSION_KEY, String(res.data.user.id));
    return { message: 'Registration successful', user: res.data.user };
  },

  logout: () => {
    const refresh = localStorage.getItem('refreshToken');
    if (refresh) {
      api.post('/auth/logout/', { refresh }).catch(() => {});
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: async () => {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    try {
      const res = await api.get('/auth/me/');
      return res.data;
    } catch {
      return null;
    }
  },

  requestPasswordReset: async (email: string) => {
    const res = await api.post('/auth/password-reset/', { email });
    return res.data;
  },

  confirmPasswordReset: async (uidb64: string, token: string, password: string) => {
    const res = await api.post('/auth/password-reset/confirm/', { uidb64, token, password });
    return res.data;
  },

  verifyEmail: async (uidb64: string, token: string) => {
    const res = await api.post('/auth/verify-email/', { uidb64, token });
    return res.data;
  },

  resendVerification: async () => {
    const res = await api.post('/auth/resend-verification/');
    return res.data;
  },

  googleLogin: async (credential: string) => {
    const res = await api.post('/auth/google/', { credential });
    localStorage.setItem('accessToken', res.data.access);
    localStorage.setItem('refreshToken', res.data.refresh);
    localStorage.setItem(SESSION_KEY, String(res.data.user.id));
    return res.data;
  },
};

export default authService;
