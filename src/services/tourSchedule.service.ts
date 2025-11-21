import {
  getAllTourSchedules,
  getTourScheduleById,
  createTourSchedule,
  updateTourSchedule,
  deleteTourSchedule,
  getRemainingSchedulesCount,
  getPaginatedTourSchedules,
  getScheduleBookings,
  type TourSchedule,
  type TourScheduleQueryParams,
  type TourScheduleResponse,
  type TourScheduleCreateResponse,
  type TourScheduleUpdateResponse,
  type TourScheduleDeleteResponse,
  type RemainingSchedulesResponse,
  type TourScheduleWithTourResponse,
  type ScheduleBookingsResponse,
  type ScheduleBooking,
  type ScheduleBookingDetail,
} from "@/apis/tourSchedule.api";
import axiosInstance from "@/apis/axiosInstance";

// Service functions
export const fetchAllTourSchedules = async (
  params?: TourScheduleQueryParams
): Promise<TourScheduleResponse> => {
  try {
    const res = await getAllTourSchedules(params);
    // Handle axios response structure - res.data contains the actual response
    // The API returns { success: true, data: [...], pagination: {...} }
    return res.data;
  } catch (error) {
    console.error("Error fetching all tour schedules:", error);
    throw error;
  }
};

export const fetchTourScheduleById = async (
  id: number
): Promise<TourSchedule> => {
  try {
    const res = await getTourScheduleById(id);
    // Handle axios response structure - res.data contains the actual response
    // The API returns { success: true, data: {...} }
    return res.data.data;
  } catch (error) {
    console.error(`Error fetching tour schedule with id ${id}:`, error);
    throw error;
  }
};

export const createTourScheduleService = async (tourScheduleData: {
  tour_id: number;
  start_date: string;
  participant: number;
}): Promise<TourScheduleCreateResponse> => {
  try {
    const res = await createTourSchedule(tourScheduleData);
    return res.data;
  } catch (error) {
    console.error("Error creating tour schedule:", error);
    throw error;
  }
};

export const updateTourScheduleService = async (
  id: number,
  tourScheduleData: {
    start_date?: string;
    status?: "available" | "full" | "cancelled";
  }
): Promise<TourScheduleUpdateResponse> => {
  try {
    const res = await updateTourSchedule(id, tourScheduleData);
    return res.data;
  } catch (error) {
    console.error(`Error updating tour schedule with id ${id}:`, error);
    throw error;
  }
};

export const deleteTourScheduleService = async (
  id: number
): Promise<TourScheduleDeleteResponse> => {
  try {
    const res = await deleteTourSchedule(id);
    return res.data;
  } catch (error) {
    console.error(`Error deleting tour schedule with id ${id}:`, error);
    throw error;
  }
};

// New service function for getting remaining schedules count
export const fetchRemainingSchedulesCount =
  async (): Promise<RemainingSchedulesResponse> => {
    try {
      const res = await getRemainingSchedulesCount();
      return res;
    } catch (error) {
      console.error("Error fetching remaining schedules count:", error);
      throw error;
    }
  };

export const fetchPaginatedTourSchedules = async (
  params?: TourScheduleQueryParams,
  provider_id?: number
): Promise<TourScheduleWithTourResponse> => {
  try {
    const res = await getPaginatedTourSchedules(params, provider_id);
    return res.data;
  } catch (error) {
    console.error("Error fetching paginated tour schedules:", error);
    throw error;
  }
};

// Export types for use in components
export type {
  TourSchedule,
  TourScheduleQueryParams,
  TourScheduleResponse,
  ScheduleBooking,
  ScheduleBookingDetail,
};

export const fetchScheduleBookings = async (
  schedule_id: number,
  page?: number,
  limit?: number
): Promise<ScheduleBookingsResponse> => {
  try {
    // Sử dụng direct call vì getScheduleBookings không trả về booking_details
    const params: Record<string, number> = {};
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    
    const res = await axiosInstance.get<ScheduleBookingsResponse>(
      `/api/tour-schedules/${schedule_id}/bookings`,
      {
        params: Object.keys(params).length > 0 ? params : undefined,
      }
    );
    
    const response = res.data;
    return response;
   } catch (error) {
    console.error("Error fetching schedule bookings:", error);
    throw error;
   }
};


