import { initMomoPayment } from '../apis/momo.api';
import type { InitMomoPaymentPayload } from '../apis/momo.api';

export const createMomoPayment = async (data: InitMomoPaymentPayload) => {
  try {
    const response = await initMomoPayment(data);
    return response.data;
  } catch (error: any) {
    console.log({ error });
    throw new Error(error.response?.data?.message || 'Lỗi khởi tạo thanh toán Momo');
  }
}; 