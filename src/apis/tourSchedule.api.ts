import axiosInstance from './axiosInstance';

export const getTourSchedules = (tour_id: number) =>
  axiosInstance.get(`/api/tour_schedules?tour_id=${tour_id}`);

export const getTourScheduleById = (id: number) =>
  axiosInstance.get(`/api/tour_schedules/${id}`)