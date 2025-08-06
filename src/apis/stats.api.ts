import axiosInstance from "./axiosInstance";

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
export const getCustomDateRangeRevenue = async (
  startDate: string,
  endDate: string
): Promise<RevenueStatsResponse> => {
  const response = await axiosInstance.get(
    `/api/stats/revenue?startDate=${startDate}&endDate=${endDate}`
  );
  return response.data;
};

// Current year revenue stats
export const getCurrentYearRevenue =
  async (): Promise<RevenueStatsResponse> => {
    const response = await axiosInstance.get("/api/stats/revenue/current-year");
    return response.data;
  };

// Last 12 months revenue stats
export const getLast12MonthsRevenue =
  async (): Promise<RevenueStatsResponse> => {
    const response = await axiosInstance.get(
      "/api/stats/revenue/last-12-months"
    );
    return response.data;
  };

export interface TopTourStats {
  tour_id: number;
  tour_title: string;
  poster_url: string;
  provider_id: number;
  provider_name: string;
  booking_count: number;
  total_revenue: number;
  provider_revenue: number;
  admin_revenue: number;
}

export interface TopProviderStats {
  provider_id: number;
  company_name: string;
  avatar: string;
  provider_revenue: number;
  admin_revenue: number;
  total_revenue: number;
  total_bookings: number;
  average_revenue_per_booking: number;
}

export interface StatsSummary {
  totalTours?: number;
  totalBookings?: number;
  totalProviders?: number;
  totalRevenue?: number;
  totalProviderRevenue?: number;
  totalAdminRevenue?: number;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface TopToursResponse {
  data: TopTourStats[];
  summary: StatsSummary;
}

export interface TopProvidersResponse {
  data: TopProviderStats[];
  summary: StatsSummary;
}

export interface StatsQueryParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// Helper function to safely convert any numeric value to number
const safeNumberConversion = (value: any): number => {
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (typeof value === "string") {
    return parseFloat(value) || 0;
  }
  if (typeof value === "number") {
    return value;
  }
  return 0;
};

export const statsApi = {
  // Get top tours by bookings
  getTopToursByBookings: async (
    params?: StatsQueryParams
  ): Promise<TopToursResponse> => {
    try {
      const response = await axiosInstance.get("/api/stats/top-tours", {
        params,
      });

      // Safely convert and validate the response data
      const rawData = response.data?.data?.data || response.data?.data || [];
      const data = rawData.map((tour: any) => ({
        tour_id: safeNumberConversion(tour.tour_id),
        tour_title: tour.tour_title || "",
        poster_url: tour.poster_url || "",
        provider_id: safeNumberConversion(tour.provider_id),
        provider_name: tour.provider_name || "",
        booking_count: safeNumberConversion(tour.booking_count),
        total_revenue: safeNumberConversion(tour.total_revenue),
        provider_revenue: safeNumberConversion(tour.provider_revenue),
        admin_revenue: safeNumberConversion(tour.admin_revenue),
      }));

      return {
        data,
        summary: response.data?.data?.summary || {},
      };
    } catch (error) {
      console.error("Error in getTopToursByBookings:", error);
      throw error;
    }
  },

  // Get top providers by revenue
  getTopProvidersByRevenue: async (
    params?: StatsQueryParams
  ): Promise<TopProvidersResponse> => {
    try {
      const response = await axiosInstance.get("/api/stats/top-providers", {
        params,
      });

      // Safely convert and validate the response data
      const rawData = response.data?.data?.data || response.data?.data || [];
      const data = rawData.map((provider: any) => ({
        provider_id: safeNumberConversion(provider.provider_id),
        company_name: provider.company_name || "",
        avatar: provider.avatar || "",
        provider_revenue: safeNumberConversion(provider.provider_revenue),
        admin_revenue: safeNumberConversion(provider.admin_revenue),
        total_revenue: safeNumberConversion(provider.total_revenue),
        total_bookings: safeNumberConversion(provider.total_bookings),
        average_revenue_per_booking: safeNumberConversion(
          provider.average_revenue_per_booking
        ),
      }));

      return {
        data,
        summary: response.data?.data?.summary || {},
      };
    } catch (error) {
      console.error("Error in getTopProvidersByRevenue:", error);
      throw error;
    }
  },
};
