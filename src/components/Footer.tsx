import { Facebook, Mail, MapPin } from "lucide-react"

export const Footer = () => {
  return (
    <footer className="bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info & QR Code */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-blue-600 mb-1">
                Vietour
                <span className="text-sm block text-orange-500 font-medium">TOURS</span>
              </h2>
              <p className="text-sm text-gray-600 font-medium">CÔNG TY TNHH DU LỊCH QUỐC TẾ BỒN PHƯƠNG</p>
            </div>

            {/* QR Code */}
            <div className="w-24 h-24 bg-white border border-gray-200 flex items-center justify-center">
              <div className="w-20 h-20 bg-black bg-opacity-80 flex items-center justify-center text-white text-xs">
                QR CODE
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <Facebook className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">THÔNG TIN LIÊN HỆ</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Địa chỉ:</span>
                <span className="text-gray-600 ml-1">202 Lê Lợi, P.Bến Thành, TP HCM</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Điện thoại:</span>
                <span className="text-blue-600 ml-1">(+84) 938 179 170</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Hotline/Whatsapp/Zalo:</span>
                <span className="text-blue-600 ml-1">(+84) 938 179 170</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="text-blue-600 ml-1">kinhdoanh.tourbonphuong@gmail.com</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Website:</span>
                <span className="text-blue-600 ml-1">tourbonphuong.com</span>
              </div>
            </div>
          </div>

          {/* Introduction Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">GIỚI THIỆU</h3>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <span className="mr-2">›</span>Về chúng tôi
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <span className="mr-2">›</span>Hướng dẫn thanh toán
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <span className="mr-2">›</span>Hướng dẫn đặt tour
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <span className="mr-2">›</span>Câu hỏi thường gặp
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <span className="mr-2">›</span>Bảng giá
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <span className="mr-2">›</span>Tour khuyến mãi
              </a>
            </div>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">CHÍNH SÁCH</h3>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <span className="mr-2">›</span>Chính sách bảo mật
              </a>
              <a href="#" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                <span className="mr-2">›</span>Điều khoản chung
              </a>
            </div>

            {/* Certification Badge */}
            <div className="mt-6">
              <div className="bg-blue-600 text-white px-3 py-2 rounded text-xs font-medium text-center">
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xs">✓</span>
                  </div>
                  <div>
                    <div className="font-bold">ĐÃ THÔNG BÁO</div>
                    <div className="text-xs">BỘ CÔNG THƯƠNG</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
