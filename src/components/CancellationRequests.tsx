import { useEffect, useState } from "react";
import { Loading } from "./Loading";
import { cancellationRequestService } from "@/services/cancellationRequest.service";
import { tourScheduleService } from "@/services/tourSchedule.service";
import { fetchTourById } from "@/services/tour.service";
import { Calendar, DollarSign, FileText, Eye, X } from "lucide-react";
import { AccountListSkeleton } from "./AccountSkeleton";

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", text: "Đang xử lý" };
      case "approved":
        return { color: "bg-green-100 text-green-800", text: "Đã duyệt" };
      case "rejected":
        return { color: "bg-red-100 text-red-800", text: "Từ chối" };
      case "refunded":
        return { color: "bg-gray-200 text-gray-700", text: "Đã hoàn tiền" };
      case "success":
        return { color: "bg-green-100 text-green-800", text: "Hoàn tiền thành công" };
      default:
        return { color: "bg-gray-100 text-gray-800", text: "Không xác định" };
    }
  };

  if (loadingCancellation) {
    return <AccountListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Yêu cầu hủy tour</h2>
        <p className="text-gray-600 text-sm">Theo dõi trạng thái yêu cầu hủy tour</p>
      </div>

      {/* Cancellation Requests List */}
      {cancellationRequests.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có yêu cầu hủy tour</h3>
          <p className="text-gray-600">Bạn chưa có yêu cầu hủy đặt tour nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cancellationRequests.map((req: EnrichedCancellationRequest) => (
            <div
              key={req.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {req.tour_title || `Booking #${req.booking_id}`}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Ngày khởi hành: {req.start_date || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Ngày yêu cầu: {req.request_date ? new Date(req.request_date).toLocaleString() : "-"}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>Lý do: {req.cancel_reason}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>Số tiền hoàn: {req.refund_amount?.toLocaleString()} đ ({req.refund_percentage}%)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 min-w-[160px] mt-4 md:mt-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(req.status).color}`}
                    >
                      {getStatusBadge(req.status).text}
                    </span>
                    {req.transaction_image && (
                      <button
                        onClick={() =>
                          setImageModal({
                            open: true,
                            url: req.transaction_image,
                          })
                        }
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                        Xem ảnh giao dịch
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {imageModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setImageModal({ open: false, url: null })}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-4 max-w-2xl w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setImageModal({ open: false, url: null })}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mt-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Ảnh giao dịch</h3>
              <img
                src={imageModal.url || ""}
                alt="Giao dịch"
                className="max-h-[70vh] w-auto mx-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
