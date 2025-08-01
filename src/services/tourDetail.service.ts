import {
  getAllTourDetails,
  getTourDetailById,
  getTourDetailsByTourId,
  createTourDetail,
  updateTourDetail,
  deleteTourDetail,
  type TourDetail,
  type TourDetailQueryParams,
  type TourDetailResponse,
  type TourDetailCreateResponse,
  type TourDetailUpdateResponse,
  type TourDetailDeleteResponse,
} from "@/apis/tourDetail.api";

// Service functions
export const fetchAllTourDetails = async (
  params?: TourDetailQueryParams
): Promise<TourDetailResponse> => {
  const res = await getAllTourDetails(params);
  return res;
};

export const fetchTourDetailById = async (id: number): Promise<TourDetail> => {
  const res = await getTourDetailById(id);
  return res;
};

export const fetchTourDetailsByTourId = async (
  tour_id: number
): Promise<TourDetailResponse> => {
  const res = await getTourDetailsByTourId(tour_id);
  return res;
};

export const createTourDetailService = async (tourDetailData: {
  tour_id: number;
  title: string;
  order: number;
  morning_description: string;
  noon_description: string;
  afternoon_description: string;
}): Promise<TourDetailCreateResponse> => {
  const res = await createTourDetail(tourDetailData);
  return res;
};

export const updateTourDetailService = async (
  id: number,
  tourDetailData: {
    tour_id: number;
    title: string;
    order: number;
    morning_description: string;
    noon_description: string;
    afternoon_description: string;
  }
): Promise<TourDetailUpdateResponse> => {
  const res = await updateTourDetail(id, tourDetailData);
  return res;
};

export const deleteTourDetailService = async (
  id: number
): Promise<TourDetailDeleteResponse> => {
  const res = await deleteTourDetail(id);
  return res;
};

// Export types for use in components
export type { TourDetail, TourDetailQueryParams, TourDetailResponse };
