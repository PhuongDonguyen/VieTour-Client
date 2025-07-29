import { useEffect, useState } from "react";
import { Loading } from "./Loading";
import { cancellationRequestService } from "@/services/cancellationRequest.service";
import { tourScheduleService } from "@/services/tourSchedule.service";
import { fetchTourById } from "@/services/tour.service";

interface EnrichedCancellationRequest {
  id: number;
  booking_id: number;
  schedule_id?: number;
  request_date: string;
  cancel_reason: string;
  refund_percentage: number;
  refund_amount: number;
  status: string;
  created_at: string;
  updated_at: string | null;
  transaction_image: string | null;
  recipient_name: string;
  bank_name: string;
  account_number: string;
  phone_number: string;
  booking: any;
  tour_title?: string;
  start_date?: string;
}

interface CancellationRequestsListProps {
  adminMode?: boolean;
}

export default function CancellationRequestsList({
  adminMode = false,
}: CancellationRequestsListProps) {
  const [cancellationRequests, setCancellationRequests] = useState<
    EnrichedCancellationRequest[]
  >([]);
  const [loadingCancellation, setLoadingCancellation] = useState<boolean>(true);
  const [imageModal, setImageModal] = useState<{
    open: boolean;
    url: string | null;
  }>({ open: false, url: null });

  useEffect(() => {
    const loadCancellationRequests = async () => {
      try {
        setLoadingCancellation(true);
        const res = adminMode
          ? await cancellationRequestService.getAllCancellationRequests()
          : await cancellationRequestService.getMyCancellationRequests();
        const requests = res.data || [];
        // Enrich with schedule and tour info
        const scheduleCache: Record<number, any> = {};
        const tourCache: Record<number, any> = {};
        const enriched = await Promise.all(
          requests.map(async (req: any) => {
            let tour_title = undefined;
            let start_date = undefined;
            let schedule_id = req.booking?.schedule_id;
            if (schedule_id) {
              let schedule = scheduleCache[schedule_id];
              if (!schedule) {
                const scheduleRes =
                  await tourScheduleService.getTourScheduleById(schedule_id);
                schedule = scheduleRes.data;
                scheduleCache[schedule_id] = schedule;
              }
              start_date = schedule.start_date;
              if (schedule.tour_id) {
                let tour = tourCache[schedule.tour_id];
                if (!tour) {
                  tour = await fetchTourById(schedule.tour_id);
                  tourCache[schedule.tour_id] = tour;
                }
                tour_title = tour.title;
              }
            }
            return {
              ...req,
              schedule_id,
              tour_title,
              start_date,
            };
          })
        );
        setCancellationRequests(enriched);
      } catch (error) {
        console.error("Lỗi khi lấy yêu cầu hủy đặt tour:", error);
      } finally {
        setLoadingCancellation(false);
      }
    };
    loadCancellationRequests();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-24">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 pl-6 relative">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-blue-500 rounded-full"></span>
        Yêu cầu hủy đặt tour
      </h2>
      {loadingCancellation ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <Loading />
        </div>
      ) : cancellationRequests.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          Bạn chưa có yêu cầu hủy đặt tour nào.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {cancellationRequests.map(
            (req: EnrichedCancellationRequest, idx: number) => (
              <div
                key={req.id}
                className={`p-6 flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 last:border-b-0`}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-lg mb-1">
                    {req.tour_title
                      ? req.tour_title
                      : `Booking #${req.booking_id}`}
                  </div>
                  {/* Tên tour dòng riêng */}
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Tên tour:</span>{" "}
                    {req.tour_title || "-"}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Ngày khởi hành: {req.start_date || "-"}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Ngày yêu cầu:{" "}
                    {req.request_date
                      ? new Date(req.request_date).toLocaleString()
                      : "-"}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Lý do: {req.cancel_reason}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    Số tiền hoàn: {req.refund_amount?.toLocaleString()} đ (
                    {req.refund_percentage}%)
                  </div>
                  {req.transaction_image && (
                    <div
                      className="text-sm text-blue-600 underline cursor-pointer mt-2"
                      onClick={() =>
                        setImageModal({
                          open: true,
                          url: req.transaction_image,
                        })
                      }
                    >
                      Xem ảnh giao dịch
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 min-w-[160px]">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      req.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : req.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : req.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : req.status === "refunded"
                        ? "bg-gray-200 text-gray-700"
                        : req.status === "success"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {(() => {
                      switch (req.status) {
                        case "pending":
                          return "Đang xử lý";
                        case "approved":
                          return "Đã duyệt";
                        case "rejected":
                          return "Từ chối";
                        case "refunded":
                          return "Đã hoàn tiền";
                        case "success":
                          return "Hoàn tiền thành công";
                        default:
                          return "Không xác định";
                      }
                    })()}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      )}
      {/* Modal xem ảnh giao dịch */}
      {imageModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm"
          onClick={() => setImageModal({ open: false, url: null })}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
              onClick={() => setImageModal({ open: false, url: null })}
            >
              &times;
            </button>
            <img
              src={imageModal.url || ""}
              alt="Giao dịch"
              className="max-h-[70vh] w-auto mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
