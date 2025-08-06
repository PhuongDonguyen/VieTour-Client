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
  Building,
  Filter,
  DollarSign,
  BarChart3,
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
  LineChart,
  Line,
} from "recharts";
import { statsApi, TopProviderStats, StatsQueryParams } from "@/apis/stats.api";
import { toast } from "sonner";

const COLORS = [
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C80",
  "#8DD1E1",
  "#D084D0",
  "#0088FE",
];

const TopProvidersStats: React.FC = () => {
  const [topProviders, setTopProviders] = useState<TopProviderStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<StatsQueryParams>({ limit: 10 });
  const [showFilters, setShowFilters] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await statsApi.getTopProvidersByRevenue(filters);
      setTopProviders(response.data);
      toast.success("Thống kê nhà cung cấp đã được cập nhật");
    } catch (error) {
      console.error("Error fetching provider stats:", error);
      toast.error("Không thể tải thống kê nhà cung cấp");
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const totalRevenue = topProviders.reduce(
    (sum, provider) => sum + provider.total_revenue,
    0
  );

  const totalProviderRevenue = topProviders.reduce(
    (sum, provider) => sum + provider.provider_revenue,
    0
  );

  const totalAdminRevenue = topProviders.reduce(
    (sum, provider) => sum + provider.admin_revenue,
    0
  );

  const totalBookings = topProviders.reduce(
    (sum, provider) => sum + provider.total_bookings,
    0
  );

  // Prepare data for charts
  const barChartData = topProviders.map((provider, index) => ({
    name:
      provider.company_name.length > 20
        ? provider.company_name.substring(0, 20) + "..."
        : provider.company_name,
    providerRevenue: provider.provider_revenue,
    adminRevenue: provider.admin_revenue,
    bookings: provider.total_bookings,
    fullName: provider.company_name,
  }));

  const pieChartData = topProviders.slice(0, 5).map((provider, index) => ({
    name:
      provider.company_name.length > 15
        ? provider.company_name.substring(0, 15) + "..."
        : provider.company_name,
    value: provider.total_revenue,
    fullName: provider.company_name,
    bookings: provider.total_bookings,
    providerRevenue: provider.provider_revenue,
    adminRevenue: provider.admin_revenue,
  }));

  const lineChartData = topProviders.map((provider, index) => ({
    name:
      provider.company_name.length > 15
        ? provider.company_name.substring(0, 15) + "..."
        : provider.company_name,
    providerRevenue: provider.provider_revenue,
    adminRevenue: provider.admin_revenue,
    bookings: provider.total_bookings,
    fullName: provider.company_name,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thống kê Top Providers</h1>
          <p className="text-muted-foreground">
            Biểu đồ và thống kê về các nhà cung cấp có doanh thu cao nhất
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
            <CardTitle className="text-sm font-medium">
              Tổng Providers
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
              Đặt chỗ từ top providers
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
              {topProviders.length > 0
                ? formatCurrency(Math.round(totalRevenue / topProviders.length))
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Doanh thu/provider</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Biểu đồ cột - Phân bố Doanh thu
            </CardTitle>
            <CardDescription>
              So sánh doanh thu tổng, provider và admin của từng nhà cung cấp
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
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
                    <YAxis
                      label={{
                        value: "Doanh thu (VNĐ)",
                        angle: -90,
                        position: "insideLeft",
                      }}
                      tickFormatter={(value) =>
                        `${(value / 1000000).toFixed(0)}M`
                      }
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        // For bar chart, name comes from dataKey
                        if (name === "providerRevenue") {
                          return [formatCurrency(Number(value)), "Provider"];
                        } else if (name === "adminRevenue") {
                          return [formatCurrency(Number(value)), "Admin"];
                        }
                        return [formatCurrency(Number(value)), "Tổng"];
                      }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const totalRevenue =
                            data.providerRevenue + data.adminRevenue;
                          return (
                            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                              <div className="font-bold text-sm">
                                {data.fullName}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Tổng: {formatCurrency(totalRevenue)}
                              </div>
                              {payload.map((entry, index) => (
                                <div key={index} className="text-xs mt-1">
                                  <span style={{ color: entry.color }}>
                                    {entry.name === "providerRevenue"
                                      ? "Provider"
                                      : "Admin"}
                                    : {formatCurrency(entry.value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          const data = payload[0].payload;
                          const totalRevenue =
                            data.providerRevenue + data.adminRevenue;
                          return (
                            <div className="space-y-1">
                              <div className="font-bold">{data.fullName}</div>
                              <div className="text-xs text-muted-foreground">
                                Tổng: {formatCurrency(totalRevenue)}
                              </div>
                            </div>
                          );
                        }
                        return label;
                      }}
                    />
                    <Bar
                      dataKey="providerRevenue"
                      fill="#F59E0B"
                      name="Provider (95%)"
                      stackId="a"
                    />
                    <Bar
                      dataKey="adminRevenue"
                      fill="#DC2626"
                      name="Admin (5%)"
                      stackId="a"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Revenue Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Biểu đồ tròn - Phân bố Doanh thu
            </CardTitle>
            <CardDescription>
              Tỷ lệ doanh thu của 5 nhà cung cấp hàng đầu
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
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
                      formatter={(value, name) => [
                        formatCurrency(Number(value)),
                        "Tổng doanh thu",
                      ]}
                      labelFormatter={(label) => {
                        const data = pieChartData.find(
                          (item) => item.name === label
                        );
                        return data ? (
                          <div className="space-y-1">
                            <div className="font-bold">{data.fullName}</div>
                            <div className="text-sm">
                              Provider: {formatCurrency(data.providerRevenue)}
                            </div>
                            <div className="text-sm">
                              Admin: {formatCurrency(data.adminRevenue)}
                            </div>
                          </div>
                        ) : (
                          label
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Chart - Revenue vs Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Biểu đồ đường - Doanh thu vs Đặt chỗ
          </CardTitle>
          <CardDescription>
            So sánh mối quan hệ giữa doanh thu và số lượng đặt chỗ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    label={{
                      value: "Doanh thu (VNĐ)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(0)}M`
                    }
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{
                      value: "Số đặt chỗ",
                      angle: 90,
                      position: "insideRight",
                    }}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      // For line chart, name comes from the Line component's name prop
                      if (name === "Provider (95%)") {
                        return [formatCurrency(Number(value)), "Provider"];
                      } else if (name === "Admin (5%)") {
                        return [formatCurrency(Number(value)), "Admin"];
                      } else if (name === "Số đặt chỗ") {
                        return [formatNumber(Number(value)), "Số đặt chỗ"];
                      }
                      return [formatNumber(Number(value)), "Số đặt chỗ"];
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const totalRevenue =
                          data.providerRevenue + data.adminRevenue;
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                            <div className="font-bold text-sm">
                              {data.fullName}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Tổng doanh thu: {formatCurrency(totalRevenue)}
                            </div>
                            {payload.map((entry, index) => (
                              <div key={index} className="text-xs mt-1">
                                <span style={{ color: entry.color }}>
                                  {entry.name === "Provider (95%)"
                                    ? "Provider"
                                    : entry.name === "Admin (5%)"
                                    ? "Admin"
                                    : entry.name}
                                  :{" "}
                                  {entry.name === "Số đặt chỗ"
                                    ? formatNumber(entry.value)
                                    : formatCurrency(entry.value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const data = payload[0].payload;
                        const totalRevenue =
                          data.providerRevenue + data.adminRevenue;
                        return (
                          <div className="space-y-1">
                            <div className="font-bold">{data.fullName}</div>
                            <div className="text-xs text-muted-foreground">
                              Tổng doanh thu: {formatCurrency(totalRevenue)}
                            </div>
                          </div>
                        );
                      }
                      return label;
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="providerRevenue"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    name="Provider (95%)"
                    dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="adminRevenue"
                    stroke="#DC2626"
                    strokeWidth={3}
                    name="Admin (5%)"
                    dot={{ fill: "#DC2626", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#8884D8"
                    strokeWidth={3}
                    name="Số đặt chỗ"
                    dot={{ fill: "#8884D8", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Chi tiết Top Providers
          </CardTitle>
          <CardDescription>
            Danh sách chi tiết các nhà cung cấp có doanh thu cao nhất
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProviders.map((provider, index) => (
              <div
                key={provider.provider_id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">
                      {provider.company_name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(provider.total_bookings)} đặt chỗ
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-semibold text-sm">
                      {formatCurrency(provider.total_revenue)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tổng doanh thu
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      Provider: {formatCurrency(provider.provider_revenue)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Admin: {formatCurrency(provider.admin_revenue)}
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

export default TopProvidersStats;
