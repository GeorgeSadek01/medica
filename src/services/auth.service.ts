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
    await new Promise((r) => setTimeout(r, 300));
    const mockUser = {
      id: 1,
      email: data.email,
      role: data.email.includes('doctor') ? 'doctor' : ('patient' as const),
    };
    localStorage.setItem('accessToken', 'mock_access_token_123');
    localStorage.setItem('refreshToken', 'mock_refresh_token_456');
    localStorage.setItem('user', JSON.stringify(mockUser));
    return {
      access: 'mock_access_token_123',
      refresh: 'mock_refresh_token_456',
      user: mockUser,
    };
  },

  register: async (data: RegisterData) => {
    await new Promise((r) => setTimeout(r, 300));
    const mockUser = {
      id: Math.floor(Math.random() * 1000),
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role,
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    return { message: 'Registration successful', user: mockUser };
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    await new Promise((r) => setTimeout(r, 200));
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  },
};

export default authService;
