import { 
  getCustomDateRangeRevenue, 
  getCurrentYearRevenue, 
  getLast12MonthsRevenue,
  getRevenueSummary,
  getBookingRevenueTimeseries,
  type RevenueStatsResponse,
  type RevenueSummaryResponse,
  type TimeseriesResponse,
  type TimeseriesQueryParams,
  statsApi,
  TopTourStats,
  TopProviderStats,
  StatsQueryParams,
} from '../apis/stats.api';

export interface StatsService {
  getCustomDateRangeRevenue: (startDate: string, endDate: string) => Promise<RevenueStatsResponse>;
  getCurrentYearRevenue: () => Promise<RevenueStatsResponse>;
  getLast12MonthsRevenue: () => Promise<RevenueStatsResponse>;
  getRevenueSummary: (params?: StatsQueryParams) => Promise<RevenueSummaryResponse>;
  getBookingRevenueTimeseries: (params?: TimeseriesQueryParams) => Promise<TimeseriesResponse>;
  getTopToursByBookings: (params?: StatsQueryParams) => Promise<TopTourStats[]>;
  getTopProvidersByRevenue: (params?: StatsQueryParams) => Promise<TopProviderStats[]>;
  formatCurrency: (amount: number) => string;
  formatLargeNumber: (num: number) => string;
  calculatePercentageChange: (current: number, previous: number) => number;
  getMonthName: (monthString: string) => string;
}

class StatsServiceImpl implements StatsService {
  // Get custom date range revenue stats
  async getCustomDateRangeRevenue(startDate: string, endDate: string): Promise<RevenueStatsResponse> {
    try {
      return await getCustomDateRangeRevenue(startDate, endDate);
    } catch (error) {
      console.error('Error fetching custom date range revenue:', error);
      throw error;
    }
  }

  // Get current year revenue stats
  async getCurrentYearRevenue(): Promise<RevenueStatsResponse> {
    try {
      return await getCurrentYearRevenue();
    } catch (error) {
      console.error('Error fetching current year revenue:', error);
      throw error;
    }
  }

  // Get last 12 months revenue stats
  async getLast12MonthsRevenue(): Promise<RevenueStatsResponse> {
    try {
      return await getLast12MonthsRevenue();
    } catch (error) {
      console.error('Error fetching last 12 months revenue:', error);
      throw error;
    }
  }

  // Get revenue summary (total, success, refunded revenue and bookings)
  async getRevenueSummary(params?: StatsQueryParams): Promise<RevenueSummaryResponse> {
    try {
      return await getRevenueSummary(params);
    } catch (error) {
      console.error('Error fetching revenue summary:', error);
      throw error;
    }
  }

  // Get booking revenue timeseries
  async getBookingRevenueTimeseries(params?: TimeseriesQueryParams): Promise<TimeseriesResponse> {
    try {
      return await getBookingRevenueTimeseries(params);
    } catch (error) {
      console.error('Error fetching booking revenue timeseries:', error);
      throw error;
    }
  }

  async getTopToursByBookings(
    params?: StatsQueryParams
  ): Promise<TopTourStats[]> {
    try {
      const response = await statsApi.getTopToursByBookings(params);
      return response.data;
    } catch (error) {
      console.error("Error fetching top tours by bookings:", error);
      throw error;
    }
  }

  async getTopProvidersByRevenue(
    params?: StatsQueryParams
  ): Promise<TopProviderStats[]> {
    try {
      const response = await statsApi.getTopProvidersByRevenue(params);
      return response.data;
    } catch (error) {
      console.error("Error fetching top providers by revenue:", error);
      throw error;
    }
  }
  

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Format large numbers with K, M, B suffixes
  formatLargeNumber(num: number): string {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  // Calculate percentage change
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  // Get month name from YYYY-MM format
  getMonthName(monthString: string): string {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
  }
}

export const statsService = new StatsServiceImpl();
