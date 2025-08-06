import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { getLast12MonthsRevenue, getCurrentYearRevenue, type RevenueStatsResponse } from '@/apis/stats.api';

interface RevenueChartProps {
  className?: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ className }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'12months' | '6months'>('12months');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [summary, setSummary] = useState<{
    totalRevenue: number;
    averageMonthlyRevenue: number;
    monthsCount: number;
  } | null>(null);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response: RevenueStatsResponse;
      
      if (timeRange === '12months') {
        response = await getLast12MonthsRevenue();
      } else {
        // For 6 months, we'll use current year and filter to last 6 months
        response = await getCurrentYearRevenue();
      }
      
      if (response.success) {
        let chartData = response.data.data;
        
        // If 6 months is selected, take only the last 6 months
        if (timeRange === '6months') {
          chartData = chartData.slice(-6);
        }
        
        // Transform data for better display
        const transformedData = chartData.map((item, index) => ({
          name: item.month,
          revenue: item.total_revenue,
          formattedRevenue: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
          }).format(item.total_revenue),
        }));
        
        setData(transformedData);
        setSummary(response.data.summary);
      } else {
        setError('Không thể tải dữ liệu doanh thu');
      }
    } catch (err) {
             setError('Lỗi khi tải dữ liệu doanh thu');
      console.error('Error fetching revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-primary font-semibold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Phân Tích Doanh Thu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Đang tải dữ liệu doanh thu...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Phân Tích Doanh Thu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive mb-2">{error}</p>
              <Button onClick={fetchRevenueData} variant="outline" size="sm">
                Thử lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Phân Tích Doanh Thu
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={(value: '12months' | '6months') => setTimeRange(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6months">6 Tháng</SelectItem>
                <SelectItem value="12months">12 Tháng</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={(value: 'line' | 'bar') => setChartType(value)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Đường</SelectItem>
                <SelectItem value="bar">Cột</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {summary && (
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Tổng: {formatCurrency(summary.totalRevenue)}
            </Badge>
            <Badge variant="outline">
              TB/Tháng: {formatCurrency(summary.averageMonthlyRevenue)}
            </Badge>
            <Badge variant="outline">
              Kỳ: {summary.monthsCount} tháng
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="revenue" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart; 