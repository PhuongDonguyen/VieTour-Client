import axiosInstance from "./axiosInstance";

export interface TourSchedule {
  id: number;
  tour_id: number;
  start_date: string;
  participant: number;
  status: "available" | "full" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface TourScheduleQueryParams {
  page?: number;
  limit?: number;
  tour_id?: number;
  status?: "available" | "full" | "cancelled";
}

export interface TourScheduleResponse {
  success: boolean;
  data: TourSchedule[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TourScheduleCreateResponse {
  success: boolean;
  message: string;
  data: TourSchedule;
}

export interface TourScheduleUpdateResponse {
  success: boolean;
  message: string;
  data: TourSchedule;
}

export interface TourScheduleDeleteResponse {
  success: boolean;
  message: string;
}

export const getAllTourSchedules = (params?: TourScheduleQueryParams) =>
  axiosInstance.get("/api/tour-schedules", { params });

export const getTourScheduleById = (id: number) =>
  axiosInstance.get(`/api/tour-schedules/${id}`);

export const createTourSchedule = (data: {
  tour_id: number;
  start_date: string;
  participant: number;
}) => axiosInstance.post("/api/tour-schedules", data);

export const updateTourSchedule = (
  id: number,
  data: {
    start_date?: string;
    status?: "available" | "full" | "cancelled";
  }
) => axiosInstance.put(`/api/tour-schedules/${id}`, data);

export const deleteTourSchedule = (id: number) =>
  axiosInstance.delete(`/api/tour-schedules/${id}`);
