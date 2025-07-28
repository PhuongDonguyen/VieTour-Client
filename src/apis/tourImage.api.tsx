import axiosInstance from './axiosInstance';

export const getTourImages = () =>
  axiosInstance.get('/api/tour_images');

export const getTourImagesByTourId = (tour_id: number) =>
  axiosInstance.get(`/api/tour_images?tour_id=${tour_id}`);

export const getTourImagesLimit = (page: number, limit: number) =>
  axiosInstance.get(`/api/tour_images?page=${page}&limit=${limit}`);