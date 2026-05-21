import { db } from '../mock/db';
import type { Storable } from '../mock/db';

interface User extends Storable {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'patient' | 'doctor';
  phone?: string;
  avatar?: string;
}

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

function omitPassword(user: User): Omit<User, 'password'> {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
  };
}

const authService = {
  login: async (data: LoginData) => {
    const user = await db.find<User>(
      'users',
      (u) => u.email === data.email && u.password === data.password,
    );
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const safeUser = omitPassword(user);
    localStorage.setItem('accessToken', 'mock_access_token_123');
    localStorage.setItem('refreshToken', 'mock_refresh_token_456');
    localStorage.setItem('user', JSON.stringify(safeUser));
    return {
      access: 'mock_access_token_123',
      refresh: 'mock_refresh_token_456',
      user: safeUser,
    };
  },

  register: async (data: RegisterData) => {
    const existing = await db.find<User>('users', (u) => u.email === data.email);
    if (existing) {
      throw new Error('An account with this email already exists');
    }
    const { password, ...rest } = data;
    const newUser = await db.create<User>('users', {
      email: rest.email,
      password,
      first_name: rest.first_name,
      last_name: rest.last_name,
      role: rest.role,
    });
    const safeUser = omitPassword(newUser);
    localStorage.setItem('user', JSON.stringify(safeUser));
    return { message: 'Registration successful', user: safeUser };
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    await db.getAll('users');
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  },
};

export default authService;
