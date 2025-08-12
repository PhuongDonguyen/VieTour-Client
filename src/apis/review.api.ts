import axiosInstance from "./axiosInstance";

export interface ReviewQueryParams {
  tour_id?: number;
  tour_star?: number;
  page?: number;
  limit?: number;
}

export const createReview = (data: FormData) =>
  axiosInstance.post("/api/reviews", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getAllReviews = (params?: ReviewQueryParams) => {
  const queryParams = new URLSearchParams();
  
  if (params?.tour_id) {
    queryParams.append("tour_id", params.tour_id.toString());
  }
  if (params?.tour_star) {
    queryParams.append("tour_star", params.tour_star.toString());
  }
  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }
  
  const url = queryParams.toString() ? `/api/reviews?${queryParams.toString()}` : "/api/reviews";
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
