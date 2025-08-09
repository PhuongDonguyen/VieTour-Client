import { Facebook, Mail, MapPin, Phone, Globe, Instagram, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-800 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info & Logo */}
          <div className="space-y-6">
            <div>
              <img 
                src="/VieTour-Logo.png" 
                alt="VieTour Logo" 
                className="h-12 w-auto"
              />
              <p className="text-gray-600 mt-4 text-sm leading-relaxed">
                Khám phá Việt Nam với những trải nghiệm du lịch tuyệt vời. 
                Chúng tôi cam kết mang đến cho bạn những hành trình đáng nhớ nhất.
              </p>
            </div>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors text-white"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors text-white"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors text-white"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors text-white"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              THÔNG TIN LIÊN HỆ
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-sm">
                    123 Đường ABC, Quận 1, TP.HCM, Việt Nam
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-sm">+84 28 1234 5678</p>
                  <p className="text-gray-500 text-xs">Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 text-sm">+84 912 345 678</p>
                  <p className="text-gray-500 text-xs">Hotline 24/7</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <p className="text-gray-600 text-sm">info@vietour.com</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <p className="text-gray-600 text-sm">www.vietour.com</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              DỊCH VỤ
            </h3>
            <div className="space-y-3">
              <a href="#" className="block text-gray-600 hover:text-orange-600 transition-colors text-sm">
                › Tour trong nước
              </a>
              <a href="#" className="block text-gray-600 hover:text-orange-600 transition-colors text-sm">
                › Tour nước ngoài
              </a>
              <a href="#" className="block text-gray-600 hover:text-orange-600 transition-colors text-sm">
                › Tour khuyến mãi
              </a>
              <a href="#" className="block text-gray-600 hover:text-orange-600 transition-colors text-sm">
                › Thuê xe du lịch
              </a>
              <a href="#" className="block text-gray-600 hover:text-orange-600 transition-colors text-sm">
                › Đặt khách sạn
              </a>
              <a href="#" className="block text-gray-600 hover:text-orange-600 transition-colors text-sm">
                › Vé máy bay
              </a>
            </div>
          </div>

          {/* Support & Policies */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-orange-500 pb-2 inline-block">
              HỖ TRỢ
            </h3>
            <div className="space-y-3">
              <a href="#" className="block text-gray-600 hover:text-orange-600 transition-colors text-sm">
                › Hướng dẫn đặt tour
              </a>
              <a href="#" className="block text-gray-600 hover:text-orange-600 transition-colors text-sm">
                › Hướng dẫn thanh toán
              </a>
              <a href="#" className="block text-gray-600 hover:text-orange-600 transition-colors text-sm">
                › Câu hỏi thường gặp
              </a>
              <a href="#" className="block text-gray-600 hover:text-orange-600 transition-colors text-sm">
                › Chính sách bảo mật
              </a>
              <a href="#" className="block text-gray-600 hover:text-orange-600 transition-colors text-sm">
                › Điều khoản sử dụng
              </a>
              <a href="#" className="block text-gray-600 hover:text-orange-600 transition-colors text-sm">
                › Chính sách hoàn hủy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
