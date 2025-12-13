import React, { useState, useEffect, useContext } from "react";
import { ProviderRevenueStatsWrapper } from "../../components/ProviderRevenueStatsWrapper";
import RevenueChartOld from "../../components/admin/RevenueChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, TrendingUp, Filter, RefreshCw } from "lucide-react";
import { statsApi, TopTourStats, TopProviderStats } from "@/apis/stats.api";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/authContext";
import RevenueAdmin from "@/components/admin/stat/RevenueAdmin";
import RevenueChart from "@/components/admin/stat/RevenueChart";

const AdminDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";
  const isProvider = user?.role === "provider";
  const [topTours, setTopTours] = useState<TopTourStats[]>([]);
  const [topProviders, setTopProviders] = useState<TopProviderStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [toursFilters, setToursFilters] = useState({
    limit: 5,
    start_date: "",
    end_date: "",
  });
  const [providersFilters, setProvidersFilters] = useState({
    limit: 5,
    start_date: "",
    end_date: "",
  });
  const [showToursFilters, setShowToursFilters] = useState(false);
  const [showProvidersFilters, setShowProvidersFilters] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [toursResponse, providersResponse] = await Promise.all([
        statsApi.getTopToursByBookings(toursFilters),
        statsApi.getTopProvidersByRevenue(providersFilters),
      ]);
      setTopTours(toursResponse.data);
      setTopProviders(providersResponse.data);
      // console.log(toursResponse.data);
      // console.log(providersResponse.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  const fetchToursStats = async () => {
    setLoading(true);
    try {
      const response = await statsApi.getTopToursByBookings(toursFilters);
      setTopTours(response.data);
      toast.success("Thống kê tour đã được cập nhật");
    } catch (error) {
      console.error("Error fetching tour stats:", error);
      toast.error("Không thể tải thống kê tour");
    } finally {
      setLoading(false);
    }
  };

  const fetchProvidersStats = async () => {
    setLoading(true);
    try {
      const response = await statsApi.getTopProvidersByRevenue(
        providersFilters
      );
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
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, toursFilters, providersFilters]);

  const handleToursFilterChange = (key: string, value: string | number) => {
    setToursFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleProvidersFilterChange = (key: string, value: string | number) => {
    setProvidersFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetToursFilters = () => {
    setToursFilters({ limit: 5, start_date: "", end_date: "" });
  };

  const resetProvidersFilters = () => {
    setProvidersFilters({ limit: 5, start_date: "", end_date: "" });
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

  // Format Y-axis labels for millions
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    }
    return value.toString();
  };

  // Split text into lines for chart labels
  const splitTextIntoLines = (text: string, maxWidth: number = 90): string[] => {
    if (!text) return [""];
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      // Estimate width: ~7px per character for font size 11
      const estimatedWidth = testLine.length * 7;

      if (estimatedWidth <= maxWidth && currentLine) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length > 0 ? lines : [text];
  };

  // Custom Tick Component for multi-line labels
  const CustomTick = ({ x, y, payload }: any) => {
    const title = payload?.value?.toString().trim() || "";
    const lines = splitTextIntoLines(title, 90);
    const lineHeight = 13;

    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line, index) => (
          <text
            key={index}
            x={0}
            y={0}
            dy={index * lineHeight + 14}
            textAnchor="middle"
            fill="#4b5563"
            fontSize={11}
            fontWeight={400}
          >
            {line}
          </text>
        ))}
      </g>
    );
  };

  // Prepare chart data
  const toursChartData = topTours.map((tour, index) => ({
    name: tour.tour_title, // Use full name, will wrap if needed
    bookings: tour.booking_count,
    fullName: tour.tour_title,
  }));

  const providersChartData = topProviders.map((provider) => {
    return {
      nameKey: `${provider.provider_id || provider.company_name}`,
      name: provider.company_name, // Use full name, will wrap if needed
      revenue: provider.total_revenue,
      providerRevenue: provider.provider_revenue,
      adminRevenue: provider.admin_revenue,
      fullName: provider.company_name,
    };
  });

  return (
    <>
      {isProvider && <ProviderRevenueStatsWrapper />}

      {/* Revenue Chart */}
      {/* {isAdmin && (
        <div className="pt-6 px-6">
          <RevenueChartOld className="mb-6" />
        </div>
      )} */}

      {
        isAdmin && (
          <div className="pt-6 px-6">
            <RevenueAdmin />
          </div>
        )
      }

      {
        isAdmin && (
          <div className="pt-6 px-6">
            <RevenueChart />
          </div>
        )
      }

      {/* Statistics Grid - Top Tours & Providers */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 px-6 pb-6">
          {/* Top Tours by Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Top tour theo lượt đặt
              </CardTitle>
              <CardDescription>
                Top 5 tour có nhiều đặt chỗ nhất
              </CardDescription>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowToursFilters(!showToursFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                </Button>
                <Button size="sm" onClick={fetchToursStats} disabled={loading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Làm mới
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showToursFilters && (
                <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tours-start-date">Từ ngày</Label>
                      <Input
                        id="tours-start-date"
                        type="date"
                        value={toursFilters.start_date || ""}
                        onChange={(e) =>
                          handleToursFilterChange("start_date", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="tours-end-date">Đến ngày</Label>
                      <Input
                        id="tours-end-date"
                        type="date"
                        value={toursFilters.end_date || ""}
                        onChange={(e) =>
                          handleToursFilterChange("end_date", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="tours-limit">Số lượng hiển thị</Label>
                      <Input
                        id="tours-limit"
                        type="number"
                        value={toursFilters.limit}
                        onChange={(e) =>
                          handleToursFilterChange(
                            "limit",
                            parseInt(e.target.value) || 5
                          )
                        }
                        min="1"
                        max="20"
                      />
                    </div>
                  </div>
                  <div className="flex items-end gap-2 mt-4">
                    <Button
                      onClick={resetToursFilters}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Đặt lại
                    </Button>
                    <Button
                      onClick={() => setShowToursFilters(false)}
                      variant="ghost"
                      size="sm"
                    >
                      Đóng
                    </Button>
                  </div>
                </div>
              )}
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Chart */}
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={toursChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          height={80}
                          interval={0}
                          tick={<CustomTick />}
                          stroke="#6b7280"
                        />
                        <YAxis
                          tickFormatter={(v) =>
                            Math.round(Number(v)).toLocaleString("vi-VN")
                          }
                          allowDecimals={false}
                          domain={[0, (dataMax: number) => Math.ceil(dataMax) + 1]}
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            Math.round(Number(value)).toLocaleString("vi-VN"),
                            "Số đặt chỗ",
                          ]}
                          labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                              return payload[0].payload.fullName;
                            }
                            return label;
                          }}
                        />
                        <Bar dataKey="bookings" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Detailed List */}
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Providers by Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Top nhà cung cấp theo doanh thu
              </CardTitle>
              <CardDescription>
                Top 5 nhà cung cấp có doanh thu cao nhất
              </CardDescription>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProvidersFilters(!showProvidersFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Bộ lọc
                </Button>
                <Button
                  size="sm"
                  onClick={fetchProvidersStats}
                  disabled={loading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Làm mới
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showProvidersFilters && (
                <div className="mb-4 p-4 border rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="providers-start-date">Từ ngày</Label>
                      <Input
                        id="providers-start-date"
                        type="date"
                        value={providersFilters.start_date || ""}
                        onChange={(e) =>
                          handleProvidersFilterChange(
                            "start_date",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="providers-end-date">Đến ngày</Label>
                      <Input
                        id="providers-end-date"
                        type="date"
                        value={providersFilters.end_date || ""}
                        onChange={(e) =>
                          handleProvidersFilterChange(
                            "end_date",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="providers-limit">Số lượng hiển thị</Label>
                      <Input
                        id="providers-limit"
                        type="number"
                        value={providersFilters.limit}
                        onChange={(e) =>
                          handleProvidersFilterChange(
                            "limit",
                            parseInt(e.target.value) || 5
                          )
                        }
                        min="1"
                        max="20"
                      />
                    </div>
                  </div>
                  <div className="flex items-end gap-2 mt-4">
                    <Button
                      onClick={resetProvidersFilters}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Đặt lại
                    </Button>
                    <Button
                      onClick={() => setShowProvidersFilters(false)}
                      variant="ghost"
                      size="sm"
                    >
                      Đóng
                    </Button>
                  </div>
                </div>
              )}
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Chart */}
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={providersChartData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          height={80}
                          interval={0}
                          tick={<CustomTick />}
                          stroke="#6b7280"
                        />
                        <YAxis tickFormatter={formatYAxis} />
                        <Tooltip
                          formatter={(value, name) => [
                            formatCurrency(Number(value)),
                            name === "providerRevenue"
                              ? "Provider Revenue"
                              : name === "adminRevenue"
                              ? "Admin Revenue"
                              : name,
                          ]}
                          labelFormatter={(_, payload) => {
                            if (payload && payload[0]) {
                              return payload[0].payload.fullName;
                            }
                            return "";
                          }}
                        />
                        <Bar
                          dataKey="providerRevenue"
                          name="Provider Revenue"
                          fill="#10b981"
                        />
                        <Bar
                          dataKey="adminRevenue"
                          name="Admin Revenue"
                          fill="#ef4444"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Detailed List */}
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
                            Thực nhận:{" "}
                            {formatCurrency(
                              provider.provider_revenue
                            )}
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
