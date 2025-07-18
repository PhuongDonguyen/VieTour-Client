import { useState, useEffect, useRef } from "react";
import { fetchTourIsActive, fetchTours } from "../services/tour.service";
import { useNavigate } from "react-router-dom";
import {Loading} from "./Loading"
type Tour = {
  id: number;
  title: string;
  price: string;
  duration: string;
  transportation: string;
  slug:string;
};

export const TourPrices = () => {
  // const tourData = [
  //   {
  //     id: 1,
  //     code: "CC1",
  //     name: "Tour địa đạo Củ Chi",
  //     duration: "1/2 Ngày",
  //     schedule: "Hàng ngày",
  //     transport: "",
  //     price: "350.000VNĐ"
  //   },
  //   {
  //     id: 2,
  //     code: "MK1",
  //     name: "Tour 1 ngày Mỹ Tho - Bến Tre",
  //     duration: "1 Ngày",
  //     schedule: "Hàng ngày",
  //     transport: "",
  //     price: "480.000VNĐ"
  //   },
  //   {
  //     id: 3,
  //     code: "MK2",
  //     name: "Tour 2 ngày 1 đêm Mỹ Tho - Bến Tre - Cần Thơ",
  //     duration: "2 Ngày 1 Đêm",
  //     schedule: "Hàng ngày | Theo yêu cầu",
  //     transport: "",
  //     price: "1.550.000VNĐ"
  //   },
  //   {
  //     id: 4,
  //     code: "MK3CM",
  //     name: "Tour 3 ngày 2 đêm Cần Thơ - Đất Mũi Cà Mau",
  //     duration: "3 Ngày 2 Đêm",
  //     schedule: "Thứ 3 - Thứ 6 | Theo yêu cầu",
  //     transport: "",
  //     price: "2.890.000VNĐ"
  //   },
  //   {
  //     id: 5,
  //     code: "TN1",
  //     name: "Tour núi Bà Đen - 1 ngày",
  //     duration: "1 Ngày",
  //     schedule: "Thứ 6 | Thứ 7 | Chủ nhật",
  //     transport: "",
  //     price: "1.150.000VNĐ"
  //   },
  //   {
  //     id: 6,
  //     code: "CC- MK1",
  //     name: "Tour Củ Chi Mỹ Tho 1 ngày",
  //     duration: "1 Ngày",
  //     schedule: "Hàng ngày",
  //     transport: "",
  //     price: "1.450.000VNĐ"
  //   },
  //   {
  //     id: 7,
  //     code: "MK1.1",
  //     name: "Tour 1 ngày Mỹ Tho - Bến Tre tất tướng bất cứ",
  //     duration: "1 Ngày",
  //     schedule: "Hàng ngày",
  //     transport: "",
  //     price: "950.000VNĐ"
  //   },
  //   {
  //     id: 8,
  //     code: "CG1",
  //     name: "Tour Cần Giờ 1 ngày",
  //     duration: "1 Ngày",
  //     schedule: "Hàng ngày",
  //     transport: "",
  //     price: "750.000VNĐ"
  //   },
  //   {
  //     id: 9,
  //     code: "CT CC 01",
  //     name: "Tour thành phố Hồ Chí Minh - Địa đạo Củ Chi 1 ngày",
  //     duration: "1 Ngày",
  //     schedule: "Hàng ngày",
  //     transport: "",
  //     price: "1.450.000VNĐ"
  //   },
  //   {
  //     id: 10,
  //     code: "SGAT 01",
  //     name: "Ăn tối trên du thuyền Đông Dương Indochine cruise",
  //     duration: "1 Ngày",
  //     schedule: "Hàng ngày",
  //     transport: "",
  //     price: "650.000VNĐ"
  //   },
  //   {
  //     id: 11,
  //     code: "PT0101",
  //     name: "Tour 1 ngày jeep tour - Khám phá cung đường biển đẹp nhất Việt Nam",
  //     duration: "1 Ngày",
  //     schedule: "Theo yêu cầu",
  //     transport: "",
  //     price: "1.450.000VNĐ"
  //   },
  //   {
  //     id: 12,
  //     code: "PT0201",
  //     name: "Tour 2 ngày 1 đêm: Phan Thiết - Jeep tour",
  //     duration: "2 Ngày 1 Đêm",
  //     schedule: "Thứ 7 hàng tuần",
  //     transport: "",
  //     price: "1.986.000VNĐ"
  //   },
  //   {
  //     id: 13,
  //     code: "MK1-CB",
  //     name: "Tour 1 ngày Cái Bè - Cù Lao Tân Phong - Vĩnh Long",
  //     duration: "1 Ngày",
  //     schedule: "Hàng ngày",
  //     transport: "",
  //     price: "1.200.000VNĐ"
  //   },
  //   {
  //     id: 14,
  //     code: "PT2N1D-02",
  //     name: "Tour 3 ngày 2 đêm Phan Thiết KDL Tà Cú - Mango Beach",
  //     duration: "2 ngày 1 đêm",
  //     schedule: "T7 Hàng tuần",
  //     transport: "",
  //     price: "1.986.000VNĐ"
  //   },
  //   {
  //     id: 15,
  //     code: "MK4CM",
  //     name: "Tour 4 ngày 3 đêm Tiền Giang - Bến Tre - Cần Thơ - Sóc Trăng - Bạc Liêu - Cà Mau",
  //     duration: "4 Ngày 3 Đêm",
  //     schedule: "Thứ 2 & Thứ 5 | Theo yêu cầu",
  //     transport: "",
  //     price: "4.180.000VNĐ"
  //   },
  //   {
  //     id: 16,
  //     code: "PT3N2D-02",
  //     name: "TOUR 3 NGÀY 2 ĐÊM PHAN THIẾT KDL TÀ CÚ - MANGO BEACH",
  //     duration: "3 ngày 2 đêm",
  //     schedule: "T6 Hàng tuần",
  //     transport: "",
  //     price: "2.886.000VNĐ"
  //   },
  //   {
  //     id: 17,
  //     code: "PT3N2D-01",
  //     name: "Tour 3 ngày 2 đêm Phan Thiết - Jeep tour - Bàu Sen",
  //     duration: "3 Ngày 2 Đêm",
  //     schedule: "Thứ 6 hàng tuần",
  //     transport: "",
  //     price: "2.886.000VNĐ"
  //   },
  //   {
  //     id: 18,
  //     code: "MK4CD",
  //     name: "Tour 4 ngày 3 đêm Mỹ Tho - Bến Tre - Châu Đốc - Cần Thơ - Cà Mau - Bạc Liêu - Sóc Trăng",
  //     duration: "4 Ngày 3 Đêm",
  //     schedule: "T2 và T5 hàng tuần / theo yêu cầu",
  //     transport: "",
  //     price: "4.180.000VNĐ"
  //   },
  //   {
  //     id: 19,
  //     code: "MK3CD",
  //     name: "Tour miền tây 3 ngày 2 đêm: Mỹ Tho - Bến Tre - Cần Thơ - Châu Đốc",
  //     duration: "3 Ngày 2 Đêm",
  //     schedule: "Theo yêu cầu",
  //     transport: "",
  //     price: "3.080.000VNĐ"
  //   },
  //   {
  //     id: 20,
  //     code: "DN4N3D-01",
  //     name: "Tour 4 ngày 3 đêm Đà Nẵng - Hội An - Quảng Bình - Huế",
  //     duration: "4 Ngày 3 Đêm",
  //     schedule: "T5 hàng tuần",
  //     transport: "+",
  //     price: "6.290.000VNĐ"
  //   },
  //   {
  //     id: 21,
  //     code: "NT3N3D-02",
  //     name: "Tour 3 ngày 3 đêm Nha Trang - KDL Diamond Bay - Vĩnh San Hô",
  //     duration: "3 ngày 3 đêm",
  //     schedule: "Tối Thứ 5 hàng tuần",
  //     transport: "",
  //     price: "2.786.000VNĐ"
  //   },
  //   {
  //     id: 22,
  //     code: "DL3N3D-03",
  //     name: "Tour 3 ngày 3 đêm Đà Lạt - Tea Resort",
  //     duration: "3 ngày 3 đêm",
  //     schedule: "T5 hàng tuần",
  //     transport: "",
  //     price: "2.786.000VNĐ"
  //   }
  // ];
  const [tours, setTours] = useState<Tour[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const handleGoDetail = (slug:string) => {
    navigate(`/tour/${slug}`);
  };
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const tourRes = await fetchTourIsActive(true);
        const toursData = tourRes.data;
        const pagination = tourRes.pagination;
        console.log("Pagination data:", pagination);

        setTours(
          toursData.map((tour: any) => ({
            id: tour.id,
            title: tour.title,
            price: tour.price || 0,
            transportation: tour.transportation || "Không xác định",
            duration: tour.duration || "Không xác định",
            slug: tour.slug
          }))
        );
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tour prices:", error);
      }
    };

    fetchTours();
  }, []);

  useEffect(() => {
    console.log("Tour:", tours);
  }, [tours]);


  return (
    <div className="max-w-7xl mx-auto mt-20 p-4 bg-white">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-blue-600 mb-2">BẢNG GIÁ</h2>
        <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
      </div>
      {loading ? <Loading/> :(
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                Mã
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                LỊCH TRÌNH TOUR
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                THỜI GIAN
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                PHƯƠNG TIỆN
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                GIÁ TOUR
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                HÀNH ĐỘNG
              </th>
            </tr>
          </thead>
          <tbody>
            {tours.map((tour, index) => (
              <tr
                key={tour.id}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {tour.id}
                </td>
                <td className="border border-gray-300 px-4 py-3">
                  {tour.title}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {tour.duration}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  {tour.transportation}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-red-600">
                  {tour.price + "VND"}
                </td>
                <td className="border border-gray-300 px-4 py-3 text-center">
                  <button
                    onClick={() => {
                      handleGoDetail(tour.slug);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer"
                  >
                    XEM TOUR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>)}
    </div>
  );
};
