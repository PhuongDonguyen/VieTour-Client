import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, TrendingDown, BarChart3, TrendingUp } from "lucide-react";
import { statsService } from "@/services/stats.service";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ChartType = "bar" | "line";
type TimeFilterType = "year" | "month" | "day";

const RevenueChart: React.FC = () => {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [timeFilterType, setTimeFilterType] = useState<TimeFilterType>("year");
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [endYear, setEndYear] = useState<number>(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let params: { year?: number; month?: number; startYear?: number; endYear?: number } = {};

      if (timeFilterType === "year") {
        // Theo năm: từ năm nào đến năm nào
        params = { startYear, endYear };
      } else if (timeFilterType === "month") {
        // Theo tháng: chỉ chọn 1 năm (hiển thị 12 tháng)
        params = { year: selectedYear };
      } else if (timeFilterType === "day") {
        // Theo ngày: chỉ chọn tháng và năm
        params = { year: selectedYear, month: selectedMonth };
      }

      const response = await statsService.getBookingRevenueTimeseries(params);
      if (response.success) {
        let chartData = response.data.map((item) => ({
          period: item.period_value,
          revenue: item.total_revenue - item.revenue_refunded, // Doanh thu = số tiền đã nhận - số tiền đã hoàn
          period_type: item.period_type,
        }));

        // If filtering by year (from startYear to endYear), fill missing years with 0
        if (timeFilterType === "year") {
          const dataMap = new Map<string, { period: string; revenue: number; period_type: "year" | "month" | "day" }>(
            chartData.map((item) => [item.period, { ...item, period_type: "year" as const }])
          );
          const filledData: { period: string; revenue: number; period_type: "year" | "month" | "day" }[] = [];

          for (let year = startYear; year <= endYear; year++) {
            const period = year.toString();
            
            if (dataMap.has(period)) {
              const item = dataMap.get(period);
              if (item) {
                filledData.push(item);
              }
            } else {
              filledData.push({
                period,
                revenue: 0,
                period_type: "year",
              });
            }
          }

          chartData = filledData;
        }

        // If filtering by month (selectedYear), fill missing months with 0
        if (timeFilterType === "month") {
          const dataMap = new Map<string, { period: string; revenue: number; period_type: "year" | "month" | "day" }>(
            chartData.map((item) => [item.period, { ...item, period_type: item.period_type || "month" }])
          );
          const filledData: { period: string; revenue: number; period_type: "year" | "month" | "day" }[] = [];

          for (let month = 1; month <= 12; month++) {
            const monthStr = month.toString().padStart(2, "0");
            const period = `${selectedYear}-${monthStr}`;
            
            if (dataMap.has(period)) {
              const item = dataMap.get(period);
              if (item) {
                filledData.push(item);
              }
            } else {
              filledData.push({
                period,
                revenue: 0,
                period_type: "month",
              });
            }
          }

          chartData = filledData;
        }

        // If filtering by day (selectedMonth and selectedYear), fill missing days with 0
        if (timeFilterType === "day") {
          const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
          const dataMap = new Map<string, { period: string; revenue: number; period_type: "year" | "month" | "day" }>(
            chartData.map((item) => [item.period, { ...item, period_type: item.period_type || "day" }])
          );
          const filledData: { period: string; revenue: number; period_type: "year" | "month" | "day" }[] = [];

          for (let day = 1; day <= daysInMonth; day++) {
            const dayStr = day.toString().padStart(2, "0");
            const monthStr = selectedMonth.toString().padStart(2, "0");
            const period = `${selectedYear}-${monthStr}-${dayStr}`;
            
            if (dataMap.has(period)) {
              const item = dataMap.get(period);
              if (item) {
                filledData.push(item);
              }
            } else {
              filledData.push({
                period,
                revenue: 0,
                period_type: "day",
              });
            }
          }

          chartData = filledData;
        }

        setData(chartData);
      } else {
        setError("Không thể tải dữ liệu");
      }
    } catch (err) {
      console.error("Error fetching revenue timeseries:", err);
      setError("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeFilterType, selectedYear, selectedMonth, startYear, endYear]);

  const formatCurrency = (amount: number) => {
    return statsService.formatCurrency(amount);
  };

  // Format large numbers for Y-axis (e.g., 1000000 -> 1M)
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const formatPeriod = (period: string, periodType?: string) => {
    if (periodType === "day" || (period.includes("-") && period.split("-").length === 3)) {
      // Format: "2025-08-15" -> chỉ hiển thị số ngày "15"
      const [year, month, day] = period.split("-");
      return day;
    } else if (periodType === "month" || (period.includes("-") && period.split("-").length === 2)) {
      // Format: "2025-01" -> "T1/2025"
      const [year, month] = period.split("-");
      return `T${month}`;
    } else {
      // Format: "2025" -> "2025"
      return period;
    }
  };

  // Get month name for display
  const getMonthName = () => {
    if (timeFilterType === "day") {
      const monthNames = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
      ];
      return monthNames[selectedMonth - 1];
    }
    return null;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Generate years list (current year and 5 years back)
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  // Generate days for selected month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // Get period type from first data point if available
  const periodType = data.length > 0 ? 
    (data[0].period.includes("-") && data[0].period.split("-").length === 3 ? "day" :
     data[0].period.includes("-") ? "month" : "year") : "month";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Thống Kê Doanh Thu
          </CardTitle>
          <CardDescription>
            {timeFilterType === "year" ? (
              <>Phân tích doanh thu theo thời gian - Từ năm {startYear} đến năm {endYear}</>
            ) : timeFilterType === "month" ? (
              <>Phân tích doanh thu theo thời gian - Năm {selectedYear}</>
            ) : getMonthName() ? (
              <>Phân tích doanh thu theo thời gian - {getMonthName()} {selectedYear}</>
            ) : (
              <>Phân tích doanh thu theo thời gian</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Chart Type Selection */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium">Loại biểu đồ:</span>
            <div className="flex gap-2">
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("bar")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Cột
              </Button>
              <Button
                variant={chartType === "line" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("line")}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Đường
              </Button>
            </div>
          </div>

          {/* Time Filter Selection */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="text-sm font-medium">Thời gian:</span>
            <div className="flex gap-2">
              <Button
                variant={timeFilterType === "year" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilterType("year")}
              >
                Năm
              </Button>
              <Button
                variant={timeFilterType === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilterType("month")}
              >
                Tháng
              </Button>
              <Button
                variant={timeFilterType === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFilterType("day")}
              >
                Ngày
              </Button>
            </div>

            {/* Year Range Selection (for "year" filter) */}
            {timeFilterType === "year" && (
              <>
                <Select
                  value={startYear.toString()}
                  onValueChange={(value) => setStartYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Từ năm" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">→</span>
                <Select
                  value={endYear.toString()}
                  onValueChange={(value) => setEndYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Đến năm" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {/* Year Selection (for "month" filter) */}
            {timeFilterType === "month" && (
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Month and Year Selection (for "day" filter) */}
            {timeFilterType === "day" && (
              <>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            <Button onClick={fetchData} variant="outline" size="sm">
              Làm mới
            </Button>
          </div>

          {loading && (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-muted-foreground">Đang tải dữ liệu...</div>
            </div>
          )}

          {error && (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-destructive mb-2">{error}</p>
                <Button onClick={fetchData} variant="outline" size="sm">
                  Thử lại
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && data.length > 0 && (
            <div className="space-y-6">
              {/* Chart */}
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart 
                      data={data} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        tickFormatter={(value) => formatPeriod(value, periodType)}
                        height={80}
                      />
                      <YAxis tickFormatter={(value) => formatYAxis(value)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="revenue" name="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart 
                      data={data} 
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="period"
                        tickFormatter={(value) => formatPeriod(value, periodType)}
                        height={80}
                      />
                      <YAxis tickFormatter={(value) => formatYAxis(value)} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name="Doanh thu"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Summary Card */}
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Doanh thu
                        </p>
                        <p className="text-2xl font-bold mt-1">
                          {formatCurrency(
                            data.reduce((sum, item) => sum + item.revenue, 0)
                          )}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div className="h-[400px] flex items-center justify-center">
              <div className="text-muted-foreground">Không có dữ liệu</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueChart;

