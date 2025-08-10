import axiosInstance from "./axiosInstance";

export const getReviewByTourId = (tourId: number) =>
  axiosInstance.get(`/api/reviews?tour_id=${tourId}`);

export const createReview = (
  userId: number,
  tourId: number,
  tourStar: number,
  text: string
) => axiosInstance.post(`/api/reviews`, { userId, tourId, tourStar, text });

export const createReviewWithImages = (formData: FormData) =>
  axiosInstance.post(`/api/reviews/with-images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
