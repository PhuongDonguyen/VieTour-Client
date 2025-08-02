import axiosInstance from "../axiosInstance";

export interface TourSchedule {
  id: number;
  start_date: string;
  participant: number;
  status: "available" | "full" | "cancelled";
  tour_id: number;
  tour?: {
    id: number;
    title: string;
    poster_url: string;
    tour_category: {
      id: number;
      name: string;
    };
  };
}

export interface TourSchedulesResponse {
  success: boolean;
  data: TourSchedule[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const providerTourScheduleApi = {
  // Lấy danh sách tour schedules của provider
  getTourSchedules: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tour_id?: number;
    status?: string;
    start_date?: string;
  }): Promise<{ data: TourSchedulesResponse }> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.tour_id) searchParams.set("tour_id", params.tour_id.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.start_date) searchParams.set("start_date", params.start_date);

    return axiosInstance.get(
      `/api/provider/tour_schedules?${searchParams.toString()}`
    );
  },

  // Lấy tour schedule theo ID
  getTourSchedule: (
    id: number
  ): Promise<{ data: { success: boolean; data: TourSchedule } }> => {
    return axiosInstance.get(`/api/provider/tour_schedules/${id}`);
  },

  // Tạo tour schedule mới
  createTourSchedule: (scheduleData: {
    tour_id: number;
    start_date: string;
    participant: number;
    status: "available" | "full" | "cancelled";
  }): Promise<{ data: { success: boolean; data: TourSchedule } }> => {
    return axiosInstance.post("/api/provider/tour_schedules", scheduleData);
  },

  // Cập nhật tour schedule
  updateTourSchedule: (
    id: number,
    scheduleData: {
      tour_id?: number;
      start_date?: string;
      participant?: number;
      status?: "available" | "full" | "cancelled";
    }
  ): Promise<{ data: { success: boolean; data: TourSchedule } }> => {
    return axiosInstance.put(
      `/api/provider/tour_schedules/${id}`,
      scheduleData
    );
  },

  // Xóa tour schedule
  deleteTourSchedule: (id: number): Promise<{ data: { success: boolean } }> => {
    return axiosInstance.delete(`/api/provider/tour_schedules/${id}`);
  },
};
