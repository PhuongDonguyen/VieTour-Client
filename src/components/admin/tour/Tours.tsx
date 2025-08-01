import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthContext } from "@/context/authContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Users,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import {
  fetchTours,
  deleteTourService,
  toggleTourStatusService,
} from "@/services/tour.service";
import { fetchActiveTourCategories } from "@/services/tourCategory.service";
import type { Tour } from "@/apis/tour.api";

const ProviderTours: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Get category_id from URL parameter
  const categoryIdFromUrl = searchParams.get("category_id");

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); // input value
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [tourCategories, setTourCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categoryIdFromUrl || "all"
  );
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [loadingTourId, setLoadingTourId] = useState<number | null>(null);
  const [categoryMap, setCategoryMap] = useState<{ [key: number]: string }>({});

  // Set category filter from URL parameter on mount
  useEffect(() => {
    if (categoryIdFromUrl) {
      setSelectedCategoryId(categoryIdFromUrl);
    }
  }, [categoryIdFromUrl]);

  // Helper function to get category name
  const getCategoryName = (tour: Tour): string => {
    console.log("getCategoryName - tour:", tour);
    console.log("getCategoryName - tour.tour_category:", tour.tour_category);
    console.log(
      "getCategoryName - tour.tour_category_id:",
      tour.tour_category_id
    );
    console.log("getCategoryName - categoryMap:", categoryMap);

    if (tour.tour_category?.name) {
      console.log("Using tour.tour_category.name:", tour.tour_category.name);
      return tour.tour_category.name;
    }
    if (tour.tour_category_id && categoryMap[tour.tour_category_id]) {
      console.log("Using categoryMap:", categoryMap[tour.tour_category_id]);
      return categoryMap[tour.tour_category_id];
    }
    console.log(
      "Using fallback:",
      tour.tour_category_id
        ? `Category ${tour.tour_category_id}`
        : "Không xác định"
    );
    return tour.tour_category_id
      ? `Category ${tour.tour_category_id}`
      : "Không xác định";
  };

  // Helper functions to normalize data
  const getTourCapacity = (tour: Tour): number => {
    return tour.capacity || 0;
  };

  const getTourRating = (tour: Tour): number => {
    if (tour.total_star && tour.review_count && tour.review_count > 0) {
      return tour.total_star / tour.review_count;
    }
    return 0;
  };

  const getTourReviewCount = (tour: Tour): number => {
    return tour.review_count || 0;
  };

  const getTourBookedCount = (tour: Tour): number => {
    return tour.booked_count || 0;
  };

  const getTourViewCount = (tour: Tour): string => {
    const viewCount = tour.view_count;
    return typeof viewCount === "string"
      ? viewCount
      : viewCount?.toString() || "0";
  };

  const getTourTransportation = (tour: Tour): string => {
    return tour.transportation || "Không có thông tin";
  };

  const getTourAccommodation = (tour: Tour): string => {
    return tour.accommodation || "Không có thông tin";
  };

  const getTourDestinationIntro = (tour: Tour): string | null => {
    return tour.destination_intro || null;
  };

  const getTourInfo = (tour: Tour): string | null => {
    return tour.tour_info || null;
  };

  const getTourLiveCommentary = (tour: Tour): string | null => {
    return tour.live_commentary || null;
  };

  // Fetch tours data
  useEffect(() => {
    const fetchToursData = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          tour_category_id:
            selectedCategoryId !== "all"
              ? Number(selectedCategoryId)
              : undefined,
        };

        console.log("Fetching tours with params:", params);
        const res = await fetchTours(params);

        console.log("Tours data:", res.data); // Debug log to check structure
        setTours(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      } catch (error) {
        console.error("Error fetching tours:", error);
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    fetchToursData();
  }, [currentPage, searchTerm, selectedCategoryId]);

  // FE search/filter - chỉ lọc theo search term, không lọc theo category (vì đã lọc ở backend)
  useEffect(() => {
    console.log("Filter effect - tours:", tours);
    console.log("Filter effect - selectedCategoryId:", selectedCategoryId);
    console.log("Filter effect - searchTerm:", searchTerm);

    let filtered = tours;

    // Chỉ lọc theo search term, không lọc theo category vì đã lọc ở backend
    if (searchTerm) {
      filtered = filtered.filter((tour) =>
        tour.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    console.log("Filter effect - filtered result:", filtered);
    setFilteredTours(filtered);
  }, [searchTerm, tours, selectedCategoryId]);

  // Debug: log selectedCategoryId when it changes
  useEffect(() => {
    console.log("selectedCategoryId changed to:", selectedCategoryId);
  }, [selectedCategoryId]);

  // Fetch tour categories
  const fetchTourCategoriesData = async () => {
    try {
      const categories = await fetchActiveTourCategories();
      setTourCategories(categories);
    } catch (error) {
      console.error("Error fetching tour categories:", error);
      setTourCategories([]);
    }
  };

  // Fetch tour categories on mount
  useEffect(() => {
    fetchActiveTourCategories().then((data) => {
      console.log("Loaded tour categories:", data);
      setTourCategories(data);
      // Build category map for quick lookup
      const map: { [key: number]: string } = {};
      data.forEach((cat: any) => {
        map[cat.id] = cat.name;
      });
      console.log("Built category map:", map);
      setCategoryMap(map);
    });
  }, []);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    setSearchTerm(value); // FE search only
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
    // Không cần set loading vì lọc trên Frontend
  };

  // Handle delete tour
  const handleDeleteTour = async (id: number) => {
    if (isAdmin) {
      alert("Admin không có quyền xóa tour.");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa tour này?")) {
      try {
        await deleteTourService(id);
        // Refresh the tours list
        const res = await fetchTours({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
        });
        setTours(res.data);
      } catch (error) {
        console.error("Failed to delete tour:", error);
        alert("Không thể xóa tour. Vui lòng thử lại.");
      }
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: number) => {
    if (isAdmin) {
      alert("Admin không có quyền thay đổi trạng thái tour.");
      return;
    }
    try {
      setLoadingTourId(id);
      await toggleTourStatusService(id);
      // Cập nhật trạng thái tour ngay trên FE, không fetch lại cả list
      setTours((prevTours) =>
        prevTours.map((tour) =>
          tour.id === id ? { ...tour, is_active: !tour.is_active } : tour
        )
      );
    } catch (error) {
      console.error("Failed to toggle tour status:", error);
      alert("Không thể thay đổi trạng thái tour. Vui lòng thử lại.");
    } finally {
      setLoadingTourId(null);
    }
  };

  // Handle view tour details
  const handleViewTour = (tour: Tour) => {
    navigate(`/admin/tours/view/${tour.id}`);
  };

  // Handle create tour
  const handleCreateTour = () => {
    if (isAdmin) {
      alert("Admin không có quyền tạo tour.");
      return;
    }
    navigate("/admin/tours/new");
  };

  // Handle edit tour
  const handleEditTour = (tour: Tour) => {
    if (isAdmin) {
      alert("Admin không có quyền chỉnh sửa tour.");
      return;
    }
    navigate(`/admin/tours/edit/${tour.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Tours</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả tours của bạn ({totalItems} tours)
            {isAdmin && (
              <span className="text-orange-600 ml-2">(Chỉ xem - Admin)</span>
            )}
          </p>
        </div>
        {/* Ẩn nút Thêm Tour Mới nếu là admin */}
        {!isAdmin && (
          <Button
            onClick={handleCreateTour}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Tour Mới
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm Kiếm & Bộ Lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên tour..."
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
            <div className="w-56">
              <Select
                value={selectedCategoryId}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {tourCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tours Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Tours</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
              <span className="text-muted-foreground text-lg">
                Đang tải danh sách tours...
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hình Ảnh</TableHead>
                  <TableHead>Tên Tour</TableHead>
                  <TableHead>Danh Mục</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead>Số Lượng</TableHead>
                  <TableHead>Đánh Giá</TableHead>
                  <TableHead>Lượt Xem</TableHead>
                  <TableHead>Đã Đặt</TableHead>
                  <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(filteredTours) && filteredTours.length > 0 ? (
                  filteredTours.map((tour) => (
                    <TableRow
                      key={tour.id}
                      className={loadingTourId === tour.id ? "opacity-60" : ""}
                    >
                      <TableCell>
                        <img
                          src={tour.poster_url}
                          alt={tour.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p
                            className="font-medium truncate max-w-[200px] cursor-pointer"
                            title={tour.title}
                          >
                            {tour.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tour.duration} ngày
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getCategoryName(tour)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={tour.is_active ? "default" : "secondary"}
                          className={
                            tour.is_active ? "bg-green-500" : "bg-red-500"
                          }
                        >
                          {tour.is_active ? "Hoạt động" : "Tạm dừng"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {getTourCapacity(tour)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {getTourRating(tour) > 0
                            ? `${getTourRating(tour)}/5`
                            : "N/A"}
                          <span className="text-sm text-muted-foreground">
                            ({getTourReviewCount(tour)})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          {parseInt(getTourViewCount(tour)).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {getTourBookedCount(tour)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTour(tour)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {/* Ẩn các nút Sửa, Xóa, Đổi trạng thái nếu là admin */}
                          {!isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTour(tour)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(tour.id)}
                                disabled={loadingTourId === tour.id}
                              >
                                {loadingTourId === tour.id ? (
                                  <span className="flex items-center">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></span>
                                    {tour.is_active ? "Tạm dừng" : "Kích hoạt"}
                                  </span>
                                ) : tour.is_active ? (
                                  "Tạm dừng"
                                ) : (
                                  "Kích hoạt"
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTour(tour.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      {loading
                        ? "Đang tải..."
                        : "Không có tours nào được tìm thấy."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {Array.isArray(tours) && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {Array.isArray(tours) ? tours.length : 0} trong tổng số{" "}
                {totalItems} tours
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <span className="px-3 py-1 text-sm bg-muted rounded">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderTours;
