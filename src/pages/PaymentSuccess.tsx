import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Calendar,
  CreditCard,
  FileText,
  Home,
  User,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";

interface PaymentDetails {
  orderId: string;
  amount: string;
  bookingId: string;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Extract query parameters
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const bookingId = searchParams.get("bookingId");

    if (orderId && amount && bookingId) {
      setPaymentDetails({
        orderId,
        amount,
        bookingId,
      });

      // Show success toast
      setTimeout(() => {
        toast.success("Thanh toán thành công! Cảm ơn bạn đã đặt tour.");
      }, 500);
    } else {
      // Redirect to home if missing parameters
      toast.error("Thông tin thanh toán không hợp lệ.");
      navigate("/");
    }

    setIsLoading(false);
  }, [searchParams, navigate]);

  const formatAmount = (amount: string) => {
    return parseInt(amount).toLocaleString("vi-VN") + " VND";
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleViewBooking = () => {
    navigate("/user/my-bookings");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!paymentDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-25 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon and Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thanh toán thành công!
          </h1>
          <p className="text-lg text-gray-600">
            Cảm ơn bạn đã đặt tour. Chúng tôi sẽ liên hệ với bạn sớm nhất.
          </p>
        </div>

        {/* Payment Details Card */}
        <Card className="mb-6 py-0 shadow-lg border-0">
          <CardHeader className="bg-green-50 border-b py-6">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CreditCard className="w-5 h-5" />
              Chi tiết thanh toán
            </CardTitle>
            <CardDescription>
              Thông tin chi tiết về giao dịch thanh toán của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Mã đơn hàng:
              </span>
              <Badge variant="outline" className="font-mono">
                {paymentDetails.orderId}
              </Badge>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Mã đặt tour:
              </span>
              <Badge variant="outline" className="font-mono">
                #{paymentDetails.bookingId}
              </Badge>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Số tiền thanh toán:
              </span>
              <span className="text-2xl font-bold text-green-600">
                {formatAmount(paymentDetails.amount)}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Trạng thái:</span>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                ✓ Thành công
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="mb-6 py-0 shadow-lg border-0">
          <CardHeader className="bg-blue-50 py-6 border-b">
            <CardTitle className="text-blue-800">Bước tiếp theo</CardTitle>
            <CardDescription>
              Những việc bạn có thể làm tiếp theo
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>
                  Chúng tôi sẽ gửi email xác nhận đặt tour đến địa chỉ email của
                  bạn trong vòng 5 phút.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>
                  Đội ngũ tư vấn sẽ liên hệ với bạn trong vòng 24 giờ để xác
                  nhận thông tin chi tiết.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>
                  Bạn có thể xem và quản lý đặt tour trong mục "Đặt tour của
                  tôi".
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleViewBooking}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            size="lg"
          >
            <User className="w-4 h-4 mr-2" />
            Xem các tour đã đặt
          </Button>
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="flex-1 border-gray-300 hover:bg-gray-50"
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Về trang chủ
          </Button>
        </div>

        {/* Support Contact */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ:{" "}
            <a
              href="tel:+84123456789"
              className="text-orange-600 hover:underline font-medium"
            >
              0123 456 789
            </a>{" "}
            hoặc{" "}
            <a
              href="mailto:support@vietour.com"
              className="text-orange-600 hover:underline font-medium"
            >
              support@vietour.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
