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
import { fetchTourById } from "@/services/tour.service";
import type { Tour } from "@/apis/tour.api";

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

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>("Không xác định");

  const actualTourId = tourId || id;

  // Helper functions to normalize data
  const getTourCapacity = (tour: Tour): number => {
    return tour.capacity || 0;
  };

  const getTourRating = (tour: Tour): number => {
    if (tour.total_star && tour.review_count && tour.review_count > 0) {
      return tour.total_star / tour.review_count;
    }
    return 0;
  };

  const getTourReviewCount = (tour: Tour): number => {
    return tour.review_count || 0;
  };

  const getTourBookedCount = (tour: Tour): number => {
    return tour.booked_count || 0;
  };

  const getTourViewCount = (tour: Tour): string => {
    const viewCount = tour.view_count;
    return typeof viewCount === "string"
      ? viewCount
      : viewCount?.toString() || "0";
  };

  const getTourTransportation = (tour: Tour): string => {
    return tour.transportation || "Không có thông tin";
  };

  const getTourAccommodation = (tour: Tour): string => {
    return tour.accommodation || "Không có thông tin";
  };

  const getTourDestinationIntro = (tour: Tour): string | null => {
    return tour.destination_intro || null;
  };

  const getTourInfo = (tour: Tour): string | null => {
    return tour.tour_info || null;
  };

  const getTourLiveCommentary = (tour: Tour): string | null => {
    return tour.live_commentary || null;
  };

  const getTourDuration = (tour: Tour): string => {
    return tour.duration ? `${tour.duration} ngày` : "Không có thông tin";
  };

  // Load tour data
  useEffect(() => {
    const loadTourData = async () => {
      if (!actualTourId) return;
      setLoading(true);
      try {
        const tourData = await fetchTourById(Number(actualTourId));
        console.log("Tour data", tourData);
        setTour(tourData);
      } catch (error) {
        setTour(null);
      } finally {
        setLoading(false);
      }
    };
    loadTourData();
  }, [actualTourId]);

  useEffect(() => {
    if (!tour) return;
    if (tour.tour_category?.name) {
      setCategoryName(tour.tour_category.name);
    } else if (tour.tour_category_id) {
      setCategoryName(`Category ${tour.tour_category_id}`);
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
                variant="default"
                onClick={onBack}
                className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={() => navigate("/admin/tours")}
                className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
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
                    Địa điểm
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {tour.starting_point || "Chưa cập nhật"}
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
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/admin/general-questions?tour_id=${tour.id}`)
                }
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Câu hỏi thường gặp
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
                <span className="text-sm text-muted-foreground">Địa điểm:</span>
                <span className="font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {tour.starting_point || "Chưa cập nhật"}
                </span>
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
