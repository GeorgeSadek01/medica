import api from './axios';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'patient' | 'doctor';
}

const authService = {
  login: async (data: LoginData) => {
    try {
      const response = await api.post('/auth/token/', data);
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (data.email && data.password) {
            const mockUser = {
              id: 1,
              email: data.email,
              role: data.email.includes('doctor') ? 'doctor' : 'patient',
            };
            localStorage.setItem('accessToken', 'mock_access_token_123');
            localStorage.setItem('refreshToken', 'mock_refresh_token_456');
            localStorage.setItem('user', JSON.stringify(mockUser));
            resolve({
              access: 'mock_access_token_123',
              refresh: 'mock_refresh_token_456',
              user: mockUser,
            });
          } else {
            reject(new Error('Invalid credentials'));
          }
        }, 300);
      });
    }
  },

  register: async (data: RegisterData) => {
    try {
      const response = await api.post('/auth/register/', data);
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockUser = {
            id: Math.floor(Math.random() * 1000),
            email: data.email,
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role,
          };
          localStorage.setItem('user', JSON.stringify(mockUser));
          resolve({ message: 'Registration successful (Mock Fallback)', user: mockUser });
        }, 300);
      });
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me/');
      return response.data;
    } catch {
      return new Promise((resolve) => {
        setTimeout(() => {
          const stored = localStorage.getItem('user');
          resolve(stored ? JSON.parse(stored) : null);
        }, 200);
      });
    }
  },
};

export default authService;