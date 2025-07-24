import axiosInstance from './axiosInstance';

export interface TourPriceResponse {
  adult_price: number;
  kid_price: number;
  note: string;
  price_type: string;
}

export interface TourPricesApiResponse {
  success: boolean;
  data: TourPriceResponse[];
}

export const getTourPrices = () =>
  axiosInstance.get('/api/tour_prices');

export const getTourPriceById = (id: number) =>
  axiosInstance.get(`/api/tour_prices/${id}`);

export const getTourPricesByTourId = (tourId: number) =>
  axiosInstance.get(`/api/tour_prices?tour_id=${tourId}`);

export const getTourPricesByTourIdAndDate = (tourId: number, date: string): Promise<TourPricesApiResponse> =>
  axiosInstance.get(`/api/tour_prices?tour_id=${tourId}&date=${date}`);

export const getAllSortedTourPrices = () =>
  axiosInstance.get('/api/tour_prices/sorted');
