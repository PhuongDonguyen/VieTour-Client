import { useState, useEffect } from "react";
import { fetchTours } from "../services/tour.service";
import { fetchActiveTourCategories } from "../services/tourCategory.service";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Car, Star, Eye, Filter, DollarSign, Hotel } from "lucide-react";
import { Slider } from "@/components/ui/slider";

type Tour = {
  id: number;
  title: string;
  price: number;
  duration: string;
  transportation: string;
  accommodation?: string;
  slug: string;
  poster_url?: string;
  total_star?: number;
  review_count?: number;
  view_count?: string;
};

type TourCategory = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
};

// Range Slider Component using shadcn/ui
const RangeSlider = ({ 
  min, 
  max, 
  value, 
  onChange, 
  step = 100000 
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
}) => {
  return (
    <div className="w-full px-4">
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={onChange}
        minStepsBetweenThumbs={1}
        className="py-4"
      />
      <div className="mt-2 flex justify-between items-center text-sm text-gray-600 px-1">
        <span>{formatPrice(value[0])}</span>
        <span>{formatPrice(value[1])}</span>
      </div>
    </div>
  );
};

// Skeleton component for table rows
const TableSkeleton = () => {
  return (
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
            {[...Array(5)].map((_, index) => (
              <tr
                key={index}
                className={`border-b border-gray-100 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const TourPrices = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<TourCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
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

  // Fetch tour categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const categoriesData = await fetchActiveTourCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching tour categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleGoDetail = (slug: string) => {
    navigate(`/tour/${slug}`);
  };

  const fetchToursData = async (page: number = 1) => {
    try {
      setLoading(true);
      const tourRes = await fetchTours({
        page,
        limit: 10,
        is_active: true,
        tour_category_id: selectedCategory || undefined,
        min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
        max_price: priceRange[1] < 10000000 ? priceRange[1] : undefined
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
          accommodation: tour.accommodation || "Không xác định",
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
    setCurrentPage(1); // Reset to first page when filters change
    fetchToursData(1);
  }, [selectedCategory, priceRange]);

  useEffect(() => {
    fetchToursData(currentPage);
  }, [currentPage]);

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

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handlePriceRangeChange = (values: [number, number]) => {
    setPriceRange(values);
  };

  const clearPriceFilter = () => {
    setPriceRange([0, 10000000]);
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

        {/* Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6 mb-4">
            {/* Category Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex-1">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Danh mục:</span>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : null)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 flex-1"
                  disabled={categoriesLoading}
                >
                  <option value="">Tất cả</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex-1">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Khoảng giá:</span>
                {(priceRange[0] > 0 || priceRange[1] < 10000000) && (
                  <button
                    onClick={clearPriceFilter}
                    className="ml-auto px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  >
                    Xóa
                  </button>
                )}
              </div>
              
              <RangeSlider
                min={0}
                max={10000000}
                value={priceRange}
                onChange={handlePriceRangeChange}
                step={50000}
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory || priceRange[0] > 0 || priceRange[1] < 10000000) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-wrap gap-3 text-sm">
                {selectedCategory && (
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800">
                      Danh mục: <span className="font-semibold">
                        {categories.find(cat => cat.id === selectedCategory)?.name}
                      </span>
                    </span>
                  </div>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 10000000) && (
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-green-800">
                      Giá: <span className="font-semibold">
                        {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                      </span>
                    </span>
                  </div>
                )}
                <button
                  onClick={() => {
                    handleCategoryChange(null);
                    clearPriceFilter();
                  }}
                  className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-xs">Xóa tất cả</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table Section */}
        {loading ? (
          <TableSkeleton />
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
                          <Hotel className="w-4 h-4 mr-2" />
                          Chỗ ở
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
                            <Hotel className="w-4 h-4 mr-2 text-purple-500" />
                            <span className="text-sm">{tour.accommodation || "Không xác định"}</span>
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
                              từ {formatPrice(tour.price)}
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