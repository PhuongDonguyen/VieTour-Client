import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Users } from "lucide-react";
import { AuthContext } from "@/context/authContext";
import {
  fetchTourScheduleById,
  createTourScheduleService,
  updateTourScheduleService,
} from "@/services/tourSchedule.service";
import { fetchTours, fetchTourById } from "@/services/tour.service";
import type { TourSchedule } from "@/apis/tourSchedule.api";

const TourScheduleEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isEdit = !!id;

  // Get tour_id from URL query parameter
  const tourIdFromUrl = searchParams.get("tour_id");
  const tourId = tourIdFromUrl ? parseInt(tourIdFromUrl) : null;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableTours, setAvailableTours] = useState<
    { id: number; title: string }[]
  >([]);
  const [tourInfo, setTourInfo] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    tour_id: "",
    start_date: "",
    status: "available",
  });
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  useEffect(() => {
    // Load available tours only if not creating new schedule with specific tour
    if (!isEdit && tourId) {
      // If creating new schedule with specific tour, load only that tour
      const loadSpecificTour = async () => {
        try {
          const tourData = await fetchTourById(tourId);
          setTourInfo({
            id: tourData.id,
            title: tourData.title,
          });
          setAvailableTours([
            {
              id: tourData.id,
              title: tourData.title,
            },
          ]);
          // Auto-select the tour
          setFormData((prev) => ({
            ...prev,
            tour_id: tourId.toString(),
          }));
        } catch (error) {
          console.error("Error loading specific tour:", error);
          setAvailableTours([]);
        }
      };
      loadSpecificTour();
    } else {
      // Load all available tours for editing or general creation
      const loadTours = async () => {
        try {
          const response = await fetchTours({
            limit: 100, // Get all tours
          });

          if (response.data && Array.isArray(response.data)) {
            const tours = response.data.map((tour: any) => ({
              id: tour.id,
              title: tour.title,
            }));
            setAvailableTours(tours);
          }
        } catch (error) {
          console.error("Error loading tours:", error);
          // Fallback to empty array
          setAvailableTours([]);
        }
      };
      loadTours();
    }

    // If editing, load existing data
    if (isEdit && id) {
      const loadSchedule = async () => {
        try {
          setLoading(true);
          const schedule = await fetchTourScheduleById(parseInt(id));

          setFormData({
            tour_id: schedule.tour_id.toString(),
            start_date: schedule.start_date.split("T")[0], // Already in YYYY-MM-DD format from API
            status: schedule.status,
          });

          // Load tour info for the schedule's tour
          try {
            const tourData = await fetchTourById(schedule.tour_id);
            setTourInfo({
              id: tourData.id,
              title: tourData.title,
            });
          } catch (error) {
            console.error("Error loading tour info:", error);
          }
        } catch (error) {
          console.error("Error loading schedule:", error);
        } finally {
          setLoading(false);
        }
      };

      loadSchedule();
    }
  }, [id, isEdit]);

  const handleSave = async () => {
    if (!formData.tour_id) {
      alert("Vui lòng chọn tour.");
      return;
    }

    if (isEdit && !formData.start_date) {
      alert("Vui lòng chọn ngày khởi hành.");
      return;
    }

    if (!isEdit && selectedDates.length === 0) {
      alert("Vui lòng chọn ít nhất một ngày khởi hành.");
      return;
    }

    try {
      setSaving(true);

      if (isEdit) {
        // Edit existing schedule
        let scheduleData: any = {
          start_date: formData.start_date,
          status: formData.status as "available" | "full" | "cancelled",
        };

        await updateTourScheduleService(parseInt(id), scheduleData);
        alert("Cập nhật lịch trình thành công!");
      } else {
        // Create new schedules for multiple dates
        const tourId = parseInt(formData.tour_id);
        let successCount = 0;
        let errorCount = 0;

        for (const date of selectedDates) {
          try {
            const scheduleData = {
              tour_id: tourId,
              start_date: date.toLocaleDateString("sv-SE"), // Returns YYYY-MM-DD in local timezone
              participant: 0, // Default participant count
            };

            await createTourScheduleService(scheduleData);
            successCount++;
          } catch (error) {
            console.error(
              `Error creating schedule for ${date.toLocaleDateString(
                "sv-SE"
              )}:`,
              error
            );
            errorCount++;
          }
        }

        if (errorCount === 0) {
          alert(`Tạo thành công ${successCount} lịch trình!`);
        } else {
          alert(
            `Tạo thành công ${successCount} lịch trình, ${errorCount} lỗi.`
          );
        }
      }

      navigate(
        tourIdFromUrl
          ? `/admin/tours/schedules?tour_id=${tourIdFromUrl}`
          : "/admin/tours/schedules"
      );
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Có lỗi xảy ra khi lưu lịch trình. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={
              tourIdFromUrl
                ? () =>
                    navigate(`/admin/tours/schedules?tour_id=${tourIdFromUrl}`)
                : () => navigate("/admin/tours/schedules")
            }
            className="flex items-center gap-2 bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Chỉnh Sửa Lịch Trình" : "Thêm Lịch Trình Mới"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit
                ? "Cập nhật thông tin lịch trình tour"
                : "Tạo lịch trình mới cho tour"}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Đang lưu..." : isEdit ? "Cập Nhật" : "Tạo Mới"}
        </Button>
      </div>

      {/* Form */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Thông Tin Lịch Trình
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tour *
                  </label>
                  {!isEdit && tourId ? (
                    <div className="p-3 border rounded-md bg-muted/50">
                      <p className="font-medium text-foreground">
                        {tourInfo ? tourInfo.title : `Tour ID: ${tourId}`}
                      </p>
                    </div>
                  ) : (
                    <Select
                      value={formData.tour_id}
                      onValueChange={(value) =>
                        handleInputChange("tour_id", value)
                      }
                      disabled={isEdit}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tour..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTours.map((tour) => (
                          <SelectItem key={tour.id} value={tour.id.toString()}>
                            {tour.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {isEdit && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Không được phép chỉnh sửa
                    </p>
                  )}
                </div>

                {isEdit ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ngày Khởi Hành *
                    </label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        handleInputChange("start_date", e.target.value)
                      }
                      className="w-full"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Chọn Ngày Khởi Hành *
                    </label>
                    <div className="space-y-4">
                      <div className="border rounded-md p-4">
                        <Calendar
                          mode="multiple"
                          selected={selectedDates}
                          onSelect={(dates) => setSelectedDates(dates || [])}
                          className="rounded-md border-0"
                          disabled={(date) => {
                            const oneWeekFromNow = new Date();
                            oneWeekFromNow.setDate(
                              oneWeekFromNow.getDate() + 7
                            );
                            return date < oneWeekFromNow;
                          }}
                        />
                      </div>

                      {selectedDates.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-2">
                            Đã chọn {selectedDates.length} ngày:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedDates.map((date, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                {date.toLocaleDateString("vi-VN")}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedDates(
                                      selectedDates.filter(
                                        (_, i) => i !== index
                                      )
                                    )
                                  }
                                  className="ml-1 text-xs hover:text-red-500"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {isEdit && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Trạng Thái
                    </label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Còn chỗ</SelectItem>
                        <SelectItem value="full">Hết chỗ</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Form Info */}
            <Card>
              <CardHeader>
                <CardTitle>Form Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Các trường có dấu * là bắt buộc</p>
                <p>• Ngày khởi hành phải là ngày trong tương lai</p>
                <p>• Số người tham gia phải lớn hơn 0</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourScheduleEditor;
