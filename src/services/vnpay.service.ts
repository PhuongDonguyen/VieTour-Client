import { initVnPayPayment } from "../apis/vnpay.api";
import type { InitVnPayPaymentPayload } from "../apis/vnpay.api";

export const createVNPayPayment = async (data: {
  amount: number;
  orderInfo: string;
}) => {
  try {
    const vnpayData: InitVnPayPaymentPayload = {
      amount: data.amount,
      orderInfo: data.orderInfo,
    };

    const response = await initVnPayPayment(vnpayData);
    console.log("VNPay API response:", response.data); // Debug log
    return response.data; // This returns { success: true, data: { paymentUrl: "...", ... } }
  } catch (error: any) {
    console.log({ error });
    throw new Error(
      error.response?.data?.message || "Lỗi khởi tạo thanh toán VNPay"
    );
  }
};
