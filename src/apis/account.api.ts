import axiosInstance from './axiosInstance';

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const login = (credentials: { email: string; password: string }) =>
  axiosInstance.post('/auth/login', credentials);