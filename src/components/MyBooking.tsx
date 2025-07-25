import { useEffect, useState } from "react";
import { fetchMyBookings } from "@/services/booking.service";
import { Loading } from "./Loading";
import { ReviewForm } from "./ReviewForm";
import { submitReview } from "@/services/review.service";

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
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(
    null
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await fetchMyBookings();
        setBookings(result.bookings); // API phải trả về mảng bookings có kèm booking_details
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu booking:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleReviewClick = (booking: Booking) => {
    console.log("Đánh giá booking:", booking.id);
    setSelectedBooking(booking);
    console.log("Selected booking:", booking);
  };

  const handleReviewSubmit = async(rating: number, comment: string) => {
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
      // TODO: gọi API gửi đánh giá
      setSelectedBooking(null); // đóng form
    }
  };

  return (
    <div className="">
      {loading ? (
        <div className="mt-30">
          <Loading />
        </div>
      ) : (
        <div>
          <div
            className="mt-25 max-w-6xl mx-auto opacity-0 animate-pulse"
            style={{ animation: "fadeInUp 0.6s ease forwards 0.6s" }}
          >
            <h2 className="text-3xl font-semibold text-gray-800 mb-8 pl-6 relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
              Lịch sử đặt tour
            </h2>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {bookings.map((booking: Booking, index: number) => (
                <div
                  key={booking.id}
                  className={`p-8 hover:bg-gray-50 transition-all duration-200 hover:translate-x-2 relative group ${
                    index < bookings.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 md:mb-0">
                      {booking.schedule.tour.title}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wide
                    ${
                      booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : booking.status === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                      >
                        {booking.status}
                      </span>
                      <button
                        onClick={() =>
                          setExpandedBookingId(
                            expandedBookingId === booking.id ? null : booking.id
                          )
                        }
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {expandedBookingId === booking.id
                          ? "Ẩn chi tiết"
                          : "Xem chi tiết"}
                        <span
                          className={`ml-1 inline-block transform transition-transform duration-300 ${
                            expandedBookingId === booking.id ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📅</span>
                      <span>{booking.schedule.start_date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">👤</span>
                      <span>{booking.client_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📞</span>
                      <span>{booking.client_phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">💰</span>
                      <span>{booking.total.toLocaleString()} đ</span>
                    </div>
                  </div>

                  {/* Chi tiết booking_details */}
                  {expandedBookingId === booking.id &&
                    booking.booking_details && (
                      <div className="mt-4 animate-fadeIn text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {booking.booking_details.map((detail, idx) => (
                          <div
                            key={detail.id}
                            className={`p-3 ${
                              idx < booking.booking_details!.length - 1
                                ? "border-b border-gray-100"
                                : ""
                            }`}
                          >
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <span>👥</span>
                                <span className="font-medium">
                                  {detail.adult_quanti > 0 &&
                                    `${detail.adult_quanti} Người lớn`}
                                  {detail.adult_quanti > 0 &&
                                    detail.kid_quanti > 0 &&
                                    ", "}
                                  {detail.kid_quanti > 0 &&
                                    `${detail.kid_quanti} Trẻ em`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>💰</span>
                                <span>
                                  {detail.adult_price.toLocaleString()}đ/Người
                                  lớn
                                </span>
                              </div>
                              {detail.kid_price > 0 && (
                                <div className="flex items-center gap-2">
                                  <span>🧒</span>
                                  <span>
                                    {detail.kid_price.toLocaleString()}đ/Trẻ em
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-purple-600 font-semibold">
                                <span>Tổng tiền</span>
                                <span>
                                  {(
                                    detail.adult_quanti * detail.adult_price +
                                    detail.kid_quanti * detail.kid_price
                                  ).toLocaleString()}
                                  đ
                                </span>
                              </div>
                            </div>

                            {detail.note && (
                              <div className="mt-2 text-sm text-gray-600 bg-amber-50 p-2 rounded border-l-3 border-amber-300">
                                📝 {detail.note}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  <div className="bg-gray-50 p-3 text-sm">
                    {/* <div className="flex flex-wrap gap-4">
                  <span>👤 {booking.client_name}</span>
                  <span>📱 {booking.client_phone}</span>
                </div> */}
                    {booking.note && (
                      <div className="mt-2 text-gray-600">
                        <span>Ghi chú: </span> 💬 {booking.note}
                      </div>
                    )}
                  </div>

                  {!booking.is_reviewed && new Date() > new Date(booking.schedule.start_date) && booking.status === "success" && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleReviewClick(booking)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 cursor-pointer rounded-lg shadow-md uppercase tracking-wide text-sm"
                      >
                        Đánh giá
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selectedBooking && (
              <ReviewForm
                booking={selectedBooking}
                onSubmit={handleReviewSubmit}
                onClose={() => setSelectedBooking(null)}
              />
            )}
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .fadeInUp {
        animation: fadeInUp 0.5s ease-out;
      }

      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
    `,
            }}
          />
        </div>
      )}
    </div>
  );
}
