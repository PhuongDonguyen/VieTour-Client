import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthContext } from "@/context/authContext";
import { ArrowLeft, Save, DollarSign, Users } from "lucide-react";
import {
  fetchTourPriceById,
  createTourPriceService,
  updateTourPriceService,
} from "@/services/tourPrice.service";
import { fetchTours, fetchTourById } from "@/services/tour.service";
import TinyMCEEditor from "../../TinyMCEEditor";
import { Badge } from "@/components/ui/badge";
import type { TourPrice } from "@/apis/tourPrice.api";

interface TourPriceFormData {
  tour_id: number;
  adult_price: number;
  kid_price: number;
  note: string;
}

const TourPriceEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Get tour_id from URL query parameter
  const tourIdFromUrl = searchParams.get("tour_id");

  const [formData, setFormData] = useState<TourPriceFormData>({
    tour_id: tourIdFromUrl ? parseInt(tourIdFromUrl) : 0,
    adult_price: 0,
    kid_price: 0,
    note: "",
  });

  const [availableTours, setAvailableTours] = useState<
    { id: number; title: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingTour, setIsLoadingTour] = useState(false);
  const [currentTourPrice, setCurrentTourPrice] = useState<TourPrice | null>(
    null
  );
  const [selectedTour, setSelectedTour] = useState<any>(null);

  const isEditing = !!id;
  const isCreateMode = !isEditing;

  // Load tour info for the assigned tour
  const loadTourInfo = async () => {
    if (!tourIdFromUrl) return;

    try {
      const tourRes = await fetchTourById(parseInt(tourIdFromUrl));
      setSelectedTour(tourRes);
    } catch (error) {
      console.error("Failed to load tour info:", error);
    }
  };

  // Load available tours
  const loadAvailableTours = async () => {
    try {
      setIsLoadingTour(true);
      const response = await fetchTours({
        page: 1,
        limit: 100,
      });

      let toursData: any[] = [];
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
    } catch (error: any) {
      console.error("Failed to load tours:", error);

      // Show user-friendly error message
      if (error.response?.status === 400) {
        console.error(
          "API Error 400: Bad Request - The tours API endpoint may not be implemented yet"
        );
      } else if (error.response?.status === 404) {
        console.error(
          "API Error 404: Not Found - The tours API endpoint does not exist"
        );
      } else if (error.response?.status === 500) {
        console.error(
          "API Error 500: Internal Server Error - Backend server error"
        );
      } else if (error.code === "ERR_NETWORK") {
        console.error("Network Error: Cannot connect to the server");
      }

      setAvailableTours([]);
    } finally {
      setIsLoadingTour(false);
    }
  };

  // Load tour price data for editing
  const loadTourPriceData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await fetchTourPriceById(parseInt(id));

      if (response) {
        setFormData({
          tour_id: response.tour_id,
          adult_price: response.adult_price,
          kid_price: response.kid_price,
          note: response.note || "",
        });
        setCurrentTourPrice(response);
        setSelectedTour(response.tour);
      }
    } catch (error: any) {
      console.error("Failed to load tour price:", error);

      // Show user-friendly error message
      if (error.response?.status === 400) {
        console.error(
          "API Error 400: Bad Request - The API endpoint may not be implemented yet"
        );
        alert("API endpoint chưa được implement. Vui lòng thử lại sau.");
      } else if (error.response?.status === 404) {
        console.error(
          "API Error 404: Not Found - The tour price does not exist"
        );
        alert("Không tìm thấy thông tin giá tour. Vui lòng kiểm tra lại.");
      } else if (error.response?.status === 500) {
        console.error(
          "API Error 500: Internal Server Error - Backend server error"
        );
        alert("Lỗi server. Vui lòng thử lại sau.");
      } else if (error.code === "ERR_NETWORK") {
        console.error("Network Error: Cannot connect to the server");
        alert("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        alert("Có lỗi xảy ra khi tải thông tin giá tour. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCreateMode && tourIdFromUrl) {
      loadTourInfo();
    } else if (isEditing) {
      loadAvailableTours();
      loadTourPriceData();
    } else {
      loadAvailableTours();
    }
  }, [id, tourIdFromUrl]);

  // Handle input changes
  const handleInputChange = (
    field: keyof TourPriceFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle tour selection
  const handleTourChange = (tourId: string) => {
    const tour = availableTours.find((t) => t.id === parseInt(tourId));
    setSelectedTour(tour);
    handleInputChange("tour_id", parseInt(tourId));
  };

  // Handle save
  const handleSave = async () => {
    if (
      !formData.tour_id ||
      formData.adult_price <= 0 ||
      formData.kid_price <= 0
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await updateTourPriceService(parseInt(id!), {
          adult_price: formData.adult_price,
          kid_price: formData.kid_price,
          note: formData.note,
        });
      } else {
        await createTourPriceService({
          tour_id: formData.tour_id,
          adult_price: formData.adult_price,
          kid_price: formData.kid_price,
          note: formData.note,
        });
      }

      navigate(
        tourIdFromUrl || formData.tour_id
          ? `/admin/tours/prices?tour_id=${tourIdFromUrl || formData.tour_id}`
          : "/admin/tours/prices"
      );
    } catch (error: any) {
      console.error("Failed to save tour price:", error);

      // Show user-friendly error message
      if (error.response?.status === 400) {
        console.error(
          "API Error 400: Bad Request - The API endpoint may not be implemented yet"
        );
        alert("API endpoint chưa được implement. Vui lòng thử lại sau.");
      } else if (error.response?.status === 404) {
        console.error(
          "API Error 404: Not Found - The tour price does not exist"
        );
        alert("Không tìm thấy thông tin giá tour. Vui lòng kiểm tra lại.");
      } else if (error.response?.status === 500) {
        console.error(
          "API Error 500: Internal Server Error - Backend server error"
        );
        alert("Lỗi server. Vui lòng thử lại sau.");
      } else if (error.code === "ERR_NETWORK") {
        console.error("Network Error: Cannot connect to the server");
        alert("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        alert("Không thể lưu thông tin giá tour. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString()} VND`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isEditing ? "Đang tải thông tin giá tour..." : "Đang tải..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                tourIdFromUrl || formData.tour_id
                  ? `/admin/tours/prices?tour_id=${
                      tourIdFromUrl || formData.tour_id
                    }`
                  : "/admin/tours/prices"
              )
            }
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Chỉnh Sửa Giá Tour" : "Tạo Giá Tour Mới"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? "Cập nhật thông tin giá tour"
                : "Thêm giá tour mới cho hệ thống"}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading
            ? isEditing
              ? "Đang cập nhật..."
              : "Đang tạo..."
            : isEditing
            ? "Cập nhật"
            : "Tạo mới"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Thông Tin Giá Tour
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tour Selection */}
              <div className="space-y-2">
                <Label htmlFor="tour_id">Chọn Tour *</Label>
                {isCreateMode && tourIdFromUrl ? (
                  <div className="flex items-center gap-3 p-3 border rounded-md bg-muted">
                    <img
                      src={selectedTour?.poster_url || "/avatar-default.jpg"}
                      alt={selectedTour?.title || "Tour"}
                      className="w-12 h-8 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {selectedTour?.title || `Tour ID: ${tourIdFromUrl}`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Select
                    value={formData.tour_id.toString()}
                    onValueChange={handleTourChange}
                    disabled={isLoadingTour || isEditing}
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
                {isLoadingTour && (
                  <p className="text-sm text-muted-foreground">
                    Đang tải danh sách tours...
                  </p>
                )}
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adult_price">Giá Người Lớn (VND) *</Label>
                  <Input
                    id="adult_price"
                    type="number"
                    value={formData.adult_price}
                    onChange={(e) =>
                      handleInputChange(
                        "adult_price",
                        parseInt(e.target.value) || 0
                      )
                    }
                    onFocus={(e) => {
                      if (e.target.value === "0") {
                        e.target.value = "";
                      }
                    }}
                    placeholder="Nhập giá người lớn"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kid_price">Giá Trẻ Em (VND) *</Label>
                  <Input
                    id="kid_price"
                    type="number"
                    value={formData.kid_price}
                    onChange={(e) =>
                      handleInputChange(
                        "kid_price",
                        parseInt(e.target.value) || 0
                      )
                    }
                    onFocus={(e) => {
                      if (e.target.value === "0") {
                        e.target.value = "";
                      }
                    }}
                    placeholder="Nhập giá trẻ em"
                    min="0"
                  />
                </div>
              </div>

              {/* Note Field */}
              <div className="space-y-2">
                <Label htmlFor="note">Ghi Chú</Label>
                <textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleInputChange("note", e.target.value)}
                  placeholder="Nhập ghi chú về giá tour..."
                  className="w-full min-h-[80px] rounded border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Save Button */}
              {/* The save button is now in the header */}
            </CardContent>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          {/* Selected Tour Preview */}
          {selectedTour && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Tour Đã Chọn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedTour.poster_url}
                    alt={selectedTour.title}
                    className="w-12 h-8 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium text-sm">
                      {selectedTour.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedTour.tour_category?.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Price Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Xem Trước Giá</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Giá Người Lớn
                </label>
                <div className="text-lg font-bold text-green-600">
                  {formatPrice(formData.adult_price)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Giá Trẻ Em
                </label>
                <div className="text-lg font-bold text-blue-600">
                  {formatPrice(formData.kid_price)}
                </div>
              </div>
              {formData.note && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ghi Chú
                  </label>
                  <div className="p-2 bg-muted rounded text-sm">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: formData.note,
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Status */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng Thái Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tour đã chọn:</span>
                <Badge variant={formData.tour_id ? "default" : "secondary"}>
                  {formData.tour_id ? "✓" : "✗"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Giá người lớn:</span>
                <Badge
                  variant={formData.adult_price > 0 ? "default" : "secondary"}
                >
                  {formData.adult_price > 0 ? "✓" : "✗"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Giá trẻ em:</span>
                <Badge
                  variant={formData.kid_price > 0 ? "default" : "secondary"}
                >
                  {formData.kid_price > 0 ? "✓" : "✗"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TourPriceEditor;
