import axiosInstance from './axiosInstance';

export const getTourDetails = () =>
  axiosInstance.get('/api/tour_details');

export const getTourDetailByTourId = (tour_id: number) =>
  axiosInstance.get(`/api/tour_details?tour_id=${tour_id}`);