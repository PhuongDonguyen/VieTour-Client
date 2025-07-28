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
import { providerTourImageService } from "../../../services/provider/providerTourImage.service";
import { adminTourImageService } from "../../../services/admin/adminTourImage.service";
import { providerTourApi } from "../../../apis/provider/providerTour.api";
import type { TourImage } from "../../../apis/provider/providerTourImage.api";
import type { AdminTourImage } from "../../../apis/admin/adminTourImage.api";
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
  const [image, setImage] = useState<TourImage | AdminTourImage | null>(null);
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
        let response;
        response = await providerTourImageService.getTourImageById(
          Number(actualImageId)
        );
        setImage(response);
        // Nếu có tour_id, fetch thêm thông tin tour
        const tourId = response.tour_id || (response.tour && response.tour.id);
        if (tourId) {
          try {
            const tourRes = await providerTourApi.getTourById(tourId);
            setTour(tourRes.data.data);
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

  if (loading) return <div>Đang tải...</div>;
  if (error || !image)
    return (
      <div className="text-red-500">{error || "Không tìm thấy hình ảnh."}</div>
    );

  // Helper lấy alt text
  const getAltText = (img: TourImage | AdminTourImage) =>
    "alt_text" in img ? img.alt_text : (img as any).description || "Tour image";
  // Helper lấy tour_id
  const getTourId = (img: TourImage | AdminTourImage) =>
    "tour_id" in img ? img.tour_id : img.tour?.id;
  // Helper lấy created_at
  const getCreatedAt = (img: TourImage | AdminTourImage) =>
    "created_at" in img ? img.created_at : (img as any).created_at;
  // Helper lấy updated_at
  const getUpdatedAt = (img: TourImage | AdminTourImage) =>
    "updated_at" in img ? img.updated_at : (img as any).updated_at;

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={onBack ? onBack : () => navigate("/admin/tours/images")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
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
                alt={getAltText(image)}
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
                  <div className="font-mono">{getTourId(image)}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Alt text</div>
                <div>{getAltText(image)}</div>
              </div>
              {getCreatedAt(image) && (
                <div>
                  <div className="text-sm text-muted-foreground">Ngày tạo</div>
                  <div>
                    {format(new Date(getCreatedAt(image)), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
              )}
              {getUpdatedAt(image) && (
                <div>
                  <div className="text-sm text-muted-foreground">Cập nhật</div>
                  <div>
                    {format(new Date(getUpdatedAt(image)), "dd/MM/yyyy HH:mm")}
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
              <Button
                onClick={() => {
                  if (onEdit && image) onEdit(image.id);
                  else navigate(`/admin/tours/images/edit/${image.id}`);
                }}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa chi tiết
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/tours/view/${tour?.id}`)}
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
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 space-y-4 z-50">
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => navigate(`/admin/tours/view/${tour?.id}`)}
        >
          <Calendar className="w-5 h-5 text-blue-600" />
        </Button>
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => window.open("tel:+84123456789", "_blank")}
        >
          <Phone className="w-5 h-5 text-green-600" />
        </Button>
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => window.open("https://m.me/yourpage", "_blank")}
        >
          <MessageCircle className="w-5 h-5 text-blue-600" />
        </Button>
        <Button
          size="icon"
          className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => window.open("https://zalo.me/yourzalo", "_blank")}
        >
          <span className="text-blue-600 font-semibold text-sm">Zalo</span>
        </Button>
      </div>
    </div>
  );
};

export default TourImageViewContent;
