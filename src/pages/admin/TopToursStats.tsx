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
  MapPin,
  Filter,
  BarChart3,
  DollarSign,
  List,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { statsApi, TopTourStats, StatsQueryParams } from "@/apis/stats.api";
import { toast } from "sonner";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C80",
  "#8DD1E1",
  "#D084D0",
];

const TopToursStats: React.FC = () => {
  const [topTours, setTopTours] = useState<TopTourStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<StatsQueryParams>({ limit: 10 });
  const [showFilters, setShowFilters] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await statsApi.getTopToursByBookings(filters);
      setTopTours(response.data);
      toast.success("Thống kê tour đã được cập nhật");
    } catch (error) {
      console.error("Error fetching tour stats:", error);
      toast.error("Không thể tải thống kê tour");
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
    setFilters({ limit: 10 });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(num);
  };

  const totalBookings = topTours.reduce(
    (sum, tour) => sum + tour.booking_count,
    0
  );

  const totalRevenue = topTours.reduce(
    (sum, tour) => sum + tour.total_revenue,
    0
  );

  const totalProviderRevenue = topTours.reduce(
    (sum, tour) => sum + tour.provider_revenue,
    0
  );

  const totalAdminRevenue = topTours.reduce(
    (sum, tour) => sum + tour.admin_revenue,
    0
  );

  // Prepare data for charts
  const barChartData = topTours.map((tour, index) => ({
    name:
      tour.tour_title.length > 20
        ? tour.tour_title.substring(0, 20) + "..."
        : tour.tour_title,
    bookings: tour.booking_count,
    revenue: tour.total_revenue,
    provider: tour.provider_name,
    fullName: tour.tour_title,
  }));

  const pieChartData = topTours.slice(0, 5).map((tour, index) => ({
    name:
      tour.tour_title.length > 15
        ? tour.tour_title.substring(0, 15) + "..."
        : tour.tour_title,
    value: tour.booking_count,
    fullName: tour.tour_title,
    provider: tour.provider_name,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thống kê Top Tours</h1>
          <p className="text-muted-foreground">
            Biểu đồ và thống kê về các tour có nhiều đặt chỗ nhất
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
                  value={filters.limit || 10}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">Tổng Đặt chỗ</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
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
              Doanh thu từ top tours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trung bình</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topTours.length > 0
                ? formatNumber(Math.round(totalBookings / topTours.length))
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Đặt chỗ/tour</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Biểu đồ cột - Top Tours
            </CardTitle>
            <CardDescription>Số lượng đặt chỗ theo từng tour</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      formatNumber(Number(value)),
                      "Đặt chỗ",
                    ]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return `${payload[0].payload.fullName} - ${payload[0].payload.provider}`;
                      }
                      return label;
                    }}
                  />
                  <Bar dataKey="bookings" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Biểu đồ tròn - Top 5 Tours
            </CardTitle>
            <CardDescription>Phân bố đặt chỗ theo tour</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      formatNumber(Number(value)),
                      "Đặt chỗ",
                    ]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullName;
                      }
                      return label;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Chi tiết Top Tours
          </CardTitle>
          <CardDescription>
            Danh sách chi tiết các tour có nhiều đặt chỗ nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topTours.map((tour, index) => (
              <div
                key={tour.tour_id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{tour.tour_title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {tour.provider_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-semibold text-sm">
                      {formatNumber(tour.booking_count)} đặt chỗ
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(tour.total_revenue)} doanh thu
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      Provider: {formatCurrency(tour.provider_revenue)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Admin: {formatCurrency(tour.admin_revenue)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopToursStats;
