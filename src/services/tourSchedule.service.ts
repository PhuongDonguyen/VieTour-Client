import {
  getAllTourSchedules,
  getTourScheduleById,
  createTourSchedule,
  updateTourSchedule,
  deleteTourSchedule,
  type TourSchedule,
  type TourScheduleQueryParams,
  type TourScheduleResponse,
  type TourScheduleCreateResponse,
  type TourScheduleUpdateResponse,
  type TourScheduleDeleteResponse,
} from "@/apis/tourSchedule.api";

// Service functions
export const fetchAllTourSchedules = async (
  params?: TourScheduleQueryParams
): Promise<TourScheduleResponse> => {
  const res = await getAllTourSchedules(params);
  // Handle axios response structure - res.data contains the actual response
  // The API returns { success: true, data: [...], pagination: {...} }
  return res.data;
};

export const fetchTourScheduleById = async (
  id: number
): Promise<TourSchedule> => {
  const res = await getTourScheduleById(id);
  // Handle axios response structure - res.data contains the actual response
  // The API returns { success: true, data: {...} }
  return res.data.data;
};

export const createTourScheduleService = async (tourScheduleData: {
  tour_id: number;
  start_date: string;
  participant: number;
}): Promise<TourScheduleCreateResponse> => {
  const res = await createTourSchedule(tourScheduleData);
  return res;
};

export const updateTourScheduleService = async (
  id: number,
  tourScheduleData: {
    start_date?: string;
    status?: "available" | "full" | "cancelled";
  }
): Promise<TourScheduleUpdateResponse> => {
  const res = await updateTourSchedule(id, tourScheduleData);
  return res;
};

export const deleteTourScheduleService = async (
  id: number
): Promise<TourScheduleDeleteResponse> => {
  const res = await deleteTourSchedule(id);
  return res;
};

// Export types for use in components
export type { TourSchedule, TourScheduleQueryParams, TourScheduleResponse };
