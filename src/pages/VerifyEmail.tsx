import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmailUser } from '../services/account.service';
import { CheckCircle, XCircle, Loader2, Mail, Home, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setVerificationStatus('error');
      setMessage('Token không hợp lệ hoặc đã hết hạn.');
      toast.error('Token không hợp lệ hoặc đã hết hạn.');
      return;
    }

    const verifyEmailToken = async () => {
      try {
        const response = await verifyEmailUser(token);
        
        if (response.success) {
          setVerificationStatus('success');
          setMessage('Email đã được xác thực thành công!');
          toast.success('Email đã được xác thực thành công!');
          
          // Redirect to home page after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          setVerificationStatus('error');
          setMessage(response.message || 'Xác thực email thất bại.');
          toast.error(response.message || 'Xác thực email thất bại.');
        }
      } catch (error: any) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        // Handle the specific error response structure
        const errorMessage = error.message || error.response?.data?.message || 'Xác thực email thất bại. Vui lòng thử lại.';
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    verifyEmailToken();
  }, [searchParams, navigate]);

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'loading':
        return <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'Đang xác thực email...';
      case 'success':
        return 'Xác thực email thành công!';
      case 'error':
        return 'Xác thực email thất bại';
      default:
        return '';
    }
  };

  const getStatusDescription = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'Vui lòng chờ trong giây lát...';
      case 'success':
        return 'Email của bạn đã được xác thực thành công. Bạn sẽ được chuyển hướng về trang chủ trong vài giây.';
      case 'error':
        return message;
      default:
        return '';
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-25 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Status Icon and Header */}
        <div className="text-center mb-8">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
            verificationStatus === 'loading' ? 'bg-blue-100' :
            verificationStatus === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {getStatusIcon()}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getStatusTitle()}
          </h1>
          <p className="text-lg text-gray-600">
            {getStatusDescription()}
          </p>
        </div>

        {/* Verification Details Card */}
        <Card className="mb-6 py-0 shadow-lg border-0">
          <CardHeader className={`border-b py-6 ${
            verificationStatus === 'loading' ? 'bg-blue-50' :
            verificationStatus === 'success' ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <CardTitle className={`flex items-center gap-2 ${
              verificationStatus === 'loading' ? 'text-blue-800' :
              verificationStatus === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              <Mail className="w-5 h-5" />
              Chi tiết xác thực email
            </CardTitle>
            <CardDescription>
              {verificationStatus === 'loading' ? 'Đang xử lý yêu cầu xác thực...' :
               verificationStatus === 'success' ? 'Email đã được xác thực thành công' :
               'Có lỗi xảy ra trong quá trình xác thực'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Trạng thái:</span>
              <Badge className={
                verificationStatus === 'loading' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                verificationStatus === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                'bg-red-100 text-red-800 hover:bg-red-100'
              }>
                {verificationStatus === 'loading' ? '⏳ Đang xử lý' :
                 verificationStatus === 'success' ? '✓ Thành công' :
                 '✗ Thất bại'}
              </Badge>
            </div>

            <Separator />

            {verificationStatus === 'error' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lỗi:</span>
                  <span className="text-red-600 font-medium">{message}</span>
                </div>
                <Separator />
              </>
            )}

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Thời gian:</span>
              <span className="text-gray-900">
                {new Date().toLocaleString('vi-VN')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps Card - Only show for success */}
        {verificationStatus === 'success' && (
          <Card className="mb-6 py-0 shadow-lg border-0">
            <CardHeader className="bg-green-50 py-6 border-b">
              <CardTitle className="text-green-800">Bước tiếp theo</CardTitle>
              <CardDescription>
                Những việc bạn có thể làm tiếp theo
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="space-y-3 text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p>
                    Email của bạn đã được xác thực thành công. Bạn có thể sử dụng đầy đủ các tính năng của tài khoản.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p>
                    Bạn có thể đặt tour và nhận thông báo qua email.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p>
                    Truy cập trang cá nhân để quản lý thông tin tài khoản.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Help Card - Only show for error */}
        {verificationStatus === 'error' && (
          <Card className="mb-6 py-0 shadow-lg border-0">
            <CardHeader className="bg-red-50 py-6 border-b">
              <CardTitle className="text-red-800">Cần hỗ trợ?</CardTitle>
              <CardDescription>
                Những điều bạn có thể thử
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="space-y-3 text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p>
                    Token có thể đã hết hạn. Vui lòng yêu cầu gửi lại email xác thực.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p>
                    Kiểm tra lại đường link trong email xác thực.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p>
                    Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {verificationStatus === 'success' && (
            <Button
              onClick={handleGoHome}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          )}

          {verificationStatus === 'error' && (
            <>
              <Button
                onClick={handleRetry}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
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
            </>
          )}
        </div>

        {/* Support Contact */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Nếu bạn cần hỗ trợ, vui lòng liên hệ:{" "}
            <a
              href="tel:+84123456789"
              className="text-blue-600 hover:underline font-medium"
            >
              0123 456 789
            </a>{" "}
            hoặc{" "}
            <a
              href="mailto:support@vietour.com"
              className="text-blue-600 hover:underline font-medium"
            >
              support@vietour.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 