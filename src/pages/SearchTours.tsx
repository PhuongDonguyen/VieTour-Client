import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  ChevronDown,
  Star,
  Eye,
  BookOpen,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Slider } from "../components/ui/slider";
import SearchTourCard from "../components/SearchTourCard";
import { fetchTours } from "../services/tour.service";
import { fetchActiveTourCategories } from "../services/tourCategory.service";

interface Province {
  code: string;
  name: string;
}

interface TourCategory {
  id: number;
  name: string;
}

interface Tour {
  id: number;
  title: string;
  location: string;
  duration: string;
  capacity: number;
  view_count: number;
  slug: string;
  is_active: boolean;
  total_star: number;
  review_count: number;
  booked_count: number;
  poster_url: string;
  price: number;
  tour_category: {
    id: number;
    name: string;
  };
  upcoming_schedules: Array<{
    id: number;
    start_date: string;
    participant: number;
    status: string;
  }>;
}

interface SearchResponse {
  success: boolean;
  data: Tour[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const SearchTours: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // UI States
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedLocation, setSelectedLocation] = useState(
    searchParams.get("location") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("tour_category_id") || ""
  );
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get("schedule") || ""
  );

  // Debug: Log URL params when component mounts
  useEffect(() => {
    console.log("🔗 SearchTours - URL params received:", {
      search: searchParams.get("search"),
      location: searchParams.get("location"),
      tour_category_id: searchParams.get("tour_category_id"),
      schedule: searchParams.get("schedule"),
      min_price: searchParams.get("min_price"),
      max_price: searchParams.get("max_price"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
      page: searchParams.get("page"),
    });
  }, [searchParams]);
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get("min_price") || "0"),
    parseInt(searchParams.get("max_price") || "10000000"),
  ]);
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "id");
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sortOrder") || "DESC"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );

  // Data States
  const [tours, setTours] = useState<Tour[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [categories, setCategories] = useState<TourCategory[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Load initial data
  useEffect(() => {
    loadProvinces();
    loadCategories();
  }, []);

  // Update priceRange when URL params change
  useEffect(() => {
    const minPrice = parseInt(searchParams.get("min_price") || "0");
    const maxPrice = parseInt(searchParams.get("max_price") || "10000000");
    setPriceRange([minPrice, maxPrice]);
  }, [searchParams]);

  // Load tours when search params change
  useEffect(() => {
    searchTours();
  }, [searchParams]);

  const loadProvinces = async () => {
    try {
      const response = await fetch(
        "https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (
        result &&
        result.exitcode === 1 &&
        result.data &&
        Array.isArray(result.data.data)
      ) {
        setProvinces(result.data.data);
      } else {
        setProvinces([]);
      }
    } catch (error) {
      console.error("Error loading provinces:", error);
      setProvinces([]);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchActiveTourCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const searchTours = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 12,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedLocation && selectedLocation !== "all")
        params.location = selectedLocation;
      if (selectedCategory && selectedCategory !== "all")
        params.tour_category_id = selectedCategory;
      if (selectedDate) params.schedule = selectedDate;
      if (priceRange[0] > 0) params.min_price = priceRange[0];
      if (priceRange[1] < 10000000) params.max_price = priceRange[1];
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;

      console.log("🔍 Sending search request with params:", params);
      const response = await fetchTours(params);
      console.log("✅ Search response:", response);

      if (response.success) {
        setTours(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error searching tours:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("search", searchQuery);
    if (selectedLocation && selectedLocation !== "all")
      params.set("location", selectedLocation);
    if (selectedCategory && selectedCategory !== "all")
      params.set("tour_category_id", selectedCategory);
    if (selectedDate) params.set("schedule", selectedDate);
    if (priceRange[0] > 0) params.set("min_price", priceRange[0].toString());
    if (priceRange[1] < 10000000)
      params.set("max_price", priceRange[1].toString());
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);
    params.set("page", currentPage.toString());

    setSearchParams(params);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    updateSearchParams();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("");
    setSelectedCategory("");
    setSelectedDate("");
    setPriceRange([0, 10000000]);
    setSortBy("id");
    setSortOrder("DESC");
    setCurrentPage(1);
    setSearchParams({});
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateSearchParams();
  };

  const sortOptions = [
    { value: "id", label: "Mới nhất" },
    { value: "title", label: "Tên A-Z" },
    { value: "price", label: "Giá" },
    { value: "view_count", label: "Lượt xem" },
    { value: "total_star", label: "Đánh giá" },
    { value: "booked_count", label: "Lượt đặt" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tìm kiếm Tours
          </h1>
          <p className="text-gray-600">
            Khám phá những tour du lịch tuyệt vời nhất tại Việt Nam
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Main Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Tìm kiếm tours, điểm đến, hoạt động..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="lg:w-48">
                <Select
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                >
                  <SelectTrigger className="h-12">
                    <MapPin className="w-5 h-5 mr-2 text-gray-400" />
                    <SelectValue placeholder="Điểm đến" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả điểm đến</SelectItem>
                    {provinces.map((province) => (
                      <SelectItem key={province.code} value={province.name}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="lg:w-48">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Search Button */}
              <Button onClick={handleSearch} className="h-12 px-8">
                <Search className="w-5 h-5 mr-2" />
                Tìm kiếm
              </Button>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-4"
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Bộ lọc
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category */}
                  <div>
                    <Label className="text-sm font-medium mb-2">
                      Loại tour
                    </Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại tour" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả loại tour</SelectItem>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="lg:col-span-2">
                    <Label className="text-sm font-medium mb-2">
                      Khoảng giá: {priceRange[0].toLocaleString()} -{" "}
                      {priceRange[1].toLocaleString()} VND
                    </Label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={10000000}
                      min={0}
                      step={100000}
                      className="mt-2"
                    />
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">
              {pagination.totalItems} tours được tìm thấy
            </h2>
            {(searchQuery ||
              selectedLocation ||
              selectedCategory ||
              priceRange[0] > 0 ||
              priceRange[1] < 10000000) && (
              <div className="flex gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Tìm kiếm: {searchQuery}
                  </Badge>
                )}
                {selectedLocation && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedLocation}
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="secondary" className="gap-1">
                    {
                      categories.find(
                        (c) => c.id.toString() === selectedCategory
                      )?.name
                    }
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 10000000) && (
                  <Badge variant="secondary" className="gap-1">
                    Giá: {priceRange[0].toLocaleString()} -{" "}
                    {priceRange[1].toLocaleString()} VND
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <Label className="text-sm">Sắp xếp:</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASC">Tăng</SelectItem>
                  <SelectItem value="DESC">Giảm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Tours Grid/List */}
        {!isLoading && (
          <>
            {tours.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Không tìm thấy tour nào
                </h3>
                <p className="text-gray-500 mb-4">
                  Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {tours.map((tour) => (
                  <div key={tour.id}>
                    {viewMode === "grid" ? (
                      <SearchTourCard
                        id={tour.id}
                        title={tour.title}
                        location={tour.location}
                        duration={tour.duration}
                        price={tour.price}
                        imageUrl={tour.poster_url}
                        rating={
                          tour.total_star / Math.max(tour.review_count, 1)
                        }
                        reviewCount={tour.review_count}
                        slug={tour.slug}
                        viewCount={tour.view_count}
                        bookedCount={tour.booked_count}
                      />
                    ) : (
                      // List view card
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <img
                              src={tour.poster_url}
                              alt={tour.title}
                              className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">
                                {tour.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {tour.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {tour.duration}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {tour.capacity} người
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {tour.view_count} lượt xem
                                </div>
                                <div className="flex items-center gap-1">
                                  <BookOpen className="w-4 h-4" />
                                  {tour.booked_count} lượt đặt
                                </div>
                                {tour.review_count > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    {(
                                      tour.total_star / tour.review_count
                                    ).toFixed(1)}{" "}
                                    ({tour.review_count})
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {tour.price.toLocaleString()} ₫
                              </div>
                              <Button
                                onClick={() => navigate(`/tour/${tour.slug}`)}
                                className="mt-2"
                              >
                                Xem chi tiết
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Trước
                </Button>

                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    const page = Math.max(1, currentPage - 2) + i;
                    if (page > pagination.totalPages) return null;

                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    );
                  }
                )}

                <Button
                  variant="outline"
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchTours;
