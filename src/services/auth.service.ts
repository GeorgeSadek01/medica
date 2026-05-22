import { db } from '../mock/db';
import type { Storable } from '../mock/db';

interface User extends Storable {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'patient' | 'doctor' | 'admin';
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
  specialty?: string;
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
    verified: user.verified,
  };
}

const SESSION_KEY = 'medica_session_userId';

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
    localStorage.setItem(SESSION_KEY, String(safeUser.id));
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
      verified: rest.role === 'doctor' ? false : undefined,
    });

    if (rest.role === 'doctor') {
      await db.create('doctors', {
        first_name: rest.first_name,
        last_name: rest.last_name,
        specialty: rest.specialty || 'General Medicine',
        bio: '',
        contact: rest.email,
        availability: [],
        bookedSlots: {},
        session_price: 0,
      });
    }

    const safeUser = omitPassword(newUser);
    localStorage.setItem(SESSION_KEY, String(safeUser.id));
    return { message: 'Registration successful', user: safeUser };
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: async () => {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    const user = await db.getById<User>('users', Number(userId));
    return user ? omitPassword(user) : null;
  },
};

export default authService;
