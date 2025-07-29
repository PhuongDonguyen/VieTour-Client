import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Eye,
  DollarSign,
  Users,
  Calendar,
  Building,
  Tag,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AuthContext } from "@/context/authContext";
import { providerTourPriceService } from "@/services/provider/providerTourPrice.service";
import { adminTourPriceService } from "@/services/admin/adminTourPrice.service";
import { providerTourApi } from "@/apis/provider/providerTour.api";
import type { TourPrice } from "@/apis/provider/providerTourPrice.api";
import type { AdminTourPrice } from "@/apis/admin/adminTourPrice.api";
import { adminTourService } from "@/services/admin/adminTour.service";

interface TourPriceViewContentProps {
  priceId?: string;
  onBack?: () => void;
  showHeader?: boolean;
}

const TourPriceViewContent: React.FC<TourPriceViewContentProps> = ({
  priceId,
  onBack,
  showHeader = true,
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const [tourPrice, setTourPrice] = useState<TourPrice | AdminTourPrice | null>(
    null
  );
  const [tourInfo, setTourInfo] = useState<{
    title: string;
    poster_url: string;
    category_name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const actualPriceId = priceId || id;

  // Helper functions to normalize data between TourPrice and AdminTourPrice
  const getChildPrice = (price: TourPrice | AdminTourPrice): number => {
    return "kid_price" in price ? price.kid_price : price.child_price;
  };

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString()} VND`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to get tour information safely
  const getTourInfo = (price: TourPrice | AdminTourPrice) => {
    if (price.tour) {
      return {
        title: price.tour.title,
        poster_url: price.tour.poster_url,
        category_name: price.tour.tour_category.name,
      };
    } else if (tourInfo) {
      return tourInfo;
    } else {
      return {
        title: `Tour ID: ${price.tour_id}`,
        poster_url: "/public/VieTour-Logo.png",
        category_name: "Chưa phân loại",
      };
    }
  };

  // Load tour price data
  const loadTourPriceData = async () => {
    if (!actualPriceId) return;

    try {
      setLoading(true);
      let response;

      if (user?.role === "admin") {
        response = await adminTourPriceService.getTourPrice(
          parseInt(actualPriceId)
        );
        console.log("Admin tour price response:", response);
      } else if (user?.role === "provider") {
        response = await providerTourPriceService.getTourPrice(
          parseInt(actualPriceId)
        );
        console.log("Provider tour price response:", response);
      } else {
        setTourPrice(null);
        setTourInfo(null);
        setLoading(false);
        return;
      }

      // Extract the tour price data from response
      let priceData: TourPrice | AdminTourPrice;
      if (response && typeof response === "object") {
        if (response.data && response.data.data) {
          priceData = response.data.data;
        } else if (response.data) {
          priceData = response.data;
        } else {
          priceData = response;
        }
      } else {
        throw new Error("Invalid response format");
      }

      console.log("Processed tour price data:", priceData);
      setTourPrice(priceData);

      // Fetch tour info if not available in the response
      if (!priceData.tour && priceData.tour_id) {
        try {
          if (user?.role === "admin") {
            const tourRes = await adminTourService.getTour(priceData.tour_id);
            setTourInfo({
              title: tourRes.title,
              poster_url: tourRes.poster_url,
              category_name: tourRes.tour_category?.name || "Chưa phân loại",
            });
          } else if (user?.role === "provider") {
            const tourResponse = await providerTourApi.getTourById(
              priceData.tour_id
            );
            const tourData = tourResponse.data.data;
            setTourInfo({
              title: tourData.title,
              poster_url: tourData.poster_url,
              category_name: tourData.tour_category?.name || "Chưa phân loại",
            });
          } else {
            setTourInfo({
              title: `Tour ID: ${priceData.tour_id}`,
              poster_url: "/public/VieTour-Logo.png",
              category_name: "Chưa phân loại",
            });
          }
        } catch (tourError) {
          setTourInfo({
            title: `Tour ID: ${priceData.tour_id}`,
            poster_url: "/public/VieTour-Logo.png",
            category_name: "Chưa phân loại",
          });
        }
      }
    } catch (error) {
      console.error("Failed to load tour price:", error);
      setTourPrice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTourPriceData();
  }, [actualPriceId, isAdmin]);

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
              Vui lòng chờ trong khi chúng tôi tải thông tin giá tour.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!tourPrice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Không tìm thấy thông tin giá tour
          </h2>
          <p className="text-muted-foreground mb-4">
            Thông tin giá tour bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          {onBack ? (
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          ) : (
            <Button onClick={() => navigate("/admin/tours/prices")}>
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
                <span>Back</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => navigate("/admin/tours/prices")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Tour Prices</span>
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold">
                Giá Tour: {getTourInfo(tourPrice).title}
              </h1>
              <p className="text-muted-foreground">
                Tour Price
                {tourPrice.created_at &&
                formatDate(tourPrice.created_at) !== "Invalid Date"
                  ? ` • ${formatDate(tourPrice.created_at)}`
                  : ""}
                {getTourInfo(tourPrice).category_name
                  ? ` • ${getTourInfo(tourPrice).category_name}`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Thông Tin Giá
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Giá Người Lớn
                  </p>
                  <p className="flex items-center gap-2 text-lg font-bold text-green-600">
                    {formatPrice(tourPrice.adult_price)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Giá Trẻ Em
                  </p>
                  <p className="flex items-center gap-2 text-lg font-bold text-blue-600">
                    <Users className="w-4 h-4" />
                    {formatPrice(getChildPrice(tourPrice))}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Loại Giá
                  </p>
                  <Badge variant="secondary">
                    <Tag className="w-3 h-3 mr-1" />
                    {tourPrice.price_type || "Standard"}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Trạng Thái
                  </p>
                  <Badge variant="default">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tour Information */}
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
                  src={getTourInfo(tourPrice).poster_url}
                  alt={getTourInfo(tourPrice).title}
                  className="w-16 h-12 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-lg">
                    {getTourInfo(tourPrice).title}
                  </h3>
                  <p className="text-muted-foreground">
                    {getTourInfo(tourPrice).category_name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Details */}
          {tourPrice.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Mô Tả Giá
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-foreground [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>p]:mb-3 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-3 [&>li]:mb-1 [&>strong]:font-semibold [&>em]:italic [&>a]:text-primary [&>a]:underline [&>a]:hover:text-primary/80 [&>blockquote]:border-l-4 [&>blockquote]:border-border [&>blockquote]:pl-4 [&>blockquote]:my-3 [&>blockquote]:italic [&>blockquote]:text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: tourPrice.description || "Chưa có mô tả",
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isAdmin && (
                <Button
                  onClick={() =>
                    navigate(`/admin/tours/prices/edit/${tourPrice.id}`)
                  }
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Tour Price
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/admin/tours/view/${tourPrice.tour_id}`)
                }
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Tour
              </Button>
            </CardContent>
          </Card>

          {/* Price Details */}
          <Card>
            <CardHeader>
              <CardTitle>Price Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Price ID
                </label>
                <p className="font-mono text-sm">{tourPrice.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tour ID
                </label>
                <p className="font-mono text-sm">{tourPrice.tour_id}</p>
              </div>
              {tourPrice.created_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created
                  </label>
                  <p className="text-sm">{formatDate(tourPrice.created_at)}</p>
                </div>
              )}
              {tourPrice.updated_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Updated
                  </label>
                  <p className="text-sm">{formatDate(tourPrice.updated_at)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TourPriceViewContent;
