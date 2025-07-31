import { useState, useEffect, useRef } from "react";
import { fetchTours } from "../services/tour.service";
import { useNavigate } from "react-router-dom";
import { Loading } from "./Loading";
import { MapPin, Clock, Car, Star, Eye, ArrowRight } from "lucide-react";

type Tour = {
  id: number;
  title: string;
  price: number;
  duration: string;
  transportation: string;
  slug: string;
  poster_url?: string;
  total_star?: number;
  review_count?: number;
  view_count?: string;
};

export const TourPrices = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGoDetail = (slug: string) => {
    navigate(`/tour/${slug}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const fetchToursData = async (page: number = 1) => {
    try {
      setLoading(true);
      const tourRes = await fetchTours({
        page,
        limit: 10,
        is_active: true
      });
      
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
          slug: tour.slug,
          poster_url: tour.poster_url,
          total_star: tour.total_star || 0,
          review_count: tour.review_count || 0,
          view_count: tour.view_count || "0",
        }))
      );

      // Update pagination state
      setCurrentPage(pagination.page);
      setTotalPages(pagination.totalPages);
      setHasNextPage(pagination.hasNextPage);
      setHasPrevPage(pagination.hasPrevPage);
      setTotalItems(pagination.totalItems);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tour prices:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToursData(currentPage);
  }, [currentPage]);

  useEffect(() => {
    console.log("Tour:", tours);
  }, [tours]);

  const handleNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4" style={{ backgroundColor: '#015294' }}>
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Bảng Giá Tour
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá các gói tour du lịch hấp dẫn với giá cả hợp lý và chất lượng dịch vụ tốt nhất
          </p>
          <div className="w-16 h-0.5 mx-auto mt-6" style={{ backgroundColor: '#015294' }}></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loading />
          </div>
        ) : (
          <>
            {/* Simple Modern Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-white" style={{ backgroundColor: '#015294' }}>
                      <th className="px-6 py-4 text-left font-semibold w-20">
                        <div className="flex items-center">
                          <span className="bg-white/20 rounded w-6 h-6 flex items-center justify-center mr-2 text-sm">
                            #
                          </span>
                          Mã Tour
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold w-80">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Lịch Trình Tour
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold w-32">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Thời Gian
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold w-32">
                        <div className="flex items-center">
                          <Car className="w-4 h-4 mr-2" />
                          Phương Tiện
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold w-24">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          Lượt Xem
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold w-32">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-2" />
                          Đánh Giá
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-semibold w-40">
                        Giá Tour
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tours.map((tour, index) => (
                      <tr
                        key={tour.id}
                        className={`group hover:bg-blue-50 transition-colors duration-200 border-b border-gray-100 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-gray-700 font-medium text-sm">
                              {tour.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <h3 
                              className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer hover:underline leading-relaxed"
                              onClick={() => handleGoDetail(tour.slug)}
                            >
                              {tour.title}
                            </h3>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-gray-700">
                            <Clock className="w-4 h-4 mr-2" style={{ color: '#015294' }} />
                            <span className="text-sm">{tour.duration}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-gray-700">
                            <Car className="w-4 h-4 mr-2 text-green-500" />
                            <span className="text-sm">{tour.transportation}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-gray-600">
                            <Eye className="w-4 h-4 mr-2 text-purple-500" />
                            <span className="text-sm">{tour.view_count}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {tour.total_star && tour.total_star > 0 ? (
                            <div className="flex items-center">
                              <div className="flex mr-2">
                                {renderStars(tour.total_star)}
                              </div>
                              <span className="text-xs text-gray-500">
                                ({tour.review_count})
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">Chưa có đánh giá</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-lg font-semibold text-red-600">
                              {formatPrice(tour.price)}
                            </p>
                            <p className="text-xs text-gray-500">Giá cho 1 người</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Simple Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
                <div className="text-gray-600 text-sm">
                  <span className="font-medium" style={{ color: '#015294' }}>{tours.length}</span> trong tổng số{" "}
                  <span className="font-medium" style={{ color: '#015294' }}>{totalItems}</span> tours
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handlePrevPage}
                    disabled={!hasPrevPage}
                    className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                      hasPrevPage
                        ? "text-white hover:opacity-90"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                    style={hasPrevPage ? { backgroundColor: '#015294' } : {}}
                  >
                    ← Trước
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-md font-medium transition-colors duration-200 ${
                            isActive
                              ? "text-white"
                              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                          }`}
                          style={isActive ? { backgroundColor: '#015294' } : {}}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <span className="text-gray-500">...</span>
                    )}
                  </div>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={!hasNextPage}
                    className={`flex items-center px-3 py-2 rounded-md font-medium transition-colors duration-200 ${
                      hasNextPage
                        ? "text-white hover:opacity-90"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                    style={hasNextPage ? { backgroundColor: '#015294' } : {}}
                  >
                    Sau →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};