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
import { providerTourService } from "../../../services/provider/providerTour.service";
import { adminTourService } from "../../../services/admin/adminTour.service";
import { fetchActiveTourCategories } from "../../../services/tourCategory.service";
import type { ProviderTour } from "../../../apis/provider/providerTour.api";
import type { AdminTour } from "../../../apis/admin/adminTour.api";
import { providerTourCategoryApi } from "../../../apis/provider/providerTourCategory.api";
import { getAllProviders } from "../../../apis/admin/adminTour.api";

const ProviderTours: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Get category_id from URL parameter
  const categoryIdFromUrl = searchParams.get("category_id");

  const [tours, setTours] = useState<(ProviderTour | AdminTour)[]>([]);
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
  const [filteredTours, setFilteredTours] = useState<
    (ProviderTour | AdminTour)[]
  >([]);
  const [loadingTourId, setLoadingTourId] = useState<number | null>(null);
  // Sửa kiểu dữ liệu providers để chấp nhận cả company_name và business_name
  const [providers, setProviders] = useState<
    { id: number; business_name?: string; company_name?: string }[]
  >([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("all");

  // Set category filter from URL parameter on mount
  useEffect(() => {
    if (categoryIdFromUrl) {
      setSelectedCategoryId(categoryIdFromUrl);
    }
  }, [categoryIdFromUrl]);

  // Helper functions to normalize data between AdminTour and ProviderTour
  const getTourCapacity = (tour: ProviderTour | AdminTour): number => {
    return "capacity" in tour ? tour.capacity : tour.max_participants;
  };

  const getTourRating = (tour: ProviderTour | AdminTour): number => {
    return "total_star" in tour ? tour.total_star : tour.average_rating;
  };

  const getTourReviewCount = (tour: ProviderTour | AdminTour): number => {
    return "review_count" in tour ? tour.review_count : tour.total_reviews;
  };

  const getTourBookedCount = (tour: ProviderTour | AdminTour): number => {
    return "booked_count" in tour ? tour.booked_count : tour.booking_count;
  };

  const getTourViewCount = (tour: ProviderTour | AdminTour): string => {
    const viewCount = tour.view_count;
    return typeof viewCount === "string" ? viewCount : viewCount.toString();
  };

  const getTourTransportation = (tour: ProviderTour | AdminTour): string => {
    return "transportation" in tour ? tour.transportation : tour.location;
  };

  const getTourAccommodation = (tour: ProviderTour | AdminTour): string => {
    return "accommodation" in tour ? tour.accommodation : "Không có thông tin";
  };

  const getTourDestinationIntro = (
    tour: ProviderTour | AdminTour
  ): string | null => {
    return "destination_intro" in tour ? tour.destination_intro : null;
  };

  const getTourInfo = (tour: ProviderTour | AdminTour): string | null => {
    return "tour_info" in tour ? tour.tour_info : null;
  };

  const getTourLiveCommentary = (
    tour: ProviderTour | AdminTour
  ): string | null => {
    return "live_commentary" in tour ? tour.live_commentary : null;
  };

  // Fetch tours data
  useEffect(() => {
    if (isAdmin) {
      // Lấy danh sách provider cho admin
      getAllProviders().then((res) => {
        if (res.data.success) setProviders(res.data.data);
      });
    }
  }, [isAdmin]);

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        let data;
        if (isAdmin) {
          // Chỉ dùng admin API khi là admin - không gửi category_id xuống BE
          const res = await adminTourService.getAllTours({
            page: currentPage,
            search: searchTerm,
            provider_id:
              selectedProviderId !== "all"
                ? Number(selectedProviderId)
                : undefined,
          });
          data = res.data;
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.totalItems);
        } else {
          // ... giữ nguyên logic cũ cho provider
          const res = await providerTourService.getTours({
            page: currentPage,
            limit: 10,
            search: searchTerm || undefined,
          });
          data = res.data;
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.totalItems);
        }
        setTours(data);
      } catch (error) {
        console.error("Error fetching tours:", error);
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, [isAdmin, currentPage, searchTerm, selectedProviderId]);

  // FE search/filter - thêm lọc theo category
  useEffect(() => {
    let filtered = tours;

    // Lọc theo category
    if (selectedCategoryId !== "all") {
      filtered = filtered.filter((tour) => {
        const tourCategoryId = tour.tour_category?.id;
        return tourCategoryId === Number(selectedCategoryId);
      });
    }

    // Lọc theo search term
    if (searchTerm) {
      filtered = filtered.filter((tour) =>
        tour.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

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
      setTourCategories(data);
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
        await providerTourService.deleteTour(id);
        // Xóa hoặc cập nhật các tham chiếu fetchTours không còn dùng nữa
        // setTours(tours.filter(tour => tour.id !== id)); // This line was removed
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
      await providerTourService.toggleTourStatus(id);
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
  const handleViewTour = (tour: ProviderTour | AdminTour) => {
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
  const handleEditTour = (tour: ProviderTour | AdminTour) => {
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
            {isAdmin && (
              <div className="w-56">
                <Select
                  value={selectedProviderId}
                  onValueChange={setSelectedProviderId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.company_name || p.business_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
                            {tour.duration}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {tour.tour_category.name}
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
