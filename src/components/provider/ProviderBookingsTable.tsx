import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../hooks/useAuth";
import { providerBookingService } from "../../services/provider/providerBooking.service";
import { providerTourService } from "../../services/provider/providerTour.service";
import { toast } from "sonner";
import type { AdminBooking } from "../../apis/booking.api";
import type { ProviderTour } from "../../apis/provider/providerTour.api";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Search, Calendar, Users, DollarSign } from "lucide-react";

const ProviderBookingsTable: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [tours, setTours] = useState<ProviderTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tourFilter, setTourFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("ProviderBookingsTable: Starting to fetch data...");

      // Fetch bookings
      const queryParams = new URLSearchParams();
      if (debouncedSearchTerm)
        queryParams.append("search", debouncedSearchTerm);
      if (statusFilter !== "all") queryParams.append("status", statusFilter);
      if (startDate) queryParams.append("start_date", startDate);
      if (endDate) queryParams.append("end_date", endDate);
      // Validate date range: end_date should be >= start_date
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        toast.error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
        return;
      }
      if (tourFilter !== "all") queryParams.append("tour_id", tourFilter);
      queryParams.append("page", currentPage.toString());
      queryParams.append("limit", "10");

      console.log(
        "ProviderBookingsTable: Calling providerBookingService.getProviderBookings..."
      );
      const bookingsRes = await providerBookingService.getProviderBookings(
        {
          page: currentPage,
          limit: 10,
          search: debouncedSearchTerm || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          tour_id: tourFilter !== "all" ? parseInt(tourFilter) : undefined,
        },
        user
      ); // Truyền user để lấy provider_id
      console.log("ProviderBookingsTable: Bookings response:", bookingsRes);
      console.log(
        "ProviderBookingsTable: Raw response data:",
        bookingsRes.data
      );
      console.log(
        "ProviderBookingsTable: Response data type:",
        typeof bookingsRes.data
      );
      console.log(
        "ProviderBookingsTable: Is data array?",
        Array.isArray(bookingsRes.data)
      );

      // Handle API response structure
      let bookingsData: any[] = [];
      let paginationData = {
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };

      // API returns { success: true, data: [...], pagination: {...} }
      const responseData = bookingsRes.data as any;
      if (responseData && responseData.success) {
        bookingsData = Array.isArray(responseData.data)
          ? responseData.data
          : [];
        paginationData = responseData.pagination || paginationData;
      }

      console.log(
        "ProviderBookingsTable: Processed bookings data:",
        bookingsData
      );
      console.log(
        "ProviderBookingsTable: Processed pagination:",
        paginationData
      );

      setBookings(bookingsData);
      setTotalPages(paginationData.totalPages);
      setTotalItems(paginationData.totalItems);
      setHasNextPage(paginationData.hasNextPage || false);
      setHasPrevPage(paginationData.hasPrevPage || false);

      // Fetch tours for filter - only for provider role
      if (user?.role === "provider") {
        console.log(
          "ProviderBookingsTable: Calling providerTourService.getProviderTours..."
        );
        const toursRes = await providerTourService.getProviderTours();
        console.log("ProviderBookingsTable: Tours response:", toursRes);
        const toursData = (toursRes as any).data?.data || toursRes.data || [];
        setTours(Array.isArray(toursData) ? toursData : []);
      }
    } catch (error) {
      console.error("ProviderBookingsTable: Error fetching data:", error);
      setBookings([]);
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    console.log(
      "ProviderBookingsTable: Component mounted, calling fetchData..."
    );
    fetchData();
  }, [
    currentPage,
    debouncedSearchTerm,
    statusFilter,
    tourFilter,
    startDate,
    endDate,
  ]);

  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null) {
      return "0 VND";
    }
    return price.toLocaleString("vi-VN") + " VND";
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Chờ xác nhận", variant: "secondary" as const },
      success: { label: "Thành công", variant: "default" as const },
      failed: { label: "Thất bại", variant: "destructive" as const },
      refund_requested: {
        label: "Đã yêu cầu hoàn tiền",
        variant: "secondary" as const,
      },
      refunded: { label: "Đã hoàn tiền", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "outline" as const,
    };

    // Custom styling based on status
    const getCustomStyle = (status: string) => {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "success":
          return "bg-green-100 text-green-800 border-green-200";
        case "failed":
          return "bg-red-100 text-red-800 border-red-200";
        case "refund_requested":
          return "bg-purple-100 text-purple-800 border-purple-200";
        case "refunded":
          return "bg-blue-100 text-blue-800 border-blue-200";
        default:
          return "";
      }
    };

    return (
      <Badge variant="outline" className={`${getCustomStyle(status)}`}>
        {config.label}
      </Badge>
    );
  };

  console.log(
    "ProviderBookingsTable: Rendering component, bookings:",
    bookings,
    "bookings type:",
    typeof bookings,
    "isArray:",
    Array.isArray(bookings),
    "loading:",
    loading,
    "totalPages:",
    totalPages,
    "totalItems:",
    totalItems
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {user?.role === "admin" ? "Quản lý đặt tour" : "Đặt tour của tôi"}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === "admin"
              ? "Quản lý tất cả đặt tour trong hệ thống"
              : "Theo dõi các đặt tour từ khách hàng của bạn"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm & Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên tour..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 max-w-sm"
              />
            </div>

            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                  <SelectItem value="refund_requested">
                    Đã yêu cầu hoàn tiền
                  </SelectItem>
                  <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-40">
              <Input
                type="date"
                placeholder="Từ ngày"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-40">
              <Input
                type="date"
                placeholder="Đến ngày"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>

            {user?.role === "provider" && (
              <div className="w-56">
                <Select value={tourFilter} onValueChange={setTourFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tour" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả tour</SelectItem>
                    {Array.isArray(tours) &&
                      tours.map((tour) => (
                        <SelectItem key={tour.id} value={tour.id.toString()}>
                          {tour.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đặt tour</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
              <span className="text-muted-foreground text-lg">
                Đang tải danh sách đặt tour...
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đặt tour</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Ngày khởi hành</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      Không có kết quả phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  (Array.isArray(bookings) ? bookings : []).map(
                    (booking, index) => {
                      console.log(
                        `ProviderBookingsTable: Rendering booking ${index}:`,
                        booking
                      );
                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {booking.id.toString()}
                          </TableCell>
                          <TableCell>
                            {booking.schedule?.tour?.title ||
                              booking.tour_title ||
                              "N/A"}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {booking.client_name ||
                                  booking.user?.first_name +
                                    " " +
                                    booking.user?.last_name ||
                                  "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.client_phone ||
                                  booking.user?.phone ||
                                  "N/A"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>
                                {booking.booking_details?.reduce(
                                  (total: number, detail: any) =>
                                    total + detail.adult_quanti,
                                  0
                                ) || 0}{" "}
                                người lớn
                              </span>
                              {booking.booking_details?.reduce(
                                (total: number, detail: any) =>
                                  total + detail.kid_quanti,
                                0
                              ) > 0 && (
                                <span className="text-sm text-gray-500">
                                  +{" "}
                                  {booking.booking_details?.reduce(
                                    (total: number, detail: any) =>
                                      total + detail.kid_quanti,
                                    0
                                  ) || 0}{" "}
                                  trẻ em
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">
                                {formatPrice(booking.total)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {booking.create_at
                              ? formatDate(booking.create_at)
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {booking.schedule?.start_date
                              ? formatDate(booking.schedule.start_date)
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(booking.status || "unknown")}
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Hiển thị {bookings.length} trong tổng số {totalItems} kết quả
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!hasPrevPage}
                >
                  Trước
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!hasNextPage}
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

export default ProviderBookingsTable;
