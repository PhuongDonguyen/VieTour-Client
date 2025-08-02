import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
import { fetchTourPriceById } from "@/services/tourPrice.service";
import { fetchTourById } from "@/services/tour.service";
import type { TourPrice } from "@/apis/tourPrice.api";

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
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Get tour_id from URL query parameter
  const tourIdFromUrl = searchParams.get("tour_id");

  const [tourPrice, setTourPrice] = useState<TourPrice | null>(null);
  const [tourInfo, setTourInfo] = useState<{
    title: string;
    poster_url: string;
    category_name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const actualPriceId = priceId || id;

  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null) {
      return "0 VND";
    }
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
  const getTourInfo = (price: TourPrice) => {
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
        poster_url: "/avatar-default.jpg",
        category_name: "Chưa phân loại",
      };
    }
  };

  // Load tour price data
  const loadTourPriceData = async () => {
    if (!actualPriceId) return;

    try {
      setLoading(true);
      console.log("Loading tour price with ID:", actualPriceId);

      const response = await fetchTourPriceById(parseInt(actualPriceId));
      console.log("Tour price response:", response);
      console.log("Response type:", typeof response);
      console.log("Response keys:", Object.keys(response));

      setTourPrice(response);

      // Always fetch tour info since the API doesn't include tour data
      if (response.tour_id) {
        console.log("Fetching tour info for tour_id:", response.tour_id);
        try {
          const tourRes = await fetchTourById(response.tour_id);
          console.log("Tour info response:", tourRes);
          setTourInfo({
            title: tourRes.title,
            poster_url: tourRes.poster_url,
            category_name: tourRes.tour_category?.name || "Chưa phân loại",
          });
        } catch (tourError: any) {
          console.error("Failed to load tour info:", tourError);
          setTourInfo({
            title: `Tour ID: ${response.tour_id}`,
            poster_url: "/avatar-default.jpg",
            category_name: "Chưa phân loại",
          });
        }
      } else {
        console.log("No tour_id found in response");
      }
    } catch (error: any) {
      console.error("Failed to load tour price:", error);

      // Show user-friendly error message
      if (error.response?.status === 400) {
        console.error(
          "API Error 400: Bad Request - The API endpoint may not be implemented yet"
        );
      } else if (error.response?.status === 404) {
        console.error(
          "API Error 404: Not Found - The tour price does not exist"
        );
      } else if (error.response?.status === 500) {
        console.error(
          "API Error 500: Internal Server Error - Backend server error"
        );
      } else if (error.code === "ERR_NETWORK") {
        console.error("Network Error: Cannot connect to the server");
      }

      setTourPrice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTourPriceData();
  }, [actualPriceId]);

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
            <Button
              onClick={() =>
                navigate(
                  tourIdFromUrl
                    ? `/admin/tours/prices?tour_id=${tourIdFromUrl}`
                    : "/admin/tours/prices"
                )
              }
            >
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
                variant="outline"
                onClick={onBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>Quay lại</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  navigate(
                    tourIdFromUrl || tourPrice?.tour_id
                      ? `/admin/tours/prices?tour_id=${
                          tourIdFromUrl || tourPrice?.tour_id
                        }`
                      : "/admin/tours/prices"
                  )
                }
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>Quay lại</span>
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold">
                Giá Tour: {getTourInfo(tourPrice).title}
              </h1>
              <p className="text-muted-foreground">
                Tour Price
                {tourPrice?.created_at &&
                formatDate(tourPrice.created_at) !== "Invalid Date"
                  ? ` • ${formatDate(tourPrice.created_at)}`
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
                    {formatPrice(tourPrice?.adult_price)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Giá Trẻ Em
                  </p>
                  <p className="flex items-center gap-2 text-lg font-bold text-blue-600">
                    <Users className="w-4 h-4" />
                    {formatPrice(tourPrice?.kid_price)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Loại Giá
                  </p>
                  <Badge variant="secondary">
                    <Tag className="w-3 h-3 mr-1" />
                    {tourPrice?.price_type || "Standard"}
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
              <div>
                <h3 className="font-semibold text-lg">
                  {getTourInfo(tourPrice).title}
                </h3>
              </div>
            </CardContent>
          </Card>

          {/* Price Details */}
          {tourPrice?.note && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Ghi Chú
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-foreground">{tourPrice.note}</div>
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
                    navigate(
                      tourIdFromUrl
                        ? `/admin/tours/prices/edit/${tourPrice?.id}?tour_id=${tourIdFromUrl}`
                        : `/admin/tours/prices/edit/${tourPrice?.id}`
                    )
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
                  navigate(`/admin/tours/view/${tourPrice?.tour_id}`)
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
                <p className="font-mono text-sm">{tourPrice?.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tour ID
                </label>
                <p className="font-mono text-sm">{tourPrice?.tour_id}</p>
              </div>
              {tourPrice?.created_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created
                  </label>
                  <p className="text-sm">{formatDate(tourPrice.created_at)}</p>
                </div>
              )}
              {tourPrice?.updated_at && (
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
