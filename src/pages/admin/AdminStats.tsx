import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  MapPin,
  Building,
  Filter,
} from "lucide-react";
import {
  statsApi,
  TopTourStats,
  TopProviderStats,
  StatsQueryParams,
} from "@/apis/stats.api";
import { toast } from "sonner";

const AdminStats: React.FC = () => {
  const [topTours, setTopTours] = useState<TopTourStats[]>([]);
  const [topProviders, setTopProviders] = useState<TopProviderStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<StatsQueryParams>({ limit: 5 });
  const [showFilters, setShowFilters] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [toursResponse, providersResponse] = await Promise.all([
        statsApi.getTopToursByBookings(filters),
        statsApi.getTopProvidersByRevenue(filters),
      ]);
      setTopTours(toursResponse.data);
      setTopProviders(providersResponse.data);
      toast.success("Thống kê đã được cập nhật");
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const handleFilterChange = (
    key: keyof StatsQueryParams,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({ limit: 5 });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const totalBookings = topTours.reduce(
    (sum, tour) => sum + tour.booking_count,
    0
  );
  const totalRevenue = topProviders.reduce(
    (sum, provider) => sum + provider.total_revenue,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thống kê</h1>
          <p className="text-muted-foreground">
            Xem thống kê về tour và nhà cung cấp hàng đầu
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Bộ lọc
          </Button>
          <Button onClick={fetchStats} disabled={loading}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Bộ lọc thống kê
            </CardTitle>
            <CardDescription>
              Tùy chỉnh khoảng thời gian và số lượng kết quả
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="startDate">Từ ngày</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="endDate">Đến ngày</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="limit">Số lượng kết quả</Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  max="100"
                  value={filters.limit || 5}
                  onChange={(e) =>
                    handleFilterChange("limit", parseInt(e.target.value))
                  }
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="flex-1"
                >
                  Đặt lại
                </Button>
                <Button onClick={() => setShowFilters(false)} variant="ghost">
                  Đóng
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Tour</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topTours.length}</div>
            <p className="text-xs text-muted-foreground">
              Tour trong danh sách
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Nhà cung cấp
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topProviders.length}</div>
            <p className="text-xs text-muted-foreground">
              Nhà cung cấp trong danh sách
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Đặt chỗ</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalBookings)}
            </div>
            <p className="text-xs text-muted-foreground">
              Đặt chỗ từ top tours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng Doanh thu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Doanh thu từ top providers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Tours by Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Tour hàng đầu theo đặt chỗ
            </CardTitle>
            <CardDescription>Những tour có nhiều đặt chỗ nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {topTours.map((tour, index) => (
                  <div
                    key={tour.tour_id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Badge
                      variant="secondary"
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      #{index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <img
                          src={tour.poster_url || "/avatar-default.jpg"}
                          alt={tour.tour_title}
                          className="w-12 h-8 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {tour.tour_title}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {tour.provider_name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatNumber(tour.booking_count)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        đặt chỗ
                      </div>
                    </div>
                  </div>
                ))}
                {topTours.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Không có dữ liệu
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Providers by Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Nhà cung cấp hàng đầu theo doanh thu
            </CardTitle>
            <CardDescription>
              Những nhà cung cấp có doanh thu cao nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {topProviders.map((provider, index) => (
                  <div
                    key={provider.provider_id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Badge
                      variant="secondary"
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      #{index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <img
                          src={provider.avatar || "/avatar-default.jpg"}
                          alt={provider.company_name}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {provider.company_name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(provider.total_bookings)} đặt chỗ
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(provider.total_revenue)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        TB:{" "}
                        {formatCurrency(provider.average_revenue_per_booking)}
                      </div>
                    </div>
                  </div>
                ))}
                {topProviders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Không có dữ liệu
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;
