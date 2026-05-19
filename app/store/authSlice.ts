import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, LoginRequest, RegisterRequest } from '~/lib/auth';
import {
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  setStoredTokens,
  setStoredUser,
  clearStoredAuth,
} from '~/lib/auth';
import { loginUser, registerUser } from '~/services/auth';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

function getInitialState(): AuthState {
  const accessToken = getStoredAccessToken();
  const refreshToken = getStoredRefreshToken();
  const user = getStoredUser();

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!(accessToken && user),
    isLoading: false,
    error: null,
  };
}

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const data = await loginUser(credentials);
      setStoredTokens(data.access, data.refresh);
      setStoredUser(data.user);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      const axiosError = error as { response?: { data?: { detail?: string } }; message?: string };
      return rejectWithValue(
        axiosError.response?.data?.detail || axiosError.message || 'Login failed',
      );
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await registerUser(data);
      setStoredTokens(response.access, response.refresh);
      setStoredUser(response.user);
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      const axiosError = error as {
        response?: { data?: Record<string, string[]> | { detail?: string } };
        message?: string;
      };
      const errData = axiosError.response?.data;
      if (errData && typeof errData === 'object' && !('detail' in errData)) {
        const messages = Object.values(errData).flat().join(' ');
        return rejectWithValue(messages);
      }
      return rejectWithValue(
        (errData as { detail?: string })?.detail || axiosError.message || 'Registration failed',
      );
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      clearStoredAuth();
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ access: string; refresh: string; user: User }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<{ access: string; refresh: string; user: User }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Registration failed';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
