import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
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
import { fetchTours, fetchTourById } from "@/services/tour.service";
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
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [tourInfo, setTourInfo] = useState<any>(null);
  const [availableTours, setAvailableTours] = useState<
    { id: number; title: string }[]
  >([]);
  const [loadingTours, setLoadingTours] = useState(false);

  // Load available tours (always needed for edit mode to allow tour changes)
  const loadAvailableTours = async () => {
    if (mode === "create" && tourIdFromUrl) return; // Skip for create mode with tour_id

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
      const tourRes = await fetchTourById(Number(tourId));
      setTourInfo(tourRes);
    } catch (error) {
      console.error("Failed to load tour info:", error);
      setTourInfo(null);
    }
  };

  useEffect(() => {
    // Load available tours only for create mode without tour_id
    if (mode === "create" && !tourIdFromUrl) {
      loadAvailableTours();
    } else {
      // For edit mode or create mode with tour_id, don't load available tours
      setAvailableTours([]);
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
          setPreviewUrls([response.image_url || ""]);
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
      // Load tour info for create mode with tour_id
      loadTourInfo(tourIdFromUrl);
    } else if (mode === "create" && !tourIdFromUrl && form.tour_id) {
      // Load tour info when user selects a tour in create mode
      loadTourInfo(form.tour_id);
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
    // Load tour info when tour changes
    loadTourInfo(tourId);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);

      // Create preview URLs for all selected files
      const urls = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleSave = async () => {
    if (!form.tour_id) {
      setError("Vui lòng chọn Tour.");
      return;
    }
    if (files.length === 0 && mode === "create") {
      setError("Vui lòng chọn file hình ảnh.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (mode === "edit" && id) {
        // Khi edit, chỉ có thể cập nhật 1 ảnh
        if (files.length > 1) {
          setError("Chế độ chỉnh sửa chỉ hỗ trợ 1 ảnh.");
          return;
        }

        const formData = new FormData();
        formData.append("tour_id", form.tour_id);
        formData.append("alt_text", form.alt_text);
        formData.append("is_featured", form.is_featured ? "true" : "false");
        if (files.length > 0) {
          formData.append("image", files[0]);
        }
        await updateTourImageService(Number(id), formData);
        alert("Cập nhật hình ảnh thành công!");
      } else {
        // Khi tạo mới, gửi từng ảnh qua vòng lặp
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < files.length; i++) {
          try {
            const formData = new FormData();
            formData.append("tour_id", form.tour_id);
            formData.append("alt_text", form.alt_text);
            formData.append("is_featured", form.is_featured ? "true" : "false");
            formData.append("image", files[i]);

            await createTourImageService(formData);
            successCount++;
          } catch (err: any) {
            console.error(`Error uploading file ${files[i].name}:`, err);
            errorCount++;
          }
        }

        if (errorCount === 0) {
          alert(`Tạo thành công ${successCount} hình ảnh!`);
        } else if (successCount > 0) {
          alert(
            `Tạo thành công ${successCount} hình ảnh, ${errorCount} hình ảnh lỗi.`
          );
        } else {
          throw new Error("Tất cả hình ảnh đều lỗi.");
        }
      }

      navigate(
        tourIdFromUrl || form.tour_id
          ? `/admin/tours/images?tour_id=${tourIdFromUrl || form.tour_id}`
          : "/admin/tours/images"
      );
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
            onClick={
              onBack ||
              (() =>
                navigate(
                  tourIdFromUrl || form.tour_id
                    ? `/admin/tours/images?tour_id=${
                        tourIdFromUrl || form.tour_id
                      }`
                    : "/admin/tours/images"
                ))
            }
            className="flex items-center gap-2 bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
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
                    Tour *
                  </label>
                  {mode === "edit" || (mode === "create" && tourIdFromUrl) ? (
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
                    Chọn file hình ảnh{" "}
                    {mode === "create" ? "(có thể chọn nhiều)" : ""}
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple={mode === "create"}
                    onChange={handleFileChange}
                  />
                  {files.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Đã chọn {files.length} file:{" "}
                      {files.map((f) => f.name).join(", ")}
                    </div>
                  )}
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
              {previewUrls.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-w-xs">
                  {previewUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                  ))}
                </div>
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
              <div>
                Đã chọn file:{" "}
                {files.length > 0 ? `${files.length} file` : "Chưa chọn"}
              </div>
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
