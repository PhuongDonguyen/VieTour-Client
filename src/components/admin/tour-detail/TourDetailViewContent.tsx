import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  MapPin,
  Building,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AuthContext } from "@/context/authContext";
import { providerTourDetailService } from "@/services/provider/providerTourDetail.service";
import { adminTourDetailService } from "@/services/admin/adminTourDetail.service";
import { providerTourApi } from "@/apis/provider/providerTour.api";
import type { TourDetail } from "@/apis/provider/providerTourDetail.api";
import type { AdminTourDetail } from "@/apis/admin/adminTourDetail.api";

interface TourDetailViewContentProps {
  detailId?: string;
  onBack?: () => void;
  showHeader?: boolean;
}

const TourDetailViewContent: React.FC<TourDetailViewContentProps> = ({
  detailId,
  onBack,
  showHeader = true,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const [tourDetail, setTourDetail] = useState<
    TourDetail | AdminTourDetail | null
  >(null);
  const [tourInfo, setTourInfo] = useState<{
    title: string;
    poster_url: string;
    category_name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const actualDetailId = detailId || id;

  // Helper function to get tour information safely
  const getTourInfo = (detail: TourDetail | AdminTourDetail) => {
    if (detail.tour) {
      return {
        title: detail.tour.title,
        poster_url: detail.tour.poster_url,
        category_name: detail.tour.tour_category.name,
      };
    } else if (tourInfo) {
      return tourInfo;
    } else {
      return {
        title: `Tour ID: ${detail.tour_id}`,
        poster_url: "/public/VieTour-Logo.png",
        category_name: "Chưa phân loại",
      };
    }
  };

  // Load tour detail data
  useEffect(() => {
    const loadTourDetailData = async () => {
      if (!actualDetailId) return;

      try {
        setLoading(true);
        let detailData;

        if (isAdmin) {
          // Use admin service to get tour detail
          const response = await adminTourDetailService.getTourDetail(
            parseInt(actualDetailId)
          );
          console.log("Admin tour detail response:", response); // Debug log
          // Service returns the tour detail object directly
          detailData = response;
          console.log("Admin processed tour detail data:", detailData); // Debug log
        } else {
          // Use provider service to get tour detail
          const response = await providerTourDetailService.getTourDetail(
            parseInt(actualDetailId)
          );
          console.log("Provider tour detail response:", response); // Debug log
          // Service returns the tour detail object directly
          detailData = response;
          console.log("Provider processed tour detail data:", detailData); // Debug log
        }

        setTourDetail(detailData);

        // Fetch tour info if not available in the response
        if (!detailData.tour && detailData.tour_id) {
          try {
            const tourResponse = await providerTourApi.getTourById(
              detailData.tour_id
            );
            const tourData = tourResponse.data.data;
            setTourInfo({
              title: tourData.title,
              poster_url: tourData.poster_url,
              category_name: tourData.tour_category?.name || "Chưa phân loại",
            });
          } catch (tourError) {
            console.error("Failed to fetch tour info:", tourError);
            setTourInfo({
              title: `Tour ID: ${detailData.tour_id}`,
              poster_url: "/public/VieTour-Logo.png",
              category_name: "Chưa phân loại",
            });
          }
        }
      } catch (error) {
        console.error("Error loading tour detail data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTourDetailData();
  }, [actualDetailId, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Đang tải thông tin chi tiết tour...
          </p>
        </div>
      </div>
    );
  }

  if (!tourDetail) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Không tìm thấy chi tiết tour
          </h2>
          <p className="text-muted-foreground mb-4">
            Chi tiết tour bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          {onBack ? (
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          ) : (
            <Button onClick={() => navigate("/admin/tours/details")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onBack ? (
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => navigate("/admin/tours/details")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Về danh sách chi tiết tour</span>
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold">{tourDetail.title}</h1>
              <p className="text-muted-foreground">
                Chi tiết lịch trình • Ngày: {tourDetail.order}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tour Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Thông Tin Tour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <img
              src={getTourInfo(tourDetail).poster_url}
              alt={getTourInfo(tourDetail).title}
              className="w-16 h-12 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-lg">
                {getTourInfo(tourDetail).title}
              </h3>
              <p className="text-muted-foreground">
                {getTourInfo(tourDetail).category_name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tour Detail Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Thông tin chi tiết
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Tiêu đề
                  </p>
                  <p className="text-lg font-semibold">{tourDetail.title}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Thứ tự ngày
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {tourDetail.order}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Mã Tour
                  </p>
                  <p className="font-mono text-sm">{tourDetail.tour_id}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Mã Chi Tiết
                  </p>
                  <p className="font-mono text-sm">{tourDetail.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buổi Sáng */}
          {tourDetail.morning_description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Buổi Sáng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-foreground [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>p]:mb-3 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-3 [&>li]:mb-1 [&>strong]:font-semibold [&>em]:italic [&>a]:text-primary [&>a]:underline [&>a]:hover:text-primary/80 [&>blockquote]:border-l-4 [&>blockquote]:border-border [&>blockquote]:pl-4 [&>blockquote]:my-3 [&>blockquote]:italic [&>blockquote]:text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html:
                      tourDetail.morning_description || "Chưa có thông tin",
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Buổi Trưa */}
          {tourDetail.noon_description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Buổi Trưa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-foreground [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>p]:mb-3 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-3 [&>li]:mb-1 [&>strong]:font-semibold [&>em]:italic [&>a]:text-primary [&>a]:underline [&>a]:hover:text-primary/80 [&>blockquote]:border-l-4 [&>blockquote]:border-border [&>blockquote]:pl-4 [&>blockquote]:my-3 [&>blockquote]:italic [&>blockquote]:text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: tourDetail.noon_description || "Chưa có thông tin",
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Buổi Chiều */}
          {tourDetail.afternoon_description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Buổi Chiều
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-foreground [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>p]:mb-3 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-3 [&>li]:mb-1 [&>strong]:font-semibold [&>em]:italic [&>a]:text-primary [&>a]:underline [&>a]:hover:text-primary/80 [&>blockquote]:border-l-4 [&>blockquote]:border-border [&>blockquote]:pl-4 [&>blockquote]:my-3 [&>blockquote]:italic [&>blockquote]:text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html:
                      tourDetail.afternoon_description || "Chưa có thông tin",
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thao tác nhanh */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isAdmin && (
                <Button
                  onClick={() =>
                    navigate(`/admin/tours/details/edit/${tourDetail.id}`)
                  }
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa chi tiết
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/admin/tours/view/${tourDetail.tour_id}`)
                }
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem Tour
              </Button>
            </CardContent>
          </Card>

          {/* Thông tin Tour */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin Tour</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tên Tour
                </label>
                <p className="font-medium text-sm">
                  {getTourInfo(tourDetail).title}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Danh mục
                </label>
                <Badge variant="secondary" className="text-xs">
                  {getTourInfo(tourDetail).category_name}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Mã Tour
                </label>
                <p className="font-mono text-sm">{tourDetail.tour_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Mã Chi Tiết
                </label>
                <p className="font-mono text-sm">{tourDetail.id}</p>
              </div>
              {tourDetail.created_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ngày tạo
                  </label>
                  <p className="text-sm">
                    {new Date(tourDetail.created_at).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              )}
              {tourDetail.updated_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Cập nhật
                  </label>
                  <p className="text-sm">
                    {new Date(tourDetail.updated_at).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TourDetailViewContent;
