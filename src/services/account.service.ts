import * as accountApi from '../apis/account.api';

export const loginUser = async (credentials: { email: string; password: string }) => {
  try {
    const response = await accountApi.login(credentials);
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    throw new Error('Login failed');
  }
};