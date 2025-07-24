import { TopBar } from "../layouts/TopBar";
import { NavBar } from "../layouts/NavBar";
import { useEffect, useState } from "react";

interface Tour {
  id: string;
  name: string;
  date: string;
  people: string;
  price: string;
  status: "completed" | "upcoming" | "cancelled";
  statusText: string;
  statusColor: string;
}



export default function MyBooking() {
  const tours: Tour[] = [
    {
      id: "TL2024001",
      name: "Tour Hạ Long Bay - Sapa 5N4Đ",
      date: "15/12/2024 - 20/12/2024",
      people: "2 người",
      price: "12.500.000 VNĐ",
      status: "completed",
      statusText: "Đã hoàn thành",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: "TL2025002",
      name: "Tour Phú Quốc 3N2Đ",
      date: "25/07/2025 - 28/07/2025",
      people: "4 người",
      price: "8.900.000 VNĐ",
      status: "upcoming",
      statusText: "Sắp diễn ra",
      statusColor: "bg-yellow-100 text-yellow-800",
    },
    {
      id: "TL2025003",
      name: "Tour Đà Lạt 2N1Đ",
      date: "10/06/2025 - 12/06/2025",
      people: "2 người",
      price: "3.200.000 VNĐ",
      status: "cancelled",
      statusText: "Đã hủy",
      statusColor: "bg-red-100 text-red-800",
    },
  ];

  const [userIdCurrent, setUserIdCurrent] = useState<number|null>(null);

  useEffect(() => {
    const fetchUserCurrent = async() => {
        
    }
  },[]);

  return (
    <div className="min-h-screen">
      <TopBar />
      <NavBar textDark={true} />
      {/* Lịch sử đặt tour */}
      <div
        className="mt-25 max-w-6xl mx-auto opacity-0 animate-pulse"
        style={{ animation: "fadeInUp 0.6s ease forwards 0.6s" }}
      >
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 pl-6 relative">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
          Lịch sử đặt tour
        </h2>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {tours.map((tour: Tour, index: number) => (
            <div
              key={tour.id}
              className={`p-8 hover:bg-gray-50 transition-all duration-200 hover:translate-x-2 relative group ${
                index < tours.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 md:mb-0">
                  {tour.name}
                </h3>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wide ${tour.statusColor}`}
                >
                  {tour.statusText}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📅</span>
                  <span>{tour.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">👥</span>
                  <span>{tour.people}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💰</span>
                  <span>{tour.price}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🆔</span>
                  <span>{tour.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .fadeInUp {
        animation: fadeInUp 0.5s ease-out;
      }
    `,
        }}
      />
    </div>
  );
}
