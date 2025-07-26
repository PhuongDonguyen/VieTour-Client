import { providerTourScheduleApi } from '../../apis/provider/providerTourSchedule.api';
import type { TourSchedule, TourSchedulesResponse } from '../../apis/provider/providerTourSchedule.api';

export const providerTourScheduleService = {
  // Lấy danh sách tour schedules
  getTourSchedules: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tour_id?: number;
    status?: string;
    start_date?: string;
  }): Promise<TourSchedulesResponse> => {
    try {
      const response = await providerTourScheduleApi.getTourSchedules(params);
      return response.data;
    } catch (error) {
      console.error('Error fetching tour schedules:', error);
      throw error;
    }
  },

  // Lấy tour schedule theo ID
  getTourSchedule: async (id: number): Promise<TourSchedule> => {
    try {
      const response = await providerTourScheduleApi.getTourSchedule(id);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching tour schedule:', error);
      throw error;
    }
  },

  // Tạo tour schedule mới
  createTourSchedule: async (scheduleData: {
    tour_id: number;
    start_date: string;
    participant: number;
    status: 'available' | 'full' | 'cancelled';
  }): Promise<TourSchedule> => {
    try {
      const response = await providerTourScheduleApi.createTourSchedule(scheduleData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating tour schedule:', error);
      throw error;
    }
  },

  // Cập nhật tour schedule
  updateTourSchedule: async (id: number, scheduleData: {
    tour_id?: number;
    start_date?: string;
    participant?: number;
    status?: 'available' | 'full' | 'cancelled';
  }): Promise<TourSchedule> => {
    try {
      const response = await providerTourScheduleApi.updateTourSchedule(id, scheduleData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating tour schedule:', error);
      throw error;
    }
  },

  // Xóa tour schedule
  deleteTourSchedule: async (id: number): Promise<void> => {
    try {
      await providerTourScheduleApi.deleteTourSchedule(id);
    } catch (error) {
      console.error('Error deleting tour schedule:', error);
      throw error;
    }
  },
};
