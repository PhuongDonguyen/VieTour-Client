import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPaginatedTourSchedules, fetchScheduleBookings } from "@/services/tourSchedule.service";
import type { TourScheduleWithTour } from "@/apis/tourSchedule.api";
import { Calendar, Loader2, MapPin, Users, List, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type StatusFilter = "all" | "available" | "full" | "cancelled";

interface PaginationState {
  totalItems: number;
  totalPages: number;
  itemsPerPage: number;
}

const STATUS_LABELS: Record<Exclude<StatusFilter, "all">, string> = {
  available: "Còn chỗ",
  full: "Hết chỗ",
  cancelled: "Đã hủy",
};

const ListTrip: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<TourScheduleWithTour[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    totalItems: 0,
    totalPages: 1,
    itemsPerPage: 10,
  });
  const [exportingId, setExportingId] = useState<number | null>(null);

  const providerId =
    user?.role === "provider"
      ? user?.provider_id ||
        (user as any)?.providerId ||
        (user as any)?.provider?.id ||
        user?.id
      : undefined;

  useEffect(() => {
    if (user?.role === "provider" && !providerId) {
      return;
    }

    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchPaginatedTourSchedules(
          {
            page: currentPage,
            limit: 10,
            status: statusFilter !== "all" ? statusFilter : undefined,
          },
          providerId
        );

        setSchedules(response.data || []);
        setPagination({
          totalItems: response.pagination?.totalItems ?? 0,
          totalPages: response.pagination?.totalPages ?? 1,
          itemsPerPage: response.pagination?.itemsPerPage ?? 10,
        });
      } catch (err) {
        console.error("Error fetching tour schedules:", err);
        setError("Không thể tải danh sách lịch trình. Vui lòng thử lại sau.");
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [statusFilter, currentPage, providerId, user?.role]);

  const handleStatusChange = (value: StatusFilter) => {
    setCurrentPage(1);
    setStatusFilter(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status: StatusFilter | string) => {
    switch (status) {
      case "available":
        return { variant: "default" as const, label: STATUS_LABELS.available };
      case "full":
        return { variant: "destructive" as const, label: STATUS_LABELS.full };
      case "cancelled":
        return { variant: "secondary" as const, label: STATUS_LABELS.cancelled };
      default:
        return { variant: "outline" as const, label: status };
    }
  };

  const handleViewBookings = (schedule: TourScheduleWithTour) => {
    const path =
      user?.role === "provider"
        ? `/admin/provider/tours/schedules/${schedule.id}/bookings`
        : `/admin/tours/schedules/${schedule.id}/bookings`;
    navigate(path, {
      state: { schedule },
    });
  };

  const handleExportBookings = async (schedule: TourScheduleWithTour) => {
    setExportingId(schedule.id);
    try {
      const response = await fetchScheduleBookings(schedule.id);
      const bookings = response.data || [];

      if (bookings.length === 0) {
        toast.info("Lịch trình này chưa có booking để xuất.");
        return;
      }

      const escapeValue = (value: string | number | null | undefined) => {
        const str = value === null || value === undefined ? "" : String(value);
        if (/[",\n]/.test(str)) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const formatDate = (dateString: string) => {
        try {
          return new Date(dateString).toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        } catch (e) {
          return dateString;
        }
      };

      // Thông tin lịch trình
      const scheduleInfo = [
        ["THÔNG TIN LỊCH TRÌNH"],
        ["ID Lịch trình", schedule.id],
        ["Tên tour", schedule.tour.title],
        ["Địa điểm", schedule.tour.location?.trim() || "Đang cập nhật"],
        ["Ngày khởi hành", formatDate(schedule.start_date)],
        ["Số người tham gia", schedule.participant ?? 0],
        ["Trạng thái", getStatusBadge(schedule.status).label],
        ["Thời lượng", schedule.tour.duration || "Đang cập nhật"],
        [], // Dòng trống
      ];

      const headers = [
        "ID Booking",
        "Tên khách hàng",
        "Số điện thoại",
        "Phương thức thanh toán",
        "Trạng thái",
        "Tổng tiền",
        "Ghi chú booking",
        "ID Chi tiết",
        "Số lượng người lớn",
        "Giá người lớn",
        "Số lượng trẻ em",
        "Giá trẻ em",
        "Ghi chú chi tiết",
      ];

      const rows: any[] = [];
      bookings.forEach((booking) => {
        const bookingDetails = booking.booking_details || [];

        if (bookingDetails.length === 0) {
          // Nếu không có booking_details, vẫn tạo một dòng với thông tin booking
          rows.push([
            booking.id,
            escapeValue(booking.client_name),
            escapeValue(booking.client_phone),
            escapeValue(booking.payment?.payment_method),
            escapeValue(booking.status),
            booking.total ?? 0,
            escapeValue(booking.note),
            "", // ID Chi tiết
            "", // Số lượng người lớn
            "", // Giá người lớn
            "", // Số lượng trẻ em
            "", // Giá trẻ em
            "", // Ghi chú chi tiết
          ]);
        } else {
          // Tạo một dòng cho mỗi booking_detail
          bookingDetails.forEach((detail) => {
            rows.push([
              booking.id,
              escapeValue(booking.client_name),
              escapeValue(booking.client_phone),
              escapeValue(booking.payment?.payment_method),
              escapeValue(booking.status),
              booking.total ?? 0,
              escapeValue(booking.note),
              detail.id,
              detail.adult_quanti ?? 0,
              detail.adult_price ?? 0,
              detail.kid_quanti ?? 0,
              detail.kid_price ?? 0,
              escapeValue(detail.note),
            ]);
          });
        }
      });

      // Kết hợp thông tin lịch trình, headers và rows
      const allRows = [
        ...scheduleInfo.map((row) => row.map((cell) => escapeValue(cell)).join(",")),
        headers.map((h) => escapeValue(h)).join(","),
        ...rows.map((row) => row.map((cell) => (typeof cell === "number" ? cell : escapeValue(cell))).join(",")),
      ];

      const csvContent = "\ufeff" + allRows.join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `lich-trinh-${schedule.id}-${schedule.tour.title.replace(/[^a-z0-9]/gi, "-")}-bookings.csv`;
      link.click();

      URL.revokeObjectURL(url);
      toast.success("Xuất danh sách booking thành công!");
    } catch (err) {
      console.error("Error exporting bookings:", err);
      toast.error("Không thể xuất danh sách booking. Vui lòng thử lại.");
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Danh sách lịch trình</h1>
          <p className="text-muted-foreground">
            Theo dõi các lịch trình tour sắp diễn ra và trạng thái hiện tại.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Trạng thái</span>
            <Select
              value={statusFilter}
              onValueChange={(value) => handleStatusChange(value as StatusFilter)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="available">Còn chỗ</SelectItem>
                <SelectItem value="full">Hết chỗ</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bảng lịch trình</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-600">
              {error}
            </div>
          )}

          <div className="min-h-[420px]">
            {loading ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Đang tải dữ liệu...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tour</TableHead>
                    <TableHead>Ngày khởi hành</TableHead>
                    <TableHead>Số người</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                        Không có lịch trình nào phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    schedules.map((schedule) => {
                      const badge = getStatusBadge(schedule.status);
                      return (
                        <TableRow key={schedule.id} className="hover:bg-muted/40">
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-semibold">{schedule.tour.title}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="mr-1 h-3.5 w-3.5" />
                                {schedule.tour.location?.trim() || "Đang cập nhật"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span>{formatDate(schedule.start_date)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-emerald-600" />
                              <span className="font-medium">
                                {schedule.participant ?? 0} khách
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewBookings(schedule)}
                                className="inline-flex items-center gap-2"
                              >
                                <List className="h-4 w-4" />
                                Xem booking
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExportBookings(schedule)}
                                disabled={exportingId === schedule.id}
                                className="inline-flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                {exportingId === schedule.id ? "Đang xuất..." : "Xuất Excel"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t pt-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <div>
              Hiển thị {schedules.length} trong tổng số {pagination.totalItems} lịch trình
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Trước
              </Button>
              <span className="rounded-md border px-3 py-1 text-sm">
                {currentPage} / {Math.max(pagination.totalPages, 1)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === pagination.totalPages || loading || pagination.totalPages === 0}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, Math.max(pagination.totalPages, 1)))
                }
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListTrip;

