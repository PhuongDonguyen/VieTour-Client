import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Calendar, Users } from "lucide-react";
import { AuthContext } from "@/context/authContext";
import { providerTourScheduleService } from "../../../services/provider/providerTourSchedule.service";
import { providerTourService } from "../../../services/provider/providerTour.service";
import type { TourSchedule } from "../../../apis/provider/providerTourSchedule.api";

const TourScheduleEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableTours, setAvailableTours] = useState<
    { id: number; title: string }[]
  >([]);

  const [formData, setFormData] = useState({
    tour_id: "",
    start_date: "",
    participant: "",
    status: "available",
  });

  useEffect(() => {
    // Load available tours
    const loadTours = async () => {
      try {
        const response = await providerTourService.getTours({
          limit: 100, // Get all tours
          status: "active", // Only active tours
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

    // If editing, load existing data
    if (isEdit && id) {
      const loadSchedule = async () => {
        try {
          setLoading(true);
          const schedule = await providerTourScheduleService.getTourSchedule(
            parseInt(id)
          );

          setFormData({
            tour_id: schedule.tour_id.toString(),
            start_date: schedule.start_date.split("T")[0], // Convert to date input format
            participant: schedule.participant.toString(),
            status: schedule.status,
          });
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
    if (!formData.tour_id || !formData.start_date || !formData.participant) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    // Only validate participant for new schedules, not when editing
    if (!isEdit && parseInt(formData.participant) <= 0) {
      alert("Số người tham gia phải lớn hơn 0.");
      return;
    }

    try {
      setSaving(true);

      let scheduleData: any = {
        start_date: formData.start_date,
      };

      if (isEdit) {
        scheduleData.status = formData.status as
          | "available"
          | "full"
          | "cancelled";
      } else {
        // Only for new schedule, include tour_id and participant
        scheduleData.tour_id = parseInt(formData.tour_id);
        scheduleData.participant = parseInt(formData.participant);
      }

      if (isEdit && id) {
        await providerTourScheduleService.updateTourSchedule(
          parseInt(id),
          scheduleData
        );
        alert("Cập nhật lịch trình thành công!");
      } else {
        await providerTourScheduleService.createTourSchedule(scheduleData);
        alert("Tạo lịch trình thành công!");
      }

      navigate("/admin/tours/schedules");
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
            variant="ghost"
            onClick={() => navigate("/admin/tours/schedules")}
            className="flex items-center gap-2"
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
                  <Calendar className="w-5 h-5" />
                  Thông Tin Lịch Trình
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Chọn Tour *
                  </label>
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
                  {isEdit && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Không được phép chỉnh sửa
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Số Người Tham Gia *
                    </label>
                    <Input
                      type="number"
                      value={formData.participant}
                      onChange={(e) =>
                        handleInputChange("participant", e.target.value)
                      }
                      className="w-full"
                      placeholder="Nhập số người tham gia"
                      min="1"
                      required
                      disabled={isEdit}
                    />
                    {isEdit && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Không được phép chỉnh sửa
                      </p>
                    )}
                  </div>
                </div>
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
