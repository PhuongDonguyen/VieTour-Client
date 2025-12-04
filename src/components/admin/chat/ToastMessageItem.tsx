
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export interface MessageToastData {
  id: string;
  senderName: string;
  avatar?: string;
  text?: string;
  image_url?: string;
}

interface MessageToastItemProps {
  data: MessageToastData;
  onClose: (id: string) => void;
}

export default function MessageToastItem({
  data,
  onClose,
}: MessageToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(data.id), 300);
    }, 7000);

    return () => clearTimeout(timer);
  }, [data.id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(data.id), 300);
  };

  return (
    <div
      className={`w-80 transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500">
                {data.avatar ? (
                  <img
                    src={data.avatar}
                    alt={data.senderName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm">
                    {data.senderName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <p className="text-sm text-gray-900">
                <span className="font-semibold">{data.senderName}</span>
                <span className="text-gray-500"> vừa gửi tin nhắn</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {data.text && (
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              {data.text}
            </p>
          )}

          {data.image_url && (
            <div className="rounded-md overflow-hidden">
              <img
                src={data.image_url}
                alt="Image"
                className="w-full h-40 object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
