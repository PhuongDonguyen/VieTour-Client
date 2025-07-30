import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Users, Edit, Eye } from "lucide-react";
import { AuthContext } from "@/context/authContext";
import { providerTourScheduleService } from "../../../services/provider/providerTourSchedule.service";
import { adminTourScheduleService } from "../../../services/admin/adminTourSchedule.service";
import { providerTourApi } from "../../../apis/provider/providerTour.api";
import type { TourSchedule } from "../../../apis/provider/providerTourSchedule.api";
import type { AdminTourSchedule } from "../../../apis/admin/adminTourSchedule.api";
import { adminTourService } from "@/services/admin/adminTour.service";

interface TourScheduleViewContentProps {
  scheduleId: string;
  onBack?: () => void;
}

const TourScheduleViewContent: React.FC<TourScheduleViewContentProps> = ({
  scheduleId,
  onBack,
}) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const [schedule, setSchedule] = useState<
    TourSchedule | AdminTourSchedule | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [tourInfo, setTourInfo] = useState<{
    title: string;
    poster_url: string;
    category_name: string;
  } | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      if (!scheduleId) return;
      setLoading(true);
      try {
        let scheduleData;
        if (user?.role === "admin") {
          scheduleData = await adminTourScheduleService.getTourSchedule(
            parseInt(scheduleId)
          );
        } else if (user?.role === "provider") {
          scheduleData = await providerTourScheduleService.getTourSchedule(
            parseInt(scheduleId)
          );
        } else {
          setSchedule(null);
          setTourInfo(null);
          setLoading(false);
          return;
        }
        setSchedule(scheduleData);
        // Fetch tour info nếu cần
        const tourId =
          (scheduleData as any).tour_id ||
          (scheduleData.tour && scheduleData.tour.id);
        if (tourId) {
          try {
            if (user?.role === "admin") {
              const tourRes = await adminTourService.getTour(tourId);
              setTourInfo({
                title: tourRes.title,
                poster_url: tourRes.poster_url,
                category_name: tourRes.tour_category?.name || "Chưa phân loại",
              });
            } else if (user?.role === "provider") {
              const response = await providerTourApi.getTourById(tourId);
              const tourData = response.data.data;
              setTourInfo({
                title: tourData.title,
                poster_url: tourData.poster_url,
                category_name: tourData.tour_category?.name || "Chưa phân loại",
              });
            } else {
              setTourInfo(null);
            }
          } catch {
            setTourInfo(null);
          }
        }
      } catch {
        setSchedule(null);
      } finally {
        setLoading(false);
      }
    };
    loadSchedule();
  }, [scheduleId, user?.role]);

  // Ẩn/disable các nút thao tác nếu là admin
  const isEditable = !isAdmin;
  const isViewable = !isAdmin;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Đang tải...
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Vui lòng chờ trong khi chúng tôi tải thông tin lịch trình tour.
            </p>
          </div>
        </div>
      </div>
    );
  if (!schedule)
    return <div className="text-red-500">Không tìm thấy lịch trình</div>;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Còn chỗ";
      case "full":
        return "Hết chỗ";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          onClick={onBack ? onBack : () => navigate("/admin/tours/schedules")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </Button>
        <h1 className="text-3xl font-bold ml-4">
          {tourInfo?.title ||
            (schedule as TourSchedule).tour_id ||
            "Lịch Trình"}
        </h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Thông Tin Lịch Trình
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4 items-center">
              <img
                src={tourInfo?.poster_url || "/public/VieTour-Logo.png"}
                alt={tourInfo?.title || "Tour"}
                className="w-24 h-16 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  {tourInfo?.title ||
                    `Tour ID: ${(schedule as TourSchedule).tour_id}`}
                </h3>
                <Badge variant="secondary" className="mb-2">
                  {tourInfo?.category_name || "Chưa phân loại"}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  ID: {schedule.id}
                </div>
                <div className="text-sm text-muted-foreground">
                  Ngày khởi hành: {formatDate(schedule.start_date)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Số người tham gia: {schedule.participant} người
                </div>
                <div className="text-sm text-muted-foreground">
                  Trạng thái: {getStatusText(schedule.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isEditable && (
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() =>
                    navigate(`/admin/tours/schedules/edit/${schedule.id}`)
                  }
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa chi tiết
                </Button>
              )}
              {schedule &&
                ((schedule as any).tour_id ||
                  (schedule.tour && schedule.tour.id)) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const tid =
                        (schedule as any).tour_id ||
                        (schedule.tour && schedule.tour.id);
                      navigate(`/admin/tours/view/${tid}`);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Xem Tour
                  </Button>
                )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Lịch Trình</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  ID Lịch Trình
                </label>
                <p className="font-mono text-sm">{schedule.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  ID Tour
                </label>
                <p className="font-mono text-sm">
                  {tourInfo?.title ? (schedule as any).tour_id : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TourScheduleViewContent;
