import { useEffect, useState } from "react";
import { Heart, Users, Star, MapPin, Award, Shield, Clock, Globe, CheckCircle, ArrowRight, Mail, Phone, MessageSquare, Send } from "lucide-react";
import CountUp from "react-countup";
import { RegisterPartnerForm } from "../components/RegisterPartnerForm";

export default function Contact() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .fade-in-up-delay-1 {
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }
        
        .fade-in-up-delay-2 {
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }
        
        .fade-in-up-delay-3 {
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }
        
        .slide-in-left {
          animation: slideInLeft 0.8s ease-out 0.3s both;
        }
        
        .slide-in-right {
          animation: slideInRight 0.8s ease-out 0.3s both;
        }
        
        .float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="pt-24 px-4 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className={`text-center mb-16 transition-opacity duration-700 ${isVisible ? "opacity-100 fade-in-up" : "opacity-0"}`}>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Liên hệ <span className="text-blue-600">VieTour</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn cho bạn. 
                Hãy liên hệ với chúng tôi để được phục vụ tốt nhất!
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 transition-opacity duration-700 ${isVisible ? "opacity-100 fade-in-up-delay-1" : "opacity-0"}`}>
              <div className="text-center group bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <CountUp end={24} suffix="/7" duration={2.5} />
                </div>
                <div className="text-gray-700 font-medium">Hỗ trợ khách hàng</div>
              </div>
              <div className="text-center group bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <CountUp end={5} suffix=" phút" duration={2.5} />
                </div>
                <div className="text-gray-700 font-medium">Thời gian phản hồi</div>
              </div>
              <div className="text-center group bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <CountUp end={98} suffix="%" duration={2.5} />
                </div>
                <div className="text-gray-700 font-medium">Khách hàng hài lòng</div>
              </div>
              <div className="text-center group bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <CountUp end={3} suffix=" kênh" duration={2.5} />
                </div>
                <div className="text-gray-700 font-medium">Kênh liên hệ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm p-8 md:p-12">
              <div className={`transition-opacity duration-700 ${isVisible ? "opacity-100 slide-in-left" : "opacity-0"}`}>
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    Thông tin liên hệ
                  </h2>
                  <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Chúng tôi luôn sẵn sàng hỗ trợ bạn qua nhiều kênh liên lạc khác nhau. 
                    Hãy chọn cách liên hệ phù hợp nhất với bạn.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300 group">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-4">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-3">Địa chỉ văn phòng</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">123 Đường ABC, Quận 1, TP.HCM</p>
                    <p className="text-gray-600 text-sm">Việt Nam</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 hover:shadow-lg transition-all duration-300 group">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-4">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-3">Điện thoại</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">+84 123 456 789</p>
                    <p className="text-gray-600 text-sm">+84 987 654 321</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300 group">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-4">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-3">Email</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">info@vietour.com</p>
                    <p className="text-gray-600 text-sm">support@vietour.com</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100 hover:shadow-lg transition-all duration-300 group">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-4">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-3">Giờ làm việc</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                    <p className="text-gray-600 text-sm">Thứ 7: 8:00 - 12:00</p>
                  </div>
                </div>

                {/* Additional Contact Options */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white hover:shadow-lg transition-all duration-300 group cursor-pointer">
                    <MessageSquare className="w-8 h-8 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h4 className="font-semibold mb-2">Chat trực tuyến</h4>
                    <p className="text-blue-100 text-sm">Hỗ trợ 24/7 qua chat</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white hover:shadow-lg transition-all duration-300 group cursor-pointer">
                    <Phone className="w-8 h-8 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h4 className="font-semibold mb-2">Hotline</h4>
                    <p className="text-green-100 text-sm">Gọi ngay để được tư vấn</p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl text-white hover:shadow-lg transition-all duration-300 group cursor-pointer">
                    <Mail className="w-8 h-8 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h4 className="font-semibold mb-2">Email</h4>
                    <p className="text-purple-100 text-sm">Gửi email để được hỗ trợ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Register Partner Section */}
        <div className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm p-8 md:p-12">
              <div className={`text-center mb-16 transition-opacity duration-700 ${isVisible ? "opacity-100 fade-in-up-delay-2" : "opacity-0"}`}>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Đăng ký trở thành đối tác
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Bạn muốn trở thành đối tác cung cấp tour du lịch? Hãy đăng ký ngay để cùng chúng tôi 
                  mang đến những trải nghiệm du lịch tuyệt vời cho khách hàng.
                </p>
              </div>
              
              <div className={`transition-opacity duration-700 ${isVisible ? "opacity-100 fade-in-up-delay-3" : "opacity-0"}`}>
                <RegisterPartnerForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}