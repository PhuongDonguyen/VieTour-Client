import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';

interface PaymentFailureDetails {
    message: string;
    errorCode?: string;
}

export default function PaymentFailed() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [failureDetails, setFailureDetails] = useState<PaymentFailureDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Extract query parameters
        const message = searchParams.get('message');
        const errorCode = searchParams.get('errorCode');

        if (message) {
            setFailureDetails({
                message: decodeURIComponent(message),
                errorCode: errorCode || undefined
            });

            // Show error toast
            setTimeout(() => {
                toast.error('Thanh toán không thành công. Vui lòng thử lại.');
            }, 500);
        } else {
            // Redirect to home if missing parameters
            toast.error('Thông tin thanh toán không hợp lệ.');
            navigate('/');
        }

        setIsLoading(false);
    }, [searchParams, navigate]);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleRetryPayment = () => {
        // Go back to the previous page (usually the booking form)
        window.history.back();
    };

    const handleGoToTours = () => {
        navigate('/');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!failureDetails) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-25 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Error Icon and Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="w-12 h-12 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Thanh toán không thành công
                    </h1>
                    <p className="text-lg text-gray-600">
                        Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
                    </p>
                </div>

                {/* Error Details Card */}
                <Card className="mb-6 shadow-lg border-0 border-l-4 border-l-red-500">
                    <CardHeader className="bg-red-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-red-800">
                            <AlertTriangle className="w-5 h-5" />
                            Chi tiết lỗi
                        </CardTitle>
                        <CardDescription>
                            Thông tin về lỗi thanh toán đã xảy ra
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-gray-600 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Lý do:
                            </span>
                            <div className="text-right flex-1 ml-4">
                                <p className="text-gray-900 font-medium">
                                    {failureDetails.message}
                                </p>
                            </div>
                        </div>

                        {failureDetails.errorCode && (
                            <>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Mã lỗi:</span>
                                    <Badge variant="outline" className="font-mono text-red-600 border-red-200">
                                        {failureDetails.errorCode}
                                    </Badge>
                                </div>
                            </>
                        )}

                        <Separator />

                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Trạng thái:</span>
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                ✗ Thất bại
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        onClick={handleRetryPayment}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                        size="lg"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Thử lại thanh toán
                    </Button>
                    <Button
                        onClick={handleGoToTours}
                        variant="outline"
                        className="flex-1 border-gray-300 hover:bg-gray-50"
                        size="lg"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Chọn tour khác
                    </Button>
                </div>

                <div className="flex justify-center mt-4">
                    <Button
                        onClick={handleGoHome}
                        variant="ghost"
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Về trang chủ
                    </Button>
                </div>

                {/* Support Contact */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Cần hỗ trợ? Liên hệ với chúng tôi:{' '}
                        <a href="tel:+84123456789" className="text-orange-600 hover:underline font-medium">
                            0123 456 789
                        </a>
                        {' '}hoặc{' '}
                        <a href="mailto:support@vietour.com" className="text-orange-600 hover:underline font-medium">
                            support@vietour.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}