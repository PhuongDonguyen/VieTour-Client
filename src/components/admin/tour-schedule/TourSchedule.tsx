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
import { Search, Edit, Trash2, Eye, Plus, Calendar, Users } from "lucide-react";
import { providerTourScheduleService } from "../../../services/provider/providerTourSchedule.service";
import { adminTourScheduleService } from "../../../services/admin/adminTourSchedule.service";
import { providerTourApi } from "../../../apis/provider/providerTour.api";
import type { TourSchedule } from "../../../apis/provider/providerTourSchedule.api";
import type { AdminTourSchedule } from "../../../apis/admin/adminTourSchedule.api";
import { adminTourService } from "../../../services/admin/adminTour.service";

const TourSchedulesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Get tour_id from URL query parameter
  const tourIdFromUrl = searchParams.get("tour_id");

  const [tourSchedules, setTourSchedules] = useState<
    (TourSchedule | AdminTourSchedule)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [tours, setTours] = useState<{ id: number; title: string }[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>(
    tourIdFromUrl || "all"
  );
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [availableTours, setAvailableTours] = useState<
    { id: number; title: string }[]
  >([]);
  const [tourInfoMap, setTourInfoMap] = useState<{
    [key: number]: { title: string; poster_url: string; category_name: string };
  }>({});
  const [loadingTours, setLoadingTours] = useState<{ [key: number]: boolean }>(
    {}
  );

  // Helper functions to normalize data between TourSchedule and AdminTourSchedule
  const getTourInfo = (schedule: TourSchedule | AdminTourSchedule) => {
    // Check if schedule has tour property (AdminTourSchedule) or just tour_id (TourSchedule)
    if ("tour" in schedule && schedule.tour) {
      return {
        id: schedule.tour.id,
        title: schedule.tour.title,
        poster_url: schedule.tour.poster_url,
        category_name: schedule.tour.tour_category.name,
      };
    } else {
      // For basic TourSchedule with only tour_id, use tour info map
      const tourSchedule = schedule as TourSchedule;
      const tourInfo = tourInfoMap[tourSchedule.tour_id];
      return {
        id: tourSchedule.tour_id,
        title: tourInfo?.title || `Tour ID: ${tourSchedule.tour_id}`,
        poster_url: tourInfo?.poster_url || "/public/VieTour-Logo.png",
        category_name: tourInfo?.category_name || "N/A",
      };
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const formatStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      active: "Hoạt động",
      inactive: "Tạm dừng",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  // Function to fetch tour information
  const fetchTourInfo = async (tourId: number) => {
    if (tourInfoMap[tourId] || loadingTours[tourId]) return;

    try {
      setLoadingTours((prev) => ({ ...prev, [tourId]: true }));
      const response = await providerTourApi.getTourById(tourId);
      const tourData = response.data.data;

      setTourInfoMap((prev) => ({
        ...prev,
        [tourId]: {
          title: tourData.title,
          poster_url: tourData.poster_url,
          category_name: tourData.tour_category?.name || "Chưa phân loại",
        },
      }));
    } catch (error) {
      console.error(`Error fetching tour info for tour ${tourId}:`, error);
      // Set fallback data
      setTourInfoMap((prev) => ({
        ...prev,
        [tourId]: {
          title: `Tour ID: ${tourId}`,
          poster_url: "/public/VieTour-Logo.png",
          category_name: "Chưa phân loại",
        },
      }));
    } finally {
      setLoadingTours((prev) => ({ ...prev, [tourId]: false }));
    }
  };

  // Fetch tour schedules data from API
  const fetchTourSchedules = async () => {
    setLoading(true);
    try {
      let data;
      if (isAdmin) {
        const status =
          selectedStatus !== "all"
            ? (selectedStatus as "available" | "full" | "cancelled")
            : undefined;
        const res = await adminTourScheduleService.getAllTourSchedules({
          page: currentPage,
          search: searchTerm,
          tour_id:
            selectedTourId !== "all" ? Number(selectedTourId) : undefined,
          status,
        });
        data = res.data;
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      } else {
        const status =
          selectedStatus !== "all"
            ? (selectedStatus as "available" | "full" | "cancelled")
            : undefined;
        const res = await providerTourScheduleService.getTourSchedules({
          page: currentPage,
          search: searchTerm,
          tour_id:
            selectedTourId !== "all" ? Number(selectedTourId) : undefined,
          status,
        });
        data = res.data;
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      }
      setTourSchedules(data);
    } catch (error) {
      setTourSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      // Lấy danh sách tour cho admin
      adminTourService.getAllTours({ page: 1, limit: 100 }).then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setTours(res.data.map((t: any) => ({ id: t.id, title: t.title })));
        }
      });
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchTourSchedules();
  }, [isAdmin, currentPage, searchTerm, selectedTourId, selectedStatus]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle view schedule
  const handleViewSchedule = (schedule: TourSchedule | AdminTourSchedule) => {
    navigate(`/admin/tours/schedules/view/${schedule.id}`);
  };

  // Handle edit schedule
  const handleEditSchedule = (schedule: TourSchedule | AdminTourSchedule) => {
    if (isAdmin) {
      alert("Admin không có quyền chỉnh sửa.");
      return;
    }
    navigate(`/admin/tours/schedules/edit/${schedule.id}`);
  };

  // Handle delete schedule
  const handleDeleteSchedule = async (id: number) => {
    if (isAdmin) {
      alert("Admin không có quyền xóa.");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch trình tour này?")) {
      try {
        await providerTourScheduleService.deleteTourSchedule(id);
        fetchTourSchedules();
      } catch (error) {
        console.error("Failed to delete tour schedule:", error);
        alert("Không thể xóa lịch trình tour. Vui lòng thử lại.");
      }
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "available":
        return "default";
      case "full":
        return "destructive";
      case "cancelled":
        return "secondary";
      case "completed":
        return "outline";
      default:
        return "outline";
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Còn chỗ";
      case "full":
        return "Hết chỗ";
      case "cancelled":
        return "Đã hủy";
      case "completed":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const handleTourChange = (tourId: string) => {
    setSelectedTourId(tourId);
    setLoading(true); // show loading until list update
  };
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setLoading(true); // show loading until list update
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Lịch Trình Tours</h1>
          <p className="text-muted-foreground">
            Quản lý lịch trình và thời gian biểu của các tours ({totalItems}{" "}
            lịch trình)
            {isAdmin && (
              <span className="text-orange-600 ml-2">(Chỉ xem - Admin)</span>
            )}
          </p>
        </div>
        {!isAdmin && (
          <Button
            onClick={() => navigate("/admin/tours/schedules/new")}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Lịch Trình
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
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
            <div className="w-56">
              <Select value={selectedTourId} onValueChange={handleTourChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tours</SelectItem>
                  {tours.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="available">Còn chỗ</SelectItem>
                  <SelectItem value="full">Hết chỗ</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tour Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Lịch Trình Tours</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
              <span className="text-muted-foreground text-lg">
                Đang tải danh sách lịch trình...
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tour</TableHead>
                  <TableHead>Ngày Khởi Hành</TableHead>
                  <TableHead>Số Người Tham Gia</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead>Danh Mục</TableHead>
                  <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(tourSchedules) && tourSchedules.length > 0 ? (
                  tourSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {loadingTours[(schedule as TourSchedule).tour_id] ? (
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                              <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <img
                                src={
                                  "tour" in schedule && schedule.tour
                                    ? schedule.tour.poster_url
                                    : tourInfoMap[
                                        (schedule as TourSchedule).tour_id
                                      ]?.poster_url ||
                                      "/public/VieTour-Logo.png"
                                }
                                alt={
                                  "tour" in schedule && schedule.tour
                                    ? schedule.tour.title
                                    : tourInfoMap[
                                        (schedule as TourSchedule).tour_id
                                      ]?.title ||
                                      `Tour ID: ${
                                        (schedule as TourSchedule).tour_id
                                      }`
                                }
                                className="w-12 h-8 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium text-sm">
                                  {"tour" in schedule && schedule.tour
                                    ? schedule.tour.title
                                    : tourInfoMap[
                                        (schedule as TourSchedule).tour_id
                                      ]?.title ||
                                      `Tour ID: ${
                                        (schedule as TourSchedule).tour_id
                                      }`}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="font-medium">
                              {formatDate(schedule.start_date)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-green-600" />
                          <span className="font-semibold">
                            {schedule.participant} người
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(schedule.status)}>
                          {getStatusText(schedule.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {"tour" in schedule && schedule.tour
                            ? schedule.tour.tour_category.name
                            : tourInfoMap[(schedule as TourSchedule).tour_id]
                                ?.category_name || "Chưa phân loại"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSchedule(schedule)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSchedule(schedule)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleDeleteSchedule(schedule.id)
                                }
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
                    <TableCell colSpan={6} className="text-center py-8">
                      {loading
                        ? "Đang tải..."
                        : "Không có lịch trình nào được tìm thấy."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {Array.isArray(tourSchedules) && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị{" "}
                {Array.isArray(tourSchedules) ? tourSchedules.length : 0} trong
                tổng số {totalItems} lịch trình
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

export default TourSchedulesManagement;
