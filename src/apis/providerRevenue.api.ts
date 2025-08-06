import axiosInstance from "./axiosInstance";

export interface ProviderRevenueData {
  total_revenue: number;
  total_bookings: number;
  success_bookings: number;
  fail_bookings: number;
  pending_bookings: number;
  average_booking_value: number;
  total_tours: number;
  active_tours: number;
  success_rate: string;
  fail_rate: string;
  pending_rate: string;
  inactive_tours: number;
  tour_activity_rate: string;
}

// export interface ProviderRevenueResponse {
//   success: boolean;
//   data: ProviderRevenueData;
// }

export const getProviderRevenue = (providerId: number) =>
  axiosInstance.get(`/api/provider-revenue-stats/provider/${providerId}`);

export const getProviderRevenueByDateRange = (
  providerId: number,
  startDate: string,
  endDate: string
) =>
  axiosInstance.get(`/api/provider-revenue-stats/provider/${providerId}`, {
    params: { start_date: startDate, end_date: endDate }
  });

export interface ProviderMonthlyRevenue {
  month: number;
  month_name: string;
  total_revenue: string;
  total_bookings: number;
  success_bookings: number;
  fail_bookings: number;
  pending_bookings: number;
  average_booking_value: string;
}

export const getProviderMonthlyRevenue = (providerId: number, year: number) =>
  axiosInstance.get<{ success: boolean; data: ProviderMonthlyRevenue[] }>(
    `/api/provider-revenue-stats/provider/${providerId}/monthly`,
    { params: { year } }
  );

export interface ProviderTourStat {
  tour_id: number;
  tour_title: string;
  total_revenue: string;
  total_bookings: number;
  success_bookings: number;
  fail_bookings: number;
  pending_bookings: number;
  average_booking_value: string;
  tour_rating: string;
  review_count: number;
}

export const getProviderTourStats = (
  providerId: number,
  startDate: string,
  endDate: string
) =>
  axiosInstance.get<{ success: boolean; data: ProviderTourStat[] }>(
    `/api/provider-revenue-stats/provider/${providerId}/tour`,
    { params: { start_date: startDate, end_date: endDate } }
  );

export interface ProviderCategoryStat {
  category_id: number;
  category_name: string;
  total_revenue: string;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  pending_bookings: number;
  average_booking_value: string;
  tour_count: number;
}

export const getProviderCategoryStats = (
  providerId: number,
  startDate: string,
  endDate: string
) =>
  axiosInstance.get<{ success: boolean; data: ProviderCategoryStat[] }>(
    `/api/provider-revenue-stats/provider/${providerId}/category`,
    { params: { start_date: startDate, end_date: endDate } }
  );

export interface ProviderWeeklyStat {
  day_of_week: number;
  day_name: string;
  total_revenue: string;
  total_bookings: number;
  success_bookings: number;
  fail_bookings: number;
  pending_bookings: number;
  average_booking_value: string;
}

export const getProviderWeeklyStats = (
  providerId: number,
  startDate: string,
  endDate: string
) =>
  axiosInstance.get<{ success: boolean; data: ProviderWeeklyStat[] }>(
    `/api/provider-revenue-stats/provider/${providerId}/weekly`,
    { params: { start_date: startDate, end_date: endDate } }
  );

export interface ProviderDailyStat {
  booking_date: string;
  total_revenue: string;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  average_booking_value: string;
}

export const getProviderDailyStats = (
  providerId: number,
  startDate: string,
  endDate: string
) =>
  axiosInstance.get<{ success: boolean; data: ProviderDailyStat[] }>(
    `/api/provider-revenue-stats/provider/${providerId}/daily`,
    { params: { start_date: startDate, end_date: endDate } }
  ); 