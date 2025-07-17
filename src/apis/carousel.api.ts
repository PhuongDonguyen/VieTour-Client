import axiosInstance from './axiosInstance';

export const getCarouselData = () =>
  axiosInstance.get('/api/carousel'); 