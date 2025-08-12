import { createMomoPayment } from "./momo.service";
import { createVNPayPayment } from "./vnpay.service";
import type { PaymentMethod } from "../apis/payment.api";

interface PaymentRequest {
  amount: number;
  orderInfo: string;
  bookingId?: number;
}

interface PaymentResult {
  success: boolean;
  payUrl?: string;
  error?: string;
}

export const processPayment = async (
  paymentMethod: PaymentMethod,
  paymentRequest: PaymentRequest
): Promise<PaymentResult> => {
  try {
    switch (paymentMethod.payment_method.toLowerCase()) {
      case "momo": {
        const momoResult = await createMomoPayment({
          amount: paymentRequest.amount,
          orderInfo: paymentRequest.orderInfo,
        });

        if (momoResult && momoResult.payUrl) {
          return {
            success: true,
            payUrl: momoResult.payUrl,
          };
        } else {
          return {
            success: false,
            error: "Không thể tạo liên kết thanh toán MoMo",
          };
        }
      }

      case "vnpay": {
        const vnpayResult = await createVNPayPayment({
          amount: paymentRequest.amount,
          orderInfo: paymentRequest.orderInfo,
        });

        console.log("VNPay result:", vnpayResult); // Debug log

        // VNPay response structure: { success: true, data: { paymentUrl: "...", ... } }
        if (
          vnpayResult &&
          vnpayResult.success &&
          vnpayResult.data &&
          vnpayResult.data.paymentUrl
        ) {
          console.log("VNPay payment URL:", vnpayResult.data.paymentUrl); // Debug log
          return {
            success: true,
            payUrl: vnpayResult.data.paymentUrl,
          };
        } else {
          console.log("VNPay payment failed - missing paymentUrl"); // Debug log
          return {
            success: false,
            error: "Không thể tạo liên kết thanh toán VNPay",
          };
        }
      }

      case "bank_transfer": {
        // TODO: Implement bank transfer instructions
        return {
          success: false,
          error: "Chuyển khoản ngân hàng sẽ được hỗ trợ sớm",
        };
      }

      default: {
        return {
          success: false,
          error: `Phương thức thanh toán ${paymentMethod.payment_method} chưa được hỗ trợ`,
        };
      }
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra trong quá trình xử lý thanh toán",
    };
  }
};

export const getPaymentMethodDisplayName = (method: string): string => {
  switch (method.toLowerCase()) {
    case "momo":
      return "Ví điện tử MoMo";
    case "vnpay":
      return "Cổng thanh toán VNPay";
    case "bank_transfer":
      return "Chuyển khoản ngân hàng";
    default:
      return method;
  }
};
