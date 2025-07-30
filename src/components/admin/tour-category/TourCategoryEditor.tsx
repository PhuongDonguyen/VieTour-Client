import React, { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";
import type { AdminTourCategory } from "@/apis/admin/adminTourCategory.api";

interface TourCategoryEditorProps {
  mode: "create" | "edit";
  category?: AdminTourCategory | null;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

const TourCategoryEditor: React.FC<TourCategoryEditorProps> = ({
  mode,
  category,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(category?.name || "");
  const [isActive, setIsActive] = useState(category?.is_active ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    category?.image_url || ""
  );
  const [slug, setSlug] = useState(category?.slug || "");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("is_active", isActive ? "true" : "false");
      formData.append("slug", generateSlug(name));
      if (imageFile) {
        formData.append("image", imageFile);
      }
      await onSave(formData);
    } catch (error) {
      console.error("Error saving category:", error);
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
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {mode === "edit" ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "edit"
                ? "Cập nhật thông tin danh mục"
                : "Thêm danh mục mới"}
            </p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gray-800 hover:bg-gray-900 text-white"
        >
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
              <CardTitle>Thông Tin Danh Mục</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tên danh mục *
                  </label>
                  <Input
                    name="name"
                    placeholder="Tên danh mục"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  {name && (
                    <div className="text-xs text-gray-500 mt-1">
                      Slug:{" "}
                      <span className="font-mono">{generateSlug(name)}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ảnh danh mục
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="block"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="active" className="text-sm font-medium">
                    Kích hoạt
                  </label>
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Hoạt động" : "Tạm dừng"}
                  </Badge>
                </div>
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
              {imagePreview ? (
                <img
                  src={imagePreview}
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
          {/* Trạng thái form */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng Thái Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                Đã chọn file: {imageFile ? imageFile.name : "Chưa chọn"}
              </div>
              <div>Trạng thái: {isActive ? "Hoạt động" : "Tạm dừng"}</div>
              <div>Tên danh mục: {name || "Chưa nhập"}</div>
              <div>Slug: {name ? generateSlug(name) : "Chưa có"}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TourCategoryEditor;
