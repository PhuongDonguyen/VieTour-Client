import axiosInstance from "./axiosInstance";

export const createReview = (data: FormData) =>
  axiosInstance.post("/api/reviews", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getAllReviews = (tourId?: number) => {
  const url = tourId ? `/api/reviews?tourId=${tourId}` : "/api/reviews";
  return axiosInstance.get(url);
};

export const getReviewById = (id: number) =>
  axiosInstance.get(`/api/reviews/${id}`);

export const updateReview = (id: number, data: FormData) =>
  axiosInstance.put(`/api/reviews/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteReview = (id: number) =>
  axiosInstance.delete(`/api/reviews/${id}`);
