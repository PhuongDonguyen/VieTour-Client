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
  DollarSign,
  CalendarDays,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AuthContext } from "@/context/authContext";
import { providerTourPriceOverrideService } from "@/services/provider/providerTourPriceOverride.service";
import { adminTourPriceOverrideService } from "@/services/admin/adminTourPriceOverride.service";
import { providerTourApi } from "@/apis/provider/providerTour.api";
import type { TourPriceOverride } from "@/apis/provider/providerTourPriceOverride.api";
import type { AdminTourPriceOverride } from "@/apis/admin/adminTourPriceOverride.api";
import { format } from "date-fns";
import { providerTourPriceService } from "@/services/provider/providerTourPrice.service";

interface TourPriceOverrideViewContentProps {
  overrideId?: string;
  onBack?: () => void;
  showHeader?: boolean;
  onEdit?: (id: number) => void;
}

const TourPriceOverrideViewContent: React.FC<
  TourPriceOverrideViewContentProps
> = ({ overrideId, onBack, showHeader = true, onEdit }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const [priceOverride, setPriceOverride] = useState<
    TourPriceOverride | AdminTourPriceOverride | null
  >(null);
  const [tourInfo, setTourInfo] = useState<{
    title: string;
    poster_url: string;
    category_name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tourIdForView, setTourIdForView] = useState<number | null>(null);

  const actualOverrideId = overrideId;

  console.log("TourPriceOverrideViewContent rendered with:", {
    overrideId,
    actualOverrideId,
    isAdmin,
  });

  // Helper function to get tour information safely
  const getTourInfo = (
    override: TourPriceOverride | AdminTourPriceOverride
  ) => {
    if (override.tour_price?.tour) {
      return {
        title: override.tour_price.tour.title,
        poster_url: override.tour_price.tour.poster_url,
        category_name: override.tour_price.tour.tour_category.name,
      };
    } else if (tourInfo) {
      return tourInfo;
    } else {
      return {
        title: `Tour ID: ${override.tour_price_id}`,
        poster_url: "/public/VieTour-Logo.png",
        category_name: "Chưa phân loại",
      };
    }
  };

  // Load price override data
  useEffect(() => {
    const loadPriceOverrideData = async () => {
      if (!actualOverrideId) return;

      try {
        setLoading(true);
        let overrideData;

        if (user?.role === "admin") {
          // Use admin service to get price override
          overrideData =
            await adminTourPriceOverrideService.getTourPriceOverride(
              parseInt(actualOverrideId)
            );
        } else if (user?.role === "provider") {
          // Use provider service to get price override
          overrideData =
            await providerTourPriceOverrideService.getTourPriceOverrideById(
              parseInt(actualOverrideId)
            );
        } else {
          setPriceOverride(null);
          setTourInfo(null);
          setLoading(false);
          return;
        }

        console.log("Loaded price override data:", overrideData);
        setPriceOverride(overrideData);

        // Fetch tour info if available
        if (overrideData.tour_price?.tour?.id) {
          try {
            let tourRes;
            if (user?.role === "admin") {
              tourRes = await import("@/apis/admin/adminTour.api").then((m) =>
                m.adminTourApi.getTour(overrideData.tour_price.tour.id)
              );
              setTourInfo({
                title: tourRes.data.data.title,
                poster_url: tourRes.data.data.poster_url,
                category_name:
                  tourRes.data.data.tour_category?.name || "Chưa phân loại",
              });
            } else if (user?.role === "provider") {
              tourRes = await providerTourApi.getTourById(
                overrideData.tour_price.tour.id
              );
              setTourInfo({
                title: tourRes.data.data.title,
                poster_url: tourRes.data.data.poster_url,
                category_name:
                  tourRes.data.data.tour_category?.name || "Chưa phân loại",
              });
            } else {
              setTourInfo(null);
            }
          } catch {
            setTourInfo(null);
          }
        } else {
          setTourInfo(null);
        }
      } catch (error) {
        console.error("Error loading price override data:", error);
        console.error("Error details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPriceOverrideData();
  }, [actualOverrideId, user?.role]);

  useEffect(() => {
    if (
      user?.role === "provider" &&
      priceOverride &&
      priceOverride.tour_price_id &&
      !tourIdForView
    ) {
      providerTourPriceService
        .getTourPrice(priceOverride.tour_price_id)
        .then((price) => setTourIdForView(price.tour_id))
        .catch(() => setTourIdForView(null));
    }
  }, [user?.role, priceOverride, tourIdForView]);

  // Ẩn/disable các nút thao tác nếu là admin
  const isReadOnly = isAdmin;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy");
  };

  const getOverrideTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      single_date: "Ngày cụ thể",
      date_range: "Khoảng thời gian",
      day_of_week: "Theo thứ",
    };
    return typeMap[type] || type;
  };

  const getOverrideTypeVariant = (type: string) => {
    const variantMap: {
      [key: string]: "default" | "outline" | "secondary" | "destructive";
    } = {
      single_date: "default",
      date_range: "secondary",
      weekly: "outline",
    };
    return variantMap[type] || "outline";
  };

  const getDateDisplay = (
    override: TourPriceOverride | AdminTourPriceOverride
  ) => {
    if (override.override_type === "single_date" && override.override_date) {
      return formatDate(override.override_date);
    } else if (override.override_type === "weekly" && override.day_of_week) {
      // Map từ tiếng Anh lowercase sang tiếng Việt để hiển thị
      const dayMap: { [key: string]: string } = {
        monday: "Thứ 2",
        tuesday: "Thứ 3",
        wednesday: "Thứ 4",
        thursday: "Thứ 5",
        friday: "Thứ 6",
        saturday: "Thứ 7",
        sunday: "Chủ nhật",
      };
      return (
        dayMap[override.day_of_week] || override.day_of_week || "Không xác định"
      );
    } else if (
      override.override_type === "date_range" &&
      override.start_date &&
      override.end_date
    ) {
      return `${formatDate(override.start_date)} - ${formatDate(
        override.end_date
      )}`;
    }
    return "Không có thông tin";
  };

  // Helper lấy tourId để xem tour (ưu tiên đúng thứ tự provider)
  const getTourIdForView = () => {
    if (!priceOverride) return "";
    // Kiểm tra tồn tại field tour_id trong tour_price
    const tourPrice = priceOverride.tour_price;
    if (tourPrice && typeof tourPrice === "object" && "tour_id" in tourPrice) {
      // @ts-ignore
      return tourPrice.tour_id;
    }
    return tourPrice?.tour?.id || priceOverride.tour_price_id;
  };

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
              Vui lòng chờ trong khi chúng tôi tải thông tin giá đặc biệt.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!priceOverride) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy</h2>
          <p className="text-muted-foreground mb-4">
            Thông tin giá đặc biệt bạn đang tìm không tồn tại.
          </p>
          {onBack ? (
            <Button onClick={onBack}>Quay lại</Button>
          ) : (
            <Button onClick={() => navigate("/admin/tours/price-overrides")}>
              Về danh sách giá đặc biệt
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
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={
              onBack ? onBack : () => navigate("/admin/tours/price-overrides")
            }
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </Button>
          <h1 className="text-3xl font-bold ml-4">
            Chi Tiết Giá Đặc Biệt Tour
          </h1>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin giá */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Thông Tin Giá Đặc Biệt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Loại giá đặc biệt
                  </p>
                  <Badge
                    variant={getOverrideTypeVariant(
                      priceOverride.override_type
                    )}
                  >
                    {getOverrideTypeText(priceOverride.override_type)}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Trạng thái
                  </p>
                  <Badge
                    variant={priceOverride.is_active ? "default" : "secondary"}
                  >
                    {priceOverride.is_active ? (
                      <>
                        <ToggleRight className="w-3 h-3 mr-1" />
                        Hoạt động
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-3 h-3 mr-1" />
                        Tạm dừng
                      </>
                    )}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Thời gian áp dụng
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {getDateDisplay(priceOverride)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    ID giá đặc biệt
                  </p>
                  <p className="font-mono">{priceOverride.id}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Giá người lớn
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(priceOverride.adult_price)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Giá trẻ em
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(priceOverride.kid_price)}
                  </p>
                </div>
              </div>

              {priceOverride.note && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground mb-2">
                      Ghi chú
                    </p>
                    <p className="text-sm bg-muted p-3 rounded-lg">
                      {priceOverride.note}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Thông tin tour */}
          {tourInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Thông Tin Tour
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4 items-center">
                <img
                  src={tourInfo.poster_url}
                  alt={tourInfo.title}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    {tourInfo.title}
                  </h3>
                  <Badge variant="outline">{tourInfo.category_name}</Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    Tour ID: {priceOverride.tour_price?.tour?.id}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isAdmin && (
                <Button
                  onClick={() => {
                    if (onEdit && priceOverride) onEdit(priceOverride.id);
                    else
                      navigate(
                        `/admin/tours/price-overrides/edit/${priceOverride.id}`
                      );
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa chi tiết
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  if (user?.role === "provider") {
                    if (tourIdForView)
                      navigate(`/admin/tours/view/${tourIdForView}`);
                  } else {
                    navigate(`/admin/tours/view/${getTourIdForView()}`);
                  }
                }}
                className="w-full"
                disabled={user?.role === "provider" && !tourIdForView}
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem Tour
              </Button>
            </CardContent>
          </Card>

          {/* Thông tin chi tiết */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Chi Tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Loại:</span>
                <Badge variant="secondary">
                  {getOverrideTypeText(priceOverride.override_type)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Mã:</span>
                <span className="font-medium">{priceOverride.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Tour Price ID:
                </span>
                <span className="font-mono text-xs">
                  {priceOverride.tour_price_id}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Thời gian */}
          <Card>
            <CardHeader>
              <CardTitle>Thời Gian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Áp dụng: {getDateDisplay(priceOverride)}</span>
              </div>
              {isAdmin && (priceOverride as any).created_at && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>
                    Tạo:{" "}
                    {format(
                      new Date((priceOverride as any).created_at),
                      "dd/MM/yyyy HH:mm"
                    )}
                  </span>
                </div>
              )}
              {isAdmin && (priceOverride as any).updated_at && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>
                    Cập nhật:{" "}
                    {format(
                      new Date((priceOverride as any).updated_at),
                      "dd/MM/yyyy HH:mm"
                    )}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TourPriceOverrideViewContent;
