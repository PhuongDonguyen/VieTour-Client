import axiosInstance from '../axiosInstance';

export interface AdminTourSchedule {
  id: number;
  start_date: string;
  participant: number;
  status: 'available' | 'full' | 'cancelled';
  created_at: string;
  updated_at: string;
  tour: {
    id: number;
    title: string;
    poster_url: string;
    tour_category: {
      id: number;
      name: string;
    };
    provider: {
      id: number;
      business_name: string;
    };
  };
}

export interface AdminTourSchedulesResponse {
  success: boolean;
  data: AdminTourSchedule[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const adminTourScheduleApi = {
  // Lấy tất cả lịch trình tours trong hệ thống (Admin only)
  getAllTourSchedules: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tour_id?: number;
    provider_id?: number;
    status?: 'available' | 'full' | 'cancelled';
    start_date_from?: string;
    start_date_to?: string;
    sort_by?: 'start_date' | 'participant' | 'created_at';
    sort_order?: 'asc' | 'desc';
  }): Promise<{ data: AdminTourSchedulesResponse }> => {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.tour_id) searchParams.set('tour_id', params.tour_id.toString());
    if (params?.provider_id) searchParams.set('provider_id', params.provider_id.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.start_date_from) searchParams.set('start_date_from', params.start_date_from);
    if (params?.start_date_to) searchParams.set('start_date_to', params.start_date_to);
    if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.set('sort_order', params.sort_order);

    return axiosInstance.get(`/api/admin/tour-schedules?${searchParams.toString()}`);
  },

  // Lấy tour schedule theo ID (Admin only)
  getTourSchedule: (id: number): Promise<{ data: { success: boolean; data: AdminTourSchedule } }> => {
    return axiosInstance.get(`/api/admin/tour-schedules/${id}`);
  },

  // Lấy thống kê tour schedules
  getTourScheduleStats: (): Promise<{ data: { 
    success: boolean; 
    data: {
      total_schedules: number;
      available_schedules: number;
      full_schedules: number;
      cancelled_schedules: number;
      total_participants: number;
      upcoming_schedules: number;
    }
  } }> => {
    return axiosInstance.get('/api/admin/tour-schedules/stats');
  },

  // Cập nhật trạng thái schedule (Admin only)
  updateScheduleStatus: (id: number, status: 'available' | 'full' | 'cancelled'): Promise<{ data: { success: boolean; data: AdminTourSchedule } }> => {
    return axiosInstance.patch(`/api/admin/tour-schedules/${id}/status`, { status });
  }
};
