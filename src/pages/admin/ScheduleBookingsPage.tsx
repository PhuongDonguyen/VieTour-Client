import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
import { fetchScheduleBookings } from "@/services/tourSchedule.service";
import type { ScheduleBooking, TourScheduleWithTour } from "@/apis/tourSchedule.api";
import { ArrowLeft, Calendar, Loader2, Users } from "lucide-react";

const ScheduleBookingsPage: React.FC = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const scheduleFromState = location.state?.schedule as TourScheduleWithTour | undefined;

  const [schedule] = useState<TourScheduleWithTour | undefined>(scheduleFromState);
  const [bookings, setBookings] = useState<ScheduleBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scheduleId) {
      setError("Không tìm thấy lịch trình.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchScheduleBookings(Number(scheduleId));
        console.log("Booking response:", response);
        // Chỉ hiển thị booking thành công
        const successfulBookings = (response.data || []).filter(
          (booking) => booking.status === "success"
        );
        setBookings(successfulBookings);
      } catch (err) {
        console.error("Error fetching schedule bookings:", err);
        setError("Không thể tải danh sách booking. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [scheduleId]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

  const formatDate = (value?: string) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getBookingTotals = (booking: ScheduleBooking) => {
    if (!booking.booking_details || booking.booking_details.length === 0) {
      return { totalAdults: 0, totalKids: 0, total: 0 };
    }
    const totalAdults = booking.booking_details.reduce(
      (sum, detail) => sum + (Number(detail.adult_quanti) || 0),
      0
    );
    const totalKids = booking.booking_details.reduce(
      (sum, detail) => sum + (Number(detail.kid_quanti) || 0),
      0
    );
    return { totalAdults, totalKids, total: totalAdults + totalKids };
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking của lịch trình</h1>
          {schedule && (
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(schedule.start_date)} • {schedule.tour.title}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách booking ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="min-h-[300px]">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Đang tải dữ liệu...
              </div>
            ) : bookings.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Chưa có booking nào cho lịch trình này.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Liên hệ</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Thanh toán</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const { totalAdults, totalKids, total: totalPeople } = getBookingTotals(booking);
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <p className="font-semibold">{booking.client_name || "Ẩn danh"}</p>
                          <p className="text-sm text-muted-foreground">Mã booking: #{booking.id}</p>
                        </TableCell>
                        <TableCell>
                          <p>{booking.client_phone ?? "Chưa cập nhật"}</p>
                          {booking.note && (
                            <p className="text-xs text-muted-foreground mt-1">Ghi chú: {booking.note}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          {booking.booking_details && booking.booking_details.length > 0 ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">
                                  <span className="font-medium">{totalAdults}</span> người lớn
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">
                                  <span className="font-medium">{totalKids}</span> trẻ em
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground pt-0.5">
                                Tổng: <span className="font-medium">{totalPeople}</span> người
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Chưa có thông tin</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{booking.payment?.payment_method || "N/A"}</p>
                          {booking.txn_ref && (
                            <p className="text-xs text-muted-foreground">Ref: {booking.txn_ref}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              booking.status === "success"
                                ? "default"
                                : booking.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(booking.total)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleBookingsPage;

