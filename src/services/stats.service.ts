import { 
  getCustomDateRangeRevenue, 
  getCurrentYearRevenue, 
  getLast12MonthsRevenue,
  type RevenueStatsResponse 
} from '../apis/stats.api';

export const statsService = {
  // Get custom date range revenue stats
  getCustomDateRangeRevenue: async (startDate: string, endDate: string): Promise<RevenueStatsResponse> => {
    try {
      return await getCustomDateRangeRevenue(startDate, endDate);
    } catch (error) {
      console.error('Error fetching custom date range revenue:', error);
      throw error;
    }
  },

  // Get current year revenue stats
  getCurrentYearRevenue: async (): Promise<RevenueStatsResponse> => {
    try {
      return await getCurrentYearRevenue();
    } catch (error) {
      console.error('Error fetching current year revenue:', error);
      throw error;
    }
  },

  // Get last 12 months revenue stats
  getLast12MonthsRevenue: async (): Promise<RevenueStatsResponse> => {
    try {
      return await getLast12MonthsRevenue();
    } catch (error) {
      console.error('Error fetching last 12 months revenue:', error);
      throw error;
    }
  },

  // Format currency
  formatCurrency: (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Format large numbers with K, M, B suffixes
  formatLargeNumber: (num: number): string => {
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
  },

  // Calculate percentage change
  calculatePercentageChange: (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  },

  // Get month name from YYYY-MM format
  getMonthName: (monthString: string): string => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
  }
}; 