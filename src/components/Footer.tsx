import { Facebook, Mail, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { resourcesService } from "../services/resources.service";

export const Footer = () => {
  const [resources, setResources] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resourcesService.fetchResources().then((data) => {
      const map: Record<string, string> = {};
      data.forEach((item) => {
        map[item.key] = item.content;
      });
      setResources(map);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <footer className="bg-gray-50 py-12 px-4 text-center text-gray-500">
        Đang tải thông tin công ty...
      </footer>
    );
  }

  return (
    <footer className="bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info & QR Code */}
          <div className="space-y-4">
            <div>
              <img src="/VieTour-Logo.png" alt="VieTour Logo" />
              <p className="text-sm mt-3 text-gray-600 font-medium">
                {resources.company_name}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {/* QR CODE */}
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
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              THÔNG TIN LIÊN HỆ
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Địa chỉ:</span>
                <span className="text-gray-600 ml-1">{resources.address}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Điện thoại:</span>
                <span className="text-blue-600 ml-1">{resources.phone}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Hotline/Whatsapp/Zalo:</span>
                <span className="text-blue-600 ml-1">{resources.hotline}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <span className="text-blue-600 ml-1">{resources.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Website:</span>
                <span className="text-blue-600 ml-1">{resources.website}</span>
              </div>
            </div>
          </div>

          {/* Introduction Section (links) */}
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

          {/* Policies (static for now) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">CHÍNH SÁCH</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span className="mr-2">›</span>Chính sách bảo mật
              </a>
              <a
                href="#"
                className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
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
  );
};
