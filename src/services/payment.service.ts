import { getPaymentMethods } from '../apis/payment.api';
import type { PaymentMethodsResponse } from '../apis/payment.api';

export const paymentService = {
  async getPaymentMethods(): Promise<PaymentMethodsResponse> {
    try {
      const response = await getPaymentMethods();
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }
};
