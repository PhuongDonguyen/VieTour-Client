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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DollarSign,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { statsService } from "@/services/stats.service";
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

type FilterType = "year" | "month" | "range";

const RevenueAdmin: React.FC = () => {
  const [filterType, setFilterType] = useState<FilterType>("year");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [startDate, setStartDate] = useState<Date | undefined>(startOfYear(new Date()));
  const [endDate, setEndDate] = useState<Date | undefined>(endOfYear(new Date()));
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    total_revenue: number;
    revenue_refunded: number;
  } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let params: { startDate?: string; endDate?: string } = {};

      if (filterType === "year") {
        const yearStart = startOfYear(new Date(selectedYear, 0, 1));
        const yearEnd = endOfYear(new Date(selectedYear, 0, 1));
        params = {
          startDate: format(yearStart, "yyyy-MM-dd"),
          endDate: format(yearEnd, "yyyy-MM-dd"),
        };
      } else if (filterType === "month") {
        const monthStart = startOfMonth(new Date(selectedYear, selectedMonth - 1, 1));
        const monthEnd = endOfMonth(new Date(selectedYear, selectedMonth - 1, 1));
        params = {
          startDate: format(monthStart, "yyyy-MM-dd"),
          endDate: format(monthEnd, "yyyy-MM-dd"),
        };
      } else if (filterType === "range") {
        if (startDate && endDate) {
          params = {
            startDate: format(startDate, "yyyy-MM-dd"),
            endDate: format(endDate, "yyyy-MM-dd"),
          };
        } else {
          setError("Vui lòng chọn khoảng thời gian");
          setLoading(false);
          return;
        }
      }

      const response = await statsService.getRevenueSummary(params);
      if (response.success) {
        setData({
          total_revenue: response.data.total_revenue,
          revenue_refunded: response.data.revenue_refunded,
        });
      } else {
        setError("Không thể tải dữ liệu");
      }
    } catch (err) {
      console.error("Error fetching revenue summary:", err);
      setError("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, selectedYear, selectedMonth]);

  useEffect(() => {
    if (filterType === "range" && startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);

  const formatCurrency = (amount: number) => {
    return statsService.formatCurrency(amount);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Doanh Thu Admin
          </CardTitle>
          <CardDescription>
            Phân tích doanh thu theo thời gian
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
                  <SelectItem value="range">Khoảng thời gian</SelectItem>
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

            {filterType === "range" && (
              <>
                <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "dd/MM/yyyy", { locale: vi })
                      ) : (
                        <span>Từ ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setIsStartDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "dd/MM/yyyy", { locale: vi })
                      ) : (
                        <span>Đến ngày</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setIsEndDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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

          {!loading && !error && data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Số tiền đã nhận
                        </p>
                      <p className="text-2xl font-bold mt-1">
                        {formatCurrency(data.total_revenue)}
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
                        {formatCurrency(data.revenue_refunded)}
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueAdmin;

