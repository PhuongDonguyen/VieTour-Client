import { Phone, Mail } from 'lucide-react';

export const TopBar = () => {
  return (
    <div className="bg-gray-900 text-white py-2">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>+84 938 179 170</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>info@vietour.com</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {/* <span className="w-6 h-4 bg-red-500 rounded-sm flex items-center justify-center text-xs">🇻🇳</span>
              <span className="w-6 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-xs">🇺🇸</span> */}
            </div>
            <button className="bg-orange-500 px-3 py-1 rounded text-white hover:bg-orange-600 transition-colors">
              Liên hệ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
