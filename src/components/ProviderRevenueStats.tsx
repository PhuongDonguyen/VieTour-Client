import React, { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  ChevronDown,
  Filter,
  RefreshCw,
  PieChart,
  CalendarDays,
  MapPin,
} from "lucide-react";
import {
  getProviderRevenueByDateRange,
  ProviderRevenueData,
  getProviderMonthlyRevenue,
  ProviderMonthlyRevenue,
  getProviderTourStats,
  ProviderTourStat,
  getProviderCategoryStats,
  ProviderCategoryStat,
  getProviderWeeklyStats,
  ProviderWeeklyStat,
  getProviderDailyStats,
  ProviderDailyStat,
} from "../apis/providerRevenue.api";
import { Loading } from "./Loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Calendar as CalendarComponent } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  format,
  subDays,
  subWeeks,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";



export const ProviderRevenueStats: React.FC = () => {
  const [data, setData] = useState<ProviderRevenueData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [monthlyData, setMonthlyData] = useState<ProviderMonthlyRevenue[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  const fetchData = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getProviderRevenueByDateRange(
        format(startDate, "yyyy-MM-dd"),
        format(endDate, "yyyy-MM-dd")
      );
      console.log("response danh thu: ", response.data);
      setData(response.data.data);
    } catch (err) {
      setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
      console.error("Error fetching revenue stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    setMonthlyLoading(true);
    setMonthlyError(null);
    try {
      const response = await getProviderMonthlyRevenue(
        selectedYear
      );
      setMonthlyData(response.data.data);
    } catch (err) {
      setMonthlyError("Không thể tải dữ liệu doanh thu theo tháng.");
    } finally {
      setMonthlyLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedYear]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "blue",
    subtitle,
    trend,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    subtitle?: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full bg-${color}-100/50`}>
          <Icon className={`w-4 h-4 text-${color}-600`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp
              className={`w-3 h-3 mr-1 ${
                trend.isPositive ? "text-green-500" : "text-red-500"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const BookingStatusCard = ({
    title,
    count,
    rate,
    icon: Icon,
    color,
  }: {
    title: string;
    count: number;
    rate: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }) => (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full bg-${color}-100/50`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-lg font-bold">{formatNumber(count)}</p>
            <Badge variant="secondary" className="mt-1">
              {rate}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <BarChart3 className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchData} variant="outline">
          Thử lại
        </Button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Date Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="text-2xl">Thống kê doanh thu</CardTitle>
              <CardDescription>
                Từ{" "}
                {startDate && format(startDate, "dd/MM/yyyy", { locale: vi })}{" "}
                đến {endDate && format(endDate, "dd/MM/yyyy", { locale: vi })}
              </CardDescription>
            </div>

            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Chọn khoảng thời gian</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Từ ngày:
                      </label>
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        className="rounded-md border"
                      />
                    </div>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Đến ngày:
                      </label>
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        className="rounded-md border"
                      />
                    </div>
                    <Button
                      onClick={() => setIsDatePickerOpen(false)}
                      className="w-full"
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
      </Card>

      {/* Biểu đồ doanh thu theo tháng */}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(data.total_revenue)}
          icon={DollarSign}
          color="green"
          subtitle="Tổng thu nhập trong khoảng thời gian"
        />
        <StatCard
          title="Doanh thu thực nhận (95%)"
          value={formatCurrency(Math.round(Number(data.total_revenue) * 0.95))}
          icon={DollarSign}
          color="green"
          subtitle="Sau phí nền tảng"
        />

        <StatCard
          title="Số lượt đặt tour"
          value={formatNumber(data.total_bookings) + ' lượt'}
          icon={Users}
          color="blue"
          subtitle="Tổng số lượt đặt tour của khách hàng"
        />

        <StatCard
          title="Số chuyến đi"
          value={formatNumber(data.total_schedules) + ' chuyến'}
          icon={TrendingUp}
          color="purple"
          subtitle="Tổng số chuyến đi"
        />

        <StatCard
          title="Tổng số người tham gia"
          value={formatNumber(data.total_participants)}
          icon={BarChart3}
          color="orange"
          subtitle="Tổng số người tham gia"
        />
      </div>

      {/* Booking Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BookingStatusCard
          title="Đặt tour thành công"
          count={data.success_bookings}
          rate={data.success_rate}
          icon={CheckCircle}
          color="green"
        />

        <BookingStatusCard
          title="Đặt tour thất bại"
          count={data.fail_bookings}
          rate={data.fail_rate}
          icon={XCircle}
          color="red"
        />

        <BookingStatusCard
          title="Đặt tour chờ xử lý"
          count={data.pending_bookings}
          rate={data.pending_rate}
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Tour Activity Stats */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Thống kê hoạt động tour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tour đang hoạt động:</span>
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                  {formatNumber(data.active_tours)} / {formatNumber(data.total_tours)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tour không hoạt động:</span>
                <Badge variant="destructive">
                  {formatNumber(data.inactive_tours)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tỷ lệ hoạt động:</span>
                <Badge variant="secondary">
                  {data.tour_activity_rate}%
                </Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tỷ lệ thành công:</span>
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                  {data.success_rate}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tỷ lệ thất bại:</span>
                <Badge variant="destructive">
                  {data.fail_rate}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tỷ lệ chờ xử lý:</span>
                <Badge variant="outline" className="border-yellow-200 text-yellow-700">
                  {data.pending_rate}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Summary */}
      {/* <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Tóm tắt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="flex items-start">
              <span className="mr-2">•</span>
              Trong khoảng thời gian từ{" "}
              {startDate &&
                format(startDate, "dd/MM/yyyy", { locale: vi })} đến{" "}
              {endDate && format(endDate, "dd/MM/yyyy", { locale: vi })}, bạn đã
              có{" "}
              <Badge variant="outline" className="mx-1">
                {formatNumber(data.total_bookings)}
              </Badge>{" "}
              lượt đặt tour với tổng doanh thu{" "}
              <Badge variant="default" className="mx-1">
                {formatCurrency(data.total_revenue)}
              </Badge>
              .
            </p>
            <p className="flex items-start">
              <span className="mr-2">•</span>
              Trung bình mỗi đặt tour có giá trị{" "}
              <Badge variant="secondary" className="mx-1">
                {formatCurrency(data.average_booking_value)}
              </Badge>
              .
            </p>
            <p className="flex items-start">
              <span className="mr-2">•</span>
              Tỷ lệ thành công đạt{" "}
              <Badge
                variant="default"
                className="mx-1 bg-green-100 text-green-800 hover:bg-green-100"
              >
                {data.success_rate}%
              </Badge>{" "}
              với{" "}
              <Badge variant="outline" className="mx-1">
                {formatNumber(data.success_bookings)}
              </Badge>{" "}
              đặt tour thành công.
            </p>
            <p className="flex items-start">
              <span className="mr-2">•</span>
              Hiện có{" "}
              <Badge variant="outline" className="mx-1">
                {formatNumber(data.active_tours)}/
                {formatNumber(data.total_tours)}
              </Badge>{" "}
              tour đang hoạt động (tỷ lệ hoạt động:{" "}
              <Badge variant="secondary" className="mx-1">
                {data.tour_activity_rate}%
              </Badge>
              ).
            </p>
          </div>
        </CardContent>
      </Card> */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="text-xl">
                Biểu đồ doanh thu theo tháng
              </CardTitle>
              <CardDescription>
                Năm
                <select
                  className="ml-2 border rounded px-2 py-1"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent style={{ height: 350 }}>
          {monthlyLoading ? (
            <Loading />
          ) : monthlyError ? (
            <div className="text-red-500">{monthlyError}</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month_name" tickFormatter={(m) => m.trim()} />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => Number(v).toLocaleString("vi-VN")}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) =>
                    Math.round(Number(v)).toLocaleString("vi-VN")
                  }
                  allowDecimals={false}
                  domain={[0, (dataMax: number) => Math.ceil(dataMax) + 1]}
                />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "Doanh thu") {
                      return [
                        Number(value).toLocaleString("vi-VN") + " ₫",
                        name,
                      ];
                    } else {
                      return [
                        Math.round(Number(value)).toLocaleString("vi-VN") +
                          " lượt",
                        name,
                      ];
                    }
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="total_revenue"
                  name="Doanh thu"
                  fill="#8884d8"
                />
                <Bar
                  yAxisId="right"
                  dataKey="total_bookings"
                  name="Số lượt đặt"
                  fill="#22c55e"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
