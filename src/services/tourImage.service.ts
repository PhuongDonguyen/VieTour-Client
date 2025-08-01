import {
  getAllTourImages,
  getTourImageById,
  getTourImagesByTourId,
  createTourImage,
  updateTourImage,
  deleteTourImage,
  toggleTourImageFeatured,
  type TourImage,
  type TourImageQueryParams,
  type TourImageResponse,
  type TourImageCreateResponse,
  type TourImageUpdateResponse,
  type TourImageDeleteResponse,
} from "@/apis/tourImage.api";

export const fetchAllTourImages = async (
  params?: TourImageQueryParams
): Promise<TourImageResponse> => {
  const res = await getAllTourImages(params);
  return res;
};

export const fetchTourImageById = async (id: number): Promise<TourImage> => {
  const res = await getTourImageById(id);
  return res;
};

export const fetchTourImagesByTourId = async (
  tour_id: number
): Promise<TourImageResponse> => {
  const res = await getTourImagesByTourId(tour_id);
  return res;
};

export const createTourImageService = async (
  formData: FormData
): Promise<TourImageCreateResponse> => {
  const res = await createTourImage(formData);
  return res;
};

export const updateTourImageService = async (
  id: number,
  formData: FormData
): Promise<TourImageUpdateResponse> => {
  const res = await updateTourImage(id, formData);
  return res;
};

export const deleteTourImageService = async (
  id: number
): Promise<TourImageDeleteResponse> => {
  const res = await deleteTourImage(id);
  return res;
};

export const toggleTourImageFeaturedService = async (
  id: number
): Promise<TourImageUpdateResponse> => {
  const res = await toggleTourImageFeatured(id);
  return res;
};

export type { TourImage, TourImageQueryParams, TourImageResponse };
