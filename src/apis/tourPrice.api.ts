import axiosInstance from './axiosInstance';

export const getTourPrices = () =>
  axiosInstance.get('/api/tour_prices');

export const getTourPriceById = (id: number) =>
  axiosInstance.get(`/api/tour_prices/${id}`);

export const getTourPricesByTourId = (tourId: number) =>
  axiosInstance.get(`/api/tour_prices?tour_id=${tourId}`);

export const getAllSortedTourPrices = () =>
  axiosInstance.get('/api/tour_prices/sorted');
