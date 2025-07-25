import axiosInstance from './axiosInstance';

export interface PaymentMethod {
  id: number;
  payment_method: string;
  thumbnail: string;
}

export interface PaymentMethodsResponse {
  success: boolean;
  data: PaymentMethod[];
}

export const getPaymentMethods = () =>
  axiosInstance.get('/api/payments');
