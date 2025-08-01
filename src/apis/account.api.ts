import axiosInstance from './axiosInstance';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  email: string;
  forceNewOtp: boolean;
}

export interface ValidateResetOtpPayload {
  email: string;
  otp: string;
}

export interface UpdatePasswordPayload {
  email: string;
  newPassword: string;
}

export const login = (credentials: { email: string; password: string }) =>
  axiosInstance.post('/auth/login', credentials);

export const signup = (data: RegisterPayload) =>
  axiosInstance.post('/auth/signup', data);

export const resetPassword = (data: ResetPasswordPayload) =>
  axiosInstance.post('/auth/reset-password', data);

export const validateResetOtp = (data: ValidateResetOtpPayload) =>
  axiosInstance.post('/auth/validate-reset-otp', data);

export const updatePassword = (data: UpdatePasswordPayload) =>
  axiosInstance.post('/auth/update-password', data);

export const checkOtpStatus = () =>
  axiosInstance.get(`/auth/otp-status`);

export const emailExists = (email: string) =>
  axiosInstance.post('/auth/email-exists', { email });

export const refreshToken = () =>
  axiosInstance.post('/auth/refresh-token');

export const logout = () =>
  axiosInstance.post('/auth/logout');

export const sendEmailVerification = () =>
  axiosInstance.post('/auth/send-email-verification');

export const verifyEmail = (token: string) =>
  axiosInstance.get(`/auth/verify-email?token=${token}`);