import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/authContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  ExternalLink,
  ArrowLeft,
  ImageIcon,
  Edit,
  Calendar,
  Phone,
  MessageCircle,
} from "lucide-react";
import { fetchTourImageById } from "@/services/tourImage.service";
import { fetchTourById } from "@/services/tour.service";
import type { TourImage } from "@/apis/tourImage.api";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

interface TourImageViewContentProps {
  imageId?: string;
  onBack?: () => void;
  showHeader?: boolean;
  onEdit?: (id: number) => void;
}

const TourImageViewContent: React.FC<TourImageViewContentProps> = ({
  imageId,
  onBack,
  showHeader = true,
  onEdit,
}) => {
  const { id: idFromParams } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [image, setImage] = useState<TourImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tour, setTour] = useState<any>(null);

  const actualImageId = imageId || idFromParams;

  useEffect(() => {
    const fetchImage = async () => {
      if (!actualImageId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetchTourImageById(Number(actualImageId));
        setImage(response);

        // Nếu có tour_id, fetch thêm thông tin tour
        if (response.tour_id) {
          try {
            const tourRes = await fetchTourById(response.tour_id);
            setTour(tourRes);
          } catch {
            setTour(null);
          }
        } else {
          setTour(null);
        }
      } catch (err) {
        setError("Không tìm thấy hình ảnh hoặc đã bị xóa.");
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  }, [actualImageId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Đang tải...
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Vui lòng chờ trong khi chúng tôi tải thông tin hình ảnh tour.
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (error || !image)
    return (
      <div className="text-red-500">{error || "Không tìm thấy hình ảnh."}</div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center mb-4">
          <Button
            onClick={
              onBack
                ? onBack
                : () => navigate(`/admin/tours/images?tour_id=${image.tour_id}`)
            }
            className="flex items-center bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold ml-4">Chi Tiết Hình Ảnh Tour</h1>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ảnh lớn */}
          <Card>
            <CardHeader>
              <CardTitle>Ảnh Tour</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <img
                src={image.image_url}
                alt={image.alt_text || "Tour image"}
                className="w-full max-w-xl h-64 object-cover rounded-lg border"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(image.image_url, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Mở ảnh gốc
              </Button>
            </CardContent>
          </Card>
          {/* Thông tin ảnh */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Thông Tin Ảnh
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={image.is_featured ? "default" : "secondary"}>
                  {image.is_featured ? (
                    <>
                      <Star className="w-3 h-3 mr-1" /> Nổi bật
                    </>
                  ) : (
                    "Thường"
                  )}
                </Badge>
              </div>
              <div className="flex gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    ID hình ảnh
                  </div>
                  <div className="font-mono">{image.id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tour ID</div>
                  <div className="font-mono">{image.tour_id}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Alt text</div>
                <div>{image.alt_text || "Không có mô tả"}</div>
              </div>
              {image.created_at && (
                <div>
                  <div className="text-sm text-muted-foreground">Ngày tạo</div>
                  <div>
                    {format(new Date(image.created_at), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
              )}
              {image.updated_at && (
                <div>
                  <div className="text-sm text-muted-foreground">Cập nhật</div>
                  <div>
                    {format(new Date(image.updated_at), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Sidebar phải */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user?.role !== "admin" && (
                <Button
                  onClick={() =>
                    onEdit && image
                      ? onEdit(image.id)
                      : navigate(`/admin/tours/images/edit/${image.id}`)
                  }
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Cập nhật hình ảnh
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/tours/view/${image.tour_id}`)}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Xem Tour
              </Button>
            </CardContent>
          </Card>
          {/* Thông tin tour liên quan */}
          {tour && (
            <Card>
              <CardHeader>
                <CardTitle>Thông Tin Tour</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4 items-center">
                <img
                  src={tour.poster_url}
                  alt={tour.title}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="text-xl font-semibold mb-1">{tour.title}</h3>
                  <Badge variant="outline">
                    {tour.tour_category?.name || "Chưa phân loại"}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    Tour ID: {tour.id}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Floating Action Buttons */}
      {/* ĐÃ XÓA CÁC NÚT FLOATING ACTION BUTTONS DƯ THỪA */}
    </div>
  );
};

export default TourImageViewContent;
