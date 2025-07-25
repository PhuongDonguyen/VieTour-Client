import axiosInstance from './axiosInstance';

export interface InitMomoPaymentPayload {
  amount: number;
  orderInfo: string;
}

export const initMomoPayment = (data: InitMomoPaymentPayload) =>
  axiosInstance.post('/momo', data); 