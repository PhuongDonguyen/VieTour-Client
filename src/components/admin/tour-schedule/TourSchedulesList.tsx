import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Edit,
  Trash2,
  Eye,
  Plus,
  Calendar,
  Users,
  ArrowLeft,
  Copy,
} from "lucide-react";
import {
  fetchAllTourSchedules,
  deleteTourScheduleService,
  createTourScheduleService,
} from "@/services/tourSchedule.service";
import { fetchTourById } from "@/services/tour.service";
import type { TourSchedule } from "@/apis/tourSchedule.api";

const TourSchedulesList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Get tour_id from URL query parameter
  const tourIdFromUrl = searchParams.get("tour_id");
  const tourId = tourIdFromUrl ? parseInt(tourIdFromUrl) : null;

  const [tourSchedules, setTourSchedules] = useState<TourSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [tourInfo, setTourInfo] = useState<{
    id: number;
    title: string;
  } | null>(null);

  // State for duplicate schedule modal
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<TourSchedule | null>(
    null
  );
  const [duplicateCount, setDuplicateCount] = useState(1);
  const [duplicating, setDuplicating] = useState(false);

  // Fetch tour information
  const fetchTourInfo = async (tourId: number) => {
    try {
      const tourData = await fetchTourById(tourId);
      setTourInfo({
        id: tourData.id,
        title: tourData.title,
      });
    } catch (error) {
      console.error(`Error fetching tour info for tour ${tourId}:`, error);
      setTourInfo({
        id: tourId,
        title: `Tour ID: ${tourId}`,
      });
    }
  };

  // Fetch tour schedules data from API
  const fetchTourSchedules = async () => {
    if (!tourId) return;

    setLoading(true);
    try {
      const res = await fetchAllTourSchedules({
        page: currentPage,
        tour_id: tourId,
      });

      setTourSchedules(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.totalItems);
    } catch (error) {
      console.error("Error fetching tour schedules:", error);
      setTourSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tourId) {
      fetchTourInfo(tourId);
      fetchTourSchedules();
    }
  }, [tourId, currentPage]);

  // Handle view schedule
  const handleViewSchedule = (schedule: TourSchedule) => {
    navigate(`/admin/tours/schedules/view/${schedule.id}?tour_id=${tourId}`);
  };

  // Handle edit schedule
  const handleEditSchedule = (schedule: TourSchedule) => {
    if (isAdmin) {
      alert("Admin không có quyền chỉnh sửa.");
      return;
    }
    navigate(`/admin/tours/schedules/edit/${schedule.id}?tour_id=${tourId}`);
  };

  // Handle delete schedule
  const handleDeleteSchedule = async (id: number) => {
    if (isAdmin) {
      alert("Admin không có quyền xóa.");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch trình tour này?")) {
      try {
        await deleteTourScheduleService(id);
        fetchTourSchedules();
      } catch (error) {
        console.error("Failed to delete tour schedule:", error);
        alert("Không thể xóa lịch trình tour. Vui lòng thử lại.");
      }
    }
  };

  // Handle create new schedule
  const handleCreateSchedule = () => {
    navigate(`/admin/tours/schedules/new?tour_id=${tourId}`);
  };

  // Handle back to tour
  const handleBackToTour = () => {
    navigate(`/admin/tours/view/${tourId}`);
  };

  // Handle duplicate schedule
  const handleDuplicateSchedule = (schedule: TourSchedule) => {
    setSelectedSchedule(schedule);
    setDuplicateCount(1);
    setDuplicateModalOpen(true);
  };

  const handleConfirmDuplicate = async () => {
    if (!selectedSchedule || !tourId) return;

    setDuplicating(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < duplicateCount; i++) {
        try {
          const scheduleData = {
            tour_id: tourId,
            start_date: selectedSchedule.start_date,
          };

          await createTourScheduleService(scheduleData);
          successCount++;
        } catch (error) {
          console.error(`Error creating duplicate schedule ${i + 1}:`, error);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        alert(`Tạo thành công ${successCount} lịch trình!`);
      } else {
        alert(`Tạo thành công ${successCount} lịch trình, ${errorCount} lỗi.`);
      }

      // Refresh the list
      fetchTourSchedules();
      setDuplicateModalOpen(false);
      setSelectedSchedule(null);
    } catch (error) {
      console.error("Error duplicating schedules:", error);
      alert("Có lỗi xảy ra khi tạo lịch trình. Vui lòng thử lại.");
    } finally {
      setDuplicating(false);
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

  if (!tourId) {
    return <div className="text-red-500">Không tìm thấy tour ID</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBackToTour}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Tour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Lịch Trình Tour: {tourInfo?.title || `Tour ID: ${tourId}`}
            </h1>
            <p className="text-muted-foreground">
              Quản lý lịch trình và thời gian biểu của tour ({totalItems} lịch
              trình)
              {isAdmin && (
                <span className="text-orange-600 ml-2">(Chỉ xem - Admin)</span>
              )}
            </p>
          </div>
        </div>
        {!isAdmin && (
          <Button
            onClick={handleCreateSchedule}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Lịch Trình
          </Button>
        )}
      </div>

      {/* Tour Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Lịch Trình</CardTitle>
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
                  <TableHead>Ngày Khởi Hành</TableHead>
                  <TableHead>Số Người Tham Gia</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(tourSchedules) && tourSchedules.length > 0 ? (
                  tourSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
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
                                  handleDuplicateSchedule(schedule)
                                }
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Copy className="w-4 h-4" />
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
                    <TableCell colSpan={4} className="text-center py-8">
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

      {/* Duplicate Schedule Modal */}
      <Dialog open={duplicateModalOpen} onOpenChange={setDuplicateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhân Số Lượng Lịch Trình</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="duplicate-count">Số lượng cần tạo:</Label>
              <Input
                id="duplicate-count"
                type="number"
                min="1"
                max="20"
                value={duplicateCount}
                onChange={(e) =>
                  setDuplicateCount(parseInt(e.target.value) || 1)
                }
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Nhập số lượng lịch trình muốn tạo (tối đa 20)
              </p>
            </div>

            {selectedSchedule && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Thông tin lịch trình gốc:</p>
                <p className="text-sm text-muted-foreground">
                  Ngày: {formatDate(selectedSchedule.start_date)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tour:{" "}
                  {tourInfo?.title || `Tour ID: ${selectedSchedule.tour_id}`}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDuplicateModalOpen(false)}
                disabled={duplicating}
              >
                Hủy
              </Button>
              <Button
                onClick={handleConfirmDuplicate}
                disabled={
                  duplicating || duplicateCount < 1 || duplicateCount > 20
                }
              >
                {duplicating
                  ? "Đang tạo..."
                  : `Tạo ${duplicateCount} lịch trình`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TourSchedulesList;
