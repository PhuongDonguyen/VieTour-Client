import { useState } from 'react';
import { sendEmailVerificationUser } from '../services/account.service';
import { toast } from 'sonner';
import { Mail, Loader2 } from 'lucide-react';

interface EmailVerificationButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const EmailVerificationButton = ({ 
  className = '', 
  variant = 'default',
  size = 'md' 
}: EmailVerificationButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendVerification = async () => {
    setIsLoading(true);
    try {
      await sendEmailVerificationUser();
      toast.success('Email xác thực đã được gửi! Vui lòng kiểm tra hộp thư của bạn.');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi gửi email xác thực');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    const variantClasses = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  return (
    <button
      onClick={handleSendVerification}
      disabled={isLoading}
      className={getButtonClasses()}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Mail className="w-4 h-4" />
      )}
      {isLoading ? 'Đang gửi...' : 'Gửi email xác thực'}
    </button>
  );
};

export default EmailVerificationButton; 