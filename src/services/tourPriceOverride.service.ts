import {
  getAllTourPriceOverrides,
  getTourPriceOverrideById,
  createTourPriceOverride,
  updateTourPriceOverride,
  deleteTourPriceOverride,
  toggleActiveTourPriceOverride,
  type TourPriceOverride,
  type TourPriceOverrideQueryParams,
  type TourPriceOverrideResponse,
  type CreateTourPriceOverrideData,
  type UpdateTourPriceOverrideData,
} from "@/apis/tourPriceOverride.api";

// Service functions
export const fetchAllTourPriceOverrides = async (
  params?: TourPriceOverrideQueryParams
): Promise<TourPriceOverrideResponse> => {
  const res = await getAllTourPriceOverrides(params);
  return res;
};

export const fetchTourPriceOverrideById = async (
  id: number
): Promise<TourPriceOverride> => {
  const res = await getTourPriceOverrideById(id);
  return res;
};

export const createTourPriceOverrideService = async (
  data: CreateTourPriceOverrideData
) => {
  const res = await createTourPriceOverride(data);
  return res;
};

export const updateTourPriceOverrideService = async (
  id: number,
  data: UpdateTourPriceOverrideData
) => {
  const res = await updateTourPriceOverride(id, data);
  return res;
};

export const deleteTourPriceOverrideService = async (id: number) => {
  const res = await deleteTourPriceOverride(id);
  return res;
};

export const toggleActiveTourPriceOverrideService = async (id: number) => {
  const res = await toggleActiveTourPriceOverride(id);
  return res;
};

// Export types for use in components
export type {
  TourPriceOverride,
  TourPriceOverrideQueryParams,
  TourPriceOverrideResponse,
  CreateTourPriceOverrideData,
  UpdateTourPriceOverrideData,
};
