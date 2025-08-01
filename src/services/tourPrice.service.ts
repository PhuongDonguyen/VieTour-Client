import {
  getAllTourPrices,
  getTourPriceById,
  getTourPricesByTourId,
  getAllSortedTourPrices,
  createTourPrice,
  updateTourPrice,
  deleteTourPrice,
  type TourPrice,
  type TourPriceQueryParams,
  type TourPriceResponse,
  type TourPriceCreateResponse,
  type TourPriceUpdateResponse,
  type TourPriceDeleteResponse,
} from "@/apis/tourPrice.api";

// Service wrapper functions
export const fetchAllTourPrices = async (
  params: TourPriceQueryParams = {}
): Promise<TourPriceResponse> => {
  return await getAllTourPrices(params);
};

export const fetchTourPriceById = async (id: number): Promise<TourPrice> => {
  return await getTourPriceById(id);
};

export const fetchTourPricesByTourId = async (
  tourId: number
): Promise<TourPriceResponse> => {
  return await getTourPricesByTourId(tourId);
};

export const fetchAllSortedTourPrices =
  async (): Promise<TourPriceResponse> => {
    return await getAllSortedTourPrices();
  };

export const createTourPriceService = async (data: {
  tour_id: number;
  adult_price: number;
  kid_price: number;
  note?: string;
  price_type?: string;
}): Promise<TourPriceCreateResponse> => {
  return await createTourPrice(data);
};

export const updateTourPriceService = async (
  id: number,
  data: {
    adult_price: number;
    kid_price: number;
    note?: string;
    price_type?: string;
  }
): Promise<TourPriceUpdateResponse> => {
  return await updateTourPrice(id, data);
};

export const deleteTourPriceService = async (
  id: number
): Promise<TourPriceDeleteResponse> => {
  return await deleteTourPrice(id);
};

// Export types for use in components
export type {
  TourPrice,
  TourPriceQueryParams,
  TourPriceResponse,
  TourPriceCreateResponse,
  TourPriceUpdateResponse,
  TourPriceDeleteResponse,
};
