import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, TokenResponse } from '~/lib/auth';

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/token/', data);
  return response.data;
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register/', data);
  return response.data;
}

export async function refreshAccessToken(token: string): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/auth/token/refresh/', { refresh: token });
  return response.data;
}
