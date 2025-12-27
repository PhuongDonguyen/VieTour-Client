import React, { useEffect, useState } from "react";
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
import { fetchCancelledSchedulesWithBookings } from "@/services/tourSchedule.service";
import { cancellationRequestService } from "@/services/cancellationRequest.service";
import type { CancelledScheduleWithBookings, ScheduleBooking } from "@/apis/tourSchedule.api";
import { Calendar, Loader2, MapPin, Users, X, ArrowLeft, DollarSign } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaginationState {
  totalItems: number;
  totalPages: number;
  itemsPerPage: number;
}

// Component hiển thị bookings của một schedule
interface BookingsViewProps {
  schedule: CancelledScheduleWithBookings;
  onClose: () => void;
  onRefundSuccess?: () => void;
}

const BookingsView: React.FC<BookingsViewProps> = ({ schedule, onClose, onRefundSuccess }) => {
  const bookings = schedule.bookings || [];
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState<ScheduleBooking | null>(null);
  const [refundingBookingId, setRefundingBookingId] = useState<number | null>(null);
  const [refundFormData, setRefundFormData] = useState({
    recipient_name: "",
    bank_name: "",
    account_number: "",
    phone_number: "",
    transaction_image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

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

  const handleOpenRefundDialog = (booking: ScheduleBooking) => {
    setSelectedBookingForRefund(booking);
    setRefundFormData({
      recipient_name: booking.client_name || "",
      bank_name: "",
      account_number: "",
      phone_number: booking.client_phone || "",
      transaction_image: null,
    });
    setImagePreview(null);
    setRefundDialogOpen(true);
  };

  const handleRefundFormChange = (field: string, value: string | File | null) => {
    setRefundFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRefundBooking = async () => {
    if (!selectedBookingForRefund) return;

    if (!refundFormData.recipient_name || !refundFormData.bank_name || !refundFormData.account_number || !refundFormData.phone_number) {
      toast.error("Vui lòng điền đầy đủ thông tin người nhận.");
      return;
    }

    if (!refundFormData.transaction_image) {
      toast.error("Vui lòng tải lên ảnh giao dịch.");
      return;
    }

    setRefundingBookingId(selectedBookingForRefund.id);
    try {
      await cancellationRequestService.refundBookingForInsufficientPassengers({
        booking_id: selectedBookingForRefund.id,
        recipient_name: refundFormData.recipient_name,
        bank_name: refundFormData.bank_name,
        account_number: refundFormData.account_number,
        phone_number: refundFormData.phone_number,
        transaction_image: refundFormData.transaction_image,
      });

      toast.success("Yêu cầu hoàn tiền đã được gửi thành công!");
      setRefundDialogOpen(false);
      setSelectedBookingForRefund(null);
      setRefundFormData({
        recipient_name: "",
        bank_name: "",
        account_number: "",
        phone_number: "",
        transaction_image: null,
      });
      setImagePreview(null);
      
      // Refresh the schedule data
      if (onRefundSuccess) {
        onRefundSuccess();
      }
    } catch (err: any) {
      console.error("Error refunding booking:", err);
      toast.error(err?.response?.data?.message || "Không thể hoàn tiền. Vui lòng thử lại.");
    } finally {
      setRefundingBookingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <div>
            <CardTitle>Booking của lịch trình</CardTitle>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(schedule.start_date)} • {schedule.tour.title}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <CardTitle className="mb-2">Danh sách booking ({bookings.length})</CardTitle>
        </div>
        {bookings.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Chưa có booking nào cho lịch trình này.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <p className="font-semibold">{booking.client_name || "Ẩn danh"}</p>
                    <p className="text-sm text-muted-foreground">Mã booking: #{booking.id}</p>
                  </TableCell>
                  <TableCell>
                    <p>{booking.client_phone ?? "Chưa cập nhật"}</p>
                  </TableCell>
                  <TableCell>
                    {booking.note ? (
                      <p className="text-sm text-muted-foreground">{booking.note}</p>
                    ) : (
                      <span className="text-sm text-muted-foreground">Không có ghi chú</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{booking.payment?.payment_method || "N/A"}</p>
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
                  <TableCell className="text-right">
                    {booking.status === "refunded" ? null : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRefundDialog(booking)}
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <DollarSign className="h-4 w-4" />
                        Hoàn tiền
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hoàn tiền booking</DialogTitle>
            <DialogDescription>
              {selectedBookingForRefund && (
                <div className="mt-2 space-y-1">
                  <p>
                    <span className="font-semibold">Booking ID:</span> #{selectedBookingForRefund.id}
                  </p>
                  <p>
                    <span className="font-semibold">Khách hàng:</span> {selectedBookingForRefund.client_name || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold">Tổng tiền:</span> {formatCurrency(selectedBookingForRefund.total || 0)}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient_name">
                Tên người nhận <span className="text-red-500">*</span>
              </Label>
              <Input
                id="recipient_name"
                value={refundFormData.recipient_name}
                onChange={(e) => handleRefundFormChange("recipient_name", e.target.value)}
                placeholder="Nhập tên người nhận"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_name">
                Tên ngân hàng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bank_name"
                value={refundFormData.bank_name}
                onChange={(e) => handleRefundFormChange("bank_name", e.target.value)}
                placeholder="Ví dụ: Vietcombank"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">
                Số tài khoản <span className="text-red-500">*</span>
              </Label>
              <Input
                id="account_number"
                value={refundFormData.account_number}
                onChange={(e) => handleRefundFormChange("account_number", e.target.value)}
                placeholder="Nhập số tài khoản"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone_number"
                value={refundFormData.phone_number}
                onChange={(e) => handleRefundFormChange("phone_number", e.target.value)}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction_image">
                Ảnh giao dịch <span className="text-red-500">*</span>
              </Label>
              <Input
                id="transaction_image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleRefundFormChange("transaction_image", file);
                  
                  // Create preview
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setImagePreview(null);
                  }
                }}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 w-auto rounded-md border object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleRefundBooking}
              disabled={refundingBookingId !== null}
              className="inline-flex items-center gap-2"
            >
              {refundingBookingId !== null ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4" />
                  Hoàn tiền
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const CancelledSchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<CancelledScheduleWithBookings[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    totalItems: 0,
    totalPages: 1,
    itemsPerPage: 10,
  });
  const [selectedSchedule, setSelectedSchedule] = useState<CancelledScheduleWithBookings | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchCancelledSchedulesWithBookings(currentPage, 10);
        setSchedules(response.data || []);
        setPagination({
          totalItems: response.pagination?.totalItems ?? 0,
          totalPages: response.pagination?.totalPages ?? 1,
          itemsPerPage: response.pagination?.itemsPerPage ?? 10,
        });
      } catch (err) {
        console.error("Error fetching cancelled schedules:", err);
        setError("Không thể tải danh sách lịch trình đã hủy. Vui lòng thử lại sau.");
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [currentPage]);

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

  const handleScheduleClick = (schedule: CancelledScheduleWithBookings) => {
    if (schedule.bookings && schedule.bookings.length > 0) {
      setSelectedSchedule(schedule);
    }
  };

  const handleCloseBookings = () => {
    setSelectedSchedule(null);
  };

  const handleRefundSuccess = async () => {
    // Refresh the schedules data
    setLoading(true);
    setError(null);
    try {
      const response = await fetchCancelledSchedulesWithBookings(currentPage, 10);
      setSchedules(response.data || []);
      setPagination({
        totalItems: response.pagination?.totalItems ?? 0,
        totalPages: response.pagination?.totalPages ?? 1,
        itemsPerPage: response.pagination?.itemsPerPage ?? 10,
      });
      
      // Update selected schedule if it still exists
      if (selectedSchedule) {
        const updatedSchedule = response.data?.find((s) => s.id === selectedSchedule.id);
        if (updatedSchedule) {
          setSelectedSchedule(updatedSchedule);
        }
      }
    } catch (err) {
      console.error("Error refreshing schedules:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {selectedSchedule ? (
        <BookingsView schedule={selectedSchedule} onClose={handleCloseBookings} onRefundSuccess={handleRefundSuccess} />
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold">Lịch trình đã hủy</h1>
            <p className="text-muted-foreground mt-1">
              Danh sách các lịch trình tour đã bị hủy và thông tin booking liên quan.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách lịch trình đã hủy</CardTitle>
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
                        <TableHead>Số booking</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                            Không có lịch trình nào đã bị hủy.
                          </TableCell>
                        </TableRow>
                      ) : (
                        schedules.map((schedule) => {
                          const bookings = schedule.bookings || [];
                          const hasBookings = bookings.length > 0;

                          return (
                            <TableRow
                              key={schedule.id}
                              className={`hover:bg-muted/40 ${hasBookings ? "cursor-pointer" : ""}`}
                              onClick={() => hasBookings && handleScheduleClick(schedule)}
                            >
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="font-semibold">{schedule.tour.title}</p>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-1 h-3.5 w-3.5" />
                                    {schedule.tour.starting_point?.trim() || "Đang cập nhật"}
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
                                <span className="font-medium">{bookings.length}</span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">Đã hủy</Badge>
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
                  Hiển thị {schedules.length} trong tổng số {pagination.totalItems} lịch trình đã hủy
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
                    disabled={
                      currentPage === pagination.totalPages || loading || pagination.totalPages === 0
                    }
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
        </>
      )}
    </div>
  );
};

export default CancelledSchedulesPage;

