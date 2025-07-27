import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "@/context/authContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, ArrowLeft } from "lucide-react";
import { providerTourImageService } from "../../services/provider/providerTourImage.service";
import { adminTourImageService } from "../../services/admin/adminTourImage.service";
import { providerTourApi } from "../../apis/provider/providerTour.api";
import type { TourImage } from "../../apis/provider/providerTourImage.api";
import type { AdminTourImage } from "../../apis/admin/adminTourImage.api";

interface TourImageViewContentProps {
  imageId?: string;
  onBack?: () => void;
  showHeader?: boolean;
}

const TourImageViewContent: React.FC<TourImageViewContentProps> = ({
  imageId,
  onBack,
  showHeader = true,
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
        if (user?.role === "admin") {
          response = await adminTourImageService.getTourImage(
            Number(actualImageId)
          );
        } else {
          response = await providerTourImageService.getTourImageById(
            Number(actualImageId)
          );
        }
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
  }, [actualImageId, user?.role]);

  if (loading) return <div>Đang tải...</div>;
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
            variant="ghost"
            onClick={onBack ? onBack : () => navigate("/admin/tours/images")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Button>
          <h1 className="text-2xl font-bold ml-4">Chi Tiết Hình Ảnh</h1>
        </div>
      )}
      {/* Thông tin ảnh */}
      <Card>
        <CardHeader>
          <CardTitle>Thông Tin Ảnh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center mb-4">
            <img
              src={image.image_url}
              alt={image.alt_text}
              className="w-48 h-36 object-cover rounded-lg border"
            />
            <div>
              <div className="mb-2">
                <Badge variant={image.is_featured ? "default" : "secondary"}>
                  {image.is_featured ? (
                    <>
                      <Star className="w-3 h-3 mr-1" />
                      Nổi bật
                    </>
                  ) : (
                    "Thường"
                  )}
                </Badge>
              </div>
              <div className="mb-1 text-sm text-muted-foreground">
                ID hình ảnh: {image.id}
              </div>
              <div className="mb-1 text-sm text-muted-foreground">
                Tour ID: {image.tour_id}
              </div>
              <div className="mb-1 text-sm text-muted-foreground">
                Alt text: {image.alt_text}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(image.image_url, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Mở ảnh gốc
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Thông tin tour nếu có */}
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
  );
};

export default TourImageViewContent;
