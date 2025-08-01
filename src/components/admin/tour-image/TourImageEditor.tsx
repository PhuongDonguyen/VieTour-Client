import React, { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowLeft, ImageIcon, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchTourImageById,
  createTourImageService,
  updateTourImageService,
} from "@/services/tourImage.service";
import { fetchTours } from "@/services/tour.service";
import type { TourImage } from "@/apis/tourImage.api";

interface TourImageEditorProps {
  mode: "create" | "edit";
  id?: string;
  onBack?: () => void;
}

const TourImageEditor: React.FC<TourImageEditorProps> = ({
  mode,
  id: propId,
  onBack,
}) => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const id = propId || params.id;
  const navigate = useNavigate();

  // Get tour_id from URL query parameter for create mode
  const tourIdFromUrl = searchParams.get("tour_id");

  const [form, setForm] = useState<any>({
    tour_id: mode === "create" ? tourIdFromUrl || "" : "",
    alt_text: "",
    is_featured: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tourInfo, setTourInfo] = useState<any>(null);
  const [availableTours, setAvailableTours] = useState<
    { id: number; title: string }[]
  >([]);
  const [loadingTours, setLoadingTours] = useState(false);

  // Load available tours (only needed for edit mode)
  const loadAvailableTours = async () => {
    if (mode === "create") return; // Skip for create mode

    try {
      setLoadingTours(true);
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
    } catch (error) {
      console.error("Failed to load tours:", error);
      setAvailableTours([]);
    } finally {
      setLoadingTours(false);
    }
  };

  // Load tour info for the selected tour
  const loadTourInfo = async (tourId: string) => {
    if (!tourId) return;

    try {
      const tourRes = await fetchTours({ tour_id: Number(tourId) });
      if (tourRes.data && Array.isArray(tourRes.data)) {
        setTourInfo(tourRes.data[0]);
      }
    } catch (error) {
      console.error("Failed to load tour info:", error);
      setTourInfo(null);
    }
  };

  useEffect(() => {
    // Load available tours for edit mode only
    if (mode === "edit") {
      loadAvailableTours();
    }

    if (mode === "edit" && id) {
      setLoading(true);
      setError(null);
      (async () => {
        try {
          const response = await fetchTourImageById(Number(id));
          setForm({
            tour_id: response.tour_id,
            alt_text: response.alt_text,
            is_featured: response.is_featured,
          });
          setPreviewUrl(response.image_url || null);
          // Load tour info for the image's tour
          if (response.tour_id) {
            await loadTourInfo(response.tour_id.toString());
          }
        } catch (err) {
          setError("Không tìm thấy hình ảnh hoặc đã bị xóa.");
        } finally {
          setLoading(false);
        }
      })();
    } else if (mode === "create" && tourIdFromUrl) {
      // Load tour info for create mode
      loadTourInfo(tourIdFromUrl);
    }
  }, [mode, id, tourIdFromUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTourChange = (tourId: string) => {
    setForm((prev: any) => ({
      ...prev,
      tour_id: tourId,
    }));
    // Load tour info when tour changes (edit mode only)
    if (mode === "edit") {
      loadTourInfo(tourId);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    if (!form.tour_id) {
      setError("Vui lòng chọn Tour.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();

      if (mode === "edit" && id) {
        // Khi edit, gửi tour_id để server validate
        formData.append("tour_id", form.tour_id);
        formData.append("alt_text", form.alt_text);
        formData.append("is_featured", form.is_featured ? "true" : "false");
        if (file) {
          formData.append("image", file);
        }
        await updateTourImageService(Number(id), formData);
        alert("Cập nhật hình ảnh thành công!");
      } else {
        // Khi tạo mới, gửi tất cả trường
        formData.append("tour_id", form.tour_id);
        formData.append("alt_text", form.alt_text);
        formData.append("is_featured", form.is_featured ? "true" : "false");
        if (file) {
          formData.append("image", file);
        }
        await createTourImageService(formData);
        alert("Tạo hình ảnh thành công!");
      }
      navigate(`/admin/tours/images?tour_id=${form.tour_id}`);
      if (onBack) onBack();
    } catch (err: any) {
      console.error("Error saving tour image:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      // Hiển thị lỗi chi tiết hơn
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi lưu hình ảnh.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {mode === "edit"
                ? "Chỉnh Sửa Hình Ảnh Tour"
                : "Thêm Hình Ảnh Tour Mới"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "edit"
                ? "Cập nhật thông tin hình ảnh tour"
                : "Thêm hình ảnh mới cho tour"}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading
            ? "Đang lưu..."
            : mode === "edit"
            ? "Lưu thay đổi"
            : "Tạo mới"}
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form bên trái */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <ImageIcon className="w-5 h-5 mr-2" /> Thông Tin Ảnh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tour {mode === "edit" ? "*" : ""}
                  </label>
                  {mode === "create" ? (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">
                        {tourInfo ? tourInfo.title : `Tour ID: ${form.tour_id}`}
                      </p>
                    </div>
                  ) : (
                    <Select
                      value={form.tour_id}
                      onValueChange={handleTourChange}
                      disabled={loadingTours}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingTours ? "Đang tải..." : "Chọn tour..."
                          }
                        />
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
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Chọn file hình ảnh
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mô tả ảnh (Alt Text)
                  </label>
                  <Input
                    name="alt_text"
                    value={form.alt_text}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={form.is_featured}
                    onChange={handleChange}
                    id="is_featured"
                  />
                  <label htmlFor="is_featured">Nổi bật</label>
                  {form.is_featured && (
                    <Badge variant="default" className="ml-2">
                      <Star className="w-3 h-3 mr-1" />
                      Nổi bật
                    </Badge>
                  )}
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Preview và trạng thái bên phải */}
        <div className="space-y-6">
          {/* Preview ảnh */}
          <Card>
            <CardHeader>
              <CardTitle>Preview Ảnh</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-w-xs h-48 object-cover rounded-lg border"
                />
              ) : (
                <div className="text-muted-foreground text-sm">
                  Chưa chọn ảnh
                </div>
              )}
            </CardContent>
          </Card>
          {/* Thông tin tour liên quan */}
          {tourInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Thông Tin Tour</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4 items-center">
                <img
                  src={tourInfo.poster_url}
                  alt={tourInfo.title}
                  className="w-20 h-14 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold mb-1">{tourInfo.title}</h3>
                  <div className="text-sm text-muted-foreground mt-1">
                    Tour ID: {tourInfo.id}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Trạng thái form */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng Thái Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>Đã chọn file: {file ? file.name : "Chưa chọn"}</div>
              <div>Nổi bật: {form.is_featured ? "Có" : "Không"}</div>
              <div>Mô tả: {form.alt_text || "Chưa nhập"}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TourImageEditor;
