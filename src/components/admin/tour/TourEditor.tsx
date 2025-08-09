import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  X,
  Users,
  Clock,
  MapPin,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TinyMCEEditor from "@/components/TinyMCEEditor";
import { AuthContext } from "@/context/authContext";
import {
  fetchTourById,
  createTourService,
  updateTourService,
} from "@/services/tour.service";
import { fetchActiveTourCategories } from "@/services/tourCategory.service";
import type { Tour } from "@/apis/tour.api";

interface Province {
  code: string;
  name: string;
}

interface TourFormData {
  title: string;
  capacity: string;
  transportation: string;
  accommodation: string;
  destination_intro: string;
  tour_info: string;
  duration: string;
  tour_category_id: string;
  live_commentary: string;
  location: string;
  is_active: boolean;
  image: File | null;
}

const TourEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const isEditing = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chặn admin truy cập trang này
  React.useEffect(() => {
    if (user?.role === "admin") {
      alert("Admin không có quyền truy cập chức năng này.");
      navigate("/admin/tours");
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState<TourFormData>({
    title: "",
    capacity: "",
    transportation: "",
    accommodation: "",
    destination_intro: "",
    tour_info: "",
    duration: "",
    tour_category_id: "",
    live_commentary: "",
    location: "",
    is_active: true,
    image: null,
  });

  const [tourCategories, setTourCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTour, setIsLoadingTour] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentTour, setCurrentTour] = useState<Tour | null>(null);

  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>("");

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      setLoadingAddress(true);
      const response = await fetch(
        "https://vn-public-apis.fpo.vn/provinces/getAll?limit=-1"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (
        result &&
        result.exitcode === 1 &&
        result.data &&
        Array.isArray(result.data.data)
      ) {
        setProvinces(result.data.data);
      } else {
        setProvinces([]);
      }
    } catch (error) {
      console.error("Error loading provinces:", error);
      setProvinces([]);
    } finally {
      setLoadingAddress(false);
    }
  };

  const getProvinceName = (code: string) => {
    const province = provinces.find((p) => p.code === code);
    return province?.name || "";
  };

  // Load tour categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchActiveTourCategories();
        setTourCategories(categories);
      } catch (error) {
        console.error("Error loading tour categories:", error);
      }
    };
    loadCategories();
  }, []);

  // Load tour data for editing
  useEffect(() => {
    if (isEditing && id) {
      const loadTourData = async () => {
        try {
          setIsLoadingTour(true);
          const response = await fetchTourById(parseInt(id));
          console.log("TourEditor - Raw response:", response); // Debug log

          // Handle different response structures
          let tour;
          if (response && typeof response === "object") {
            if (
              "data" in response &&
              "success" in response &&
              response.success
            ) {
              tour = (response as any).data;
            } else if ("data" in response) {
              tour = (response as any).data;
            } else {
              tour = response;
            }
          } else {
            tour = response;
          }

          console.log("TourEditor - Processed tour data:", tour); // Debug log

          if (!tour) {
            console.error("No tour data found");
            return;
          }

          setCurrentTour(tour);

          setFormData({
            title: tour.title || "",
            capacity: tour.capacity?.toString() || "",
            transportation: tour.transportation || "",
            accommodation: tour.accommodation || "",
            destination_intro: tour.destination_intro || "",
            tour_info: tour.tour_info || "",
            duration: tour.duration?.toString() || "",
            tour_category_id: tour.tour_category_id?.toString() || "",
            live_commentary: tour.live_commentary || "",
            location: tour.location || "",
            is_active: tour.is_active ?? true,
            image: null,
          });

          // Parse location if it exists
          if (tour.location) {
            // Try to find matching province from existing location
            const province = provinces.find((p) => p.name === tour.location);
            if (province) {
              setSelectedProvince(province.code);
            }
          }

          if (tour.poster_url) {
            setImagePreview(tour.poster_url);
          }
        } catch (error) {
          console.error("Error loading tour data:", error);
        } finally {
          setIsLoadingTour(false);
        }
      };
      loadTourData();
    }
  }, [isEditing, id]);

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
      .replace(/^-+|-+$/g, "");
  };

  const handleInputChange = (
    field: keyof TourFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title || !formData.capacity || !formData.tour_category_id) {
      alert(
        "Vui lòng điền đầy đủ thông tin bắt buộc (Tên tour, Sức chứa, Danh mục)."
      );
      return;
    }

    // For create, image is required
    if (!isEditing && !formData.image) {
      alert("Vui lòng chọn ảnh cho tour.");
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("slug", generateSlug(formData.title));
      formDataToSend.append("capacity", formData.capacity);
      formDataToSend.append("transportation", formData.transportation);
      formDataToSend.append("accommodation", formData.accommodation);
      formDataToSend.append("destination_intro", formData.destination_intro);
      formDataToSend.append("tour_info", formData.tour_info);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("tour_category_id", formData.tour_category_id);
      formDataToSend.append("live_commentary", formData.live_commentary);

      // Create location string from selected province
      let locationString = "";
      if (selectedProvince) {
        locationString = getProvinceName(selectedProvince);
      } else if (formData.location) {
        // Fallback to existing location if dropdown not selected
        locationString = formData.location;
      }
      formDataToSend.append("location", locationString);

      formDataToSend.append("is_active", formData.is_active.toString());

      // Add provider_id from current user
      if (user?.id) {
        formDataToSend.append("provider_id", user.id.toString());
      }

      // Add poster image if selected
      if (formData.image) {
        formDataToSend.append("poster", formData.image);
      }

      if (isEditing && currentTour) {
        // Use user API for updating
        await updateTourService(currentTour.id, formDataToSend);
        alert("Cập nhật tour thành công!");
      } else {
        // Use user API for creating
        await createTourService(formDataToSend);
        alert("Tạo tour mới thành công!");
      }

      navigate("/admin/tours");
    } catch (error) {
      console.error("Failed to save tour:", error);
      alert("Không thể lưu tour. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    window.open("/tour/preview", "_blank");
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Show loading state while loading tour data
  if (isLoadingTour) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Loading Tour Data...
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Please wait while we load the tour information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/tours")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách tour</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Chỉnh sửa Tour" : "Tạo Tour Mới"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Cập nhật thông tin tour" : "Tạo một gói tour mới"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>
              {isLoading
                ? isEditing
                  ? "Đang cập nhật..."
                  : "Đang tạo..."
                : isEditing
                ? "Cập nhật Tour"
                : "Tạo Tour"}
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề Tour</Label>
                <Input
                  id="title"
                  placeholder="Nhập tiêu đề tour..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="text-lg"
                />
                {formData.title && (
                  <div className="text-xs text-gray-500 mt-1">
                    Slug:{" "}
                    <span className="font-mono">
                      {generateSlug(formData.title)}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">Số lượng người tham gia tour</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="50"
                      value={formData.capacity}
                      onChange={(e) =>
                        handleInputChange("capacity", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="duration">Thời gian</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="duration"
                      placeholder="3 ngày 2 đêm"
                      value={formData.duration}
                      onChange={(e) =>
                        handleInputChange("duration", e.target.value)
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="transportation">Phương tiện</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="transportation"
                    placeholder="Xe khách, máy bay..."
                    value={formData.transportation}
                    onChange={(e) =>
                      handleInputChange("transportation", e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accommodation">Lưu trú</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="accommodation"
                    placeholder="Khách sạn 3 sao..."
                    value={formData.accommodation}
                    onChange={(e) =>
                      handleInputChange("accommodation", e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Địa điểm</Label>
                <div className="space-y-2">
                  <Select
                    value={selectedProvince}
                    onValueChange={(value) => setSelectedProvince(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tỉnh/thành phố" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province.code} value={province.code}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedProvince && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Địa điểm đã chọn:</strong>{" "}
                        {getProvinceName(selectedProvince)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tour Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Chu kì diễn ra tour</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="live_commentary">Chu kì diễn ra tour</Label>
                <Textarea
                  id="live_commentary"
                  placeholder="VD: Thứ 2, Thứ 6 hàng tuần | Khởi hành 8:00 sáng..."
                  value={formData.live_commentary}
                  onChange={(e) =>
                    handleInputChange("live_commentary", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tour Description */}
          <Card>
            <CardHeader>
              <CardTitle>Mô tả Tour</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="destination_intro">Giới thiệu điểm đến</Label>
                <TinyMCEEditor
                  value={formData.destination_intro}
                  onChange={(content) =>
                    handleInputChange("destination_intro", content)
                  }
                  placeholder="Mô tả về điểm đến..."
                  className="min-h-[200px]"
                />
              </div>

              <div>
                <Label htmlFor="tour_info">Thông tin chi tiết</Label>
                <TinyMCEEditor
                  value={formData.tour_info}
                  onChange={(content) =>
                    handleInputChange("tour_info", content)
                  }
                  placeholder="Thông tin chi tiết về tour..."
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tour Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt Tour</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Danh mục</Label>
                <select
                  id="category"
                  value={formData.tour_category_id}
                  onChange={(e) =>
                    handleInputChange("tour_category_id", e.target.value)
                  }
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Chọn danh mục</option>
                  {tourCategories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    handleInputChange("is_active", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="is_active">Hoạt động Tour</Label>
              </div>
            </CardContent>
          </Card>

          {/* Tour Image */}
          <Card>
            <CardHeader>
              <CardTitle>Ảnh Tour</CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Tour preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      Thay đổi ảnh
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData((prev) => ({ ...prev, image: null }));
                      }}
                      className="flex-1"
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click để tải lên ảnh tour
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {isEditing && currentTour && (
            <Card>
              <CardHeader>
                <CardTitle>Thống kê Tour</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Lượt xem:
                  </span>
                  <span className="font-medium">
                    {parseInt(
                      currentTour.view_count?.toString() || "0"
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Đặt chỗ:
                  </span>
                  <span className="font-medium">
                    {currentTour.booked_count || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Đánh giá:
                  </span>
                  <span className="font-medium">
                    {currentTour.total_star &&
                    currentTour.review_count &&
                    currentTour.review_count > 0
                      ? `${(
                          currentTour.total_star / currentTour.review_count
                        ).toFixed(1)}/5`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Số đánh giá:
                  </span>
                  <span className="font-medium">
                    {currentTour.review_count || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourEditor;
