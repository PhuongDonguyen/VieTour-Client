import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AdminTourCategory } from "@/apis/admin/adminTourCategory.api";

interface TourCategoryViewContentProps {
  category: AdminTourCategory;
  onBack?: () => void;
  showHeader?: boolean;
  onEdit?: (cat: AdminTourCategory) => void;
  onDelete?: (cat: AdminTourCategory) => void;
}

const TourCategoryViewContent: React.FC<TourCategoryViewContentProps> = ({
  category,
  onBack,
  showHeader = true,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const handleViewTours = () => {
    navigate(`/admin/tours?category_id=${category.id}`);
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
          </Button>
          <h1 className="text-3xl font-bold ml-4">Chi Tiết Danh Mục Tour</h1>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ảnh danh mục */}
          <Card>
            <CardHeader>
              <CardTitle>Ảnh Danh Mục</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full max-w-xl h-64 object-cover rounded-lg border"
              />
            </CardContent>
          </Card>
          {/* Thông tin chi tiết */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Danh Mục</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">ID</div>
                  <div className="font-mono text-lg font-semibold">
                    {category.id}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Tên</div>
                  <div className="text-lg font-semibold">{category.name}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Slug</div>
                  <div className="font-mono text-lg">{category.slug}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">
                    Trạng thái
                  </div>
                  <Badge
                    variant={category.is_active ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {category.is_active ? "Hoạt động" : "Tạm dừng"}
                  </Badge>
                </div>
                {typeof category.tourCount !== "undefined" && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      Số lượng tours
                    </div>
                    <div className="text-lg font-semibold">
                      {category.tourCount}
                    </div>
                  </div>
                )}
                {category.created_at && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">
                      Ngày tạo
                    </div>
                    <div className="text-sm">
                      {new Date(category.created_at).toLocaleDateString(
                        "vi-VN"
                      )}
                    </div>
                  </div>
                )}
              </div>
              {category.description && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">
                    Mô tả
                  </div>
                  <div className="text-gray-700 leading-relaxed">
                    {category.description}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleViewTours}
                className="w-full bg-black hover:bg-gray-800 text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Xem các tour
              </Button>
              <Button
                onClick={() => onEdit && onEdit(category)}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDelete && onDelete(category)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TourCategoryViewContent;
