import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Users, Edit, Eye } from "lucide-react";
import { AuthContext } from "@/context/authContext";
import { fetchTourScheduleById } from "@/services/tourSchedule.service";
import { fetchTourById } from "@/services/tour.service";
import type { TourSchedule } from "@/apis/tourSchedule.api";

interface TourScheduleViewContentProps {
  scheduleId: string;
  onBack?: () => void;
}

const TourScheduleViewContent: React.FC<TourScheduleViewContentProps> = ({
  scheduleId,
  onBack,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const [schedule, setSchedule] = useState<TourSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  // Get tour_id from URL query parameter for back navigation
  const tourIdFromUrl = searchParams.get("tour_id");

  const [tourInfo, setTourInfo] = useState<{
    title: string;
  } | null>(null);

  useEffect(() => {
    const loadSchedule = async () => {
      if (!scheduleId) return;
      setLoading(true);
      try {
        const scheduleData = await fetchTourScheduleById(parseInt(scheduleId));
        setSchedule(scheduleData);

        // Fetch tour info (only title)
        const tourId = scheduleData.tour_id;
        if (tourId) {
          try {
            const tourRes = await fetchTourById(tourId);
            setTourInfo({
              title: tourRes.title,
            });
          } catch {
            setTourInfo(null);
          }
        }
      } catch (error) {
        setSchedule(null);
      } finally {
        setLoading(false);
      }
    };
    loadSchedule();
  }, [scheduleId]);

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
          onClick={
            onBack
              ? onBack
              : tourIdFromUrl
              ? () =>
                  navigate(`/admin/tours/schedules?tour_id=${tourIdFromUrl}`)
              : () => navigate("/admin/tours/schedules")
          }
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </Button>
        <h1 className="text-3xl font-bold ml-4">
          {tourInfo?.title || `Tour ID: ${schedule.tour_id}` || "Lịch Trình"}
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
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  {tourInfo?.title || `Tour ID: ${schedule.tour_id}`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">ID Lịch Trình:</span>{" "}
                      {schedule.id}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">ID Tour:</span>{" "}
                      {schedule.tour_id}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Ngày khởi hành:</span>{" "}
                      {formatDate(schedule.start_date)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Số người tham gia:</span>{" "}
                      {schedule.participant} người
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Trạng thái:</span>{" "}
                      {getStatusText(schedule.status)}
                    </div>
                  </div>
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
                    navigate(
                      `/admin/tours/schedules/edit/${schedule.id}?tour_id=${
                        tourIdFromUrl || schedule.tour_id
                      }`
                    )
                  }
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa chi tiết
                </Button>
              )}
              {schedule.tour_id && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigate(`/admin/tours/view/${schedule.tour_id}`);
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
                <p className="font-mono text-sm">{schedule.tour_id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TourScheduleViewContent;
