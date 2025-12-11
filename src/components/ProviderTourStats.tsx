import React, { useEffect, useState } from 'react';
import { getProviderTourStats, ProviderTourStat } from '../apis/providerRevenue.api';
import { getProviderCategoryStats, ProviderCategoryStat } from '../apis/providerRevenue.api';
import { getProviderWeeklyStats, ProviderWeeklyStat } from '../apis/providerRevenue.api';
import { getProviderDailyStats, ProviderDailyStat } from '../apis/providerRevenue.api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Separator } from './ui/separator';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Loading } from './Loading';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

interface ProviderTourStatsProps {
  providerId: number;
}

type ViewMode = 'tour' | 'weekday' | 'category' | 'date';

export const ProviderTourStats: React.FC<ProviderTourStatsProps> = ({ providerId }) => {
  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [data, setData] = useState<ProviderTourStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tour'); // Mặc định là 'tour'
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [statType, setStatType] = useState('tour');
  const [categoryData, setCategoryData] = useState<ProviderCategoryStat[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [weeklyData, setWeeklyData] = useState<ProviderWeeklyStat[]>([]);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyError, setWeeklyError] = useState<string | null>(null);
  const [dailyData, setDailyData] = useState<ProviderDailyStat[]>([]);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProviderTourStats(
        providerId,
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );
      console.log("res tour: ", res.data.data);
      setData(res.data.data);
    } catch (err) {
      setError('Không thể tải dữ liệu thống kê.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (statType === 'category') {
      setCategoryLoading(true);
      setCategoryError(null);
      getProviderCategoryStats(providerId, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))
        .then(res => setCategoryData(res.data.data))
        .catch(() => setCategoryError('Không thể tải dữ liệu danh mục.'))
        .finally(() => setCategoryLoading(false));
    }
    if (statType === 'weekday') {
      setWeeklyLoading(true);
      setWeeklyError(null);
      getProviderWeeklyStats(providerId, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))
        .then(res => setWeeklyData(res.data.data))
        .catch(() => setWeeklyError('Không thể tải dữ liệu ngày trong tuần.'))
        .finally(() => setWeeklyLoading(false));
    }
    if (statType === 'daily') {
      setDailyLoading(true);
      setDailyError(null);
      getProviderDailyStats(providerId, format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'))
        .then(res => setDailyData(res.data.data))
        .catch(() => setDailyError('Không thể tải dữ liệu hàng ngày.'))
        .finally(() => setDailyLoading(false));
    }
    // eslint-disable-next-line
  }, [statType, providerId, startDate, endDate]);

  // Group dữ liệu theo loại thống kê
  const groupData = () => {
    if (statType === 'tour') {
      return Object.values(
        data.reduce((acc, cur) => {
          if (!acc[cur.tour_id]) {
            acc[cur.tour_id] = { ...cur, total_revenue: Number(cur.total_revenue), total_bookings: cur.total_bookings };
          } else {
            acc[cur.tour_id].total_revenue += Number(cur.total_revenue);
            acc[cur.tour_id].total_bookings += cur.total_bookings;
          }
          return acc;
        }, {} as Record<number, any>)
      );
    }
    if (statType === 'category') {
      return categoryData.map(item => ({
        ...item,
        total_revenue: Number(item.total_revenue),
        total_bookings: item.total_bookings,
        tour_count: item.tour_count,
      }));
    }
    if (statType === 'weekday') {
      return weeklyData.map(item => ({
        ...item,
        total_revenue: Number(item.total_revenue),
        total_bookings: item.total_bookings,
      }));
    }
    if (statType === 'daily') {
      return dailyData.map(item => ({
        ...item,
        total_revenue: Number(item.total_revenue),
        total_bookings: item.total_bookings,
      }));
    }
    return [];
  };
  const grouped = groupData();

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#d8854f'];

  // Render biểu đồ theo loại thống kê
  const renderChart = () => {
    if (!grouped || grouped.length === 0) return <div className="text-center text-muted-foreground py-8">Không có dữ liệu để hiển thị biểu đồ</div>;
    if (statType === 'tour') {
      // Lọc bỏ những tour có doanh thu bằng 0
      const filteredData = grouped.filter((item: any) => Number(item.total_revenue) > 0);
      if (filteredData.length === 0) return <div className="text-center text-muted-foreground py-8">Không có dữ liệu để hiển thị biểu đồ</div>;
      
      // Tính số ký tự tối đa mỗi dòng dựa trên số lượng tour
      // Giả sử container width tối thiểu 400px, trừ margin (60+30=90) = 310px
      // Mỗi ký tự khoảng 8-10px, nên số ký tự = (310 / số tour) / 8
      const tourCount = filteredData.length;
      const estimatedChartWidth = 310; // 400 - 60 (left) - 30 (right)
      const charWidth = 8; // Ước lượng chiều rộng mỗi ký tự
      const maxCharsPerLine = Math.max(15, Math.floor((estimatedChartWidth / tourCount) / charWidth));
      
      // Hàm chia text thành nhiều dòng
      const splitTextIntoLines = (text: string): string[] => {
        if (!text || text.trim().length === 0) return [text];
        if (text.length <= maxCharsPerLine) return [text];
        const words = text.split(' ').filter(w => w.length > 0);
        if (words.length === 0) return [text];
        
        const lines: string[] = [];
        let currentLine = '';
        words.forEach(word => {
          const testLine = currentLine ? currentLine + ' ' + word : word;
          if (testLine.length <= maxCharsPerLine) {
            currentLine = testLine;
          } else {
            if (currentLine) {
              lines.push(currentLine);
            }
            // Nếu từ đơn lẻ dài hơn maxCharsPerLine, vẫn phải thêm vào
            currentLine = word.length > maxCharsPerLine ? word.substring(0, maxCharsPerLine) : word;
          }
        });
        if (currentLine) {
          lines.push(currentLine);
        }
        // Đảm bảo luôn có ít nhất 1 dòng
        return lines.length > 0 ? lines : [text];
      };
      
      // Custom tick component để render text xuống dòng
      const CustomTick = ({ x, y, payload }: any) => {
        if (!payload || !payload.value) return null;
        const title = payload.value.toString().trim();
        if (!title) return null;
        
        const lines = splitTextIntoLines(title);
        const lineHeight = 14;
        
        // Đảm bảo luôn có ít nhất 1 dòng để hiển thị
        const displayLines = lines.length > 0 ? lines : [title];
        
        return (
          <g transform={`translate(${x},${y})`}>
            {displayLines.map((line, index) => (
              <text
                key={index}
                x={0}
                y={0}
                dy={index * lineHeight + 14}
                textAnchor="middle"
                fill="#666"
                fontSize={12}
              >
                {line}
              </text>
            ))}
          </g>
        );
      };
      
      return (
        <ResponsiveContainer width="100%" height={480} minWidth={400}>
          <BarChart data={filteredData} margin={{ top: 0, right: 30, left: 60, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="tour_title" 
              height={100}
              interval={0}
              tick={<CustomTick />}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={v => Number(v).toLocaleString('vi-VN')}
              width={80}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={v => Math.round(Number(v)).toLocaleString('vi-VN')}
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.ceil(dataMax) + 1]}
              width={80}
            />
            <Tooltip 
              formatter={(value: any, name: string) => {
                if (name === 'Doanh thu') {
                  return [Number(value).toLocaleString('vi-VN') + ' ₫', name];
                }
                if (name === 'Số lượt đặt') {
                  return [Number(value).toLocaleString('vi-VN') + ' lượt', name];
                }
                if (name === 'Số tour') {
                  return [Number(value).toLocaleString('vi-VN') + ' tour', name];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="total_revenue" name="Doanh thu" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="total_bookings" name="Số lượt đặt" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (statType === 'category') {
      return (
        <ResponsiveContainer width="100%" height={480} minWidth={400}>
          <BarChart data={grouped} margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category_name" tickFormatter={v => v?.toString().trim()} />
            <YAxis
              yAxisId="left"
              tickFormatter={v => Number(v).toLocaleString('vi-VN')}
              width={80}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={v => Math.round(Number(v)).toLocaleString('vi-VN')}
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.ceil(dataMax) + 1]}
              width={80}
            />
            <Tooltip 
              formatter={(value: any, name: string) => {
                if (name === 'Doanh thu') {
                  return [Number(value).toLocaleString('vi-VN') + ' ₫', name];
                }
                if (name === 'Số lượt đặt') {
                  return [Math.round(Number(value)).toLocaleString('vi-VN') + ' lượt', name];
                }
                if (name === 'Số tour') {
                  return [Number(value).toLocaleString('vi-VN') + ' tour', name];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="total_revenue" name="Doanh thu" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="total_bookings" name="Số lượt đặt" fill="#22c55e" />
            <Bar yAxisId="right" dataKey="tour_count" name="Số tour" fill="#ffc658" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (statType === 'weekday') {
      return (
        <ResponsiveContainer width="100%" height={480} minWidth={400}>
          <BarChart data={grouped} margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day_name" tickFormatter={v => v?.toString().trim()} />
            <YAxis
              yAxisId="left"
              tickFormatter={v => Number(v).toLocaleString('vi-VN')}
              width={80}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={v => Math.round(Number(v)).toLocaleString('vi-VN')}
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.ceil(dataMax) + 1]}
              width={80}
            />
            <Tooltip 
              formatter={(value: any, name: string) => {
                if (name === 'Doanh thu') {
                  return [Number(value).toLocaleString('vi-VN') + ' ₫', name];
                }
                if (name === 'Số lượt đặt') {
                  return [Math.round(Number(value)).toLocaleString('vi-VN') + ' lượt', name];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="total_revenue" name="Doanh thu" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="total_bookings" name="Số lượt đặt" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    if (statType === 'daily') {
      return (
        <ResponsiveContainer width="100%" height={480} minWidth={400}>
          <BarChart data={grouped} margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="booking_date" tickFormatter={v => v?.toString().trim()} />
            <YAxis
              yAxisId="left"
              tickFormatter={v => Number(v).toLocaleString('vi-VN')}
              width={80}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={v => Math.round(Number(v)).toLocaleString('vi-VN')}
              allowDecimals={false}
              domain={[0, (dataMax: number) => Math.ceil(dataMax) + 1]}
              width={80}
            />
            <Tooltip 
              formatter={(value: any, name: string) => {
                if (name === 'Doanh thu') {
                  return [Number(value).toLocaleString('vi-VN') + ' ₫', name];
                }
                if (name === 'Số lượt đặt') {
                  return [Math.round(Number(value)).toLocaleString('vi-VN') + ' lượt', name];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="total_revenue" name="Doanh thu" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="total_bookings" name="Số lượt đặt" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  // Định nghĩa các loại thống kê, chỉ enable 'tour' nếu API chỉ trả về dữ liệu theo tour
  const STAT_TYPES = [
    { key: 'tour', label: 'Theo tour', enabled: true },
    { key: 'category', label: 'Theo loại tour', enabled: true },
    { key: 'weekday', label: 'Theo ngày trong tuần', enabled: true },
    { key: 'daily', label: 'Hàng ngày', enabled: true },
  ];

  return (
    <Card className="mx-6 overflow-visible -mt-6 mb-6">
      <CardHeader>
        <CardTitle className="text-xl">Thống kê doanh thu</CardTitle>
        <CardDescription>
          <Button
            size="sm"
            variant="outline"
            className="mb-2"
            onClick={() => setShowDatePicker(v => !v)}
          >
            {showDatePicker ? "Ẩn chọn ngày" : "Chọn khoảng ngày"}
          </Button>
          {showDatePicker && (
            <div className="flex flex-wrap gap-4 items-end mb-4">
              <div>
                <label className="text-xs block mb-1">Từ ngày</label>
                <CalendarComponent mode="single" selected={startDate} onSelect={d => d && setStartDate(d)} className="rounded-md border" />
              </div>
              <div>
                <label className="text-xs block mb-1">Đến ngày</label>
                <CalendarComponent mode="single" selected={endDate} onSelect={d => d && setEndDate(d)} className="rounded-md border" />
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {STAT_TYPES.map(type => (
              <Button
                key={type.key}
                variant={statType === type.key ? 'default' : 'outline'}
                onClick={() => type.enabled && setStatType(type.key)}
                disabled={!type.enabled}
              >
                {type.label}
              </Button>
            ))}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Separator className="mb-4" />
        <div className="mb-2 text-sm text-muted-foreground">
          Khoảng thời gian: <span className="font-semibold">{format(startDate, 'dd/MM/yyyy', { locale: vi })}</span> đến <span className="font-semibold">{format(endDate, 'dd/MM/yyyy', { locale: vi })}</span>
        </div>
        <div className="flex gap-2 mb-2">
          <Button variant={showChart ? 'default' : 'outline'} onClick={() => setShowChart(true)}>Biểu đồ</Button>
          <Button variant={!showChart ? 'default' : 'outline'} onClick={() => setShowChart(false)}>Bảng</Button>
        </div>
        {statType === 'daily' && dailyLoading ? (
          <Loading />
        ) : statType === 'daily' && dailyError ? (
          <div className="text-red-500">{dailyError}</div>
        ) : statType === 'weekday' && weeklyLoading ? (
          <Loading />
        ) : statType === 'weekday' && weeklyError ? (
          <div className="text-red-500">{weeklyError}</div>
        ) : statType === 'category' && categoryLoading ? (
          <Loading />
        ) : statType === 'category' && categoryError ? (
          <div className="text-red-500">{categoryError}</div>
        ) : loading ? (
          <Loading />
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : showChart ? (
          renderChart()
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  {statType === 'tour' && <th className="border px-2 py-1">Tour</th>}
                  {statType === 'tour' && <th className="border px-2 py-1">Đánh giá</th>}
                  {statType === 'tour' && <th className="border px-2 py-1">Số review</th>}
                  {statType === 'category' && <th className="border px-2 py-1">Danh mục</th>}
                  {statType === 'category' && <th className="border px-2 py-1">Số tour</th>}
                  {statType === 'weekday' && <th className="border px-2 py-1">Thứ</th>}
                  {statType === 'daily' && <th className="border px-2 py-1">Ngày</th>}
                  <th className="border px-2 py-1">Doanh thu</th>
                  <th className="border px-2 py-1">Số lượt đặt</th>
                </tr>
              </thead>
              <tbody>
                {(statType === 'tour' 
                  ? grouped.filter((row: any) => Number(row.total_revenue) > 0)
                  : grouped
                ).map((row: any, idx: number) => (
                  <tr key={idx}>
                    {statType === 'tour' && <td className="border px-2 py-1">{row.tour_title}</td>}
                    {statType === 'tour' && <td className="border px-2 py-1">{row.tour_rating}</td>}
                    {statType === 'tour' && <td className="border px-2 py-1">{row.review_count}</td>}
                    {statType === 'category' && <td className="border px-2 py-1">{row.category_name}</td>}
                    {statType === 'category' && <td className="border px-2 py-1">{row.tour_count}</td>}
                    {statType === 'weekday' && <td className="border px-2 py-1">{row.day_name}</td>}
                    {statType === 'daily' && <td className="border px-2 py-1">{row.booking_date}</td>}
                    <td className="border px-2 py-1">{Number(row.total_revenue).toLocaleString('vi-VN')} ₫</td>
                    <td className="border px-2 py-1">{row.total_bookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderTourStats;