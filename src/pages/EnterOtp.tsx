import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { validateResetOtpUser, resetPasswordUser } from '../services/account.service';



function useQuery() {
  return new URLSearchParams(window.location.search);
}

const OTP_LENGTH = 6;
const RESEND_OTP_SECONDS = 60;

const EnterOtp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();
  const email = location.state?.email || query.get('email') || '';
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(RESEND_OTP_SECONDS);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''));

  // Handle initial OTP request on page load
  useEffect(() => {
    if (email) {
      // Always send OTP on page load
      resetPasswordUser({ email, forceNewOtp: false })
        .then(() => {
          setResendTimer(RESEND_OTP_SECONDS);
        })
        .catch((err: any) => {
          setError(err.message || 'Không thể gửi mã OTP.');
        });
    }
  }, [email]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleResendOtp = async () => {
    setError('');
    setResendLoading(true);
    try {
      await resetPasswordUser({ email, forceNewOtp: true });
      setResendTimer(RESEND_OTP_SECONDS);
    } catch (err: any) {
      setError(err.message || 'Không thể gửi lại mã OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[idx] = value;
    setOtpValues(newOtp);
    if (value && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otpValues[idx]) {
        // Just clear current
        const newOtp = [...otpValues];
        newOtp[idx] = '';
        setOtpValues(newOtp);
      } else if (idx > 0) {
        // Move to previous
        inputRefs.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '');
    if (paste.length) {
      const newOtp = paste.split('').slice(0, OTP_LENGTH);
      while (newOtp.length < OTP_LENGTH) newOtp.push('');
      setOtpValues(newOtp);
      // Focus last filled
      const lastIdx = newOtp.findIndex(v => v === '');
      if (lastIdx === -1) {
        inputRefs.current[OTP_LENGTH - 1]?.focus();
      } else {
        inputRefs.current[lastIdx]?.focus();
      }
      e.preventDefault();
    }
  };

  const formik = useFormik({
    initialValues: { otp: '' },
    validate: () => {
      const errors: Record<string, string> = {};
      if (otpValues.join('').length !== OTP_LENGTH) errors.otp = 'Vui lòng nhập đủ mã OTP';
      return errors;
    },
    onSubmit: async () => {
      setError('');
      try {
        await validateResetOtpUser({ email, otp: otpValues.join('') });
        navigate(`/reset-password?isVerified=true`);
      } catch (err: any) {
        setError(err.message || 'Mã OTP không đúng hoặc đã hết hạn.');
      }
    },
  });

  if (!email) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-600 text-lg font-semibold mb-4">Đã xảy ra lỗi</div>
        <button
          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
          onClick={() => window.history.back()}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-orange-100 p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
        <h2 className="text-2xl font-bold text-orange-500 mb-4">Nhập mã OTP</h2>
        <p className="mb-4 text-gray-600 text-center">Mã OTP đã được gửi đến email: <span className="font-semibold">{email}</span></p>
        <form onSubmit={formik.handleSubmit} className="w-full flex flex-col gap-4">
          <div className="flex justify-center gap-2 mb-2">
            {otpValues.map((v, idx) => (
              <input
                key={idx}
                ref={el => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:border-orange-400 focus:outline-none bg-white shadow-sm transition-all"
                value={v}
                onChange={e => handleOtpChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={formik.isSubmitting}
                autoFocus={idx === 0}
              />
            ))}
          </div>
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              className={`text-orange-500 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || resendLoading}
            >
              {resendLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2 text-orange-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Đang gửi mã...
                </>
              ) : resendTimer > 0 ? `Gửi lại mã OTP (${resendTimer}s)` : 'Gửi lại mã OTP'}
            </button>
            {resendMsg && <div className="text-xs text-green-600 text-center">{resendMsg}</div>}
          </div>
          {formik.errors.otp && (
            <div className="text-xs text-red-500 text-start">{formik.errors.otp}</div>
          )}
          {error && (
            <div className="text-xs text-red-500 text-center font-semibold">{error}</div>
          )}
          <button
            type="submit"
            className={`w-full font-semibold py-3 rounded-lg transition-colors mt-2
              ${formik.isSubmitting || otpValues.every(v => v === '')
                ? 'bg-orange-300 text-white opacity-60 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'}
            `}
            disabled={formik.isSubmitting || otpValues.every(v => v === '')}
          >
            {formik.isSubmitting ? 'Đang xác thực...' : 'Xác nhận'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnterOtp; 