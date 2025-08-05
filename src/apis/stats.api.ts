import axiosInstance from './axiosInstance';

export interface RevenueDataPoint {
  month: string;
  total_revenue: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  averageMonthlyRevenue: number;
  monthsCount: number;
}

export interface RevenueStatsResponse {
  success: boolean;
  data: {
    data: RevenueDataPoint[];
    summary: RevenueSummary;
  };
}

// Custom date range revenue stats
export const getCustomDateRangeRevenue = async (startDate: string, endDate: string): Promise<RevenueStatsResponse> => {
  const response = await axiosInstance.get(`/api/stats/revenue?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// Current year revenue stats
export const getCurrentYearRevenue = async (): Promise<RevenueStatsResponse> => {
  const response = await axiosInstance.get('/api/stats/revenue/current-year');
  return response.data;
};

// Last 12 months revenue stats
export const getLast12MonthsRevenue = async (): Promise<RevenueStatsResponse> => {
  const response = await axiosInstance.get('/api/stats/revenue/last-12-months');
  return response.data;
}; 