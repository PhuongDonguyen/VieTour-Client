import React, { useEffect, useState } from "react";
import {
  FaFacebookMessenger,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { SiZalo } from "react-icons/si";

const contacts = [
  {
    icon: <FaCalendarAlt className="text-blue-400" />,
    label: "Đặt lịch hẹn",
    href: "#calendar",
  },
  {
    icon: <FaPhone className="text-green-500" />,
    label: "Gọi điện",
    href: "tel:0123456789",
  },
  {
    icon: <FaFacebookMessenger className="text-blue-600" />,
    label: "Liên hệ qua Facebook",
    href: "https://m.me/yourpage",
  },
  {
    icon: <SiZalo className="text-blue-500" />,
    label: "Liên hệ qua Zalo",
    href: "https://zalo.me/yourzalo",
  },
  {
    icon: <FaMapMarkerAlt className="text-green-600" />,
    label: "Xem bản đồ",
    href: "https://maps.google.com",
  },
];

const FloatingContactButtons: React.FC = () => {
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.open !== undefined) setIsGalleryModalOpen(e.detail.open);
    };
    window.addEventListener("gallery-modal-toggle", handler);
    return () => window.removeEventListener("gallery-modal-toggle", handler);
  }, []);

  if (isGalleryModalOpen) return null;

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        
        @keyframes pulse-button {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .pulse-ring {
          animation: pulse-ring 2.5s infinite;
        }
        
        .pulse-button {
          animation: pulse-button 2.5s infinite;
        }
      `}</style>

      <div className="fixed top-1/3 right-4 z-50 flex flex-col space-y-6">
        {contacts.map((contact, idx) => (
          <a
            key={idx}
            href={contact.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center"
          >
            {/* Tooltip */}
            <span className="absolute right-14 opacity-0 group-hover:opacity-100 group-hover:right-16 transition-all bg-white text-gray-700 px-3 py-1 rounded shadow pointer-events-none whitespace-nowrap">
              {contact.label}
            </span>

            {/* Button Container with Pulse Effect */}
            <div className="relative">
              {/* Pulse Ring 1 */}
              <div
                className="absolute inset-0 w-12 h-12 bg-white rounded-full pulse-ring"
                style={{ animationDelay: "0s" }}
              ></div>

              {/* Pulse Ring 2 */}
              <div
                className="absolute inset-0 w-12 h-12 bg-white rounded-full pulse-ring"
                style={{ animationDelay: "0.7s" }}
              ></div>

              {/* Pulse Ring 3 */}
              <div
                className="absolute inset-0 w-12 h-12 bg-white rounded-full pulse-ring"
                style={{ animationDelay: "1.4s" }}
              ></div>

              {/* Main Button */}
              <span className="relative w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg hover:scale-110 transition-transform duration-200 pulse-button">
                {contact.icon}
              </span>
            </div>
          </a>
        ))}
      </div>
    </>
  );
};

export default FloatingContactButtons;
