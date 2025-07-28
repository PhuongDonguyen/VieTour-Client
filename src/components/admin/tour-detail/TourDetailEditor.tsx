import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Calendar, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TinyMCEEditor from "@/components/TinyMCEEditor";
import { AuthContext } from "@/context/authContext";
import { providerTourDetailService } from "@/services/provider/providerTourDetail.service";
import { providerTourService } from "@/services/provider/providerTour.service";
import type { TourDetail } from "@/apis/provider/providerTourDetail.api";
import type { ProviderTour } from "@/apis/provider/providerTour.api";

interface TourDetailFormData {
  tour_id: string;
  title: string;
  order: string;
  morning_description: string;
  noon_description: string;
  afternoon_description: string;
}

const TourDetailEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const [formData, setFormData] = useState<TourDetailFormData>({
    tour_id: "",
    title: "",
    order: "",
    morning_description: "",
    noon_description: "",
    afternoon_description: "",
  });

  const [availableTours, setAvailableTours] = useState<ProviderTour[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingTour, setIsLoadingTour] = useState(false);
  const [currentTourDetail, setCurrentTourDetail] = useState<TourDetail | null>(
    null
  );
  const [selectedTour, setSelectedTour] = useState<ProviderTour | null>(null);

  const isEditing = !!id;

  // Load available tours
  useEffect(() => {
    const loadAvailableTours = async () => {
      try {
        const response = await providerTourService.getTours({
          page: 1,
          limit: 100,
        });

        let toursData: ProviderTour[] = [];
        if (response && typeof response === "object") {
          if (response.data && Array.isArray(response.data)) {
            toursData = response.data;
          } else if (Array.isArray(response)) {
            toursData = response;
          } else if (
            "success" in response &&
            "data" in response &&
            Array.isArray(response.data)
          ) {
            toursData = response.data;
          }
        }

        // Sort tours by title
        const sortedTours = toursData.sort((a, b) =>
          a.title.localeCompare(b.title, "vi", { sensitivity: "base" })
        );

        setAvailableTours(sortedTours);
      } catch (error) {
        console.error("Error loading available tours:", error);
      }
    };

    loadAvailableTours();
  }, []);

  // Load tour detail data for editing
  useEffect(() => {
    if (isEditing && id) {
      const loadTourDetailData = async () => {
        try {
          setIsLoadingTour(true);
          const response = await providerTourDetailService.getTourDetail(
            parseInt(id)
          );
          console.log("TourDetailEditor - Raw response:", response);

          // Handle different response structures
          let tourDetail;
          if (response && typeof response === "object") {
            if (
              "data" in response &&
              "success" in response &&
              response.success
            ) {
              tourDetail = (response as any).data;
            } else if ("data" in response) {
              tourDetail = (response as any).data;
            } else {
              tourDetail = response;
            }
          } else {
            tourDetail = response;
          }

          console.log(
            "TourDetailEditor - Processed tour detail data:",
            tourDetail
          );

          if (!tourDetail) {
            console.error("No tour detail data found");
            return;
          }

          setCurrentTourDetail(tourDetail);

          setFormData({
            tour_id: tourDetail.tour_id?.toString() || "",
            title: tourDetail.title || "",
            order: tourDetail.order?.toString() || "",
            morning_description: tourDetail.morning_description || "",
            noon_description: tourDetail.noon_description || "",
            afternoon_description: tourDetail.afternoon_description || "",
          });

          // Set selected tour
          const tour = availableTours.find((t) => t.id === tourDetail.tour_id);
          if (tour) {
            setSelectedTour(tour);
          }
        } catch (error) {
          console.error("Error loading tour detail data:", error);
        } finally {
          setIsLoadingTour(false);
        }
      };
      loadTourDetailData();
    }
  }, [isEditing, id, availableTours]);

  // Handle input changes
  const handleInputChange = (
    field: keyof TourDetailFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle tour selection
  const handleTourChange = (tourId: string) => {
    setFormData((prev) => ({
      ...prev,
      tour_id: tourId,
    }));

    const tour = availableTours.find((t) => t.id.toString() === tourId);
    setSelectedTour(tour || null);
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.tour_id || !formData.title || !formData.order) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);

      const tourDetailData = {
        tour_id: parseInt(formData.tour_id),
        title: formData.title,
        order: parseInt(formData.order),
        morning_description: formData.morning_description,
        noon_description: formData.noon_description,
        afternoon_description: formData.afternoon_description,
      };

      if (isEditing && id) {
        await providerTourDetailService.updateTourDetail(
          parseInt(id),
          tourDetailData
        );
        alert("Cập nhật chi tiết tour thành công!");
      } else {
        await providerTourDetailService.createTourDetail(tourDetailData);
        alert("Tạo chi tiết tour thành công!");
      }

      navigate("/admin/tours/details");
    } catch (error) {
      console.error("Error saving tour detail:", error);
      alert("Có lỗi xảy ra khi lưu chi tiết tour. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingTour) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Đang tải thông tin chi tiết tour...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/tours/details")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Chỉnh Sửa Chi Tiết Tour" : "Tạo Chi Tiết Tour Mới"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? "Cập nhật thông tin lịch trình tour"
                : "Thêm lịch trình chi tiết cho tour"}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Thông Tin Cơ Bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tour_id">Chọn Tour *</Label>
                  <Select
                    value={formData.tour_id}
                    onValueChange={handleTourChange}
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
                </div>
                <div>
                  <Label htmlFor="order">Thứ Tự Ngày *</Label>
                  <Input
                    id="order"
                    type="number"
                    placeholder="1"
                    min="1"
                    value={formData.order}
                    onChange={(e) => handleInputChange("order", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="title">Tiêu Đề Chi Tiết *</Label>
                <Input
                  id="title"
                  placeholder="Nhập tiêu đề chi tiết..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected Tour Info */}
          {selectedTour && (
            <Card>
              <CardHeader>
                <CardTitle>Tour Được Chọn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <img
                    src={selectedTour.poster_url}
                    alt={selectedTour.title}
                    className="w-16 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold">{selectedTour.title}</h3>
                    <p className="text-muted-foreground">
                      {selectedTour.tour_category.name}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {selectedTour.duration}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schedule Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Lịch Trình Chi Tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Morning Schedule */}
              <div>
                <Label className="text-lg font-semibold text-orange-600 mb-3 block">
                  🌅 Buổi Sáng
                </Label>
                <TinyMCEEditor
                  value={formData.morning_description}
                  onChange={(content) =>
                    handleInputChange("morning_description", content)
                  }
                  placeholder="Mô tả lịch trình buổi sáng..."
                />
              </div>

              {/* Noon Schedule */}
              <div>
                <Label className="text-lg font-semibold text-yellow-600 mb-3 block">
                  ☀️ Buổi Trưa
                </Label>
                <TinyMCEEditor
                  value={formData.noon_description}
                  onChange={(content) =>
                    handleInputChange("noon_description", content)
                  }
                  placeholder="Mô tả lịch trình buổi trưa..."
                />
              </div>

              {/* Afternoon Schedule */}
              <div>
                <Label className="text-lg font-semibold text-blue-600 mb-3 block">
                  🌆 Buổi Chiều
                </Label>
                <TinyMCEEditor
                  value={formData.afternoon_description}
                  onChange={(content) =>
                    handleInputChange("afternoon_description", content)
                  }
                  placeholder="Mô tả lịch trình buổi chiều..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng Thái Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tour được chọn</span>
                <Badge variant={formData.tour_id ? "default" : "secondary"}>
                  {formData.tour_id ? "✓" : "✗"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tiêu đề</span>
                <Badge variant={formData.title ? "default" : "secondary"}>
                  {formData.title ? "✓" : "✗"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Thứ tự ngày</span>
                <Badge variant={formData.order ? "default" : "secondary"}>
                  {formData.order ? "✓" : "✗"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mô tả buổi sáng</span>
                <Badge
                  variant={
                    formData.morning_description ? "default" : "secondary"
                  }
                >
                  {formData.morning_description ? "✓" : "✗"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mô tả buổi trưa</span>
                <Badge
                  variant={formData.noon_description ? "default" : "secondary"}
                >
                  {formData.noon_description ? "✓" : "✗"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mô tả buổi chiều</span>
                <Badge
                  variant={
                    formData.afternoon_description ? "default" : "secondary"
                  }
                >
                  {formData.afternoon_description ? "✓" : "✗"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TourDetailEditor;
