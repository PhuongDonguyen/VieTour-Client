import {
  getTourSchedules,
  getTourScheduleById,
} from "../apis/tourSchedule.api";

export const tourScheduleService = {
  async getTourSchedules(tour_id: number) {
    try {
      const response = await getTourSchedules(tour_id);
      return response.data;
    } catch (error) {
      console.error("Error fetching tour schedules:", error);
      throw error;
    }
  },
  async getTourScheduleById(schedule_id: number) {
    try {
      const response = await getTourScheduleById(schedule_id);
      return response.data;
    } catch (error) {
      console.error("Error fetching tour schedule by id:", error);
      throw error;
    }
  },
};
