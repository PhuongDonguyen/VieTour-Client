import * as accountApi from '../apis/account.api';

export const loginUser = async (credentials: { email: string; password: string, role? : string }) => {
  try {
    const response = await accountApi.login(credentials);
    localStorage.setItem('token', response.data.token);
    return response.data.user;
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.response.data.message);
  }
};

export const signupUser = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
  try {
    const response = await accountApi.signup(data);
    localStorage.setItem('token', response.data.token);
    return response.data.user;
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.response.data.message);
  }
};

export const resetPasswordUser = async (data: { email: string, forceNewOtp: boolean }) => {
  try {
    const response = await accountApi.resetPassword(data);
    return response.data;
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.response.data.message);
  }
};

export const validateResetOtpUser = async (data: { email: string; otp: string }) => {
  try {
    const response = await accountApi.validateResetOtp(data);
    return response.data;
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.response.data.message);
  }
};

export const updatePasswordUser = async (data: { email: string; newPassword: string }) => {
  try {
    const response = await accountApi.updatePassword(data);
    return response.data;
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.response.data.message);
  }
};

export const checkOtpStatusUser = async () => {
  try {
    const response = await accountApi.checkOtpStatus();
    return response.data;
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.response.data.message);
  }
};

export const checkEmailExists = async (email: string) => {
  try {
    const response = await accountApi.emailExists(email);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi kiểm tra email');
  }
};

export const sendEmailVerificationUser = async () => {
  try {
    const response = await accountApi.sendEmailVerification();
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi gửi email xác thực');
  }
};

export const verifyEmailUser = async (token: string) => {
  try {
    const response = await accountApi.verifyEmail(token);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Lỗi xác thực email');
  }
};