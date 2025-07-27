import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Users } from "lucide-react";
import { AuthContext } from "@/context/authContext";
import { providerTourScheduleService } from "../../services/provider/providerTourSchedule.service";
import { adminTourScheduleService } from "../../services/admin/adminTourSchedule.service";
import { providerTourApi } from "../../apis/provider/providerTour.api";
import { fetchUserProfile } from "../../services/userProfile.service";
import type { TourSchedule } from "../../apis/provider/providerTourSchedule.api";
import type { AdminTourSchedule } from "../../apis/admin/adminTourSchedule.api";

const TourScheduleView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [loadingTour, setLoadingTour] = useState(false);
  const [providerInfo, setProviderInfo] = useState<{
    business_name: string;
    first_name: string;
    last_name: string;
  } | null>(null);

  const providerName =
    user?.business_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    "Provider";

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "available":
        return "default";
      case "full":
        return "destructive";
      case "cancelled":
        return "secondary";
      default:
        return "outline";
    }
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

  useEffect(() => {
    const loadSchedule = async () => {
      if (!id) return;

      try {
        setLoading(true);
        let scheduleData;

        if (isAdmin) {
          scheduleData = await adminTourScheduleService.getTourSchedule(
            parseInt(id)
          );
        } else {
          scheduleData = await providerTourScheduleService.getTourSchedule(
            parseInt(id)
          );
        }

        setSchedule(scheduleData);

        // If schedule doesn't have tour data, fetch it separately
        if (!("tour" in scheduleData) || !scheduleData.tour) {
          const tourId = (scheduleData as TourSchedule).tour_id;
          try {
            setLoadingTour(true);
            const response = await providerTourApi.getTourById(tourId);
            const tourData = response.data.data;
            setTourInfo({
              title: tourData.title,
              poster_url: tourData.poster_url,
              category_name: tourData.tour_category?.name || "Chưa phân loại",
            });
          } catch (error) {
            console.error("Error fetching tour info:", error);
            setTourInfo({
              title: `Tour ID: ${tourId}`,
              poster_url: "/public/VieTour-Logo.png",
              category_name: "Chưa phân loại",
            });
          } finally {
            setLoadingTour(false);
          }
        }

        // Fetch provider info if not admin
        if (!isAdmin) {
          try {
            const response = await fetchUserProfile();
            if (response.success && response.data) {
              setProviderInfo({
                business_name:
                  response.data.business_name ||
                  `${response.data.first_name} ${response.data.last_name}`,
                first_name: response.data.first_name,
                last_name: response.data.last_name,
              });
            }
          } catch (error) {
            console.error("Error fetching provider info:", error);
          }
        }
      } catch (error) {
        console.error("Error loading schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [id, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Đang tải thông tin lịch trình...
          </p>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Không tìm thấy lịch trình
          </h2>
          <p className="text-muted-foreground mb-4">
            Lịch trình bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button onClick={() => navigate("/admin/tours/schedules")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/tours/schedules")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Lịch Trình:{" "}
              {loadingTour
                ? "Đang tải..."
                : "tour" in schedule && schedule.tour
                ? schedule.tour.title
                : tourInfo?.title ||
                  `Tour ID: ${(schedule as TourSchedule).tour_id}`}
            </h1>
            <p className="text-muted-foreground">
              Tour Schedule • {formatDate(schedule.start_date)}
            </p>
          </div>
        </div>
        {!isAdmin && (
          <Button
            onClick={() =>
              navigate(`/admin/tours/schedules/edit/${schedule.id}`)
            }
          >
            Chỉnh Sửa
          </Button>
        )}
      </div>

      {/* Schedule Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tour Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Thông Tin Lịch Trình
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                {loadingTour ? (
                  <div className="flex gap-4">
                    <div className="w-24 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={
                        "tour" in schedule && schedule.tour
                          ? schedule.tour.poster_url
                          : tourInfo?.poster_url || "/public/VieTour-Logo.png"
                      }
                      alt={
                        "tour" in schedule && schedule.tour
                          ? schedule.tour.title
                          : tourInfo?.title ||
                            `Tour ID: ${(schedule as TourSchedule).tour_id}`
                      }
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">
                        {"tour" in schedule && schedule.tour
                          ? schedule.tour.title
                          : tourInfo?.title ||
                            `Tour ID: ${(schedule as TourSchedule).tour_id}`}
                      </h3>
                      <Badge variant="secondary" className="mb-2">
                        {"tour" in schedule && schedule.tour
                          ? schedule.tour.tour_category.name
                          : tourInfo?.category_name || "Chưa phân loại"}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        ID: {schedule.id}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Ngày Khởi Hành
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(schedule.start_date)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Số Người Tham Gia
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {schedule.participant} người
                  </p>
                </div>
              </div>

              <div>
                <p className="font-medium text-sm text-muted-foreground">
                  Trạng Thái
                </p>
                <Badge variant={getStatusVariant(schedule.status)}>
                  {getStatusText(schedule.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={() =>
                  navigate(
                    `/admin/tours/view/${
                      "tour" in schedule && schedule.tour
                        ? schedule.tour.id
                        : (schedule as TourSchedule).tour_id
                    }`
                  )
                }
                className="w-full"
                disabled={loadingTour}
              >
                {loadingTour ? "Đang tải..." : "Xem Tour"}
              </Button>
              {!isAdmin && (
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(`/admin/tours/schedules/edit/${schedule.id}`)
                  }
                  className="w-full"
                >
                  Chỉnh Sửa Lịch Trình
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Schedule Details */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Schedule ID
                </label>
                <p className="font-mono text-sm">{schedule.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tour ID
                </label>
                <p className="font-mono text-sm">
                  {loadingTour
                    ? "Đang tải..."
                    : "tour" in schedule && schedule.tour
                    ? schedule.tour.id
                    : (schedule as TourSchedule).tour_id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TourScheduleView;
