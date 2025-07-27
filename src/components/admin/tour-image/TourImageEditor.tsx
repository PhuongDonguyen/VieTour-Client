import React, { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, ArrowLeft, ImageIcon } from "lucide-react";
import { providerTourImageService } from "../../../services/provider/providerTourImage.service";
import { adminTourImageService } from "../../../services/admin/adminTourImage.service";
import type { TourImage } from "../../../apis/provider/providerTourImage.api";
import type { AdminTourImage } from "../../../apis/admin/adminTourImage.api";

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
  const id = propId || params.id;
  const navigate = useNavigate();
  const [form, setForm] = useState<any>({
    tour_id: "",
    alt_text: "",
    is_featured: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tourInfo, setTourInfo] = useState<any>(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      setLoading(true);
      setError(null);
      (async () => {
        try {
          let response;
          response = await providerTourImageService.getTourImageById(
            Number(id)
          );
          setForm({
            tour_id:
              "tour_id" in response ? response.tour_id : response.tour.id,
            alt_text:
              "alt_text" in response ? response.alt_text : response.description,
            is_featured: response.is_featured,
          });
          setPreviewUrl(response.image_url || null);
          // Fetch tour info
          if (response.tour_id) {
            try {
              const tourRes = await import(
                "../../../apis/provider/providerTour.api"
              ).then((m) => m.providerTourApi.getTourById(response.tour_id));
              setTourInfo(tourRes.data.data);
            } catch {}
          }
        } catch (err) {
          setError("Không tìm thấy hình ảnh hoặc đã bị xóa.");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [mode, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("tour_id", form.tour_id);
      formData.append("alt_text", form.alt_text);
      formData.append("is_featured", form.is_featured ? "true" : "false");
      if (file) {
        formData.append("image", file);
      }
      if (mode === "edit" && id) {
        await providerTourImageService.updateTourImage(Number(id), formData);
      } else {
        await providerTourImageService.createTourImage(formData);
      }
      navigate("/admin/tours/images");
      if (onBack) onBack();
    } catch (err) {
      setError("Có lỗi xảy ra khi lưu hình ảnh.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header lớn */}
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </Button>
        <h1 className="text-3xl font-bold ml-4">
          {mode === "edit"
            ? "Chỉnh Sửa Hình Ảnh Tour"
            : "Thêm Hình Ảnh Tour Mới"}
        </h1>
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ID Tour
                  </label>
                  <Input
                    name="tour_id"
                    value={form.tour_id}
                    onChange={handleChange}
                    required
                    disabled={mode === "edit"}
                  />
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
                <Button type="submit" disabled={loading} className="w-full">
                  {loading
                    ? "Đang lưu..."
                    : mode === "edit"
                    ? "Lưu thay đổi"
                    : "Tạo mới"}
                </Button>
              </form>
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
                  <Badge variant="outline">
                    {tourInfo.tour_category?.name || "Chưa phân loại"}
                  </Badge>
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
