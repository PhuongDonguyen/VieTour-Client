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
import { DollarSign, TrendingDown } from "lucide-react";
import { statsService } from "@/services/stats.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

type FilterType = "year" | "month" | "yearRange";

const RevenueBarChart: React.FC = () => {
  const [filterType, setFilterType] = useState<FilterType>("year");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear() - 4);
  const [endYear, setEndYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let params: { year?: number; month?: number; startYear?: number; endYear?: number } = {};

      if (filterType === "year") {
        params = { year: selectedYear };
      } else if (filterType === "month") {
        params = { year: selectedYear, month: selectedMonth };
      } else if (filterType === "yearRange") {
        params = { startYear, endYear };
      }

      const response = await statsService.getBookingRevenueTimeseries(params);
      if (response.success) {
        // Transform data for chart
        const chartData = response.data.map((item) => ({
          period: item.period_value,
          total_revenue: item.total_revenue,
          revenue_refunded: item.revenue_refunded,
        }));
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
  }, [filterType, selectedYear, selectedMonth, startYear, endYear]);

  const formatCurrency = (amount: number) => {
    return statsService.formatCurrency(amount);
  };

  const formatPeriod = (period: string, periodType?: string) => {
    if (periodType === "day") {
      // Format: "2025-08-15" -> "15/08"
      const [year, month, day] = period.split("-");
      return `${day}/${month}`;
    } else if (periodType === "month") {
      // Format: "2025-01" -> "T1/2025"
      const [year, month] = period.split("-");
      return `T${month}/${year}`;
    } else {
      // Format: "2025" -> "2025"
      return period;
    }
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
            Thống Kê Doanh Thu (Biểu Đồ Cột)
          </CardTitle>
          <CardDescription>
            Phân tích doanh thu và doanh thu hoàn tiền theo thời gian
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Lọc theo:</span>
              <Select
                value={filterType}
                onValueChange={(value: FilterType) => setFilterType(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Năm</SelectItem>
                  <SelectItem value="month">Tháng/Năm</SelectItem>
                  <SelectItem value="yearRange">Khoảng năm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filterType === "year" && (
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

            {filterType === "month" && (
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

            {filterType === "yearRange" && (
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
              {/* Bar Chart */}
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={data} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="period"
                      tickFormatter={(value) => formatPeriod(value, periodType)}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="total_revenue" name="Số tiền đã nhận" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="revenue_refunded" name="Số tiền đã hoàn lại" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Số tiền đã nhận
                        </p>
                        <p className="text-2xl font-bold mt-1">
                          {formatCurrency(
                            data.reduce((sum, item) => sum + item.total_revenue, 0)
                          )}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Số tiền đã hoàn lại
                        </p>
                        <p className="text-2xl font-bold mt-1 text-red-600">
                          {formatCurrency(
                            data.reduce((sum, item) => sum + item.revenue_refunded, 0)
                          )}
                        </p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-500" />
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

export default RevenueBarChart;

