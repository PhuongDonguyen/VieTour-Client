import { adminTourScheduleApi } from '../../apis/admin/adminTourSchedule.api';
import type { AdminTourSchedulesResponse, AdminTourSchedule } from '../../apis/admin/adminTourSchedule.api';

export const adminTourScheduleService = {
  // Lấy tất cả tour schedules
  getAllTourSchedules: async (params?: {
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
  }): Promise<AdminTourSchedulesResponse> => {
    try {
      const response = await adminTourScheduleApi.getAllTourSchedules(params);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch admin tour schedules:', error);
      throw error;
    }
  },

  // Lấy tour schedule theo ID
  getTourSchedule: async (id: number): Promise<AdminTourSchedule> => {
    try {
      const response = await adminTourScheduleApi.getTourSchedule(id);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch admin tour schedule:', error);
      throw error;
    }
  },

  // Lấy thống kê tour schedules
  getTourScheduleStats: async () => {
    try {
      const response = await adminTourScheduleApi.getTourScheduleStats();
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch tour schedule stats:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái schedule
  updateScheduleStatus: async (id: number, status: 'available' | 'full' | 'cancelled'): Promise<AdminTourSchedule> => {
    try {
      const response = await adminTourScheduleApi.updateScheduleStatus(id, status);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update schedule status:', error);
      throw error;
    }
  }
};
