import axiosInstance from "./axiosInstance";

export interface InitVnPayPaymentPayload {
  amount: number;
  orderInfo: string;
}

export const initVnPayPayment = (data: InitVnPayPaymentPayload) =>
  axiosInstance.post("/vnpay/create-payment-url", data);
