import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services';
import type { RootState } from './index';

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  avatar?: string;
  verified?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  initialized: false,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authService.login(data);
      return res.user as User;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Login failed');
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    data: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      role: 'patient' | 'doctor';
      specialty?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await authService.register(data);
      return res.user as User;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Registration failed');
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user as User | null;
    } catch {
      return rejectWithValue('Failed to fetch user');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.error = null;
      authService.logout();
    },
    clearError(state) {
      state.error = null;
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Login failed';
        state.initialized = true;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Registration failed';
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.initialized = true;
      });
  },
});

export const { logout, clearError, updateUser } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.user !== null;

export default authSlice.reducer;
