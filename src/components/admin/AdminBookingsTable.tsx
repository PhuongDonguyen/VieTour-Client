import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  fetchAllBookings,
  fetchBookingsCount,
} from "../../services/booking.service";
import { getAllTours } from "../../apis/tour.api";
import { fetchAllProviderProfiles } from "../../services/providerProfile.service";
import { toast } from "sonner";
import type { AdminBooking } from "../../apis/booking.api";

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
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react";

const AdminBookingsTable: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [tourFilter, setTourFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [filteredTours, setFilteredTours] = useState<any[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch providers and initial tours
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === "admin") {
          // For admin, fetch providers only (tours will be fetched by provider filter)
          const providersRes = await fetchAllProviderProfiles({
            limit: 1000,
            is_verified: true,
          });
          console.log("Admin providers response:", providersRes);
          setProviders(providersRes || []);

          // Fetch all tours initially for admin
          const toursRes = await getAllTours({ limit: 1000 });
          setTours(toursRes.data || []);
          setFilteredTours(toursRes.data || []);
        } else {
          // For provider, fetch their own tours
          const toursRes = await getAllTours({
            limit: 1000,
            provider_id: user?.id,
          });
          setTours(toursRes.data || []);
          setFilteredTours(toursRes.data || []);
          setProviders([]); // Provider doesn't need provider dropdown
        }
      } catch (error) {
        console.error("Error fetching providers/tours:", error);
        setProviders([]);
        setTours([]);
        setFilteredTours([]);
      }
    };
    fetchData();
  }, [user?.role, user?.id]);

  // Fetch tours based on selected provider (backend filtering)
  useEffect(() => {
    const fetchToursByProvider = async () => {
      try {
        let params: any = { limit: 1000 };

        if (user?.role === "provider") {
          // Provider chỉ thấy tour của mình
          params.provider_id = user.id;
        } else if (user?.role === "admin" && providerFilter !== "all") {
          // Admin chọn provider để filter
          params.provider_id = parseInt(providerFilter);
        }

        const toursRes = await getAllTours(params);
        setTours(toursRes.data || []);
        setFilteredTours(toursRes.data || []);

        // Reset tour filter when provider changes
        setTourFilter("all");
      } catch (error) {
        console.error("Error fetching tours by provider:", error);
        setTours([]);
        setFilteredTours([]);
      }
    };

    fetchToursByProvider();
  }, [providerFilter, user?.role, user?.id]);

  // Fetch bookings
  const fetchData = async () => {
    setLoading(true);
    try {
      // Validate date range
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        toast.error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
        return;
      }

      // Nếu là provider, tự động thêm provider_id từ user
      const isProvider = user?.role === "provider";
      const providerId = isProvider ? user?.id : undefined;

      const bookingsRes = await fetchAllBookings({
        page: currentPage,
        limit: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
        provider_id: isProvider
          ? providerId
          : providerFilter !== "all"
          ? parseInt(providerFilter)
          : undefined,
        tour_id: tourFilter !== "all" ? parseInt(tourFilter) : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        // Note: search parameter not supported by backend yet
      });

      const bookingsData = bookingsRes.data || [];
      const paginationData = bookingsRes.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        limit: 10,
      };

      setBookings(bookingsData);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.totalItems || 0);
      setHasNextPage(paginationData.hasNextPage || false);
      setHasPrevPage(paginationData.hasPrevPage || false);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Không thể tải danh sách đặt tour");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    currentPage,
    debouncedSearchTerm,
    statusFilter,
    providerFilter,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {user?.role === "provider"
              ? "Đặt tour của tôi"
              : "Quản lý đặt tour"}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === "provider"
              ? "Theo dõi các đặt tour từ khách hàng của bạn"
              : "Quản lý tất cả đặt tour trong hệ thống"}
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
                placeholder="Tìm kiếm theo tên khách hàng..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            <div className="w-40">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
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

            {/* Chỉ hiển thị filter provider cho admin */}
            {user?.role === "admin" && (
              <div className="w-40">
                <Select
                  value={providerFilter}
                  onValueChange={(value) => {
                    setProviderFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
                    {providers.length > 0 ? (
                      providers.map((provider) => (
                        <SelectItem
                          key={provider.id}
                          value={provider.id.toString()}
                        >
                          {provider.company_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-providers" disabled>
                        Không có nhà cung cấp
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="w-40">
              <Select
                value={tourFilter}
                onValueChange={(value) => {
                  setTourFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tour</SelectItem>
                  {Array.isArray(filteredTours) &&
                    filteredTours.map((tour) => (
                      <SelectItem key={tour.id} value={tour.id.toString()}>
                        {tour.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-40">
              <Input
                type="date"
                placeholder="Từ ngày"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full"
              />
            </div>
            <div className="w-40">
              <Input
                type="date"
                placeholder="Đến ngày"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full"
              />
            </div>
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
                  <TableHead>Nhà cung cấp</TableHead>
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
                      colSpan={9}
                      className="text-center py-8 text-gray-500"
                    >
                      Không có kết quả phù hợp.
                    </TableCell>
                  </TableRow>
                ) : (
                  (Array.isArray(bookings) ? bookings : []).map(
                    (booking, index) => {
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
                            {booking.schedule?.tour?.provider?.company_name ||
                              booking.company_name ||
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
                                  (total, detail) =>
                                    total + detail.adult_quanti,
                                  0
                                ) || 0}{" "}
                                người lớn
                              </span>
                              {booking.booking_details?.reduce(
                                (total, detail) => total + detail.kid_quanti,
                                0
                              ) > 0 && (
                                <span className="text-sm text-gray-500">
                                  +{" "}
                                  {booking.booking_details?.reduce(
                                    (total, detail) =>
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
          {!loading && bookings.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Hiển thị {(currentPage - 1) * 10 + 1} đến{" "}
                {Math.min(currentPage * 10, totalItems)} trong tổng số{" "}
                {totalItems} kết quả
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                <span className="text-sm">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!hasNextPage}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookingsTable;
