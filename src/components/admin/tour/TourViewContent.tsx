import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Star,
  Users,
  Eye,
  Calendar,
  MapPin,
  Clock,
  Building,
  TrendingUp,
  Heart,
  FileText,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import TinyMCEEditor from "@/components/TinyMCEEditor";
import { AuthContext } from "@/context/authContext";
import { providerTourService } from "@/services/provider/providerTour.service";
import { adminTourService } from "@/services/admin/adminTour.service";
import type { ProviderTour } from "@/apis/provider/providerTour.api";
import type { AdminTour } from "@/apis/admin/adminTour.api";
import { providerTourCategoryApi } from "@/apis/provider/providerTourCategory.api";

interface TourViewContentProps {
  tourId?: string;
  onBack?: () => void;
  showHeader?: boolean;
  tourCategories?: { id: number; name: string }[];
}

const TourViewContent: React.FC<TourViewContentProps> = ({
  tourId,
  onBack,
  showHeader = true,
  tourCategories = [],
}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const [tour, setTour] = useState<ProviderTour | AdminTour | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>("Không xác định");

  const actualTourId = tourId || id;

  // Helper functions to normalize data between AdminTour and ProviderTour
  const getTourCapacity = (tour: ProviderTour | AdminTour): number => {
    return "capacity" in tour ? tour.capacity : tour.max_participants || 0;
  };

  const getTourRating = (tour: ProviderTour | AdminTour): number => {
    if ("total_star" in tour) {
      // ProviderTour: calculate average from total_star / review_count
      return tour.review_count > 0 ? tour.total_star / tour.review_count : 0;
    } else {
      // AdminTour: use average_rating directly
      return tour.average_rating || 0;
    }
  };

  const getTourReviewCount = (tour: ProviderTour | AdminTour): number => {
    return "review_count" in tour ? tour.review_count : tour.total_reviews || 0;
  };

  const getTourBookedCount = (tour: ProviderTour | AdminTour): number => {
    return "booked_count" in tour ? tour.booked_count : tour.booking_count || 0;
  };

  const getTourViewCount = (tour: ProviderTour | AdminTour): string => {
    const viewCount = tour.view_count;
    return typeof viewCount === "string"
      ? viewCount
      : viewCount?.toString() || "0";
  };

  const getTourTransportation = (tour: ProviderTour | AdminTour): string => {
    return "transportation" in tour
      ? tour.transportation
      : tour.location || "Không có thông tin";
  };

  const getTourAccommodation = (tour: ProviderTour | AdminTour): string => {
    return "accommodation" in tour ? tour.accommodation : "Không có thông tin";
  };

  const getTourDestinationIntro = (
    tour: ProviderTour | AdminTour
  ): string | null => {
    return "destination_intro" in tour
      ? tour.destination_intro
      : tour.description || null;
  };

  const getTourInfo = (tour: ProviderTour | AdminTour): string | null => {
    return "tour_info" in tour ? tour.tour_info : tour.description || null;
  };

  const getTourLiveCommentary = (
    tour: ProviderTour | AdminTour
  ): string | null => {
    return "live_commentary" in tour ? tour.live_commentary : null;
  };

  const getTourDuration = (tour: ProviderTour | AdminTour): string => {
    if ("duration" in tour) {
      // ProviderTour has duration as string
      return tour.duration as string;
    } else {
      // AdminTour has duration as number
      const adminTour = tour as AdminTour;
      return adminTour.duration
        ? `${adminTour.duration} ngày`
        : "Không có thông tin";
    }
  };

  // Load tour data
  useEffect(() => {
    const loadTourData = async () => {
      if (!actualTourId) return;
      setLoading(true);
      try {
        let tourData;
        if (isAdmin) {
          tourData = await adminTourService.getTour(Number(actualTourId));
          setTour(tourData);
        } else {
          const res = await providerTourService.getTourById(
            Number(actualTourId)
          );
          console.log("Provider tourData", res);
          if (res && typeof res === "object" && "data" in res) {
            setTour(res.data as ProviderTour);
          } else {
            setTour(res as ProviderTour);
          }
        }
      } catch (error) {
        setTour(null);
      } finally {
        setLoading(false);
      }
    };
    loadTourData();
  }, [actualTourId, isAdmin]);

  useEffect(() => {
    if (!tour) return;
    if ((tour as any).tour_category?.name) {
      setCategoryName((tour as any).tour_category.name);
    } else if ((tour as any).tour_category_id) {
      providerTourCategoryApi
        .getCategoryById((tour as any).tour_category_id)
        .then((cat) => setCategoryName(cat?.name || "Không xác định"))
        .catch(() => setCategoryName("Không xác định"));
    } else {
      setCategoryName("Không xác định");
    }
  }, [tour]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Loading Tour...
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Please wait while we load the tour details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Tour Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The tour you're looking for doesn't exist.
          </p>
          {onBack ? (
            <Button onClick={onBack}>Back</Button>
          ) : (
            <Button onClick={() => navigate("/admin/tours")}>
              Back to Tours
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
                onClick={() => navigate("/admin/tours")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Về danh sách tour</span>
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold">{tour.title}</h1>
              <p className="text-muted-foreground">
                Chi tiết Tour • {categoryName}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tour Image */}
          <Card>
            <CardContent className="p-0">
              <img
                src={tour.poster_url}
                alt={tour.title}
                className="w-full h-64 object-cover rounded-t-lg"
              />
            </CardContent>
          </Card>

          {/* Tour Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{getTourCapacity(tour)}</p>
                <p className="text-sm text-muted-foreground">
                  Số lượng người tham gia
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">
                  {getTourRating(tour) > 0
                    ? `${getTourRating(tour).toFixed(1)}/5`
                    : "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Đánh giá ({getTourReviewCount(tour)})
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">
                  {parseInt(getTourViewCount(tour)).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Lượt xem</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">{getTourBookedCount(tour)}</p>
                <p className="text-sm text-muted-foreground">Đặt chỗ</p>
              </CardContent>
            </Card>
          </div>

          {/* Tour Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Thông tin Tour
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Thời gian
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {getTourDuration(tour)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Phương tiện
                  </p>
                  <p className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {getTourTransportation(tour)}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Lưu trú
                  </p>
                  <p className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {getTourAccommodation(tour)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destination Introduction */}
          {getTourDestinationIntro(tour) && (
            <Card>
              <CardHeader>
                <CardTitle>Giới thiệu điểm đến</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-foreground [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>p]:mb-3 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-3 [&>li]:mb-1 [&>strong]:font-semibold [&>em]:italic [&>a]:text-primary [&>a]:underline [&>a]:hover:text-primary/80 [&>blockquote]:border-l-4 [&>blockquote]:border-border [&>blockquote]:pl-4 [&>blockquote]:my-3 [&>blockquote]:italic [&>blockquote]:text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: getTourDestinationIntro(tour) || "",
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Tour Details */}
          {getTourInfo(tour) && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-foreground [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mb-2 [&>p]:mb-3 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-3 [&>li]:mb-1 [&>strong]:font-semibold [&>em]:italic [&>a]:text-primary [&>a]:underline [&>a]:hover:text-primary/80 [&>blockquote]:border-l-4 [&>blockquote]:border-border [&>blockquote]:pl-4 [&>blockquote]:my-3 [&>blockquote]:italic [&>blockquote]:text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: getTourInfo(tour) || "",
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
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isAdmin && (
                <Button
                  onClick={() => navigate(`/admin/tours/edit/${tour.id}`)}
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa Tour
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/admin/tours/prices?tour_id=${tour.id}`)
                }
                className="w-full"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Quản lý giá
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/admin/tours/details?tour_id=${tour.id}`)
                }
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Quản lý chi tiết tour
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/admin/tours/schedules?tour_id=${tour.id}`)
                }
                className="w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Quản lý lịch trình
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/admin/tours/images?tour_id=${tour.id}`)
                }
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Quản lý ảnh
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigate(`/admin/tours/price-overrides?tour_id=${tour.id}`);
                }}
              >
                <Tag className="w-4 h-4 mr-2" />
                Quản lý ghi đè giá
              </Button>
            </CardContent>
          </Card>

          {/* Tour Details */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin Tour</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Danh mục:</span>
                <Badge variant="secondary">{categoryName}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Mã Tour:</span>
                <span className="font-medium">{tour.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Đường dẫn:
                </span>
                <span className="font-mono text-xs">
                  {tour.slug || "Không có đường dẫn"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Lượt xem</span>
                  <span className="font-medium">
                    {parseInt(getTourViewCount(tour)).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (parseInt(getTourViewCount(tour)) / 1000) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Đặt chỗ</span>
                  <span className="font-medium">
                    {getTourBookedCount(tour)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (getTourBookedCount(tour) / 100) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Đánh giá</span>
                  <span className="font-medium">
                    {getTourRating(tour) > 0
                      ? `${getTourRating(tour).toFixed(1)}/5`
                      : "N/A"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${(getTourRating(tour) / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Tour đang hoạt động</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>
                  Cập nhật lần cuối: {new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Ngày tạo: {new Date().toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TourViewContent;
