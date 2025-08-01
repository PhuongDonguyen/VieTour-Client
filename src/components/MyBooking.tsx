import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyBookings } from "@/services/booking.service";
import { ReviewForm } from "./ReviewForm";
import { submitReview } from "@/services/review.service";
import { Calendar, User, Phone, DollarSign, Users, Star, MessageSquare, XCircle, ChevronDown, ChevronUp, MapPin, Clock, CheckCircle, AlertCircle, XCircle as XCircleIcon, Loader2 } from "lucide-react";
import { AccountListSkeleton } from "./AccountSkeleton";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export interface Tour {
  id: number;
  title: string;
  poster_url: string;
  provider_id: number;
  capacity: number;
  transportation: string;
  accommodation: string;
  destination_intro: string;
  view_count: string;
  slug: string;
  tour_category_id: number;
  is_active: boolean;
  total_star: number;
  review_count: number;
  live_commentary: string;
  duration: string;
  booked_count: number;
}

export interface Schedule {
  id: number;
  start_date: string;
  participant: number;
  status: string;
  tour_id: number;
  tour: Tour;
}

export interface BookingDetail {
  id: number;
  booking_id: number;
  adult_quanti: number;
  kid_quanti: number;
  adult_price: number;
  kid_price: number;
  note: string;
}

export interface Booking {
  id: number;
  user_id: number;
  schedule_id: number;
  total: number;
  status: string;
  payment_id: string | null;
  txn_ref: string | null;
  create_at: string;
  is_reviewed: boolean;
  client_name: string;
  client_phone: string;
  note: string;
  schedule: Schedule;
  booking_details?: BookingDetail[];
}

export default function MyBooking() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(
    null
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null>(null);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchMyBookings(1, 5);
        setBookings(result.bookings);
        setPagination(result.pagination);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu booking:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load data when status filter changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchMyBookings(1, 5, statusFilter);
        setBookings(result.bookings);
        setFilteredBookings(result.bookings);
        setPagination(result.pagination);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu booking:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [statusFilter]);

  const loadMoreBookings = async () => {
    if (!pagination?.hasNextPage || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = pagination.currentPage + 1;
      const result = await fetchMyBookings(nextPage, 5, statusFilter);
      
      setBookings(prev => [...prev, ...result.bookings]);
      setFilteredBookings(prev => [...prev, ...result.bookings]);
      setPagination(result.pagination);
    } catch (error) {
      console.error("Lỗi khi tải thêm booking:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleReviewClick = (booking: Booking) => {
    console.log("Đánh giá booking:", booking.id);
    setSelectedBooking(booking);
    console.log("Selected booking:", booking);
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (selectedBooking) {
      console.log("Gửi đánh giá cho booking:", selectedBooking.id, {
        rating,
        comment,
      });

      try {
        await submitReview(
          selectedBooking.user_id,
          selectedBooking.schedule.tour.id,
          rating,
          comment
        );
        alert("Đánh giá đã được gửi thành công!");
      } catch (error) {
        console.error("Lỗi khi gửi đánh giá:", error);
      }
      setSelectedBooking(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const normalized = status ? status.trim().toLowerCase() : "";
    console.log("Booking status:", status);
    switch (normalized) {
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", text: "Đang xử lý" };
      case "success":
        return { color: "bg-green-100 text-green-800", text: "Thành công" };
      case "failed":
        return { color: "bg-red-100 text-red-800", text: "Thất bại" };
      case "refund_requested":
        return {
          color: "bg-blue-100 text-blue-800",
          text: "Đã yêu cầu hoàn tiền",
        };
      case "refunded":
        return { color: "bg-gray-200 text-gray-700", text: "Đã hoàn tiền" };
      default:
        return { color: "bg-gray-100 text-gray-800", text: "Không xác định" };
    }
  };

  const canCancelBooking = (booking: Booking): boolean => {
    const today = new Date();
    const tourDate = new Date(booking.schedule.start_date);
    return booking.status === "success" && tourDate > today;
  };

  const handleCancelBooking = (bookingId: number) => {
    navigate(`/cancel-booking/${bookingId}`);
  };

  const getTimelineIcon = (status: string) => {
    const normalized = status ? status.trim().toLowerCase() : "";
    switch (normalized) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case "refund_requested":
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case "refunded":
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderTimelineView = () => {
    const sortedBookings = [...filteredBookings].sort((a, b) => 
      new Date(b.create_at).getTime() - new Date(a.create_at).getTime()
    );

    return (
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-28 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-8">
          {sortedBookings.map((booking, index) => (
            <div key={booking.id} className="relative">
              {/* Date on timeline */}
              <div className="absolute left-0 top-0 text-sm text-gray-500 font-medium w-24">
                {format(new Date(booking.create_at), "dd/MM/yyyy", { locale: vi })}
              </div>
              
              {/* Timeline dot with icon */}
              <div className="absolute left-28 transform -translate-x-1/2 w-8 h-8 bg-white border-2 border-gray-300 rounded-full z-10 flex items-center justify-center">
                {getTimelineIcon(booking.status)}
              </div>
              
              {/* Content */}
              <div className="ml-40 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">
                    {booking.schedule.tour.title}
                  </h3>
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const badge = getStatusBadge(booking.status);
                      return (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
                        >
                          {badge.text}
                        </span>
                      );
                    })()}
                    <button
                      onClick={() =>
                        setExpandedBookingId(
                          expandedBookingId === booking.id ? null : booking.id
                        )
                      }
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      {expandedBookingId === booking.id ? (
                        <>
                          <span>Ẩn chi tiết</span>
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Xem chi tiết</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Timeline Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Ngày khởi hành</div>
                      <span>{format(new Date(booking.schedule.start_date), "dd/MM/yyyy", { locale: vi })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{booking.client_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{booking.total.toLocaleString()} đ</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedBookingId === booking.id && booking.booking_details && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Chi tiết đặt tour</h4>
                    {booking.booking_details.map((detail, idx) => (
                      <div
                        key={detail.id}
                        className={`p-3 bg-white rounded border ${
                          idx < booking.booking_details!.length - 1 ? "mb-3" : ""
                        }`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {detail.adult_quanti > 0 && `${detail.adult_quanti} Người lớn`}
                              {detail.adult_quanti > 0 && detail.kid_quanti > 0 && ", "}
                              {detail.kid_quanti > 0 && `${detail.kid_quanti} Trẻ em`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span>{detail.adult_price.toLocaleString()}đ/Người lớn</span>
                          </div>
                          {detail.kid_price > 0 && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span>{detail.kid_price.toLocaleString()}đ/Trẻ em</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-blue-600 font-semibold">
                            <DollarSign className="w-4 h-4" />
                            <span>
                              {(
                                detail.adult_quanti * detail.adult_price +
                                detail.kid_quanti * detail.kid_price
                              ).toLocaleString()} đ
                            </span>
                          </div>
                        </div>

                        {detail.note && (
                          <div className="mt-3 p-2 bg-amber-50 rounded border-l-4 border-amber-300">
                            <div className="flex items-start gap-2 text-sm text-gray-700">
                              <MessageSquare className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span>{detail.note}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Note */}
                {booking.note && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2 text-sm text-blue-700">
                      <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Ghi chú:</strong> {booking.note}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {!booking.is_reviewed &&
                    new Date() > new Date(booking.schedule.start_date) &&
                    booking.status === "success" && (
                      <button
                        onClick={() => handleReviewClick(booking)}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        <Star className="w-4 h-4" />
                        Đánh giá
                      </button>
                    )}

                  {canCancelBooking(booking) && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Hủy đặt tour
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-4">
        {bookings.map((booking: Booking, index: number) => (
          <div
            key={booking.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 md:mb-0">
                  {booking.schedule.tour.title}
                </h3>
                <div className="flex items-center space-x-3">
                  {(() => {
                    const badge = getStatusBadge(booking.status);
                    return (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
                      >
                        {badge.text}
                      </span>
                    );
                  })()}
                  <button
                    onClick={() =>
                      setExpandedBookingId(
                        expandedBookingId === booking.id ? null : booking.id
                      )
                    }
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {expandedBookingId === booking.id ? (
                      <>
                        <span>Ẩn chi tiết</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Xem chi tiết</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Ngày đặt</div>
                    <span>{format(new Date(booking.create_at), "dd/MM/yyyy", { locale: vi })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Ngày khởi hành</div>
                    <span>{format(new Date(booking.schedule.start_date), "dd/MM/yyyy", { locale: vi })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{booking.client_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{booking.client_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{booking.total.toLocaleString()} đ</span>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedBookingId === booking.id && booking.booking_details && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Chi tiết đặt tour</h4>
                  {booking.booking_details.map((detail, idx) => (
                    <div
                      key={detail.id}
                      className={`p-3 bg-white rounded border ${
                        idx < booking.booking_details!.length - 1 ? "mb-3" : ""
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {detail.adult_quanti > 0 && `${detail.adult_quanti} Người lớn`}
                            {detail.adult_quanti > 0 && detail.kid_quanti > 0 && ", "}
                            {detail.kid_quanti > 0 && `${detail.kid_quanti} Trẻ em`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>{detail.adult_price.toLocaleString()}đ/Người lớn</span>
                        </div>
                        {detail.kid_price > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>{detail.kid_price.toLocaleString()}đ/Trẻ em</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-blue-600 font-semibold">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {(
                              detail.adult_quanti * detail.adult_price +
                              detail.kid_quanti * detail.kid_price
                            ).toLocaleString()} đ
                          </span>
                        </div>
                      </div>

                      {detail.note && (
                        <div className="mt-3 p-2 bg-amber-50 rounded border-l-4 border-amber-300">
                          <div className="flex items-start gap-2 text-sm text-gray-700">
                            <MessageSquare className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{detail.note}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Note */}
              {booking.note && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2 text-sm text-blue-700">
                    <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Ghi chú:</strong> {booking.note}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-3">
                {!booking.is_reviewed &&
                  new Date() > new Date(booking.schedule.start_date) &&
                  booking.status === "success" && (
                    <button
                      onClick={() => handleReviewClick(booking)}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      <Star className="w-4 h-4" />
                      Đánh giá
                    </button>
                  )}

                {canCancelBooking(booking) && (
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Hủy đặt tour
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {selectedBooking && (
        <ReviewForm
          booking={selectedBooking}
          onSubmit={handleReviewSubmit}
          onClose={() => setSelectedBooking(null)}
        />
      )}
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Đặt tour của tôi</h2>
        <p className="text-gray-600 text-sm">Xem lịch sử và quản lý đặt tour</p>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
            Lọc theo trạng thái:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Đang xử lý</option>
            <option value="success">Thành công</option>
            <option value="failed">Thất bại</option>
            <option value="refund_requested">Đã yêu cầu hoàn tiền</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
          {statusFilter !== "all" && !loading && (
            <span className="text-sm text-gray-500">
              Hiển thị {filteredBookings.length} đặt tour
            </span>
          )}
        </div>
      </div>

      {/* Bookings Content */}
      {loading ? (
        <AccountListSkeleton />
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {statusFilter === "all" ? "Chưa có đặt tour" : "Không tìm thấy đặt tour"}
          </h3>
          <p className="text-gray-600">
            {statusFilter === "all" 
              ? "Bạn chưa có lịch sử đặt tour nào" 
              : `Không có đặt tour nào với trạng thái "${getStatusBadge(statusFilter).text}"`
            }
          </p>
        </div>
      ) : (
        <>
          {renderTimelineView()}
          
          {/* Modern Pagination - Load More */}
          {pagination && pagination.hasNextPage && (
            <div className="mt-12 text-center">
              <button
                onClick={loadMoreBookings}
                disabled={loadingMore}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium px-8 py-4 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 transform hover:scale-105 disabled:transform-none"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang tải...</span>
                  </>
                ) : (
                  <>
                    <span>Tải thêm</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        {pagination.currentPage}/{pagination.totalPages}
                      </span>
                    </div>
                  </>
                )}
              </button>
              
              <div className="mt-4 text-sm text-gray-500">
                Hiển thị <span className="font-medium text-gray-700">{filteredBookings.length}</span> trong tổng số <span className="font-medium text-gray-700">{pagination.totalItems}</span> đặt tour
              </div>
            </div>
          )}
          
          {/* End of results */}
          {pagination && !pagination.hasNextPage && filteredBookings.length > 0 && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 text-gray-500">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <span className="text-sm">Đã hiển thị tất cả {pagination.totalItems} đặt tour</span>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
