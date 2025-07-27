import React, { useEffect, useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { providerTourImageService } from "../../services/provider/providerTourImage.service";
import { adminTourImageService } from "../../services/admin/adminTourImage.service";
import type { TourImage } from "../../apis/provider/providerTourImage.api";
import type { AdminTourImage } from "../../apis/admin/adminTourImage.api";

interface TourImageEditorProps {
  mode: "create" | "edit";
}

const TourImageEditor: React.FC<TourImageEditorProps> = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>({
    tour_id: "",
    alt_text: "",
    is_featured: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && id) {
      setLoading(true);
      setError(null);
      (async () => {
        try {
          let response;
          if (window.location.pathname.includes("/admin")) {
            response = await adminTourImageService.getTourImage(Number(id));
          } else {
            response = await providerTourImageService.getTourImageById(
              Number(id)
            );
          }
          setForm({
            tour_id:
              "tour_id" in response ? response.tour_id : response.tour.id,
            alt_text:
              "alt_text" in response ? response.alt_text : response.description,
            is_featured: response.is_featured,
          });
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
        formData.append("file", file);
      }
      if (mode === "edit" && id) {
        if (window.location.pathname.includes("/admin")) {
          await adminTourImageService.updateTourImage(Number(id), formData);
        } else {
          await providerTourImageService.updateTourImage(Number(id), formData);
        }
      } else {
        if (window.location.pathname.includes("/admin")) {
          await adminTourImageService.createTourImage(formData);
        } else {
          await providerTourImageService.createTourImage(formData);
        }
      }
      navigate("/admin/tours/images");
    } catch (err) {
      setError("Có lỗi xảy ra khi lưu hình ảnh.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "edit"
              ? "Chỉnh Sửa Hình Ảnh Tour"
              : "Thêm Hình Ảnh Tour Mới"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ID Tour</label>
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
              <Input type="file" accept="image/*" onChange={handleFileChange} />
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
  );
};

export default TourImageEditor;
